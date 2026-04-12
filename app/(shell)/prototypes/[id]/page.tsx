import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { PrototypeRenderer } from "./PrototypeRenderer";
import type { Registry } from "../types";

function getRegistry(): Registry {
  const filePath = path.join(process.cwd(), "src", "prototypes", "registry.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function generateStaticParams() {
  const registry = getRegistry();
  return registry.prototypes.map((p) => ({ id: p.id }));
}

export default async function PrototypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const registry = getRegistry();
  const proto = registry.prototypes.find((p) => p.id === id);
  if (!proto) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{
                background: "var(--color-bg-muted)",
                color: "var(--color-text-tertiary)",
              }}
            >
              prototype
            </span>
          </div>
          <h1
            className="mt-2 text-2xl font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {proto.name}
          </h1>
          {proto.description && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              {proto.description}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {proto.author}
          </div>
          <div className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {proto.createdAt}
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border border-border p-6"
        style={{ background: "var(--color-bg-subtle)" }}
      >
        <PrototypeRenderer id={id} />
      </div>
    </div>
  );
}
