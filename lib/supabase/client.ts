/**
 * Browser Supabase client — publishable key, RLS-enforced.
 *
 * Read-only in practice: the hub reads `prototypes` and `feedback` from the
 * server, and comments are posted through `/api/feedback` rather than from
 * here. Exposed for prototypes that want to read live data directly.
 */
"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseEnv } from "./env";
import type { Database } from "./types";

let cached: SupabaseClient<Database> | null = null;

/**
 * Returns the browser client, or `null` when Supabase is not configured —
 * so callers degrade to the local registry instead of throwing.
 */
export function getBrowserSupabase(): SupabaseClient<Database> | null {
  if (cached) return cached;

  const env = getPublicSupabaseEnv();
  if (!env) return null;

  cached = createClient<Database>(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
