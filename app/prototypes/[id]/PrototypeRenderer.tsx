"use client";

import { lazy, Suspense } from "react";

// Cache avoids recreating lazy() on every render for the same id
const cache = new Map<string, React.ComponentType>();

function getComponent(id: string): React.ComponentType {
  if (!cache.has(id)) {
    cache.set(
      id,
      lazy(() =>
        import(`@/src/prototypes/${id}/index`).catch(() => ({
          default: () => <NotFound id={id} />,
        }))
      )
    );
  }
  return cache.get(id)!;
}

export function PrototypeRenderer({ id }: { id: string }) {
  const Component = getComponent(id);
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <svg
        className="h-8 w-8 animate-spin"
        style={{ color: "var(--color-text-tertiary)" }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <div
      className="rounded-lg border border-dashed p-12 text-center text-sm"
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
    >
      Component not found. Make sure{" "}
      <code
        className="font-mono text-xs px-1.5 py-0.5 rounded"
        style={{ background: "var(--color-bg-muted)" }}
      >
        src/prototypes/{id}/index.tsx
      </code>{" "}
      exists and is registered in{" "}
      <code
        className="font-mono text-xs px-1.5 py-0.5 rounded"
        style={{ background: "var(--color-bg-muted)" }}
      >
        registry.json
      </code>
      .
    </div>
  );
}
