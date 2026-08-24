/**
 * Row types for the shared prototype registry.
 *
 * Kept hand-written rather than generated so the repo stays runnable
 * without a Supabase project attached. Mirrors
 * `supabase/migrations/0001_shared_prototype_registry.sql`.
 *
 * The row types must be `type` aliases, never `interface`. supabase-js
 * requires each table's `Row` to satisfy `Record<string, unknown>`, and only
 * type aliases get an implicit index signature. Declare these as interfaces
 * and the schema silently fails that constraint — every query then resolves
 * to `never` with no error pointing at this file.
 */

export type PrototypeStatus = "open" | "merged" | "closed";

export type PrototypeRow = {
  id: string;

  /** e.g. "six7/atlas-exam-demo-1" */
  repo: string;
  /** git branch the prototype was deployed from */
  branch: string;
  /** matches `id` in registry.json */
  slug: string;

  name: string;
  description: string;
  /** app-relative route, e.g. "/prototypes/dashboard-v2" */
  path: string;

  /** deployment origin, e.g. "https://atlas-git-my-branch.vercel.app" */
  preview_url: string | null;
  screenshot_url: string | null;
  commit_sha: string | null;
  author: string | null;
  pr_number: number | null;

  status: PrototypeStatus;
  created_at: string;
  updated_at: string;
};

export type FeedbackRow = {
  id: string;
  prototype_id: string;
  body: string;
  author_name: string;
  commit_sha: string | null;
  created_at: string;

  /**
   * Where in the prototype this comment points, when it points anywhere.
   * All null for a comment about the page as a whole, and `selector` may
   * stop resolving as the prototype changes — `anchor_label` is what a
   * human reads then.
   */
  selector: string | null;
  anchor_x: number | null;
  anchor_y: number | null;
  anchor_label: string | null;
};

/** Insert shape for CI upserts. `id`/timestamps are database-assigned. */
export type PrototypeUpsert = Omit<
  PrototypeRow,
  "id" | "created_at" | "updated_at"
>;

/** Insert shape for a new comment. */
export type FeedbackInsert = Pick<
  FeedbackRow,
  "prototype_id" | "body" | "author_name"
> &
  Partial<
    Pick<
      FeedbackRow,
      "commit_sha" | "selector" | "anchor_x" | "anchor_y" | "anchor_label"
    >
  >;

export type Database = {
  public: {
    Tables: {
      prototypes: {
        Row: PrototypeRow;
        Insert: PrototypeUpsert;
        Update: Partial<PrototypeUpsert>;
        Relationships: [];
      };
      feedback: {
        Row: FeedbackRow;
        Insert: FeedbackInsert;
        Update: Partial<FeedbackInsert>;
        Relationships: [
          {
            foreignKeyName: "feedback_prototype_id_fkey";
            columns: ["prototype_id"];
            isOneToOne: false;
            referencedRelation: "prototypes";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { prototype_status: PrototypeStatus };
    CompositeTypes: { [_ in never]: never };
  };
};

/** Storage bucket CI writes screenshots into. */
export const SCREENSHOT_BUCKET = "prototype-screenshots";
