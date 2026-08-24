#!/usr/bin/env node
/**
 * Registers this branch's prototypes in the shared Supabase registry.
 *
 * Run by `.github/workflows/register-prototypes.yml` once Vercel reports a
 * successful deployment — that timing matters, because the preview URL does
 * not exist until then.
 *
 * For every entry in src/prototypes/registry.json it:
 *   1. screenshots {deploymentUrl}{path} at 1280x800,
 *   2. uploads the PNG to the `prototype-screenshots` bucket, keyed
 *      repo/branch/slug so re-runs overwrite instead of accumulating,
 *   3. upserts a row on the (repo, branch, slug) constraint,
 * then deletes rows for this (repo, branch) whose slug has left the registry,
 * so removed prototypes disappear from the hub.
 *
 * Usage:
 *   node scripts/register-prototypes.mjs \
 *     --deployment-url https://atlas-git-my-branch.vercel.app \
 *     --branch my-branch --commit-sha abc123 --author "Sam Wilson"
 *
 *   node scripts/register-prototypes.mjs --dry-run \
 *     --deployment-url https://example.vercel.app
 *
 * Add --screenshot-dir ./shots to also write each PNG to disk, which is the
 * quickest way to see what CI is actually capturing.
 *
 * Environment:
 *   SUPABASE_URL                  required unless --dry-run
 *   SUPABASE_SECRET_KEY           required unless --dry-run — new-style
 *                                 `sb_secret_…`. Falls back to the legacy
 *                                 SUPABASE_SERVICE_ROLE_KEY.
 *   GITHUB_TOKEN                  optional, used to find the PR
 *   GITHUB_REPOSITORY             e.g. "six7/atlas-exam-demo-1"
 *   PRODUCTION_URL                optional but recommended — the project's
 *                                 stable public domain, e.g.
 *                                 https://atlas-exam-demo-1.vercel.app. Used
 *                                 as the link target for the default branch
 *                                 instead of the immutable per-deployment URL,
 *                                 which is hashed and, on a protected project,
 *                                 sits behind Vercel SSO.
 *   VERCEL_AUTOMATION_BYPASS_SECRET
 *                                 required when the Vercel project has
 *                                 Deployment Protection enabled — otherwise
 *                                 every preview URL redirects to Vercel SSO
 *                                 and we would screenshot a login page.
 *                                 Vercel → Settings → Deployment Protection →
 *                                 Protection Bypass for Automation.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";

import { SECRET_KEY_HINT, resolveSecretKey } from "./lib/supabase-keys.mjs";

const BUCKET = "prototype-screenshots";
const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 45_000;
/** Grace period after network idle for fonts and entry animations to settle. */
const SETTLE_MS = 600;

/**
 * Chrome that must not appear in a prototype screenshot: the feedback overlay
 * (which tags itself `data-screenshot-hide`), a prototype's own Leva control
 * panel, and the Next.js dev overlay. Leva mounts itself into a portal on
 * `document.body` and its panel has no stable id, hence the class-prefix match
 * alongside the root id.
 */
const HIDE_CHROME_CSS = `
  [data-screenshot-hide],
  [class*="leva-c-"],
  #leva__root,
  nextjs-portal {
    display: none !important;
  }
`;

