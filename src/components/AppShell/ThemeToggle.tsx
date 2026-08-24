"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  // resolvedTheme, not theme — under "system" theme is "system",
  // which would make the first click a no-op.
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
      style={{
        color: "var(--color-text-tertiary)",
        background: "transparent",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.background =
          "var(--color-bg-muted)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.background = "transparent")
      }
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
