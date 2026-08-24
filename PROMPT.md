# Rebuild prompt: shared prototype registry

A prompt for rebuilding this system in another repo. It describes the **end
state**, not the route we took to it — and it front-loads the things that were
only obvious in hindsight, because those are what cost real time.

Adapt names, repo slug, and framework as needed. Written for Next.js App Router
+ Supabase + Vercel + GitHub Actions.

---

## What you are building

A repo where several people build UI prototypes on their own branches. Each
branch commits its own `registry.json`, so on its own each deployment only
knows about its own prototypes. The goal is a **shared hub** that lists every
prototype from every branch, with a screenshot and a comment thread, without
changing how prototypes are authored.

```
registry.json  ──push──▶  deploy  ──▶  CI: screenshot + upsert  ──▶  Supabase
   (you edit)                                                            │
                                                            hub reads ◀──┤
                                                    comments write ──────┘
```

The split that everything else follows from:

| | `registry.json` | Supabase |
|---|---|---|
| Role | authoring format | shared index |
| Written by | a person or their agent, locally | **CI only** |

---

## Stage 1 — Schema and clients

Two tables:

- `prototypes` — `id, repo, branch, slug, name, description, path, preview_url,
  screenshot_url, commit_sha, author, pr_number, status (open|merged|closed),
  created_at, updated_at`, **unique on `(repo, branch, slug)`**.
- `feedback` — `id, prototype_id (fk, on delete cascade), body, author_name,
  commit_sha, created_at`, plus anchor columns (Stage 5).

RLS: anon may `SELECT` prototypes and `SELECT`/`INSERT` feedback. **No**
insert/update/delete policy on prototypes — writes require the service role.
Revoke at the GRANT layer too, so a policy added by mistake later still cannot
open up writes.

Three clients: browser (publishable key), server (publishable key,
RLS-enforced), admin (secret key, `import "server-only"`, used by CI scripts
only — never from `app/`).

> **Trap: type aliases, not interfaces.** supabase-js requires each table's
> `Row` to satisfy `Record<string, unknown>`. Only `type` aliases get an
> implicit index signature. Declare rows as `interface` and the schema silently
> fails that constraint — every query resolves to `never`, with no error
> pointing anywhere near the cause.

> **Trap: new-style API keys.** Supabase replaced `anon`/`service_role` JWTs
> with `sb_publishable_…` / `sb_secret_…`. They map to the *same* Postgres
> roles, so RLS policies need no change. But new keys must be sent in the
> `apikey` header only, **never** `Authorization: Bearer` — matters if you make
> raw PostgREST calls. supabase-js handles it for you.

> **Trap: blank env vars.** `FOO=` in `.env.local` yields `""`, not `undefined`,
> so `process.env.NEW ?? process.env.OLD` picks the empty string and never
> falls back. Use a first-non-blank helper for every fallback pair.

---

## Stage 2 — The hub

Home page reads Supabase. Cards show screenshot, name, description, branch,
author, status, relative updated time, and link to **`preview_url + path`** so
clicking opens the prototype on the deployment it lives on.

Group `main` first, then open branches, then merged/closed. Filter by branch
and author; sort by recency and by comment count.

**Keep a local fallback:** if the Supabase env vars are missing *or the read
fails*, fall back to reading `registry.json` and say so on screen. Distinguish
the two cases — "not configured" and "unreachable" are different problems, and
collapsing them makes setup painful to debug.

Comments post through a route handler, never client-to-Supabase. The client
sends only a slug; the handler resolves it to a prototype row using the
deployment's own repo/branch, so a client cannot post against an arbitrary id.

---

## Stage 3 — CI registration

Trigger on **`deployment_status`** where `state == 'success'`, not
`pull_request`: the screenshot needs a preview URL, which does not exist yet at
`pull_request` time.

Per successful deployment: check out the deployed commit, read `registry.json`,
Playwright-screenshot `{deployment_url}{path}` at 1280x800, upload to a public
storage bucket keyed `repo/branch/slug` with upsert, upsert one row per entry
on `(repo, branch, slug)`, then **delete rows for that `(repo, branch)` whose
slug is no longer in the file**.

A second workflow on `pull_request: closed` sets `merged` or `closed`.

> **Myth: "deployment_status only runs the default branch's workflow."** It
> does not — `deployment` and `deployment_status` are not in that list. The
> workflow runs from the feature branch, so the PR adding it *can* test itself.

> **Trap: `deployment.ref` is a commit SHA, not a branch.** Vercel deploys
> against the SHA. Storing that in `branch` is quietly destructive: the natural
> key changes every commit, so upserts never dedupe, pruning never matches, the
> hub cannot group, and the PR-close workflow never finds the rows.

> **Trap: resolving that SHA. Order matters.** Use
> `/commits/{sha}/branches-where-head`. Do **not** reach for
> `/commits/{sha}/pulls` first — a merge commit still belongs to the PR that
> merged it, so production deployments resolve to the *merged feature branch*.
> We hit this: main's data was written under a deleted branch, and that
> branch's rows were reset from `merged` back to `open`. Correct order:
> deployment environment (`Production` → default branch) → `branches-where-head`
> → only **open** pull requests.

