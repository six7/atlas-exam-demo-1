"use client";

import { SidebarProvider, SidebarInset } from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/AppShell/AppSidebar";
import { AppHeader } from "@/src/components/AppShell/AppHeader";

export default function ListOfProjects() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-6">
          <div className="flex flex-col gap-6 max-w-4xl">
            <div>
              <h1
                className="text-xl font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                List of projects
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                Exploring projects
              </p>
            </div>
            {/* Build your prototype below */}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

