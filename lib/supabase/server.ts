/**
 * Server-side Supabase client — publishable key, RLS-enforced.
 *
 * This is what the hub and the feedback route handler use. It deliberately
 * carries no elevated privileges: RLS allows exactly SELECT on `prototypes`
 * and SELECT/INSERT on `feedback`, which is the entire surface the app needs.
 *
 * Prototype writes are service-role only and belong to CI. See `./admin.ts`.
 */
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | null = null;

/**
 * Returns the server client, or `null` when Supabase is not configured —
 * callers fall back to reading `src/prototypes/registry.json`.
 */
export function getServerSupabase(): SupabaseClient<Database> | null {
  if (cached) return cached;

  const env = getPublicSupabaseEnv();
  if (!env) return null;

  cached = createClient<Database>(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
