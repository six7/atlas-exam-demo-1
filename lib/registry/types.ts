import type { FeedbackRow, PrototypeStatus } from "@/lib/supabase/types";

/**
 * A prototype as the hub renders it — normalised so a Supabase row and a
 * local `registry.json` entry are interchangeable at the UI layer.
 */
export interface HubPrototype {
  /** Supabase row id, or `local:<slug>` in fallback mode. */
  id: string;
  repo: string;
  branch: string;
  slug: string;

  name: string;
  description: string;
  /** App-relative route, e.g. `/prototypes/dashboard-v2`. */
  path: string;

  previewUrl: string | null;
  screenshotUrl: string | null;
  commitSha: string | null;
  author: string | null;
  prNumber: number | null;

  status: PrototypeStatus;
  createdAt: string;
  updatedAt: string;

  /**
   * Where the card links. `previewUrl + path` when we know which deployment
   * the prototype lives on, so clicking opens it on its own branch build;
   * otherwise the local route.
   */
  href: string;
  /** True when `href` points at another deployment. */
  isExternal: boolean;

  feedback: FeedbackRow[];
}

/** Which backing store the hub is reading from. */
export type HubSource = "supabase" | "local";

export interface HubData {
  prototypes: HubPrototype[];
  source: HubSource;
  /** Set when Supabase was configured but the read failed. */
  error: string | null;
}
