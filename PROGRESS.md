# Shared Prototype Registry — Progress

Turning the per-branch local registry into a **central Supabase index** that every
branch pushes into, while `src/prototypes/registry.json` stays exactly as it is
for authoring.

**Repo:** `six7/atlas-exam-demo-1`
**Branch:** `claude/shared-prototype-registry-ef3253`

> **Naming note.** The spec calls the local file `prototypes.json`. In this repo it is
> `src/prototypes/registry.json`, shape `{ prototypes: [{ id, name, author, description, createdAt }] }`.
> Same file, same role. `slug` maps to `id`; `path` is derived as `/prototypes/{id}`.

---

## Environment variables — what to set, where

Set these before validating Stage 1. Nothing below Stage 1 works without them.

> **Key generations.** Supabase replaced the legacy JWT keys (`anon` /
> `service_role`) with **publishable** (`sb_publishable_…`) and **secret**
> (`sb_secret_…`) keys; the legacy ones are deprecated at the end of 2026.
> Everything here uses the new names and **falls back to the legacy ones**, so
> either generation works. A publishable key resolves to the same `anon`
> Postgres role and a secret key to `service_role`, which is why the RLS
> policies are identical for both.
>
> Create them in **Supabase → Project Settings → API Keys → Publishable and
> secret keys**.

### 1. Local — `.env.local` (repo root, gitignored)

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key, `sb_publishable_…` |
| `SUPABASE_SECRET_KEY` | Secret key, `sb_secret_…` (**secret**) |

Legacy equivalents, used only if the above are blank:
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 2. Vercel — Project Settings → Environment Variables

Tick **Production + Preview + Development** (preview deploys are the whole point).

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key, `sb_publishable_…` |

**Do not** add the secret key to Vercel. No runtime path needs it — feedback
inserts go through RLS as `anon`. Keeping it out of the deployment enforces
"CI writes, the app never does" structurally rather than by convention.

### 3. GitHub — Settings → Secrets and variables → Actions

**Repository *variables*** (not secrets — this one is a public URL):

| Variable | Value |
|---|---|
| `REGISTRY_PRODUCTION_URL` | `https://atlas-exam-demo-1.vercel.app` |

Without it, cards for `main` link to the immutable hashed build URL
(`…-9o8yim5eu-….vercel.app`), which is behind Vercel SSO on a protected
project — so clicking a card lands on a login page.

**Repository secrets:**

| Secret | Value |
|---|---|
| `SUPABASE_URL` | Project URL (same as above, no `NEXT_PUBLIC_` prefix) |
| `SUPABASE_SECRET_KEY` | Secret key, `sb_secret_…` (**secret**) |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | **Required — this project has Deployment Protection on.** Vercel → Settings → Deployment Protection → Protection Bypass for Automation |

Repository secrets, not environment secrets — the workflows do not target a
GitHub Environment. The workflows also pass `SUPABASE_SERVICE_ROLE_KEY` through,
so adding that secret instead works if the project is still on legacy keys.

---

## Stage 1 — Schema and client

**Status:** ✅ **validated** — 2026-08-24, 14/14 live checks passed

### What gets built
- [x] `lib/supabase/client.ts` — browser client (anon key)
- [x] `lib/supabase/server.ts` — server-side anon client (RLS-enforced reads/feedback)
- [x] `lib/supabase/admin.ts` — service-role client, server-only, **not used by app code**
- [x] `lib/supabase/types.ts` — row types for `prototypes` and `feedback`
- [x] `supabase/migrations/0001_shared_prototype_registry.sql` — paste-into-SQL-editor migration
- [x] `supabase/verify-rls.sql` — in-database RLS probe script
- [x] `scripts/verify-registry.mjs` (`npm run verify:registry`) — live end-to-end
      check of schema, RLS, keys, and storage
- [x] `.env.example` committed, `.env.local` created and gitignored
- [x] `.gitignore` allows `.env.example` through the `.env*` rule
- [x] `lib/supabase/env.ts` — optional-env reader driving the fallback

### Not touched
`src/prototypes/registry.json`, `app/page.tsx`.

### ✅ Self-validation

1. **Migration runs clean.** Paste `supabase/migrations/0001_shared_prototype_registry.sql`
   into the Supabase SQL editor and run. Expect no errors. Running it twice should also
   be clean (it is idempotent).

