<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Atlas — Agent & Prototype Environment Guide

## What is this project?

This is the **Atlas design system prototype environment**. It runs on Next.js 16, React 19, Tailwind v4, and shadcn/ui. It serves two purposes:

1. **Product shell** — a real app shell (Dashboard, Projects, Components, Tokens, Settings) that demonstrates the Atlas design system in use.
2. **Prototype sandbox** — a shared space where multiple people can each build and explore UI prototypes without stepping on each other's work.

---

## Multi-User Prototype System

This environment is used by multiple people simultaneously. Each person works in their own **isolated prototype folder**. Shared infrastructure (components, tokens, layout) is never modified for one person's prototype.

### Folder structure

```
src/
  prototypes/
    registry.json               ← source of truth: list of all prototypes
    [your-prototype-id]/
      index.tsx                 ← your prototype component (one default export)
    [someone-elses-id]/
      index.tsx

  components/
    ui/                         ← shadcn primitives (shared, don't edit)
    Button/, Card/, Input/      ← Atlas wrappers (shared)
    AppShell/                   ← shell components (shared, opt-in)

app/
  page.tsx                      ← prototype picker / home (outside shell)
  prototypes/
    [id]/
      page.tsx                  ← renders the chosen prototype full-screen
      PrototypeRenderer.tsx     ← dynamic lazy-loads from src/prototypes/[id]/index
  (shell)/
    layout.tsx                  ← app shell layout (Projects, Components, Tokens, Settings)
    projects/, components/, tokens/, settings/
  api/
    feedback/route.ts           ← reads/writes prototype feedback (RLS anon)

lib/
  supabase/                     ← clients: browser, server (anon), admin
  registry/                     ← hub data layer + local fallback

supabase/
  migrations/                   ← SQL for the shared registry
  verify-rls.sql                ← RLS self-check

scripts/
  register-prototypes.mjs       ← CI: screenshot + upsert into Supabase
  update-prototype-status.mjs   ← CI: mark rows merged/closed
  validate-registry.mjs         ← guards the registry.json contract
  verify-registry.mjs           ← live end-to-end check of Supabase setup

.github/workflows/              ← the two CI workflows above
```

### The rule: one folder per person

- Your prototype lives in `src/prototypes/your-id/index.tsx`.
- You can create any files inside your prototype folder.
- Do **not** modify other people's prototype folders.
- Shared components in `src/components/` are fine to use but should not be modified for a specific prototype. If you need a different version, create it inside your own prototype folder.

---

## The Shared Prototype Registry

Prototypes are indexed centrally so the home page shows work from **every
branch**, not just the branch a given deployment was built from.

There are two halves, and the split is the important thing to understand:

| | `src/prototypes/registry.json` | Supabase `prototypes` table |
|---|---|---|
| Role | **Authoring format** | **Shared index** |
| Lives | In the repo, per branch | One central database |
| Written by | You, or the "New prototype" flow | **CI only** |
| Read by | The app, when Supabase is unset | The hub at `/` |

### The two rules

1. **`src/prototypes/registry.json` is the only registry file an agent edits.**
   Creating a prototype means adding an entry there and creating the folder.
   Nothing else.

2. **Never write to Supabase from application code or as an agent.**
   The `prototypes` table is populated exclusively by
   `.github/workflows/register-prototypes.yml` after a successful Vercel
   deployment. Do not add a server action, route handler, script, or migration
   that inserts, updates, or deletes prototype rows.

This is enforced, not just asked for:

- Row Level Security grants `anon` **SELECT only** on `prototypes`. Writes
  require a secret key.
- The secret key is deliberately **not set on Vercel**, so a page that tried to
  write would fail at runtime rather than quietly succeed.
- `lib/supabase/admin.ts` is the only module holding a write-capable client,
  and it is for CI and local scripts. Importing it from `app/` is a bug.

If you think a prototype needs to write to the registry, the change belongs in
`scripts/register-prototypes.mjs`, not in the app.

### What CI fills in

On every successful deployment, for each entry in `registry.json`, CI records
`preview_url`, `screenshot_url` (a 1280x800 capture), `commit_sha`, `author`,
`pr_number`, and `status`, keyed on `(repo, branch, slug)`. Entries removed
from `registry.json` have their rows deleted, so the hub stays honest.

You do not need to do any of this by hand. Add the entry, push, and the
prototype appears on the hub.

### Feedback

Anyone can leave comments through the floating **Feedback** button, or by
pressing **C** to attach a comment to a specific element — which then shows as
a pin on the page. Comments post through `app/api/feedback/route.ts` (never
straight from the client) and are readable on the hub cards.

