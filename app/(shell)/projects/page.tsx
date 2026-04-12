import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/src/components/Button/Button";

const projects = [
  {
    name: "Atlas Design System",
    description: "Core tokens, components, and Storybook docs",
    status: "Active",
    components: 4,
    tokens: "40+",
  },
  {
    name: "Marketing Site",
    description: "Public-facing website using Atlas components",
    status: "In progress",
    components: 12,
    tokens: "40+",
  },
  {
    name: "Admin Dashboard",
    description: "Internal tooling — data tables, forms, charts",
    status: "Draft",
    components: 8,
    tokens: "40+",
  },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: "var(--color-bg-brand)", text: "var(--color-brand)" },
  "In progress": { bg: "#FFF8EC", text: "var(--color-warning)" },
  Draft: { bg: "var(--color-bg-muted)", text: "var(--color-text-tertiary)" },
};

export default function ProjectsPage() {
  return (
    <div className="max-w-4xl flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Projects
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
            Workspaces where Atlas tokens and components live.
          </p>
        </div>
        <Button variant="primary" size="sm">
          <Plus size={14} className="mr-1.5" /> New project
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const colors = statusColors[p.status] ?? statusColors.Draft;
          return (
            <div
              key={p.name}
              className="flex flex-col gap-4 rounded-lg border border-border p-5 cursor-pointer transition-colors hover:bg-[var(--color-bg-subtle)]"
              style={{ background: "var(--color-bg)" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: "var(--color-bg-brand)",
                    color: "var(--color-brand)",
                  }}
                >
                  <FolderKanban size={18} />
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex-1">
                <div
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {p.name}
                </div>
                <div
                  className="mt-1 text-xs leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {p.description}
                </div>
              </div>

              <div
                className="flex items-center gap-4 pt-3 border-t border-border text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <span>{p.components} components</span>
                <span>{p.tokens} tokens</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