2. **Tables exist with the right shape.** Supabase → Table Editor. Confirm:
   - `prototypes` — `id, repo, branch, slug, name, description, path, preview_url, screenshot_url, commit_sha, author, pr_number, status, created_at, updated_at`
   - `feedback` — `id, prototype_id, body, author_name, commit_sha, created_at`
   - `prototypes` has a unique constraint on `(repo, branch, slug)`

3. **Everything else, in one command.** With `.env.local` filled in:

   ```bash
   npm run verify:registry
   ```

   Hits the live project over HTTP and checks tables, upsert on the
   `(repo, branch, slug)` constraint, anon reads, anon feedback inserts, that
   anon writes to `prototypes` are denied, and that the storage bucket accepts
   an upload and serves it publicly. Cleans up after itself; exits non-zero on
   any failure. Expect **14/14 passed**.

   This is the fastest check because it exercises your actual *keys*, which the
   SQL-only version below cannot.

   Optional, from inside the database: paste `supabase/verify-rls.sql` into the
   SQL editor. Six probes run as `anon` in a rolled-back transaction; expect six
   ✅ PASS rows.

4. **Keys are wired up.** With `.env.local` filled in, `npm run dev` and load
   `/`. The "Local registry" notice should be gone. If it says *"Shared registry
   unreachable"*, the URL or key is wrong — the notice quotes the underlying
   error.

5. **`.env.local` is ignored, `.env.example` is not:**
   ```bash
   git check-ignore -v .env.local && git check-ignore -v .env.example; echo "exit=$?"
   ```
   Expect: a match line for `.env.local`, **no** match for `.env.example`, `exit=1`.

6. **It compiles.**
   ```bash
   npx tsc --noEmit
   ```

---

## Stage 2 — The hub and feedback

**Status:** ✅ **validated** — 2026-08-24, hub + feedback round-trip confirmed against Supabase

### What gets built
- [x] Home screen reads from Supabase instead of local `registry.json`
- [x] Cards show screenshot, name, description, branch, author, status, relative updated time
- [x] Card links to `preview_url + path` (opens on the deployment it lives on)
- [x] Grouped: `main` first, then open branches
- [x] Filter by branch, filter by author
- [x] Sort by recency, sort by feedback count
- [x] Local fallback: missing Supabase env vars → read `registry.json`, repo runs standalone
- [x] `FeedbackOverlay` — floating button + panel, mounts in any prototype shell
- [x] Display name asked once, kept in `localStorage`
- [x] Feedback posts through a route handler, never direct from client
- [x] Feedback threads visible on hub cards
- [x] `src/components/Hub/PrototypeHub.stories.tsx` — fixtures so the hub UI
      can be reviewed without a Supabase project

### ✅ Self-validation

1. **Standalone fallback works.** Temporarily rename `.env.local`, then `npm run dev`.
   Home page should still list the three local prototypes with a visible "local
   fallback" indicator. Restore `.env.local` after.

2. **Supabase mode works.** With `.env.local` in place, insert a fake row via the
   Supabase SQL editor (snippet provided at the bottom of this doc), reload `/`, and
   confirm the card renders with branch, author, status and relative time.

3. **Card link is correct.** Hover a card — the URL should be
   `{preview_url}{path}`, i.e. a full absolute URL to the branch deployment, not a
   local relative route.

4. **Filters and sorting.** Filter by branch and by author; switch sort between
   recency and feedback count. Confirm the grid updates and `main` stays grouped first.

5. **Feedback round-trip.** Open a prototype, click the feedback button, enter a
   display name once, post a comment. Confirm:
   - the comment appears in the panel immediately
   - a row lands in the `feedback` table in Supabase
   - reloading the page keeps the display name (no second prompt)
   - the same comment shows on the hub card

6. **No secret key in the browser bundle.**
   ```bash
   npm run build && grep -rE "sb_secret_|service_role" .next/static 2>/dev/null; echo "exit=$? (1 = clean)"
   ```

---

## Stage 3 — CI registration

**Status:** ✅ **validated** — 2026-08-24, both workflows green in CI