/* ------------------------------------------------------------------ */
/* args                                                                */
/* ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (!token.startsWith("--")) continue;
    const key = token
      .slice(2)
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    args[key] = argv[i + 1];
    i += 1;
  }
  return args;
}

function stripTrailingSlash(value) {
  return String(value).replace(/\/+$/, "");
}

/** Storage keys stay predictable: keep slashes for hierarchy, tame the rest. */
function sanitiseKeyPart(value) {
  return String(value).replace(/[^a-zA-Z0-9._/-]/g, "-");
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* inputs                                                              */
/* ------------------------------------------------------------------ */

const args = parseArgs(process.argv.slice(2));
const dryRun = Boolean(args.dryRun);

const deploymentUrl = stripTrailingSlash(
  args.deploymentUrl ?? process.env.DEPLOYMENT_URL ?? ""
);
if (!deploymentUrl) fail("Missing --deployment-url.");

const repo = args.repo ?? process.env.GITHUB_REPOSITORY;
if (!repo) fail("Missing --repo (or GITHUB_REPOSITORY).");

let branch = args.branch ?? process.env.BRANCH;
if (!branch) fail("Missing --branch.");

const commitSha = args.commitSha ?? process.env.COMMIT_SHA ?? null;
const author = args.author ?? process.env.COMMIT_AUTHOR ?? null;
const defaultBranch = args.defaultBranch ?? process.env.DEFAULT_BRANCH ?? "main";
/** Vercel reports "Production" or "Preview". Decisive for a merge commit. */
const environment =
  args.environment ?? process.env.DEPLOYMENT_ENVIRONMENT ?? "";
/** Optional local copy of every capture, for eyeballing what CI sees. */
const screenshotDir = args.screenshotDir ?? null;

/**
 * Bypasses Vercel Deployment Protection. Without it, a protected project
 * redirects every request to Vercel SSO and the "screenshot" is a login page.
 */
const bypassSecret =
  args.bypassSecret ?? process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? null;

/**
 * The project's stable public domain. GitHub's deployment_status event only
 * carries the immutable per-deployment URL (`…-9o8yim5eu-….vercel.app`), which
 * is both ugly and — with Deployment Protection on — behind Vercel SSO. For
 * the default branch we would rather link people at the real domain.
 */
const productionUrl = args.productionUrl
  ? stripTrailingSlash(args.productionUrl)
  : process.env.PRODUCTION_URL
    ? stripTrailingSlash(process.env.PRODUCTION_URL)
    : null;

const supabaseUrl = process.env.SUPABASE_URL;
const secretKey = resolveSecretKey();

if (!dryRun && !supabaseUrl) {
  fail("SUPABASE_URL must be set. Add it as a GitHub Actions repository secret.");
}
if (!dryRun && !secretKey) {
  fail(SECRET_KEY_HINT);
}

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

function readRegistry() {
  const file = path.join(process.cwd(), "src", "prototypes", "registry.json");
  if (!fs.existsSync(file)) fail(`No registry at ${file}`);

  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (!Array.isArray(parsed?.prototypes)) fail("registry.json has no `prototypes` array.");

  return parsed.prototypes.map((entry) => ({
    slug: entry.id,
    name: entry.name ?? entry.id,
    description: entry.description ?? "",
    path: `/prototypes/${entry.id}`,
    // registry.json's author is the prototype's owner and beats the commit
    // author, which is only whoever last touched the branch.
    author: entry.author ?? author ?? null,
  }));
}

/* ------------------------------------------------------------------ */
/* branch and pull request resolution                                  */
/* ------------------------------------------------------------------ */

const SHA_PATTERN = /^[0-9a-f]{40}$/i;

async function github(pathname) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  try {
    const response = await fetch(`https://api.github.com${pathname}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

/**
 * Resolves the branch name and open PR number.
 *
 * `github.event.deployment.ref` is NOT reliably a branch name — Vercel creates
 * deployments against the commit SHA, and that is what arrives here. Storing a
 * SHA in `branch` would be quietly destructive: the (repo, branch, slug) key
 * would change on every commit, so upserts would never dedupe, pruning would
 * never match, the hub could not group by branch, and the PR-close workflow
 * (which sees a real branch name) would never find these rows.
 */
async function resolveBranchAndPr() {
  const [owner] = repo.split("/");
  const name = SHA_PATTERN.test(branch) ? await branchForSha(branch) : branch;

  const pulls = await github(
    `/repos/${repo}/pulls?state=open&per_page=1` +
      `&head=${encodeURIComponent(`${owner}:${name}`)}`
  );

  return {
    branch: name,
    prNumber: Array.isArray(pulls) ? pulls[0]?.number ?? null : null,
  };
}

/**
 * Maps a commit SHA back to the branch it belongs to.
 *
 * Order matters here. An earlier version asked `/commits/{sha}/pulls` first,
 * which looks right and is wrong for the most important case: a merge commit
 * on the default branch still belongs to the pull request that merged it, so
 * production deployments resolved to the *merged feature branch*. Main's rows
 * were written under a branch that no longer exists, and that branch's rows
 * were reset from "merged" back to "open".
 *
 * So: trust the deployment environment first, then ask which branch this
 * commit is actually the head of, and only fall back to pull requests that are
 * still open.
 */
async function branchForSha(sha) {
  if (environment.toLowerCase() === "production") return defaultBranch;

  const heads = await github(`/repos/${repo}/commits/${sha}/branches-where-head`);
  if (Array.isArray(heads) && heads.length > 0) {
    // A commit can head several branches; the trunk wins.
    if (heads.some((head) => head.name === defaultBranch)) return defaultBranch;
    return heads[0].name;
  }

  // The branch has moved on since this build. An open PR still identifies it;
  // a closed one would name a branch that is already merged away.
  const pulls = await github(`/repos/${repo}/commits/${sha}/pulls`);
  const open = Array.isArray(pulls)
    ? pulls.find((pull) => pull.state === "open")
    : null;
  if (open?.head?.ref) return open.head.ref;

  console.warn(
    `  ⚠ Could not resolve a branch for commit ${sha.slice(0, 7)}; ` +
      "registering against the SHA. Check that GITHUB_TOKEN is set."
  );
  return sha;
}

/* ------------------------------------------------------------------ */
/* screenshots                                                         */
/* ------------------------------------------------------------------ */

async function captureScreenshots(entries) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
    ...(bypassSecret
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": bypassSecret,
            // Persist the bypass as a cookie so client-side navigation within
            // the prototype does not hit the challenge again.
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
  });

  const shots = new Map();

  try {
    for (const entry of entries) {
      const target = `${deploymentUrl}${entry.path}`;
      const page = await context.newPage();
      try {
        await page.goto(target, {
          waitUntil: "networkidle",
          timeout: NAV_TIMEOUT_MS,
        });

        // A protected deployment redirects to Vercel SSO. Landing on another
        // origin means we are about to photograph a login page, which would
        // look like a successful run and quietly fill the hub with junk.
        const landed = new URL(page.url());
        if (landed.origin !== new URL(deploymentUrl).origin) {
          throw new Error(
            `redirected off-origin to ${landed.origin} — this is Vercel ` +
              "Deployment Protection. Set VERCEL_AUTOMATION_BYPASS_SECRET " +
              "(Vercel → Settings → Deployment Protection → Protection " +
              "Bypass for Automation) and add it as a GitHub Actions secret."
          );
        }

        await page.addStyleTag({ content: HIDE_CHROME_CSS });
        await page.waitForTimeout(SETTLE_MS);
        const png = await page.screenshot({ type: "png" });
        shots.set(entry.slug, png);

        if (screenshotDir) {
          fs.mkdirSync(screenshotDir, { recursive: true });
          const file = path.join(screenshotDir, `${sanitiseKeyPart(entry.slug)}.png`);
          fs.writeFileSync(file, png);
          console.log(`  ✓ ${entry.slug} — ${target} → ${file}`);
        } else {
          console.log(`  ✓ ${entry.slug} — ${target}`);
        }
      } catch (error) {
        // One broken prototype must not sink the whole registration run.
        console.warn(`  ⚠ ${entry.slug} — screenshot failed: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  return shots;
}

/* ------------------------------------------------------------------ */
/* main                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  const entries = readRegistry();

  const resolved = await resolveBranchAndPr();
  if (resolved.branch !== branch) {
    console.log(`  resolved   ${branch.slice(0, 7)} → branch "${resolved.branch}"`);
  }
  branch = resolved.branch;
  const prNumber = resolved.prNumber;

  // main lives in the trunk; every other branch is in flight until its PR closes.
  const status = branch === defaultBranch ? "merged" : "open";

  // Screenshot the exact build that was deployed, but record the stable domain
  // as the link target on the default branch — that is where people should
  // land, and it is the one URL that is reliably public.
  const linkUrl =
    branch === defaultBranch && productionUrl ? productionUrl : deploymentUrl;

  console.log(`\nRegistering ${entries.length} prototype(s)`);
  console.log(`  repo       ${repo}`);
  console.log(`  branch     ${branch}`);
  console.log(`  deployment ${deploymentUrl}`);
  console.log(`  commit     ${commitSha ?? "(unknown)"}`);
  console.log(`  pr         ${prNumber ?? "(none open)"}`);
  console.log(`  status     ${status}`);
  console.log(`  bypass     ${bypassSecret ? "set" : "(none)"}`);
  if (linkUrl !== deploymentUrl) console.log(`  links to   ${linkUrl}`);
  if (dryRun) console.log("  MODE       dry run — nothing will be written\n");
  else console.log("");

  if (entries.length === 0) {
    console.log("Registry is empty; will remove any rows this branch left behind.");
  }

  // A dry run skips capture unless --screenshot-dir was passed, which is the
  // signal that seeing the screenshots is the point of the run.
  const capture = !dryRun || Boolean(screenshotDir);

  console.log("Capturing screenshots…");
  const shots = capture ? await captureScreenshots(entries) : new Map();

  if (dryRun) {
    if (!capture) console.log("  (skipped in dry run)");
    console.log("");
    console.log("Would upsert:");
    for (const entry of entries) {
      console.log(
        `  • ${entry.slug.padEnd(24)} ${deploymentUrl}${entry.path}` +
          `  →  ${BUCKET}/${sanitiseKeyPart(`${repo}/${branch}/${entry.slug}`)}.png`
      );
    }
    console.log(
      "\nWould delete any existing rows for " +
        `(${repo}, ${branch}) whose slug is not listed above.\n`
    );
    return;
  }

  const supabase = createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  /* upload screenshots ------------------------------------------------ */

  console.log("\nUploading screenshots…");
  const screenshotUrls = new Map();

  for (const entry of entries) {
    const png = shots.get(entry.slug);
    if (!png) continue;

    const key = `${sanitiseKeyPart(`${repo}/${branch}/${entry.slug}`)}.png`;

    const { error } = await supabase.storage.from(BUCKET).upload(key, png, {
      contentType: "image/png",
      // Overwrite the same key rather than piling up one object per run.
      upsert: true,
      cacheControl: "31536000",
    });

    if (error) {
      console.warn(`  ⚠ ${entry.slug} — upload failed: ${error.message}`);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(key);

    // The object is overwritten in place, so the URL never changes. Version it
    // by commit so the CDN serves the new screenshot instead of a cached one.
    screenshotUrls.set(
      entry.slug,
      commitSha ? `${publicUrl}?v=${commitSha.slice(0, 12)}` : publicUrl
    );
    console.log(`  ✓ ${key}`);
  }

  /* upsert rows -------------------------------------------------------- */

  if (entries.length > 0) {
    const rows = entries.map((entry) => ({
      repo,
      branch,
      slug: entry.slug,
      name: entry.name,
      description: entry.description,
      path: entry.path,
      preview_url: linkUrl,
      screenshot_url: screenshotUrls.get(entry.slug) ?? null,
      commit_sha: commitSha,
      author: entry.author,
      pr_number: prNumber,
      status,
    }));

    console.log("\nUpserting rows…");
    const { error } = await supabase
      .from("prototypes")
      .upsert(rows, { onConflict: "repo,branch,slug" });

    if (error) fail(`Upsert failed: ${error.message}`);
    console.log(`  ✓ ${rows.length} row(s)`);
  }

  /* prune rows for prototypes that no longer exist ---------------------- */

  console.log("\nPruning removed prototypes…");
  const { data: existing, error: readError } = await supabase
    .from("prototypes")
    .select("id, slug")
    .eq("repo", repo)
    .eq("branch", branch);

  if (readError) fail(`Could not read existing rows: ${readError.message}`);

  const live = new Set(entries.map((entry) => entry.slug));
  const stale = (existing ?? []).filter((row) => !live.has(row.slug));

  if (stale.length === 0) {
    console.log("  ✓ nothing to prune");
  } else {
    const { error: deleteError } = await supabase
      .from("prototypes")
      .delete()
      .in(
        "id",
        stale.map((row) => row.id)
      );

    if (deleteError) fail(`Prune failed: ${deleteError.message}`);
    console.log(`  ✓ removed ${stale.map((row) => row.slug).join(", ")}`);
  }

  console.log("\nDone.\n");
}

main().catch((error) => {
  fail(error?.stack ?? String(error));
});
