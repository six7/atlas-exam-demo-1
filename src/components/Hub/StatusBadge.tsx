import type { PrototypeStatus } from "@/lib/supabase/types";

const STYLES: Record<
  PrototypeStatus,
  { label: string; bg: string; fg: string }
> = {
  open: {
    label: "Open",
    bg: "var(--color-bg-brand)",
    fg: "var(--color-text-brand)",
  },
  merged: {
    label: "Merged",
    bg: "color-mix(in srgb, var(--color-success) 14%, transparent)",
    fg: "var(--color-success)",
  },
  closed: {
    label: "Closed",
    bg: "var(--color-bg-muted)",
    fg: "var(--color-text-tertiary)",
  },
};

export function StatusBadge({ status }: { status: PrototypeStatus }) {
  const style = STYLES[status] ?? STYLES.open;
  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: style.bg, color: style.fg }}
    >
      {style.label}
    </span>
  );
}