### What gets built
- [x] `.github/workflows/register-prototypes.yml` — triggers on `deployment_status`, `state == 'success'`
- [x] Checks out the deployed commit
- [x] Reads `registry.json`
- [x] Playwright screenshots `{deployment_url}{path}` at 1280x800, network idle
- [x] Uploads to storage bucket `prototype-screenshots`, keyed `repo/branch/slug` (overwrite, not accumulate)
- [x] Upserts one row per entry on the `(repo, branch, slug)` constraint
- [x] Fills `preview_url`, `screenshot_url`, `commit_sha`, `author`, `pr_number`, `status`
- [x] Deletes rows for `(repo, branch)` whose slug left `registry.json`
- [x] `.github/workflows/prototype-pr-status.yml` — on `pull_request: closed`, sets `merged` or `closed`
- [x] `scripts/register-prototypes.mjs` + `scripts/update-prototype-status.mjs`
- [x] CI screenshots hide the Leva panel and the feedback overlay
      (anything marked `data-screenshot-hide`)

### ⚠️ Correction

An earlier version of this doc claimed `deployment_status` workflows only run
from the default branch's copy of the file, so the PR adding them could not
test itself. **That was wrong.** `deployment` and `deployment_status` are not
in the set of events that run from the default branch, and the workflow ran
from the feature branch on the first push — which is how the two bugs below
were caught before merge.

### ✅ Self-validation

1. **Bucket exists.** Supabase → Storage. Confirm a **public** bucket named
   `prototype-screenshots` (created by the Stage 1 migration).

2. **Secrets are set.** GitHub → Settings → Secrets and variables → Actions.
   Confirm `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or the legacy
   `SUPABASE_SERVICE_ROLE_KEY`), and `VERCEL_AUTOMATION_BYPASS_SECRET` under
   **Repository secrets**.

   > **Deployment Protection is enabled on this Vercel project.** Per-deployment
   > URLs redirect to Vercel SSO, so without the bypass secret Playwright would
   > capture a login page. The script detects the off-origin redirect and fails
   > the run with a pointer to this setting rather than uploading junk — but
   > set the secret and it just works.

3. **Dry run locally** before trusting CI:
   ```bash
   npm run register:prototypes -- --dry-run --deployment-url https://example.vercel.app
   ```
   Expect a printed plan — which rows would be upserted, which deleted — and no writes.

4. **Real run.** Push this branch, let Vercel deploy. When the deployment succeeds the
   workflow fires. In the Actions tab, confirm the run is green and the log lists one
   screenshot per prototype.

5. **Rows landed.** Supabase → `prototypes` table. Confirm one row per entry for this
   branch, with a populated `screenshot_url` that loads in a browser.

6. **Re-run overwrites, not accumulates.** Re-run the workflow. Confirm the row count
   is unchanged and `updated_at` moved forward.

7. **Deletion works.** Remove an entry from `registry.json`, push, wait for redeploy.
   Confirm that row disappears from the table and from the hub.

8. **Close the PR.** Confirm the second workflow sets `status` to `merged` or `closed`
   for this branch's rows, and the hub regroups them accordingly.

---

## Stage 4 — Agent instructions

**Status:** ✅ **shipped** — merged in PR #5

### What gets built
- [x] `AGENTS.md` describes the shared registry
- [x] `CLAUDE.md` created (it was removed in an earlier commit) and kept in sync
- [x] States plainly: `registry.json` is the authoring format and the only file an agent edits
- [x] States plainly: Supabase is populated by CI, never written from app code or by an agent
- [x] "New prototype" flow documented as writing **locally only**
- [x] `README.md` shared-hub section (the home page is no longer a local picker)

### ✅ Self-validation

1. Ask a fresh agent to "create a new prototype called Test Widget". Confirm it edits
   only `src/prototypes/registry.json` + a new folder, and does not attempt any
   Supabase write.
2. Grep for accidental guidance drift:
   ```bash
   grep -n "registry.json\|Supabase\|supabase" AGENTS.md CLAUDE.md
   ```

---

## Handy SQL snippets

**Insert a fake prototype row for Stage 2 validation:**
```sql
insert into public.prototypes
  (repo, branch, slug, name, description, path, preview_url, commit_sha, author, status)
values
  ('six7/atlas-exam-demo-1', 'main', 'dashboard-v2', 'Dashboard v2',
   'Redesigned dashboard with activity feed and quick actions.',
   '/prototypes/dashboard-v2', 'https://example.vercel.app',
   'abc1234', 'Sam Wilson', 'open')
