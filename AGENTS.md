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
    AppShell/                   ← shell components (shared)

app/
  page.tsx                      ← prototype picker / home (outside shell, lists all prototypes)
  (shell)/
    prototypes/
      [id]/
        page.tsx                ← renders the chosen prototype (inside app shell)
        PrototypeRenderer.tsx   ← maps IDs → dynamic imports (auto-updated)
    actions/
      prototype.ts              ← server action: creates new prototypes
```

### The rule: one folder per person

- Your prototype lives in `src/prototypes/your-id/index.tsx`.
- You can create any files inside your prototype folder.
- Do **not** modify other people's prototype folders.
- Shared components in `src/components/` are fine to use but should not be modified for a specific prototype. If you need a different version, create it inside your own prototype folder.

---

### Creating a New Prototype

### Via the UI (recommended)

1. Navigate to `/` (the home page) in the running app.
2. Click **"New prototype"**.
3. Fill in: name, your name, description.
4. Click **"Create prototype"**.

This automatically:
- Creates `src/prototypes/[slug]/index.tsx` with a scaffold component
- Adds an entry to `src/prototypes/registry.json`
- Registers the prototype in `app/(shell)/prototypes/[id]/PrototypeRenderer.tsx`
- Redirects you to the new prototype page

The dev server will hot-reload the new file immediately.

### Manually

1. Create your folder: `src/prototypes/my-feature/`
2. Create `src/prototypes/my-feature/index.tsx`:

```tsx
export default function MyFeature() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        My Feature
      </h1>
      {/* Build here */}
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

That's it. The prototype is automatically discovered at runtime — no other files need to be changed.

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
| Button (primary, secondary, ghost) | `@/src/components/Button/Button` |
| Card (header/body/footer slots) | `@/src/components/Card/Card` |
| Input (with label + error state) | `@/src/components/Input/Input` |
| DropdownMenu | `@/src/components/DropdownMenu/DropdownMenu` |
| shadcn primitives | `@/src/components/ui/[name]` |

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

## Architecture: Picker Outside the Shell

The prototype picker at `/` is a **standalone page** — it has no sidebar. It shows the full list of prototypes with the Atlas logo and a theme toggle.

When you pick a prototype you navigate to `/prototypes/[id]`, which **enters the app shell** (sidebar + header). The header shows "← All prototypes" to return to the picker.

This separation is intentional:
- The picker is neutral — it belongs to no prototype
- Picking a prototype "activates" the shell for that context
- Multiple people can share `/` links; no one's prototype is the default

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
| `src/components/ui/` | shadcn primitives — do not edit directly |
| `src/components/Button/`, `Card/`, `Input/`, `DropdownMenu/`, `AppShell/` | Shared — discuss changes |
| `src/prototypes/[your-id]/` | Yours — edit freely |
| `src/prototypes/registry.json` | Auto-managed by the prototype creator |
| `DESIGN.md` | Brand guidelines — reference before building |

---

## Prototype Lifecycle

1. **Create** — use the UI button or manually follow the steps above
2. **Build** — iterate freely in your folder, using shared tokens and components
3. **Share** — share the URL `/prototypes/[your-id]` with the team for review
4. **Promote** — if a prototype becomes production-ready, extract it into the shared component layer with a PR

---

## Questions / Conventions

- Spacing: always use tokens (`--space-*`) or Tailwind spacing utilities
- Colour: always use tokens, never hardcode hex
- Typography: use `var(--font-sans)` / `var(--font-mono)` — never override font families
- Icons: use `lucide-react` (already installed)
- Forms: use shadcn Input/Button or build custom inside your prototype
