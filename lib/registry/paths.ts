/**
 * Pure path helpers. Deliberately free of `fs` and `server-only` so both the
 * hub and the API route can import them without pulling filesystem code into
 * modules that never touch the local registry.
 */

/** The app route a registry entry is served at. */
export function pathForSlug(slug: string): string {
  return `/prototypes/${slug}`;
}

export function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
