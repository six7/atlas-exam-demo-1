import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { FeedbackRow, PrototypeRow } from "@/lib/supabase/types";
import { getDeploymentContext } from "./deployment";

/** The registry could not be queried — as distinct from "no such prototype". */
export class RegistryUnreachableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistryUnreachableError";
  }
}

/**
 * Single-prototype lookups against the shared registry.
 *
 * Kept apart from `./hub.ts` so the feedback API route does not import the
 * local-registry reader — that module touches `fs`, which has no business in
 * a request handler that only ever talks to Supabase.
 */

/**
 * Finds the registry row for a prototype being viewed *right now*.
 *
 * On Vercel the deployment knows its own repo and branch, so the match is
 * exact. Off Vercel — local dev — there is no branch to match on, so we relax
 * to slug alone and prefer whatever was updated most recently. That keeps
 * local development usable against a populated registry.
 *
 * Returns `null` only when the prototype genuinely is not registered, and
 * throws when the registry could not be reached. Collapsing those two into
 * `null` would report an unreachable database as "not registered yet", which
 * is the single most misleading thing this code could say while someone is
 * setting Supabase up.
 */
export async function resolvePrototype(slug: string): Promise<PrototypeRow | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;

  const { repo, branch, isVercel } = getDeploymentContext();

  if (isVercel && branch) {
    const { data, error } = await supabase
      .from("prototypes")
      .select("*")
      .eq("repo", repo)
      .eq("branch", branch)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new RegistryUnreachableError(error.message);
    return data ?? null;
  }

  const { data, error } = await supabase
    .from("prototypes")
    .select("*")
    .eq("slug", slug)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) throw new RegistryUnreachableError(error.message);
  return data?.[0] ?? null;
}

/** Comments on one prototype, oldest first. */
export async function getFeedbackFor(prototypeId: string): Promise<FeedbackRow[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("feedback")
    .select("*")
    .eq("prototype_id", prototypeId)
    .order("created_at", { ascending: true });

  return data ?? [];
}
