"use client";

import dynamic from "next/dynamic";

// Explicit map — updated automatically by the createPrototype server action
const components: Record<string, React.ComponentType> = {
  "onboarding-flow": dynamic(() => import("@/src/prototypes/onboarding-flow/index")),
  "dashboard-v2": dynamic(() => import("@/src/prototypes/dashboard-v2/index")),
};

export function PrototypeRenderer({ id }: { id: string }) {
  const Component = components[id];
  if (!Component) {
    return (
      <div
        className="rounded-lg border border-dashed border-border p-12 text-center text-sm"
        style={{ color: "var(--color-text-tertiary)" }}
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
          PrototypeRenderer.tsx
        </code>
        .
      </div>
    );
  }
  return <Component />;
}
