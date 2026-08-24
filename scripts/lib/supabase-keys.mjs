/**
 * Supabase API key resolution, shared by the CI scripts.
 *
 * Supabase replaced the legacy JWT keys (`anon` / `service_role`) with
 * publishable (`sb_publishable_…`) and secret (`sb_secret_…`) keys. Legacy keys
 * keep working until they are deprecated at the end of 2026, so both
 * generations are accepted here, new names first.
 */

/**
 * New-format keys are not JWTs and belong only in the `apikey` header.
 * Legacy JWT keys keep the `Authorization: Bearer` fallback.
 */
export function isNewApiKey(key) {
  return (
    typeof key === "string" &&
    (key.startsWith("sb_publishable_") || key.startsWith("sb_secret_"))
  );
}

/**
 * The server-side write key: a secret key, or the legacy service_role key.
 * Both resolve to the `service_role` Postgres role and bypass RLS.
 */
export function resolveSecretKey(env = process.env) {
  // First non-blank wins. Blank-but-defined matters: CI passes both variables
  // through, so the one the user did not set arrives as an empty string, and
  // a pasted secret can carry a trailing newline.
  return firstNonBlank(env.SUPABASE_SECRET_KEY, env.SUPABASE_SERVICE_ROLE_KEY);
}

/** First argument that is a non-whitespace string, trimmed. Otherwise null. */
function firstNonBlank(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * Headers for a raw PostgREST call.
 *
 * Supabase's guidance for new keys is `apikey` only — they must not be sent as
 * a Bearer token. Legacy JWT keys still need the Authorization header, since
 * that is where PostgREST reads the role claim from.
 */
export function restHeaders(key, extra = {}) {
  const headers = { apikey: key, ...extra };
  if (!isNewApiKey(key)) headers.Authorization = `Bearer ${key}`;
  return headers;
}

/** Human-readable hint naming both accepted variables. */
export const SECRET_KEY_HINT =
  "Set SUPABASE_SECRET_KEY (new-style `sb_secret_…`) or, for a project still " +
  "on legacy keys, SUPABASE_SERVICE_ROLE_KEY. Add it as a GitHub Actions " +
  "repository secret.";
