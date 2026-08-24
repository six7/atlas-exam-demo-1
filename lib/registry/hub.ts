import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import type { FeedbackRow, PrototypeRow } from "@/lib/supabase/types";
import { getLocalPrototypes } from "./local";
import { pathForSlug, stripTrailingSlash } from "./paths";
import type { HubData, HubPrototype } from "./types";

/**
 * A row's destination: the deployment it was registered from, plus its path.
 * Falls back to the local route when CI never recorded a preview URL.
 */
function hrefFor(row: PrototypeRow): { href: string; isExternal: boolean } {
  const path = row.path || pathForSlug(row.slug);
  if (!row.preview_url) return { href: path, isExternal: false };
  return { href: `${stripTrailingSlash(row.preview_url)}${path}`, isExternal: true };
}

function toHubPrototype(row: PrototypeRow, feedback: FeedbackRow[]): HubPrototype {
  const { href, isExternal } = hrefFor(row);
  return {
    id: row.id,
    repo: row.repo,
    branch: row.branch,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    path: row.path || pathForSlug(row.slug),
    previewUrl: row.preview_url,
    screenshotUrl: row.screenshot_url,
    commitSha: row.commit_sha,
    author: row.author,
    prNumber: row.pr_number,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    href,
    isExternal,
    feedback,
  };
}

/**
 * Everything the hub renders.
 *
 * Reads Supabase when it is configured, and falls back to the local
 * `registry.json` otherwise — or if the read fails — so the repo keeps working
 * standalone with no project attached.
 */
export async function getHubData(): Promise<HubData> {
  const supabase = getServerSupabase();

  if (!supabase) {
    return { prototypes: getLocalPrototypes(), source: "local", error: null };
  }

  const [prototypesResult, feedbackResult] = await Promise.all([
    supabase.from("prototypes").select("*").order("updated_at", { ascending: false }),
    supabase.from("feedback").select("*").order("created_at", { ascending: true }),
  ]);

  const failure = prototypesResult.error ?? feedbackResult.error;
  if (failure) {
    return {
      prototypes: getLocalPrototypes(),
      source: "local",
      error: failure.message,
    };
  }

  const byPrototype = new Map<string, FeedbackRow[]>();
  for (const comment of feedbackResult.data ?? []) {
    const thread = byPrototype.get(comment.prototype_id);
    if (thread) thread.push(comment);
    else byPrototype.set(comment.prototype_id, [comment]);
  }

  return {
    prototypes: (prototypesResult.data ?? []).map((row) =>
      toHubPrototype(row, byPrototype.get(row.id) ?? [])
    ),
    source: "supabase",
    error: null,
  };
}
