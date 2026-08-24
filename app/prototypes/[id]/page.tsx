import fs from "fs";
import path from "path";
import { PrototypeRenderer } from "./PrototypeRenderer";
import { FeedbackLoader } from "@/src/components/Feedback/FeedbackLoader";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  return (
    <>
      <PrototypeRenderer id={id} />
      {/*
        Mounted here rather than inside each prototype, so every prototype gets
        the overlay without opting in — and loaded from production, so it is
        never pinned to the branch this prototype was built from.
      */}
      {isSupabaseConfigured() && <FeedbackLoader slug={id} />}
    </>
  );
}
