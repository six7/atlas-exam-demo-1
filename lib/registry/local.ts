import "server-only";

import fs from "fs";
import path from "path";
import type { HubPrototype } from "./types";
import { getDeploymentContext } from "./deployment";
import { pathForSlug } from "./paths";

/**
 * The local authoring registry. Unchanged by this feature — it remains the
 * only file an agent edits when creating a prototype, and the only source of
 * truth for what exists *on this branch*.
 */
interface LocalRegistryEntry {
  id: string;
  name: string;
  author: string;
  description: string;
  createdAt: string;
}

export const REGISTRY_PATH = ["src", "prototypes", "registry.json"] as const;

export function readLocalRegistry(): LocalRegistryEntry[] {
  // turbopackIgnore keeps the bundler from treating this runtime path join
  // as a reason to trace the entire project into the server bundle.
  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), ...REGISTRY_PATH);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return Array.isArray(parsed?.prototypes) ? parsed.prototypes : [];
  } catch {
    return [];
  }
}

/**
 * Local entries lifted into the hub's shape, so the repo still runs standalone
 * when Supabase is not configured. Everything CI would fill in — screenshot,
 * preview URL, PR number — is simply absent.
 */
export function getLocalPrototypes(): HubPrototype[] {
  const { repo, branch, commitSha } = getDeploymentContext();

  return readLocalRegistry().map((entry) => ({
    id: `local:${entry.id}`,
    repo,
    branch: branch ?? "local",
    slug: entry.id,
    name: entry.name,
    description: entry.description ?? "",
    path: pathForSlug(entry.id),
    previewUrl: null,
    screenshotUrl: null,
    commitSha,
    author: entry.author ?? null,
    prNumber: null,
    status: "open" as const,
    createdAt: entry.createdAt,
    updatedAt: entry.createdAt,
    href: pathForSlug(entry.id),
    isExternal: false,
    feedback: [],
  }));
}
