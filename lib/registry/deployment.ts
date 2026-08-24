import "server-only";

/**
 * Where this instance of the app is running.
 *
 * On Vercel every field comes from the system environment variables. Locally
 * we know far less, which is what `isVercel: false` signals to callers — see
 * `resolvePrototype` in `lib/registry/hub.ts` for how lookup relaxes off-Vercel.
 */
export interface DeploymentContext {
  repo: string;
  branch: string | null;
  commitSha: string | null;
  /** Origin of this deployment, no trailing slash. */
  previewUrl: string | null;
  isVercel: boolean;
}

/** Fallback when nothing in the environment identifies the repository. */
const DEFAULT_REPO = "six7/atlas-exam-demo-1";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getDeploymentContext(): DeploymentContext {
  const owner = process.env.VERCEL_GIT_REPO_OWNER;
  const slug = process.env.VERCEL_GIT_REPO_SLUG;

  const repo =
    owner && slug
      ? `${owner}/${slug}`
      : process.env.REGISTRY_REPO || DEFAULT_REPO;

  // VERCEL_BRANCH_URL is stable per branch; VERCEL_URL changes per deployment.
  const host = process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL;

  return {
    repo,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    previewUrl: host ? stripTrailingSlash(`https://${host}`) : null,
    isVercel: Boolean(process.env.VERCEL),
  };
}
