/**
 * Write-capable Supabase client — bypasses RLS. Server-only.
 *
 * ⚠️  NOT FOR APPLICATION CODE.
 *
 * The `prototypes` table is populated by CI (see
 * `.github/workflows/register-prototypes.yml`) and by nothing else. Pages,
 * route handlers, and server actions must use `./server.ts`, which is
 * RLS-enforced. If you are reaching for this module from inside `app/`,
 * the change almost certainly belongs in the CI script instead.
 *
 * The secret key is intentionally NOT set on the Vercel deployment, so
 * importing this from a page would fail at runtime there.
 */
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { firstNonBlank } from "./env";
import type { Database } from "./types";

/**
 * The server-side write key.
 *
 * Supabase's new-style secret key (`sb_secret_…`) replaces the legacy
 * `service_role` JWT; both resolve to the `service_role` Postgres role and
 * bypass RLS. Legacy keys work until they are deprecated at the end of 2026,
 * so both variables are accepted, new name first.
 */
function resolveSecretKey(): string | null {
  return firstNonBlank(
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Builds a write-capable client. Throws when no secret key is present, because
 * unlike the read paths there is no meaningful fallback for a write.
 */
export function createAdminSupabase(): SupabaseClient<Database> {
  const url = firstNonBlank(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
  const secretKey = resolveSecretKey();

  if (!url) {
    throw new Error(
      "Supabase admin client: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) is not set."
    );
  }
  if (!secretKey) {
    throw new Error(
      "Supabase admin client: no secret key. Set SUPABASE_SECRET_KEY " +
        "(or, on a project still using legacy keys, SUPABASE_SERVICE_ROLE_KEY). " +
        "This key belongs in GitHub Actions secrets and .env.local only — " +
        "never in the deployed app."
    );
  }

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
