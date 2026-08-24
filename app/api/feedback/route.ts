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
  const slug = new URL(request.url).searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing `slug`." }, { status: 400 });
  }

  if (!getServerSupabase()) return notConfigured();

  let prototype;
  try {
    prototype = await resolvePrototype(slug);
  } catch (error) {
    if (error instanceof RegistryUnreachableError) return unreachable(error);
    throw error;
  }

  if (!prototype) {
    return NextResponse.json(
      {
        error:
          "This prototype is not in the shared registry yet. It appears once CI registers the deployment.",
        code: "not_registered",
        feedback: [],
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    prototype: {
      id: prototype.id,
      name: prototype.name,
      branch: prototype.branch,
      slug: prototype.slug,
    },
    feedback: await getFeedbackFor(prototype.id),
  });
}

/** POST /api/feedback — add a comment. Body: { slug, body, authorName }. */
export async function POST(request: Request) {
  const supabase = getServerSupabase();
  if (!supabase) return notConfigured();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const { slug, body, authorName } = (payload ?? {}) as Record<string, unknown>;

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Missing `slug`." }, { status: 400 });
  }
  if (typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
  }
  if (body.length > MAX_BODY) {
    return NextResponse.json(
      { error: `Comment is too long (max ${MAX_BODY} characters).` },
      { status: 400 }
    );
  }

  let prototype;
  try {
    prototype = await resolvePrototype(slug.trim());
  } catch (error) {
    if (error instanceof RegistryUnreachableError) return unreachable(error);
    throw error;
  }

  if (!prototype) {
    return NextResponse.json(
      {
        error:
          "This prototype is not in the shared registry yet. It appears once CI registers the deployment.",
        code: "not_registered",
      },
      { status: 404 }
    );
  }

  const name =
    typeof authorName === "string" && authorName.trim()
      ? authorName.trim().slice(0, MAX_NAME)
      : "Anonymous";

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      prototype_id: prototype.id,
      body: body.trim(),
      author_name: name,
      // Stamp the commit the comment was left on, so feedback stays
      // interpretable after the prototype moves on.
      commit_sha: getDeploymentContext().commitSha,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ feedback: data }, { status: 201 });
}
