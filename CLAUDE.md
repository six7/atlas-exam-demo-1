# CLAUDE.md

**Read `AGENTS.md` first.** It is the full guide to this repo — folder layout,
design tokens, shared components, dark mode, Storybook, and the prototype
workflow. This file exists to keep the rules that are easiest to get wrong in
front of you, and deliberately does not restate the rest.

---

## The shared prototype registry

Prototypes are indexed centrally, so the hub at `/` shows work from **every
branch** rather than only the branch a deployment was built from. Two halves:

| | `src/prototypes/registry.json` | Supabase `prototypes` table |
|---|---|---|
| Role | **Authoring format** | **Shared index** |
| Written by | You | **CI only** |

### Rule 1 — `registry.json` is the only registry file you edit

Creating a prototype is exactly two changes:

1. a new `src/prototypes/<slug>/index.tsx`
2. a new entry in `src/prototypes/registry.json`

```json
{
  "id": "my-feature",
  "name": "My Feature",
  "author": "Your Name",
  "description": "What you're exploring.",
  "createdAt": "2026-08-24"
}
```

Nothing else. The prototype is discovered at runtime.

### Rule 2 — never write to Supabase

The `prototypes` table is populated **only** by
`.github/workflows/register-prototypes.yml`, after Vercel reports a successful
deployment. Do not add a server action, route handler, migration, or script
that inserts, updates, or deletes prototype rows. Do not "help" by seeding a
row so a prototype shows up sooner — push instead, and CI will register it.

This is structural, not a convention:

- RLS grants `anon` **SELECT only** on `prototypes`.
- The secret key is **not set on Vercel**, so a page that tried to write would
  fail at runtime rather than quietly succeed.
- `lib/supabase/admin.ts` holds the only write-capable client and is for CI and
  local scripts. **Importing it from `app/` is a bug.**

If a change genuinely needs to write to the registry, it belongs in
`scripts/register-prototypes.mjs`.

### The "New prototype" flow writes locally only

`app/actions/prototype.ts` creates the folder and appends to `registry.json`.
It does not contact Supabase, and must not start to. The prototype reaches the
hub when CI registers the deployment, not when it is created.

### Feedback

`app/prototypes/[id]/page.tsx` mounts the Feedback overlay into every
prototype. Prototypes do not opt in and should not mount their own. Comments
go through `app/api/feedback/route.ts`, never straight from the client.

Anything that floats above a prototype must carry `data-screenshot-hide`, or it
will end up in the CI screenshots.

### API keys

Supabase's new **publishable** (`sb_publishable_…`) and **secret**
(`sb_secret_…`) keys replace the legacy `anon` / `service_role` JWTs, which are
deprecated at the end of 2026. The code prefers the new variable names and
falls back to the legacy ones:

| Role | New | Legacy fallback |
|---|---|---|
| Reads | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| CI writes | `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |

Publishable → `anon`, secret → `service_role`, so **RLS policies are identical
for both** — never rewrite a policy because the key format changed. In raw REST
calls, new-style keys go in the `apikey` header only, never
`Authorization: Bearer`; use `scripts/lib/supabase-keys.mjs`.

### Working without Supabase

With `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` unset,
the hub falls back to `registry.json` and says so on screen. This is a supported
mode — never gate prototype work on having Supabase configured.

---

## Everything else

`AGENTS.md` covers design tokens (`app/tokens.css` — always use them, never
hardcode hex), the shared component layer, the opt-in app shell, Tailwind v4
conventions, and `npm install --legacy-peer-deps`. `DESIGN.md` has the brand
guidelines. `PROGRESS.md` has the registry setup and validation steps.
