"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/src/components/ui/sidebar";
import { Separator } from "@/src/components/ui/separator";
import { ThemeToggle } from "./ThemeToggle";

const breadcrumbMap: Record<string, string> = {
  "/projects": "Projects",
  "/components": "Components",
  "/tokens": "Tokens",
  "/settings": "Settings",
};

export function AppHeader() {
  const pathname = usePathname();
  const isPrototype = pathname.startsWith("/prototypes/");
  const label =
    breadcrumbMap[pathname] ??
    (isPrototype ? "Prototype" : "Atlas");

  return (
    <header
      className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-4"
      style={{ background: "var(--color-bg)", borderColor: "var(--color-border)" }}
    >
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="h-4" />

      {isPrototype ? (
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft size={13} />
            All prototypes
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            {label}
          </span>
        </div>
      ) : (
        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </span>
      )}

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

