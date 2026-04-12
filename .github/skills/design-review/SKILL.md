---
name: design-review
description: Visual design review for the Atlas prototype environment. Validates against DESIGN.md — checks token usage, spacing, colour, typography, and layout using agent-browser on the live dev server.
---

# Design Review Skill

Use this skill to validate the Atlas UI against the brand guidelines in `DESIGN.md`. It combines code inspection with a live visual check via `agent-browser`.

## When to Use

- After making UI changes (spacing, colour, layout, typography)
- When reviewing a prototype for design quality
- Before committing visual changes
- When the user asks for a design review or visual validation

## Dev Server

The Atlas prototype environment runs on **http://localhost:3003**.

Common URLs:
- `/` — Prototype picker (home)
- `/prototypes/dashboard-v2` — Dashboard prototype
- `/prototypes/list-of-projects` — Project list prototype
- `/prototypes/onboarding-flow` — Onboarding prototype

## Design Token Rules (from DESIGN.md)

**Never** use hardcoded hex values in JSX or CSS. Always use design tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand` | `#73BF33` | Primary actions, active states |
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-bg-subtle` | `#F6F8F1` | Sidebar, cards, panels |
| `--color-bg-muted` | `#EEF2E7` | Muted surfaces |
| `--color-text-primary` | `#162F02` | Body text, headings |
| `--color-text-secondary` | `#39462D` | Secondary labels |
| `--color-text-tertiary` | `#4F5E41` | Captions, metadata |
| `--color-border` | `#DDE5D1` | Default borders |
| `--color-border-strong` | `#C4D1B3` | Prominent borders |

## Review Checklist

### Tokens & Colour
- [ ] No hardcoded hex values in component files (`grep -r "#[0-9A-Fa-f]\{6\}" src/ app/`)
- [ ] Background uses `var(--color-bg)` or `var(--color-bg-subtle)`
- [ ] Text uses `var(--color-text-primary/secondary/tertiary)`
- [ ] Borders use `var(--color-border)` or `var(--color-border-strong)`
- [ ] Brand colour only used for primary actions / active states

### Typography
- [ ] Font is Poppins (sans) — check `font-sans` class is applied
- [ ] Headings use `text-2xl font-semibold` or similar token-aligned sizes
- [ ] Caption/metadata text uses `text-xs` with `--color-text-tertiary`

### Spacing
- [ ] Page sections use multiples of 4px (`space-4`, `space-6`, `space-8`, etc.)
- [ ] Cards have consistent internal padding (typically `p-5` or `p-6`)
- [ ] Bottom of pages has sufficient breathing room (`pb-16` to `pb-24`)
- [ ] Grid gaps are consistent (`gap-4` or `gap-6`)

### Layout
- [ ] Content is centred with a max-width (`max-w-5xl` or similar)
- [ ] No layout shifts or overflow issues
- [ ] Sidebar (if present) does not overlay main content
- [ ] Collapsed sidebar is compact (not too wide)

### Visual Quality
- [ ] No visual noise — decorative elements are purposeful
- [ ] Clear hierarchy — headings, labels, actions are visually distinct
- [ ] Interactive elements have clear hover/focus states
- [ ] Dark mode tokens are applied correctly

## Standard Review Workflow

### 1. Check for hardcoded colours

```bash
grep -rn "#[0-9A-Fa-f]\{6\}" src/ app/ --include="*.tsx" --include="*.css" | grep -v globals.css | grep -v "node_modules"
```

### 2. Open page in browser

```bash
agent-browser open http://localhost:3003
agent-browser snapshot --compact
```

### 3. Screenshot and review

```bash
agent-browser screenshot ./design-review-home.png
```

### 4. Check a specific prototype

```bash
agent-browser open http://localhost:3003/prototypes/dashboard-v2
agent-browser snapshot --compact
agent-browser screenshot ./design-review-dashboard.png
```

### 5. Verify dark mode

```bash
agent-browser set media dark
agent-browser screenshot ./design-review-dark.png
agent-browser set media light
```

### 6. Check for console errors

```bash
agent-browser errors
agent-browser console
```

## Reporting Findings

Report findings in this format:

```
## Design Review: [Page/Component]

### ✅ Passing
- ...

### ⚠️ Warnings (improve)
- ...

### ❌ Violations (must fix)
- ...
```

Always include a screenshot as visual evidence.

## Related Files

- `DESIGN.md` — Full brand and design guidelines
- `app/globals.css` — Token definitions and Tailwind theme
- `src/components/ui/` — shadcn primitives (do not modify directly unless necessary)
- `src/components/AppShell/` — Atlas shell components
