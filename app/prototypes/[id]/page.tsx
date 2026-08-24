import fs from "fs";
import path from "path";
import { PrototypeRenderer } from "./PrototypeRenderer";
import { FeedbackOverlay } from "@/src/components/Feedback/FeedbackOverlay";
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
        Mounted here rather than inside each prototype, so every prototype
        gets the overlay without opting in. Hidden entirely when there is no
        shared registry to talk to — a permanently disabled button would just
        be noise in a standalone checkout.
      */}
      {isSupabaseConfigured() && <FeedbackOverlay slug={id} />}
    </>
  );
}
