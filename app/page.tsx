import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { NewPrototypeForm } from "@/app/(shell)/prototypes/NewPrototypeForm";
import { ThemeToggle } from "@/src/components/AppShell/ThemeToggle";
import type { Registry } from "@/app/(shell)/prototypes/types";

function getRegistry(): Registry {
  const filePath = path.join(process.cwd(), "src", "prototypes", "registry.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export default function HomePage() {
  const registry = getRegistry();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-6"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md text-white text-xs font-bold"
            style={{ background: "var(--color-brand)" }}
          >
            A
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Atlas
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Prototypes
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              Each prototype is isolated. Pick one to continue, or create a new one.
            </p>
          </div>
          <NewPrototypeForm />
        </div>

        {registry.prototypes.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed py-24 text-center"
            style={{
              background: "var(--color-bg-subtle)",
              borderColor: "var(--color-border)",
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: "var(--color-bg-muted)", color: "var(--color-text-tertiary)" }}
            >
              <Layers size={22} />
            </div>
            <div>
              <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                No prototypes yet
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                Create the first one to get started.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {registry.prototypes.map((proto) => (
              <Link
                key={proto.id}
                href={`/prototypes/${proto.id}`}
                className="group flex flex-col gap-4 rounded-lg border p-5 transition-colors"
                style={{
                  background: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md"
                    style={{
                      background: "var(--color-bg-brand)",
                      color: "var(--color-brand)",
                    }}
                  >
                    <Layers size={18} />
                  </div>
                  <ArrowRight
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                </div>

                <div className="flex-1">
                  <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {proto.name}
                  </div>
                  {proto.description && (
                    <div
                      className="mt-1 text-xs leading-relaxed line-clamp-2"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {proto.description}
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-between pt-3 border-t text-xs"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
                >
                  <span>{proto.author}</span>
                  <span>{proto.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