on conflict (repo, branch, slug) do update set updated_at = now();
```

**Wipe everything and start over:**
```sql
truncate table public.feedback, public.prototypes restart identity cascade;
```

---

## Validation log

**2026-08-24 — Stage 1 ✅**
`npm run verify:registry` → **14/14**. Schema, upsert on the
`(repo, branch, slug)` constraint, anon reads, anon feedback inserts, storage
upload + public read. Critically, anon `INSERT`/`UPDATE`/`DELETE` on
`prototypes` all returned **401** and the probe row was unchanged afterwards.

**2026-08-24 — Stage 2 ✅**
Ran a real registration of `main` against `https://atlas-exam-demo-1.vercel.app`:
3 screenshots captured, uploaded, and upserted. The hub then rendered them from
Supabase — no fallback notice, real screenshots, `main` grouping, commit
`57a096c`, "Merged" badges. Posted a comment through the overlay; it landed in
the `feedback` table and appeared inline on the hub card.

Note: that comment's `commit_sha` is `null`, which is correct — it comes from
`VERCEL_GIT_COMMIT_SHA`, which only exists on a Vercel deployment.

**2026-08-24 — Stage 3, first CI run.** The workflow fired from the feature
branch (see the correction above) and caught two bugs that could not surface
locally:

1. **Node 20 has no native WebSocket**, so `@supabase/supabase-js` threw inside
   `createClient()`. Both workflows now pin Node 22. The run failed before any
   write, so no bad rows were created.
2. **Vercel set `deployment.ref` to the commit SHA, not the branch name.** The
   log read `branch 45ae4ce7…`. Left alone this would have keyed every row by
   SHA — upserts would never dedupe, pruning would never match, the hub could
   not group by branch, and the PR-close workflow would never find the rows.
   `resolveBranchAndPr()` now maps a SHA back to its branch via the GitHub API;
   verified resolving `45ae4ce` → `claude/shared-prototype-registry-ef3253`,
   and it picks up PR #5 which the old code missed entirely.

Confirmed working in that run: the Vercel bypass secret (`bypass set`, all
three screenshots captured from a protected preview).

**2026-08-24 — Stage 3 ✅ (after the fixes above)**

`Register prototypes` on `de876d8` — **success**:
```
resolved   de876d8 → branch "claude/shared-prototype-registry-ef3253"
pr         5
bypass     set
✓ onboarding-flow / dashboard-v2 / list-of-projects
```

`Update prototype status` on PR #5 close — **success**:
```
✓ Marked 3 row(s) "merged" for six7/atlas-exam-demo-1 @ claude/shared-prototype-registry-ef3253
```

Registry now holds 6 rows — 3 on `main`, 3 on the merged branch — all with
screenshots, and the hub groups them "On main" then "Merged & closed" with the
`#5` PR chip. Every stage is validated end to end.

### Known consequence: merged branch rows persist

A merged branch keeps its rows, marked `merged`, in the "Merged & closed"
group. So the same prototype can appear twice — once under `main`, once under
the branch it came from.

This is deliberate. `feedback` has `on delete cascade`, so deleting a merged
branch's rows would destroy the review conversation attached to them. Keeping
them preserves that history at the cost of a longer archive section. If the
archive ever gets noisy, the fix is to collapse that group in the UI rather
than to delete rows.

---

## What I verified, and what I could not

Verified locally:

- `npx tsc --noEmit` clean; `npm run build` succeeds with no new warnings
- `npm run lint` adds no new problems (6 remain, all pre-existing: `sidebar.tsx`,
  `ThemeToggle.tsx`, `PrototypeRenderer.tsx`, `AppSidebar.tsx`)
- The hub renders in local-fallback mode against this branch's `registry.json`
- Grouping, branch/author filtering, sorting, PR chips, and inline feedback
  threads all work — checked against fixtures in Storybook
- Card links resolve to `preview_url + path`, i.e. an absolute URL to the
  branch deployment
- Playwright captures all three prototypes at 1280x800 (@2x), with the Leva
  panel and feedback overlay correctly hidden
