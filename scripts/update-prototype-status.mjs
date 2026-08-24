#!/usr/bin/env node
/**
 * Marks a branch's registry rows merged or closed when its PR closes.
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

const query =
  `repo=eq.${encodeURIComponent(repo)}` +
  `&branch=eq.${encodeURIComponent(branch)}`;

const patch = { status };
// Only set the PR number if we actually have one — never blank an existing value.
if (prNumber) patch.pr_number = prNumber;

const response = await fetch(`${supabaseUrl}/rest/v1/prototypes?${query}`, {
  method: "PATCH",
  // New-style secret keys must not be sent as a Bearer token; legacy JWT keys
  // still need one. restHeaders() picks the right shape for the key in hand.
  headers: restHeaders(secretKey, {
    "Content-Type": "application/json",
    Prefer: "return=representation",
  }),
  body: JSON.stringify(patch),
});

if (!response.ok) {
  fail(`PATCH failed (${response.status}): ${await response.text()}`);
}

const updated = await response.json();
console.log(
  `✓ Marked ${updated.length} row(s) "${status}" for ${repo} @ ${branch}` +
    (updated.length ? `: ${updated.map((row) => row.slug).join(", ")}` : "")
);
