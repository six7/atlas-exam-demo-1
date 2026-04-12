# Atlas — Prototype Environment

Atlas is a platform for structuring and scaling digital products. This repository is the **design system prototype environment** — a shared space where the team can build and explore UI prototypes alongside a live reference implementation of the Atlas design system.

---

## What's in here

| Area | Purpose |
|------|---------|
| **App shell** | A real app (Dashboard, Projects, Components, Tokens, Settings) demonstrating Atlas design tokens and components in production use. |
| **Prototype sandbox** | Each person gets an isolated folder (`src/prototypes/[id]/`) to build and explore UI ideas without touching shared infrastructure. |
| **Component library** | shadcn/ui primitives extended with Atlas tokens, documented in Storybook. |

---

## Getting started

```bash
npm install --legacy-peer-deps

# Start the dev server
npm run dev
# → http://localhost:3000

# Start Storybook (component docs)
npm run storybook
# → http://localhost:6006
```

> **Note:** Always use `--legacy-peer-deps` when installing packages — React 19 has unresolved peer deps with several packages.

---

## Creating a prototype

The easiest way is through the UI:

1. Go to `http://localhost:3000`
2. Click **"New prototype"**
3. Fill in name, author, and description → **Create**

This creates `src/prototypes/[slug]/index.tsx` and registers it in `src/prototypes/registry.json`. The new prototype is immediately available at `/prototypes/[slug]`.

To add the Atlas app shell to your prototype, import the shared AppShell components — see `src/prototypes/dashboard-v2/index.tsx` as a reference. Shell usage is opt-in; prototypes render full-screen by default.

---

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI library | React 19 |
| Styling | Tailwind v4 — theme defined in `app/globals.css`, no `tailwind.config.js` |
| Components | shadcn/ui (Tailwind v4 mode) |
| Storybook | v10 (`@storybook/nextjs-vite`) |
| Icons | `lucide-react` |
| Theming | `next-themes` — `.dark` class on `<html>` |

---

## Design tokens

All visual decisions live in `app/tokens.css` as CSS custom properties. Use them everywhere:

```tsx
// Inline styles
<div style={{ color: "var(--color-text-primary)", background: "var(--color-bg-subtle)" }} />

// Tailwind utilities (mapped automatically)
<div className="text-foreground bg-muted border-border" />
```

See `DESIGN.md` for the full token reference and brand guidelines.

---

## Project structure

```
app/
  page.tsx                  # Prototype picker (home)
  prototypes/[id]/          # Full-screen prototype renderer
  (shell)/                  # App shell pages (Projects, Components, Tokens, Settings)
  globals.css               # Tailwind theme + base styles
  tokens.css                # Atlas design tokens

src/
  components/
    ui/                     # shadcn primitives + Atlas InputField
    AppShell/               # Sidebar, header, theme provider
  prototypes/
    registry.json           # Auto-managed list of all prototypes
    [id]/index.tsx          # One file per prototype
```

---

## Commands

```bash
npm run dev            # Dev server
npm run build          # Production build
npm run storybook      # Component docs (Storybook)
npm run build-storybook  # Static Storybook export
```

---

For agent and contributor conventions, see [AGENTS.md](./AGENTS.md).
For brand and design guidelines, see [DESIGN.md](./DESIGN.md).