The overlay is **not** bundled with the prototype. It ships as
`public/feedback.js` from the production deployment and every prototype loads
it from there (`NEXT_PUBLIC_FEEDBACK_ORIGIN`), so old prototypes pick up
improvements without being rebuilt. That is why it is plain dependency-free JS
in a shadow root rather than a React component — it has to run inside arbitrary
prototypes built from arbitrary branches.

Chrome that should not appear in CI screenshots is marked
`data-screenshot-hide`. Add that attribute to anything you introduce that
floats above a prototype.

### Running without Supabase

If `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are
unset, the hub falls back to reading `registry.json` and says so on screen. The
repo stays fully usable standalone — so never gate prototype work on having
Supabase configured.

### API keys

Supabase replaced the legacy JWT keys (`anon` / `service_role`) with
**publishable** (`sb_publishable_…`) and **secret** (`sb_secret_…`) keys; the
legacy ones are deprecated at the end of 2026. The code reads the new variable
names and falls back to the legacy ones, so either generation works:

| Role | New | Legacy fallback |
|---|---|---|
| Browser / server reads | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| CI writes | `SUPABASE_SECRET_KEY` | `SUPABASE_SERVICE_ROLE_KEY` |

A publishable key resolves to the `anon` Postgres role and a secret key to
`service_role`, so **the RLS policies are the same for both** — migrating keys
needs no schema change. One difference matters if you write a raw REST call:
new-style keys must be sent on the `apikey` header only, never as
`Authorization: Bearer`. `scripts/lib/supabase-keys.mjs` handles that;
`supabase-js` handles it for you.

See `PROGRESS.md` for setup and validation steps, and `.env.example` for the
variables.

---

### Creating a New Prototype

### Via the hub (recommended)

1. Open `/` — locally or on the deployed hub, either works.
2. Click **"New prototype"**.
3. Fill in name, your name, and what you're exploring.
4. Pick your agent: **Claude Code**, **GitHub Copilot**, or **Codex**.
5. Use the deep link or the clone commands, then paste the generated prompt.

The dialog does not create anything. It composes a prompt that tells an agent
exactly which folder to create and exactly which `registry.json` entry to add,
including all five required fields. Creating a prototype means writing into a
git checkout, which is local work — so the hub hands it off rather than
pretending to do it server-side.

> This replaced a server action that wrote to the filesystem. It worked locally
> and failed on every deployment, because a serverless instance has no checkout
> to write into. Don't reintroduce that pattern.

The dev server hot-reloads the new file immediately.

### Manually

1. Create your folder: `src/prototypes/my-feature/`
2. Create `src/prototypes/my-feature/index.tsx`:

```tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MyFeature() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      <div className="px-6 pt-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          <ArrowLeft size={13} />
          All prototypes
        </Link>
      </div>
      <main className="flex-1 p-6">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          My Feature
        </h1>
        {/* Build here */}
      </main>
    </div>
  );
}
```

3. Add to `src/prototypes/registry.json`:

```json
{
  "id": "my-feature",
  "name": "My Feature",
  "author": "Your Name",
  "description": "What you're exploring.",
  "createdAt": "2024-01-01"
}
```

Then check it:

```bash
npm run validate:registry
```

All five fields are required, `id` must be kebab-case and match the folder
name, and every entry needs `src/prototypes/<id>/index.tsx`. The same check
runs on every pull request and again before CI registers anything, so a
malformed entry fails there rather than becoming a broken card on the hub.
`src/prototypes/registry.schema.json` gives editors the same rules inline.

That's it. The prototype is automatically discovered at runtime — no other files need to be changed. In particular, **do not** add a row to Supabase by hand; CI does that on the next successful deployment.

---

## Design Tokens

All design decisions live in `app/tokens.css`. Import nothing yourself — tokens are globally available via CSS variables.

Use tokens like this:

```tsx
<div style={{ color: "var(--color-text-primary)", background: "var(--color-bg-subtle)" }}>
```

Or via Tailwind utilities:

```tsx
<div className="text-foreground bg-muted border-border">
```

See `DESIGN.md` for the full token reference and brand guidelines.

---

## Shared Components

All shared components are in `src/components/`. Use them freely in your prototype:

| Component | Import |
|-----------|--------|
| Button (default, secondary, ghost, outline, destructive) | `@/src/components/ui/button` |
| Card (CardHeader, CardContent, CardFooter) | `@/src/components/ui/card` |
| InputField (with label + error state) | `@/src/components/ui/input-field` |
| Input (bare shadcn input) | `@/src/components/ui/input` |
| DropdownMenu and sub-components | `@/src/components/ui/dropdown-menu` |
| Dialog, Sheet, Tooltip, Separator, Skeleton | `@/src/components/ui/[name]` |

If you need a component that doesn't exist, either create it inside your prototype folder or (if it's broadly useful) propose adding it to the shared layer and build it in `src/components/`.

---

## Dark Mode

Dark mode is implemented with `next-themes`. The toggle is in the app header. Your prototype automatically supports dark mode if you use design tokens (CSS variables) instead of hardcoded colours.

**Always use tokens, never hardcode hex values in prototypes.**

---

## Running the Project

```bash
# Development server
npm run dev

