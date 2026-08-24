#!/usr/bin/env node
/**
 * Retires a branch's registry rows when its PR closes.
 *
 * Rows that carry feedback are marked merged/closed and kept — the comments
 * are the review history and deleting the row would cascade them away.
 *
 * Rows with no feedback are deleted. Once a branch is merged its prototypes
 * live on the default branch, so an identical card from a dead branch is pure
 * duplication: we watched the hub reach 15 cards for 3 actual prototypes
 * across four merged branches, which is worse than useless.
 *
 * Run by `.github/workflows/prototype-pr-status.yml`.
 *
 * Deliberately dependency-free — it talks to PostgREST over plain fetch — so
 * the workflow needs no `npm ci`, no Playwright, and finishes in seconds.
 *
 * Usage:
 *   node scripts/update-prototype-status.mjs \
 *     --repo six7/atlas-exam-demo-1 --branch my-branch \
 *     --status merged --pr-number 12
 *
 * Environment:
 *   SUPABASE_URL          required
 *   SUPABASE_SECRET_KEY   required — new-style `sb_secret_…`. Falls back to
 *                         the legacy SUPABASE_SERVICE_ROLE_KEY.
 */

import process from "node:process";

import {
  SECRET_KEY_HINT,
  resolveSecretKey,
  restHeaders,
} from "./lib/supabase-keys.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token
      .slice(2)
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    args[key] = argv[i + 1];
    i += 1;
  }
  return args;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));

const repo = args.repo ?? process.env.GITHUB_REPOSITORY;
const branch = args.branch;
const status = args.status;
const prNumber = args.prNumber ? Number(args.prNumber) : null;

if (!repo) fail("Missing --repo.");
if (!branch) fail("Missing --branch.");
if (!["merged", "closed"].includes(status)) {
  fail(`--status must be "merged" or "closed" (got ${status ?? "nothing"}).`);
}

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const secretKey = resolveSecretKey();

if (!supabaseUrl) {
  fail("SUPABASE_URL must be set. Add it as a GitHub Actions repository secret.");
}
if (!secretKey) {
  fail(SECRET_KEY_HINT);
}

const branchFilter =
  `repo=eq.${encodeURIComponent(repo)}` +
  `&branch=eq.${encodeURIComponent(branch)}`;

// New-style secret keys must not be sent as a Bearer token; legacy JWT keys
// still need one. restHeaders() picks the right shape for the key in hand.
function headers(extra = {}) {
  return restHeaders(secretKey, { "Content-Type": "application/json", ...extra });
}

async function rest(path, init = {}) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: headers(init.headers ?? {}),
  });
  if (!response.ok) {
    fail(`${init.method ?? "GET"} ${path} failed (${response.status}): ${await response.text()}`);
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/* --- which of this branch's rows have a conversation attached? --------- */

const rows = await rest(`prototypes?${branchFilter}&select=id,slug`);

if (rows.length === 0) {
  console.log(`✓ Nothing registered for ${repo} @ ${branch}.`);
  process.exit(0);
}

const ids = rows.map((row) => row.id);
const comments = await rest(
  `feedback?prototype_id=in.(${ids.join(",")})&select=prototype_id`
);
const discussed = new Set(comments.map((c) => c.prototype_id));

const keep = rows.filter((row) => discussed.has(row.id));
const drop = rows.filter((row) => !discussed.has(row.id));

/* --- keep the discussed ones, retired ---------------------------------- */

if (keep.length > 0) {
  const patch = { status };
  // Only set the PR number if we have one — never blank an existing value.
  if (prNumber) patch.pr_number = prNumber;

  await rest(`prototypes?id=in.(${keep.map((r) => r.id).join(",")})`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  console.log(
    `✓ Kept ${keep.length} row(s) as "${status}" (they have feedback): ` +
      keep.map((r) => r.slug).join(", ")
  );
}

/* --- delete the silent duplicates -------------------------------------- */

if (drop.length > 0) {
  await rest(`prototypes?id=in.(${drop.map((r) => r.id).join(",")})`, {
    method: "DELETE",
  });
  console.log(
    `✓ Removed ${drop.length} row(s) with no feedback ` +
      `(they now live on the default branch): ${drop.map((r) => r.slug).join(", ")}`
  );
}

console.log(`  ${repo} @ ${branch} — done.`);