- The registration script's dry run prints the right upsert and prune plan
- Pointed at an unreachable Supabase, the hub falls back with an accurate
  "Shared registry unreachable" notice and the feedback API returns 502
  `registry_unreachable` — not a misleading "not registered yet"
- Key resolution: new-style keys preferred, legacy picked up when the new
  variable is blank, and raw-REST headers switch between `apikey`-only (new)
  and `apikey` + `Authorization` (legacy). Exercised both in the running app
  and as a unit check over five env combinations
- `package-lock.json` is in sync, so `npm ci --legacy-peer-deps` will work in CI

Could not verify without your Supabase project and GitHub secrets:

- That the migration applies cleanly (validation step 1 covers it)
- The real feedback round-trip against Supabase — the route handler, RLS
  policies, and insert path are written but never executed end to end
- Screenshot upload to storage and the public URL it produces
- The upsert and prune against the real `(repo, branch, slug)` constraint
- Both workflows actually firing

Those are exactly what the per-stage checks above are for.

### Notes on two judgement calls

- **`CLAUDE.md` is intentionally thin.** It was deleted in an earlier commit, so
  I recreated it as a pointer to `AGENTS.md` plus the rules that are easiest to
  get wrong, rather than a second full copy that would drift out of sync.
- **`status` on the default branch is `merged`.** `main` has no PR to close, and
  its prototypes are in the trunk. The hub groups by branch first, so they still
  land in "On main" rather than the archived group.

---

## Deployment Protection vs. sharing

The hub is public at **https://atlas-exam-demo-1.vercel.app**. Prototypes on
`main` are reachable there too, once `REGISTRY_PRODUCTION_URL` is set.

**Prototypes on feature branches are not.** Vercel Deployment Protection puts
every preview behind SSO, and GitHub's `deployment_status` event carries only
the per-deployment URL — Vercel's payload is empty, so there is no stable
public alias for CI to record instead. Anyone without Vercel access to the team
clicking a branch card gets a login page.

That is a direct conflict with the point of the hub. Three ways out:

1. **Turn off Vercel Authentication for preview deployments**
   (Settings → Deployment Protection). Everything works for everyone. Previews
   become reachable by anyone with the URL — usually fine for prototypes,
   but it is a real decision.
2. **Give every reviewer Vercel access** to the team. Works, but designers and
   stakeholders often will not have it.
3. **Leave it.** Branch prototypes stay reviewable only by people with Vercel
   access; the hub still shows what exists, who made it, and its screenshot.

Do **not** append the automation bypass secret to the card links. The hub is a
public page, so that would publish the secret in its HTML and disable the
protection for everyone anyway.

---

## Prototype creation, reworked

The original **New prototype** button was a server action that wrote
`src/prototypes/<slug>/index.tsx` and appended to `registry.json` with `fs`.
That works locally and fails on every deployment — a serverless instance has no
git checkout to write into, so clicking it on the hub returned a digest error.

It now composes a prompt instead. You describe the prototype, pick **Claude
Code**, **GitHub Copilot**, or **Codex**, and the dialog hands you a deep link
(where the tool provides one), clone commands, and a prompt naming the exact
folder and registry entry to create. The agent does the work in your checkout;
the prototype reaches the hub when you push.

What each tool actually supports, since none does clone-and-prompt in one click:

| Tool | Deep link | What it does |
|---|---|---|
| Claude Code | `claude-cli://open?repo=&q=` | Opens a session in an **existing** clone with the prompt filled in. Does not clone. |
| GitHub Copilot | `vscode://vscode.git/clone?url=` | Clones in VS Code. Copilot Chat cannot be pre-filled, so the prompt is pasted. |
| Codex | none | Clone commands plus the prompt. |

### The registry contract is now enforced

`scripts/validate-registry.mjs` (`npm run validate:registry`) requires all five
fields, kebab-case unique ids, `YYYY-MM-DD` dates, no unknown fields, and a
matching `src/prototypes/<id>/index.tsx`. It runs on every pull request that
touches `src/prototypes/`, and again before CI registers anything, so a
malformed entry fails a check rather than becoming a broken hub card.
`src/prototypes/registry.schema.json` gives editors the same rules inline.

Verified: the dialog's generated entry passes every rule, and the validator
catches bad slugs, missing fields, duplicate ids, bad dates, unknown fields, and
missing folders.
