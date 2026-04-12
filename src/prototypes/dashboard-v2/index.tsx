"use client";

import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/AppShell/AppSidebar";
import { AppHeader } from "@/src/components/AppShell/AppHeader";

const metrics = [
  { label: "Token sets", value: "12", delta: "+2 this week" },
  { label: "Components", value: "38", delta: "+5 this sprint" },
  { label: "Open decisions", value: "4", delta: "3 need review" },
];

const activity = [
  { who: "Sam W.", action: "updated", target: "color tokens", time: "2m ago" },
  { who: "Alex R.", action: "created", target: "Button v3 prototype", time: "1h ago" },
  { who: "Sam W.", action: "resolved", target: "spacing decision #12", time: "3h ago" },
  { who: "Alex R.", action: "commented on", target: "typography scale", time: "Yesterday" },
];

export default function DashboardV2() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-8 max-w-4xl">
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Dashboard v2 prototype
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                Redesigned layout with metrics + activity feed.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-border p-5"
                  style={{ background: "var(--color-bg)" }}
                >
                  <div className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                    {m.value}
                  </div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {m.label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: "var(--color-text-brand)" }}>
                    {m.delta}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-primary)" }}>
                Recent activity
              </h2>
              <div
                className="rounded-lg border border-border divide-y divide-border"
                style={{ background: "var(--color-bg)" }}
              >
                {activity.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: "var(--color-brand)" }}
                    >
                      {a.who[0]}
                    </div>
                    <span style={{ color: "var(--color-text-primary)" }}>
                      <span className="font-medium">{a.who}</span>{" "}
                      <span style={{ color: "var(--color-text-tertiary)" }}>{a.action}</span>{" "}
                      <span style={{ color: "var(--color-text-brand)" }}>{a.target}</span>
                    </span>
                    <span className="ml-auto text-xs shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                      {a.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

