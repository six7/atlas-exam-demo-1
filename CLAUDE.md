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

### Rule 3 — every entry must pass validation

```bash
npm run validate:registry
```

All five fields are required. `id` must be kebab-case and match the folder
name, `createdAt` must be `YYYY-MM-DD`, ids must be unique, and every entry
needs `src/prototypes/<id>/index.tsx`. The check runs on every pull request and
again before CI registers anything. Run it after editing the registry.

### The "New prototype" button composes a prompt

It does not create files. It emits the author's brief plus the five registry
fields, and the agent does the work locally.

The prompt deliberately carries **no procedure** — no "read AGENTS.md first",
no token rules, no "don't write to Supabase". Those live in AGENTS.md under
*"If you are an agent handed a New prototype prompt"*. Repeating them in every
generated prompt buried the one part only the author could write. Do not add
them back.

An earlier version was a server action that wrote to the filesystem. That
worked locally and failed on every deployment — a serverless instance has no
git checkout to write into. Do not reintroduce it.

### Leva is per prototype, never global

`leva` is for controls a prototype author adds to their **own** prototype —
variants, states, feature flags. Nothing mounts it in `app/layout.tsx`, and a
prototype that never calls `useControls` shows no panel.

Do not add a global control panel, and do not wire Leva to design-system values
— brand colour, radius, spacing, font size, dark mode. Those live in
`app/tokens.css` and are shared by everyone; a panel writing them onto `<html>`
retunes every prototype at once. To explore a token change, change the token.

There was such a panel. It also owned a "Dark mode" switch, which it synced
against `next-themes` in both directions — two effects in one commit, each
correcting the other from a stale read, swapping values forever. That is what a
theme strobing between light and dark looks like. Two controls over one piece of
global state is the bug, not the sync code.

### Feedback

The overlay is **not** bundled with prototypes. It ships as `public/feedback.js`
from production, and `app/prototypes/[id]/page.tsx` loads it via
`FeedbackLoader`. That is deliberate: prototypes merged months ago pick up UI
improvements without being rebuilt.

So `public/feedback.js` has hard constraints — no framework, no build step, no
imports. It runs inside arbitrary prototypes on arbitrary React versions, in a
shadow root. Do not "modernise" it into a React component.

Press **C** in a prototype to attach a comment to a DOM element; it renders as
a pin on the page. Comments post through `app/api/feedback/route.ts`, never
straight from the client.

Selectors are generated from the DOM and break when you restructure. Add
`data-feedback-id="…"` to anything that should keep its pin across edits — the
overlay checks that attribute first.

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
