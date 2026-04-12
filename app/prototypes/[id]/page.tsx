import fs from "fs";
import path from "path";
import { PrototypeRenderer } from "./PrototypeRenderer";

function getIds(): string[] {
  const fp = path.join(process.cwd(), "src", "prototypes", "registry.json");
  const r = JSON.parse(fs.readFileSync(fp, "utf-8"));
  return r.prototypes.map((p: { id: string }) => p.id);
}

export function generateStaticParams() {
  return getIds().map((id) => ({ id }));
}

export default async function PrototypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PrototypeRenderer id={id} />;
}