# Storybook (component docs + token viewer)
npm run storybook

# Build for production
npm run build

# Build Storybook static site
npm run build-storybook
```

---

## Storybook

Storybook lives at `src/**/*.stories.tsx`. It includes:

- **Button, Card, Input, DropdownMenu** stories with all variants
- **Tokens/Overview** — Colors, Typography, Spacing visual reference

The Storybook toolbar has a **Light / Dark** theme switch. Stories automatically respond to it because they use design token CSS variables.

---

## Architecture: Opt-In Shell

Prototypes live at `/prototypes/[id]` **outside** the `(shell)` route group. They render full-screen — no sidebar, no header imposed on them.

Each prototype controls its own layout:

- **No shell (default)** — the scaffold includes a minimal back-link to `/`. The prototype fills the full viewport however it wants.
- **With Atlas shell** — import `SidebarProvider`, `AppSidebar`, `SidebarInset`, and `AppHeader` from the shared AppShell components and compose them yourself. See `src/prototypes/dashboard-v2/index.tsx` as a reference.

```tsx
// Prototype WITH the Atlas shell (opt-in)
"use client";
import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/AppShell/AppSidebar";
import { AppHeader } from "@/src/components/AppShell/AppHeader";

export default function MyShellPrototype() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          {/* your content */}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

The `AppHeader` automatically shows "← All prototypes" when the pathname starts with `/prototypes/`, so navigation back to the picker is built in.

The standalone prototype picker at `/` is always shell-free — it belongs to no prototype.

---

## Key Technical Details

| Detail | Value |
|--------|-------|
| Next.js | 16 (App Router) |
| React | 19 |
| Tailwind | v4 (no `tailwind.config.js` — all config in CSS) |
| shadcn/ui | Tailwind v4 mode (`"tailwind.config": ""` in `components.json`) |
| Storybook | v10 (`@storybook/nextjs-vite`) |
| Font loading | `next/font/google` — Poppins (sans), Geist Mono (mono) |
| Theme | `next-themes`, `attribute="class"`, `.dark` on `<html>` |

### Tailwind v4 notes

- No `tailwind.config.js` — theme is defined via `@theme inline` in `app/globals.css`
- Dark mode uses `@custom-variant dark (&:is(.dark *))` — use `dark:` utilities normally
- CSS variable format: `--color-*` in `@theme inline` creates Tailwind utilities

### npm install

Always use `--legacy-peer-deps` because React 19 has unresolved peer deps with some packages:

```bash
npm install [package] --legacy-peer-deps
```

### Adding shadcn components

```bash
npx shadcn@latest add [component] --yes --overwrite
```

After adding, apply our design tokens by ensuring the component uses `border-border` (not bare `border`) and uses semantic colour classes.

---

## File Ownership

| Area | Who owns it |
|------|-------------|
| `app/tokens.css` | Shared — discuss changes with the team |
| `app/globals.css` | Shared — discuss changes with the team |
| `src/components/ui/` | shadcn primitives + InputField — do not edit directly |
| `src/components/AppShell/` | Shared shell components — discuss changes |
| `src/prototypes/[your-id]/` | Yours — edit freely |
| `src/prototypes/registry.json` | The authoring source of truth — validated by `npm run validate:registry` |
| Supabase `prototypes` table | **CI only** — never written from app code or by an agent |
| `lib/supabase/`, `lib/registry/` | Shared registry plumbing — discuss changes |
| `scripts/*.mjs`, `.github/workflows/` | CI registration — the only place registry writes belong |
| `DESIGN.md` | Brand guidelines — reference before building |

---

## Prototype Lifecycle

1. **Create** — use the UI button or manually follow the steps above. Writes locally only.
2. **Build** — iterate freely in your folder, using shared tokens and components
3. **Push** — open a PR. Once Vercel deploys, CI screenshots the prototype and
   registers it, and it appears on the shared hub at `/` for everyone.
4. **Review** — teammates leave comments via the Feedback button, readable on
   the hub without opening each prototype
5. **Promote** — if a prototype becomes production-ready, extract it into the shared component layer with a PR

Closing the PR marks the branch's rows `merged` or `closed`, which regroups
them on the hub. Deleting an entry from `registry.json` removes its row on the
next deployment.

---

## Questions / Conventions

- Spacing: always use tokens (`--space-*`) or Tailwind spacing utilities
- Colour: always use tokens, never hardcode hex
- Typography: use `var(--font-sans)` / `var(--font-mono)` — never override font families
- Icons: use `lucide-react` (already installed)
- Forms: use shadcn Input/Button or build custom inside your prototype
