---
name: design-tokens
description: Use Atlas semantic design tokens by default and never hardcode colour, type, spacing, or radius values. Maps intent to the right CSS variable from app/tokens.css and DESIGN.md when writing or reviewing any UI.
---

# Design Tokens Skill

Use this skill so every style you write reaches for a semantic token instead of a literal value — automatically. `app/tokens.css` is the source of truth; `DESIGN.md` documents intent.

## When to Use

- Writing or editing any JSX/CSS with colour, type, spacing, radius, or shadow
- Building components or prototypes
- Reviewing a diff for hardcoded values

## Core Rule

**Never hardcode.** No hex (`#73BF33`), no raw px for spacing/radius, no literal font sizes in components. Use the token:

```tsx
// ❌ Don't
<div style={{ background: "#F6F8F1", color: "#162F02", padding: "16px", borderRadius: "8px" }}>

// ✅ Do
<div style={{ background: "var(--color-bg-subtle)", color: "var(--color-text-primary)", padding: "var(--space-4)", borderRadius: "var(--radius-md)" }}>
```

Or use the Tailwind utilities that map to tokens: `bg-muted`, `text-foreground`, `border-border`.

## Semantic over Literal

Choose tokens by **meaning**, not appearance. Reach for `--color-text-primary`, not "the dark green one". This keeps light/dark mode and future re-theming working for free — tokens flip in `.dark`, literals don't.

| Intent | Token |
|--------|-------|
| Page background | `--color-bg` |
| Card / panel surface | `--color-bg-subtle` |
| Primary action / active state | `--color-brand` |
| Body text / heading | `--color-text-primary` |
| Secondary / metadata text | `--color-text-secondary` / `--color-text-tertiary` |
| Default border | `--color-border` |
| Error / success / warning | `--color-danger` / `--color-success` / `--color-warning` |

## Token Categories (`app/tokens.css`)

- **Colour** — `--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-brand*`, plus `--color-danger/success/warning`. Semantic names only; never a raw palette like `--blue-500`.
- **Typography** — `--font-sans` / `--font-mono` (never override font families), `--font-size-xs…4xl`, `--font-weight-*`, `--line-height-*`, `--letter-spacing-*`.
- **Spacing** — `--space-1…16` on a 4px base. Use for padding, gaps, margins.
- **Radius** — `--radius-sm/md/lg/xl/full`.
- **Shadow** — `--shadow-sm/md/lg`.

## Extend, Don't Inline

If a needed value doesn't exist, **add a token** (discuss shared-file changes per `AGENTS.md`) rather than inlining a one-off literal. Tokens are the single source of truth; a stray hex breaks that.

## Quick Check

```bash
grep -rn "#[0-9A-Fa-f]\{6\}" src/ app/ --include="*.tsx" | grep -v globals.css | grep -v tokens.css
```

Any match in a component or prototype is a violation — replace with a token.

## Source of Truth

- `app/tokens.css` — token definitions (and `.dark` overrides in `app/globals.css`)
- `DESIGN.md` — token reference with usage notes
