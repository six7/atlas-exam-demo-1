/**
 * Formatting shared by the hub and the feedback overlay.
 * No `server-only` import — these run on both sides.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * "just now" / "4h ago" / "3d ago", falling back to an absolute date beyond a
 * month, where precision stops being the useful thing.
 */
export function formatRelativeTime(
  value: string | null | undefined,
  now: number = Date.now()
): string {
  if (!value) return "unknown";

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "unknown";

  const elapsed = now - timestamp;
  if (elapsed < 0) return "just now";
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h ago`;
  if (elapsed < WEEK) return `${Math.floor(elapsed / DAY)}d ago`;
  if (elapsed < 5 * WEEK) return `${Math.floor(elapsed / WEEK)}w ago`;

  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Full timestamp for `title` attributes, where the relative form is shown. */
export function formatAbsoluteTime(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

/** Short commit sha, e.g. `a1b2c3d`. */
export function shortSha(sha: string | null | undefined): string | null {
  return sha ? sha.slice(0, 7) : null;
}

/** Initials for an avatar chip: "Sam Wilson" -> "SW". */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