> **Trap: Node 20.** supabase-js needs a native WebSocket; `createClient()`
> throws on 20. Pin Node 22 in the workflow.

> **Trap: Deployment Protection.** If the Vercel project has it on, every
> preview URL 302s to SSO and Playwright screenshots a **login page** — a green
> run full of junk. Pass `VERCEL_AUTOMATION_BYPASS_SECRET` as
> `x-vercel-protection-bypass` + `x-vercel-set-bypass-cookie`, and **detect an
> off-origin redirect after navigation and fail loudly**. Never put that secret
> in a link on a public page.

> **Trap: `environment_url` is the hashed immutable build URL** and is also
> SSO-walled. For the default branch, record a configured stable production
> domain as the link target instead, while still screenshotting the exact build.

> **Hide your own chrome before screenshotting.** Tag floating UI
> `data-screenshot-hide` and hide it plus framework dev panels via
> `addStyleTag` before capture, or every screenshot has your feedback button
> and dev tooling in it.

---

## Stage 4 — Creating prototypes

**Do not write files from a server action.** A serverless instance has no git
checkout, so it fails on every deployment — and even on success the write could
never reach the author's working copy.

Instead, the "New prototype" button **composes a prompt**. Take name / author /
description, let the user pick their agent, and hand them a deep link plus
clone commands plus a prompt naming the exact folder and registry entry.

Real deep links, as of writing:

| Tool | Link | Caveat |
|---|---|---|
| Claude Code | `claude-cli://open?repo=owner/name&q=<encoded>` | Resolves only to a clone it has already seen. Does **not** clone. 5,000 char limit on `q`. |
| GitHub Copilot | `ghapp://session/new?repo=&prompt=&mode=interactive`, wrapped in `https://github.com/copilot/app/launch?open=<encoded>` | Use the hosted launcher — web pages routinely refuse custom schemes. |
| Codex | none | Clone commands + prompt. |

Always offer clone commands as a fallback, and be explicit about what each link
does and does not do.

**Make the registry a checked contract.** Validate: all required fields present
and non-empty, kebab-case unique ids, ISO dates, no unknown fields, and a
matching `src/prototypes/<id>/index.tsx`. Run it on every PR touching the
prototypes directory *and* before CI registers anything. A registered prototype
that does not render is worse than no entry. Ship a JSON Schema referenced from
the file so editors enforce it too.

---

## Stage 5 — Commenting that survives

Two requirements that shape the implementation:

**1. Comments attach to DOM elements.** Press `C` (or a button) to enter pick
mode: hover outlines elements, click attaches. Store a selector plus
coordinates **normalised 0..1 inside the element's box**, so the pin survives a
resize or a different viewport. Render pins as avatars on the page, tracking
scroll and resize via `requestAnimationFrame`.

Selectors are best-effort — the prototype they point into is still being
edited. When one stops resolving, show the comment as unanchored with the
element's captured label, marked "(gone)". Never drop it. Check a stable
`data-feedback-id` attribute before falling back to a structural path.

**2. Serve the overlay from production, not from the prototype.** This is the
important one. If the overlay is bundled into each prototype, it freezes at
whatever branch built it, and a prototype merged months ago never improves.

Ship it as a standalone script on the production deployment; every prototype
loads it from there. That forces real constraints, all of them worth accepting:

- **No framework, no build step.** It runs inside arbitrary prototypes on
  arbitrary framework versions, so it cannot import anything.
- **Shadow DOM**, so the host's CSS cannot leak in or out.
- **It calls the API on the origin that served it**, which means preview
  deployments need no backend configuration at all — but the API must answer
  **CORS**. Use an allowlist (localhost + your project's own hosts), not `*`:
  this endpoint writes.
- **Short cache** (`max-age=60, must-revalidate`). A long cache defeats the
  entire point.
- Tag its root `data-screenshot-hide`.

---

## Environment

| Where | Variables |
|---|---|
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` |
| Vercel (all envs) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_FEEDBACK_ORIGIN` |
| GitHub secrets | `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `VERCEL_AUTOMATION_BYPASS_SECRET` |
| GitHub variables | `REGISTRY_PRODUCTION_URL` |

**Do not put the secret key on the deployment.** No runtime path needs it, and
its absence makes "CI writes, the app never does" structural rather than a
convention a future change can quietly break.

---

## Verification worth building

A single command that hits the live project over HTTP and checks: tables exist,
upsert works on the natural key, anon can read, anon can insert feedback, anon
writes to prototypes are **denied**, and the storage bucket accepts an upload
and serves it publicly. Seed a probe row, assert, clean up, exit non-zero on
failure.

This is more useful than SQL-only RLS checks, because it exercises your actual
*keys* and the actual HTTP path — which is where the real problems were.

---

## The one thing that will still be broken

If the host has Deployment Protection on, **branch previews stay behind SSO for
humans**. CI can bypass it with a secret; a teammate clicking a card cannot,
and embedding that secret in the public hub would publish it and disable the
protection for everyone.

There is no code fix. Either turn off preview authentication, or accept that
only people with platform access can open in-progress prototypes. Decide this
early — it determines whether the hub is genuinely shareable.
