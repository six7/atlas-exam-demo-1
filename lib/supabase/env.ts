/**
 * Environment access for the shared registry.
 *
 * The repo must stay runnable with no Supabase project attached, so every
 * read here is optional. Callers branch on `isSupabaseConfigured()` and fall
 * back to the local `src/prototypes/registry.json`.
 *
 * Supabase replaced the legacy JWT keys (`anon` / `service_role`) with
 * publishable (`sb_publishable_…`) and secret (`sb_secret_…`) keys. Legacy keys
 * keep working until they are deprecated at the end of 2026, so both are
 * accepted, new name first. A publishable key resolves to the same `anon`
 * Postgres role the legacy key did, so the RLS policies are unchanged.
 */

/**
 * Public Supabase config. Safe in the browser bundle: the publishable key is
 * designed to be shipped to clients, and RLS is what actually protects data.
 */
export function getPublicSupabaseEnv(): {
  url: string;
  publishableKey: string;
} | null {
  const url = firstNonBlank(process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Written as two complete, literal identifiers on purpose. Next.js only
  // inlines `process.env.NEXT_PUBLIC_*` at build time when it can see the
  // whole name statically — any dynamic lookup would read as undefined in
  // the browser.
  //
  // firstNonBlank, not `??`: an unset line in .env.local (`FOO=`) yields an
  // empty string rather than undefined, and `??` would treat that as a real
  // value and never reach the legacy key.
  const publishableKey = firstNonBlank(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

/** First argument that is a non-whitespace string, trimmed. Otherwise null. */
export function firstNonBlank(
  ...values: (string | undefined)[]
): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** True when the hub should read from Supabase instead of the local file. */
export function isSupabaseConfigured(): boolean {
  return getPublicSupabaseEnv() !== null;
}
