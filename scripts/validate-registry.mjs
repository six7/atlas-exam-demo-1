#!/usr/bin/env node
/**
 * Validates src/prototypes/registry.json.
 *
 * The registry is the authoring contract: CI mirrors it into the shared index,
 * and the hub renders whatever is in it. A missing author or a slug that does
 * not match its folder produces a broken card that nobody owns, so this runs
 * on every pull request and before registration.
 *
 * Usage:
 *   npm run validate:registry
 *   node scripts/validate-registry.mjs --no-fs   (skip folder checks)
 *
 * Exits non-zero on any error.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const REQUIRED = ["id", "name", "author", "description", "createdAt"];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LIMITS = { name: 80, author: 80, description: 280, id: 60 };

const checkFiles = !process.argv.includes("--no-fs");

const root = process.cwd();
const registryPath = path.join(root, "src", "prototypes", "registry.json");

const errors = [];
const warnings = [];

function error(where, message) {
  errors.push(`${where}: ${message}`);
}

/* ------------------------------------------------------------------ */

if (!fs.existsSync(registryPath)) {
  console.error(`✖ No registry at ${registryPath}`);
  process.exit(1);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
} catch (cause) {
  console.error(`✖ registry.json is not valid JSON: ${cause.message}`);
  process.exit(1);
}

if (!Array.isArray(registry?.prototypes)) {
  console.error("✖ registry.json must have a `prototypes` array.");
  process.exit(1);
}

const entries = registry.prototypes;
const seen = new Map();

entries.forEach((entry, index) => {
  const label = entry?.id ? `"${entry.id}"` : `entry #${index + 1}`;

  if (typeof entry !== "object" || entry === null) {
    error(label, "must be an object.");
    return;
  }

  for (const field of REQUIRED) {
    const value = entry[field];
    if (typeof value !== "string" || !value.trim()) {
      error(label, `missing or empty "${field}".`);
    }
  }

  // Anything beyond the contract is almost always a typo for a real field.
  for (const key of Object.keys(entry)) {
    if (!REQUIRED.includes(key)) {
      error(label, `unknown field "${key}". Allowed: ${REQUIRED.join(", ")}.`);
    }
  }

  if (typeof entry.id === "string" && entry.id.trim()) {
    if (!SLUG.test(entry.id)) {
      error(label, `id must be kebab-case (a-z, 0-9, single hyphens). Got "${entry.id}".`);
    }
    const first = seen.get(entry.id);
    if (first !== undefined) {
      error(label, `duplicate id, already used by entry #${first + 1}.`);
    } else {
      seen.set(entry.id, index);
    }
  }

  if (typeof entry.createdAt === "string" && entry.createdAt.trim()) {
    if (!ISO_DATE.test(entry.createdAt)) {
      error(label, `createdAt must be YYYY-MM-DD. Got "${entry.createdAt}".`);
    } else if (Number.isNaN(new Date(entry.createdAt).getTime())) {
      error(label, `createdAt is not a real date: "${entry.createdAt}".`);
    }
  }

  for (const [field, max] of Object.entries(LIMITS)) {
    const value = entry[field];
    if (typeof value === "string" && value.length > max) {
      error(label, `"${field}" is ${value.length} characters; the limit is ${max}.`);
    }
  }

  // A registered prototype that does not render is worse than no entry.
  if (checkFiles && typeof entry.id === "string" && SLUG.test(entry.id ?? "")) {
    const dir = path.join(root, "src", "prototypes", entry.id);
    if (!fs.existsSync(dir)) {
      error(label, `no folder at src/prototypes/${entry.id}/.`);
    } else {
      const hasEntrypoint = ["index.tsx", "index.ts", "index.jsx", "index.js"].some(
        (file) => fs.existsSync(path.join(dir, file))
      );
      if (!hasEntrypoint) {
        error(label, `src/prototypes/${entry.id}/ has no index.tsx.`);
      }
    }
  }
});

/* Folders with no entry render nowhere — worth flagging, not failing. */
if (checkFiles) {
  const dir = path.join(root, "src", "prototypes");
  for (const name of fs.readdirSync(dir)) {
    if (!fs.statSync(path.join(dir, name)).isDirectory()) continue;
    if (!seen.has(name)) {
      warnings.push(
        `src/prototypes/${name}/ has no entry in registry.json, so it is not on the hub.`
      );
    }
  }
}

/* ------------------------------------------------------------------ */

for (const warning of warnings) console.warn(`  ⚠ ${warning}`);

if (errors.length > 0) {
  console.error(`\n✖ registry.json has ${errors.length} problem(s):\n`);
  for (const message of errors) console.error(`  • ${message}`);
  console.error(
    "\nEvery prototype needs: " +
      REQUIRED.join(", ") +
      " — plus a folder at src/prototypes/<id>/index.tsx.\n"
  );
  process.exit(1);
}

console.log(
  `✓ registry.json is valid — ${entries.length} prototype(s)` +
    (warnings.length ? `, ${warnings.length} warning(s)` : "") +
    "\n"
);
