/**
 * Feedback API.
 *
 * Comments never go from the browser straight to Supabase: the client only
 * knows a slug, and this handler resolves that to a prototype row using the
 * deployment's own repo/branch. That keeps the mapping server-side and means
 * a client cannot post against an arbitrary prototype id.
 *
 * Uses the RLS-enforced anon client — `feedback` allows SELECT and INSERT for
 * anon, and nothing else. No service-role key is involved.
 *
 * Answers cross-origin. The overlay is served from production and runs on
 * preview deployments, so its requests arrive from a different origin — see
 * `allowedOrigin` for which ones are accepted.
 */
import { NextResponse } from "next/server";

import { getServerSupabase } from "@/lib/supabase/server";
import { getDeploymentContext } from "@/lib/registry/deployment";
import {
  RegistryUnreachableError,
  getFeedbackFor,
  resolvePrototype,
} from "@/lib/registry/lookup";

export const dynamic = "force-dynamic";

const MAX_BODY = 4000;
const MAX_NAME = 80;
const MAX_SELECTOR = 500;
const MAX_LABEL = 120;

/**
 * Which origins may call this API.
 *
 * The overlay ships from production and runs on every preview deployment, so
 * `*` would be the lazy fix — but this endpoint writes, so the allowlist is
 * narrow: localhost, and this project's own Vercel hosts. Extra origins (a
 * custom domain) go in FEEDBACK_ALLOWED_ORIGINS as a comma-separated list.
 */
function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;

  const extra = (process.env.FEEDBACK_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (extra.includes(origin)) return origin;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }

  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return origin;

  // Vercel names every deployment of a project with the project as a prefix.
  const project = process.env.FEEDBACK_ORIGIN_PREFIX ?? "atlas-exam-demo-1";
  if (
    url.protocol === "https:" &&
    url.hostname.endsWith(".vercel.app") &&
    url.hostname.startsWith(project)
  ) {
    return origin;
  }

  return null;
}

/** Adds CORS headers, and `Vary` so caches never mix origins up. */
function withCors(response: NextResponse, origin: string | null): NextResponse {
  const allowed = allowedOrigin(origin);
  if (allowed) {
    response.headers.set("Access-Control-Allow-Origin", allowed);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  response.headers.set("Vary", "Origin");
  return response;
}

export async function OPTIONS(request: Request) {
  return withCors(
    new NextResponse(null, { status: 204 }),
    request.headers.get("origin")
  );
}

/** Clamps a normalised 0..1 anchor coordinate, or null if unusable. */
function coordinate(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

function unreachable(error: unknown) {
  return NextResponse.json(
    {
      error:
        "Could not reach the shared registry. Check NEXT_PUBLIC_SUPABASE_URL " +
        "and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and that the migration has run.",
      code: "registry_unreachable",
      detail: error instanceof Error ? error.message : String(error),
    },
    { status: 502 }
  );
}

function notConfigured() {
  return NextResponse.json(
    {
      error:
        "Supabase is not configured for this deployment, so feedback is unavailable.",
      code: "not_configured",
    },
    { status: 503 }
  );
}

/** GET /api/feedback?slug=dashboard-v2 — the thread for one prototype. */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const cors = (response: NextResponse) => withCors(response, origin);

  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return cors(NextResponse.json({ error: "Missing `slug`." }, { status: 400 }));
  }

  if (!getServerSupabase()) return cors(notConfigured());

  let prototype;
  try {
    prototype = await resolvePrototype(slug);
  } catch (error) {
    if (error instanceof RegistryUnreachableError) return cors(unreachable(error));
    throw error;
  }

  if (!prototype) {
    return cors(
      NextResponse.json(
        {
          error:
            "This prototype is not in the shared registry yet. It appears once CI registers the deployment.",
          code: "not_registered",
          feedback: [],
        },
        { status: 404 }
      )
    );
  }

  return cors(
    NextResponse.json({
      prototype: {
        id: prototype.id,
        name: prototype.name,
        branch: prototype.branch,
        slug: prototype.slug,
      },
      feedback: await getFeedbackFor(prototype.id),
    })
  );
}

/** POST /api/feedback — add a comment. Body: { slug, body, authorName }. */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const cors = (response: NextResponse) => withCors(response, origin);

  const supabase = getServerSupabase();
  if (!supabase) return cors(notConfigured());

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return cors(
      NextResponse.json({ error: "Expected a JSON body." }, { status: 400 })
    );
  }

  const { slug, body, authorName, selector, anchorX, anchorY, anchorLabel } =
    (payload ?? {}) as Record<string, unknown>;

  if (typeof slug !== "string" || !slug.trim()) {
    return cors(NextResponse.json({ error: "Missing `slug`." }, { status: 400 }));
  }
  if (typeof body !== "string" || !body.trim()) {
    return cors(
      NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 })
    );
  }
  if (body.length > MAX_BODY) {
    return cors(
      NextResponse.json(
        { error: `Comment is too long (max ${MAX_BODY} characters).` },
        { status: 400 }
      )
    );
  }

  let prototype;
  try {
    prototype = await resolvePrototype(slug.trim());
  } catch (error) {
    if (error instanceof RegistryUnreachableError) return cors(unreachable(error));
    throw error;
  }

  if (!prototype) {
    return cors(
      NextResponse.json(
        {
          error:
            "This prototype is not in the shared registry yet. It appears once CI registers the deployment.",
          code: "not_registered",
        },
        { status: 404 }
      )
    );
  }

  const name =
    typeof authorName === "string" && authorName.trim()
      ? authorName.trim().slice(0, MAX_NAME)
      : "Anonymous";

  // An anchor is optional, and only stored when it is actually usable: a
  // selector with no coordinates would put the pin in an arbitrary place.
  const anchor =
    typeof selector === "string" && selector.trim() && selector.length <= MAX_SELECTOR
      ? {
          selector: selector.trim(),
          anchor_x: coordinate(anchorX) ?? 0.5,
          anchor_y: coordinate(anchorY) ?? 0.5,
          anchor_label:
            typeof anchorLabel === "string" && anchorLabel.trim()
              ? anchorLabel.trim().slice(0, MAX_LABEL)
              : null,
        }
      : {};

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      prototype_id: prototype.id,
      body: body.trim(),
      author_name: name,
      // Stamp the commit the comment was left on, so feedback stays
      // interpretable after the prototype moves on.
      commit_sha: getDeploymentContext().commitSha,
      ...anchor,
    })
    .select()
    .single();

  if (error) {
    return cors(NextResponse.json({ error: error.message }, { status: 500 }));
  }

  return cors(NextResponse.json({ feedback: data }, { status: 201 }));
}
