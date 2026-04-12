"use server";

import fs from "fs";
import path from "path";
import { redirect } from "next/navigation";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createPrototype(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const author = (formData.get("author") as string)?.trim() || "Unknown";
  const description = (formData.get("description") as string)?.trim() || "";

  if (!name) throw new Error("Name is required");

  const id = slugify(name);
  const root = process.cwd();
  const protoDir = path.join(root, "src", "prototypes", id);

  if (fs.existsSync(protoDir)) {
    throw new Error(`Prototype "${id}" already exists`);
  }

  // 1. Create prototype directory + scaffold component
  fs.mkdirSync(protoDir, { recursive: true });
  fs.writeFileSync(
    path.join(protoDir, "index.tsx"),
    `export default function ${toPascalCase(id)}() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--color-text-primary)" }}
        >
          ${name}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          ${description || "Your prototype starts here."}
        </p>
      </div>
      {/* Build your prototype below */}
    </div>
  );
}
`
  );

  // 2. Update registry.json
  const registryPath = path.join(root, "src", "prototypes", "registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  registry.prototypes.push({
    id,
    name,
    author,
    description,
    createdAt: new Date().toISOString().split("T")[0],
  });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

  redirect(`/prototypes/${id}`);
}

function toPascalCase(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

