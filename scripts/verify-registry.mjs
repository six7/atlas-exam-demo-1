#!/usr/bin/env node
/**
 * Live self-check for the shared registry.
 *
 * Exercises the real HTTP path — tables, storage bucket, RLS, and both key
 * generations — against the configured Supabase project, then cleans up after
 * itself. Complements `supabase/verify-rls.sql`, which checks the same policies
 * from inside the database but cannot tell you whether your *keys* work.
 *
 * Usage:
 *   npm run verify:registry
 *
 * Reads .env.local (or the process environment) for:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *   SUPABASE_SECRET_KEY                   (or SUPABASE_SERVICE_ROLE_KEY)
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { isNewApiKey } from "./lib/supabase-keys.mjs";

const PROBE = "__verify_probe__";
const BUCKET = "prototype-screenshots";

/* ---------------------------------------------------------------- env --- */

function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
    const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.trim().replace(/^["']|["']$/g, "");
    if (value && !process.env[key]) process.env[key] = value;
  }
}

function firstNonBlank(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

loadEnvLocal();

const url = firstNonBlank(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_URL
)?.replace(/\/+$/, "");

const publishable = firstNonBlank(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const secret = firstNonBlank(
  process.env.SUPABASE_SECRET_KEY,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

if (!url || !publishable || !secret) {
  console.error(
    "✖ Missing configuration. Need NEXT_PUBLIC_SUPABASE_URL, a publishable/anon\n" +
      "  key, and a secret/service_role key — in .env.local or the environment."
  );
  process.exit(1);
}

/* -------------------------------------------------------------- checks --- */

const results = [];

function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? ` — ${detail}` : ""}`);
}

function headers(key, extra = {}) {
  const base = { apikey: key, ...extra };
  if (!isNewApiKey(key)) base.Authorization = `Bearer ${key}`;
  return base;
}

async function rest(key, pathname, init = {}) {
  const response = await fetch(`${url}/rest/v1/${pathname}`, {
    ...init,
    headers: headers(key, {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    }),
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, ok: response.ok, body };
}

/** A write is denied if it errors, or silently affects nothing. */
function isDenied({ ok, body }) {
  if (!ok) return true;
  return Array.isArray(body) && body.length === 0;
}

let probeId = null;

async function main() {
  console.log(`\nVerifying ${url}\n`);
  console.log(
    `Keys: publishable=${isNewApiKey(publishable) ? "new" : "legacy"}, ` +
      `secret=${isNewApiKey(secret) ? "new" : "legacy"}\n`
  );

  /* --- schema ---------------------------------------------------------- */
  console.log("Schema");
  const protoRead = await rest(publishable, "prototypes?select=id&limit=1");
  record(
    "prototypes table exists",
    protoRead.status !== 404,
    protoRead.status === 404 ? "run the migration first" : `HTTP ${protoRead.status}`
  );
  const fbRead = await rest(publishable, "feedback?select=id&limit=1");
  record("feedback table exists", fbRead.status !== 404, `HTTP ${fbRead.status}`);

  if (protoRead.status === 404 || fbRead.status === 404) {
    console.log(
      "\n✖ Migration has not been applied. Paste\n" +
        "  supabase/migrations/0001_shared_prototype_registry.sql\n" +
        "  into the Supabase SQL editor and run it, then re-run this check.\n"
    );
    process.exit(1);
  }

  /* --- seed a probe row via the secret key ------------------------------ */
  console.log("\nWrites (secret key)");
  const created = await rest(secret, "prototypes", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      repo: PROBE,
      branch: PROBE,
      slug: PROBE,
      name: "Verification probe",
      path: `/prototypes/${PROBE}`,
      status: "open",
    }),
  });
  probeId = Array.isArray(created.body) ? created.body[0]?.id : null;
  record("secret key can INSERT prototypes", Boolean(probeId), `HTTP ${created.status}`);

  if (!probeId) {
    console.log("\n✖ Could not seed a probe row; aborting.\n");
    process.exit(1);
  }

  const upserted = await rest(
    secret,
    "prototypes?on_conflict=repo,branch,slug",
    {
      method: "POST",
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        repo: PROBE,
        branch: PROBE,
        slug: PROBE,
        name: "Verification probe (upserted)",
        path: `/prototypes/${PROBE}`,
        status: "open",
      }),
    }
  );
  record(
    "upsert on (repo, branch, slug) works",
    upserted.ok && Array.isArray(upserted.body) && upserted.body.length === 1,
    `HTTP ${upserted.status}`
  );

  /* --- reads ------------------------------------------------------------ */
  console.log("\nReads (publishable key)");
  const visible = await rest(
    publishable,
    `prototypes?select=id,name&slug=eq.${PROBE}`
  );
  record(
    "anon can SELECT prototypes",
    visible.ok && Array.isArray(visible.body) && visible.body.length === 1,
    `HTTP ${visible.status}`
  );

  const fbList = await rest(publishable, "feedback?select=id&limit=1");
  record("anon can SELECT feedback", fbList.ok, `HTTP ${fbList.status}`);

  /* --- feedback insert -------------------------------------------------- */
  const fbInsert = await rest(publishable, "feedback", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      prototype_id: probeId,
      body: "verification probe comment",
      author_name: "verifier",
    }),
  });
  record(
    "anon can INSERT feedback",
    fbInsert.ok && Array.isArray(fbInsert.body) && fbInsert.body.length === 1,
    `HTTP ${fbInsert.status}`
  );

  /* --- writes that must be denied --------------------------------------- */
  console.log("\nRLS (publishable key must be read-only on prototypes)");

  const badInsert = await rest(publishable, "prototypes", {
    method: "POST",
    body: JSON.stringify({
      repo: `${PROBE}-x`,
      branch: `${PROBE}-x`,
      slug: `${PROBE}-x`,
      name: "should not exist",
      path: "/nope",
    }),
  });
  record("anon INSERT prototypes denied", isDenied(badInsert), `HTTP ${badInsert.status}`);

  const badUpdate = await rest(publishable, `prototypes?slug=eq.${PROBE}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name: "hacked" }),
  });
  record("anon UPDATE prototypes denied", isDenied(badUpdate), `HTTP ${badUpdate.status}`);

  const badDelete = await rest(publishable, `prototypes?slug=eq.${PROBE}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
    body: null,
  });
  record("anon DELETE prototypes denied", isDenied(badDelete), `HTTP ${badDelete.status}`);

  // Confirm the row really survived the attempts above.
  const stillThere = await rest(
    publishable,
    `prototypes?select=name&slug=eq.${PROBE}`
  );
  const name = Array.isArray(stillThere.body) ? stillThere.body[0]?.name : null;
  record(
    "probe row unchanged after denied writes",
    name === "Verification probe (upserted)",
    name ? `name="${name}"` : "row missing"
  );

  /* --- storage ---------------------------------------------------------- */
  console.log("\nStorage");
  const bucket = await fetch(`${url}/storage/v1/bucket/${BUCKET}`, {
    headers: headers(secret),
  });
  record(`bucket "${BUCKET}" exists`, bucket.ok, `HTTP ${bucket.status}`);

  if (bucket.ok) {
    // Smallest valid PNG, so the round trip stays cheap.
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    const key = `${PROBE}/${PROBE}/${PROBE}.png`;

    const upload = await fetch(`${url}/storage/v1/object/${BUCKET}/${key}`, {
      method: "POST",
      headers: headers(secret, { "Content-Type": "image/png", "x-upsert": "true" }),
      body: png,
    });
    record("secret key can upload a screenshot", upload.ok, `HTTP ${upload.status}`);

    if (upload.ok) {
      const publicUrl = `${url}/storage/v1/object/public/${BUCKET}/${key}`;
      const fetched = await fetch(publicUrl);
      record(
        "screenshot readable without a key (public bucket)",
        fetched.ok,
        `HTTP ${fetched.status}`
      );

      await fetch(`${url}/storage/v1/object/${BUCKET}/${key}`, {
        method: "DELETE",
        headers: headers(secret),
      });
    }
  }
}

async function cleanup() {
  if (!probeId) return;
  // Deleting the prototype cascades to its feedback.
  await rest(secret, `prototypes?repo=eq.${PROBE}`, { method: "DELETE" });
}

try {
  await main();
} finally {
  await cleanup();
  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${failed.length === 0 ? "✅" : "❌"} ${results.length - failed.length}/${results.length} checks passed\n`
  );
  process.exit(failed.length === 0 ? 0 : 1);
}
