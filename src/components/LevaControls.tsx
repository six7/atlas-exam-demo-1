"use client";

import { useEffect, useRef } from "react";
import { Leva, useControls, button } from "leva";
import { useTheme } from "next-themes";

/**
 * Live design-system controls.
 *
 * Tunes the Atlas token layer in real time by writing inline CSS custom
 * properties onto <html>, which override the defaults declared in
 * app/tokens.css. Every control maps to an existing semantic token — nothing
 * here introduces new hardcoded values.
 */

const SPACING_BASE: Array<[string, number]> = [
  ["--space-1", 4],
  ["--space-2", 8],
  ["--space-3", 12],
  ["--space-4", 16],
  ["--space-5", 20],
  ["--space-6", 24],
  ["--space-8", 32],
  ["--space-10", 40],
  ["--space-12", 48],
  ["--space-16", 64],
];

const TUNED_VARS = [
  "--color-brand",
  "--color-brand-hover",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-xl",
  "--font-size-md",
  "--spacing",
  ...SPACING_BASE.map(([name]) => name),
];

const BRIDGE_ID = "leva-token-bridge";

// Point the Tailwind radius utilities at the radius tokens so live token
// overrides are reflected (the utilities are otherwise compiled to literals).
function ensureBridge() {
  if (document.getElementById(BRIDGE_ID)) return;
  const style = document.createElement("style");
  style.id = BRIDGE_ID;
  style.textContent = [
    ".rounded-sm{border-radius:var(--radius-sm)}",
    ".rounded-md{border-radius:var(--radius-md)}",
    ".rounded-lg{border-radius:var(--radius-lg)}",
    ".rounded-xl{border-radius:var(--radius-xl)}",
  ].join("");
  document.head.appendChild(style);
}

function clearOverrides() {
  const root = document.documentElement;
  TUNED_VARS.forEach((name) => root.style.removeProperty(name));
  root.style.removeProperty("font-size");
}

export function LevaControls() {
  const { resolvedTheme, setTheme } = useTheme();
  const setRef = useRef<((value: Record<string, unknown>) => void) | null>(null);

  const [values, set] = useControls(() => ({
    darkMode: { value: false, label: "Dark mode" },
    brandColor: { value: "#73BF33", label: "Brand" },
    radius: { value: 8, min: 0, max: 24, step: 1, label: "Radius (px)" },
    baseFontSize: { value: 16, min: 12, max: 20, step: 1, label: "Font (px)" },
    spacingScale: { value: 1, min: 0.75, max: 1.5, step: 0.05, label: "Spacing" },
    reset: button(() => {
      clearOverrides();
      setRef.current?.({
        brandColor: "#73BF33",
        radius: 8,
        baseFontSize: 16,
        spacingScale: 1,
      });
    }),
  }));

  useEffect(() => {
    setRef.current = set;
  });

  const { darkMode, brandColor, radius, baseFontSize, spacingScale } = values;

  // Leva switch ⇄ next-themes.
  //
  // This has to be ONE effect. Two effects — one per direction — both run in
  // the same commit, each seeing the other side's pre-update value, so each
  // "corrects" the other from a stale reading and the two values swap places
  // instead of converging. That swap repeats every commit, which is a theme
  // strobing between light and dark. Deciding once, from both values, is what
  // makes it impossible.
  //
  // The rule: whichever side actually changed wins, and on the first run
  // next-themes wins — the Leva default is a hardcoded `false`, not a
  // statement about the user's theme.
  const prevSync = useRef<{ dark: boolean | null; theme?: string }>({
    dark: null,
    theme: undefined,
  });

  useEffect(() => {
    const prev = prevSync.current;
    const darkChanged = darkMode !== prev.dark;
    const themeChanged = resolvedTheme !== prev.theme;
    prevSync.current = { dark: darkMode, theme: resolvedTheme };

    // next-themes has not resolved yet; nothing to sync against.
    if (!resolvedTheme) return;

    const themeIsDark = resolvedTheme === "dark";

    if (prev.dark !== null && darkChanged && !themeChanged) {
      // The panel switch moved → the theme follows it. Staying silent when it
      // already agrees keeps a "system" theme from being pinned to an explicit
      // light/dark by a sync that changed nothing.
      if (darkMode !== themeIsDark) setTheme(darkMode ? "dark" : "light");
    } else if (darkMode !== themeIsDark) {
      // First run, or the theme changed elsewhere → the panel follows it.
      set({ darkMode: themeIsDark });
    }
  }, [darkMode, resolvedTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply token overrides as inline CSS variables on <html>
  useEffect(() => {
    ensureBridge();
    const root = document.documentElement;
    root.style.setProperty("--color-brand", brandColor);
    root.style.setProperty("--color-brand-hover", brandColor);

    root.style.setProperty("--radius-sm", `${radius * 0.5}px`);
    root.style.setProperty("--radius-md", `${radius}px`);
    root.style.setProperty("--radius-lg", `${radius * 1.5}px`);
    root.style.setProperty("--radius-xl", `${radius * 2}px`);

    root.style.setProperty("--font-size-md", `${baseFontSize}px`);
    root.style.fontSize = `${baseFontSize}px`;

    // Scale Tailwind's spacing base (drives p-*, m-*, gap-* utilities live)
    root.style.setProperty("--spacing", `${0.25 * spacingScale}rem`);
    // Keep the semantic spacing tokens in sync for direct token consumers
    SPACING_BASE.forEach(([name, px]) => {
      root.style.setProperty(name, `${px * spacingScale}px`);
    });
  }, [brandColor, radius, baseFontSize, spacingScale]);

  return <Leva collapsed />;
}
