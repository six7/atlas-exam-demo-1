"use client";

import {
  Activity,
  ArrowUpRight,
  Check,
  CircleDot,
  Folder,
  MoreHorizontal,
} from "lucide-react";

import { AppHeader } from "@/src/components/AppShell/AppHeader";
import { AppSidebar } from "@/src/components/AppShell/AppSidebar";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/src/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar";

const metadataClassName = "font-mono text-xs uppercase";
const surfaceCardStyle = {
  background: "var(--color-bg)",
  boxShadow: "var(--shadow-sm)",
};

function MoreButton({ label }: { label: string }) {
  return (
    <button
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ color: "var(--color-text-tertiary)" }}
      type="button"
    >
      <MoreHorizontal aria-hidden="true" size={17} />
    </button>
  );
}

export default function CardPatterns() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="min-h-full" style={{ background: "var(--color-bg-subtle)" }}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 pb-16 lg:px-10 lg:py-10">
            <header
              className="flex flex-col justify-between gap-6 border-b pb-8 lg:flex-row lg:items-end"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex max-w-2xl flex-col gap-3">
                <p
                  className={metadataClassName}
                  style={{ color: "var(--color-text-brand)", letterSpacing: "var(--letter-spacing-wide)" }}
                >
                  Component exploration
                </p>
                <h1 className="text-3xl font-semibold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                  Content card variations
                </h1>
                <p className="max-w-xl text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                  Three ways to structure a content-first card. Same job, different levels of density and emphasis.
                </p>
              </div>
              <div
                className="flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs lg:self-auto"
                style={{
                  borderColor: "var(--color-border-strong)",
                  color: "var(--color-text-secondary)",
                  background: "var(--color-bg)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-brand)" }} />
                3 surface variants
              </div>
            </header>

            <section className="flex flex-col gap-5" data-feedback-id="card-patterns">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Option 1 / Surface card
                  </h2>
                  <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    Compare the same content model across three layouts.
                  </p>
                </div>
                <span
                  className={metadataClassName}
                  style={{ color: "var(--color-text-tertiary)", letterSpacing: "var(--letter-spacing-wide)" }}
                >
                  Card / 003
                </span>
              </div>

              <div className="grid items-stretch gap-5 lg:grid-cols-3">
                <Card
                  className="flex h-full flex-col"
                  data-feedback-id="quiet-surface-card"
                  style={surfaceCardStyle}
                >
                  <CardHeader className="gap-6">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-md"
                        style={{ background: "var(--color-bg-brand)", color: "var(--color-brand)" }}
                      >
                        <Folder aria-hidden="true" size={18} />
                      </div>
                      <MoreButton label="More quiet surface card options" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <p
                        className={metadataClassName}
                        style={{ color: "var(--color-text-brand)", letterSpacing: "var(--letter-spacing-wide)" }}
                      >
                        01 / Quiet surface
                      </p>
                      <h3 className="text-xl font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                        Projects
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                        A calm entry point for the work your team owns.
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border border-border bg-muted p-3">
                        <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          24
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          Open projects
                        </p>
                      </div>
                      <div className="rounded-md border border-border bg-muted p-3">
                        <p className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          06
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          Updated today
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      <Activity aria-hidden="true" size={14} style={{ color: "var(--color-text-brand)" }} />
                      <span>Content-first overview</span>
                    </div>
                  </CardContent>
                  <CardFooter
                    className="justify-between border-t pt-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      Use for browsing
                    </span>
                    <Button size="sm" type="button" variant="link">
                      Open projects
                      <ArrowUpRight aria-hidden="true" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card
                  className="flex h-full flex-col"
                  data-feedback-id="compact-surface-card"
                  style={surfaceCardStyle}
                >
                  <CardHeader className="gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md"
                          style={{ background: "var(--color-bg-muted)", color: "var(--color-text-brand)" }}
                        >
                          <Folder aria-hidden="true" size={17} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p
                            className={metadataClassName}
                            style={{ color: "var(--color-text-brand)", letterSpacing: "var(--letter-spacing-wide)" }}
                          >
                            02 / Compact surface
                          </p>
                          <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                            Token sets
                          </h3>
                        </div>
                      </div>
                      <MoreButton label="More compact surface card options" />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                      Keep the card light when the details need to be scanned quickly.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="divide-y divide-border border-y border-border">
                      <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          Published sets
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          12
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          Pending review
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          03
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 py-3">
                        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          Last change
                        </span>
                        <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          2h ago
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      <CircleDot aria-hidden="true" size={14} style={{ color: "var(--color-text-brand)" }} />
                      <span>Dense metadata, low chrome</span>
                    </div>
                  </CardContent>
                  <CardFooter
                    className="justify-between border-t pt-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      Use for lists
                    </span>
                    <Button size="sm" type="button" variant="ghost">
                      View token sets
                      <ArrowUpRight aria-hidden="true" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card
                  className="flex h-full flex-col"
                  data-feedback-id="summary-surface-card"
                  style={surfaceCardStyle}
                >
                  <CardHeader className="gap-5">
                    <div className="flex items-center justify-between">
                      <p
                        className={metadataClassName}
                        style={{ color: "var(--color-text-brand)", letterSpacing: "var(--letter-spacing-wide)" }}
                      >
                        03 / Summary surface
                      </p>
                      <MoreButton label="More summary surface card options" />
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-semibold leading-tight" style={{ color: "var(--color-text-primary)" }}>
                          Components
                        </h3>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                          Lead with one useful number.
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-4xl font-semibold leading-none" style={{ color: "var(--color-text-primary)" }}>
                          38
                        </p>
                        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                          tracked
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-5">
                    <div
                      className="rounded-md border p-4"
                      style={{
                        background: "var(--color-bg-brand)",
                        borderColor: "var(--color-border-strong)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium" style={{ color: "var(--color-text-primary)" }}>
                          Coverage
                        </p>
                        <p className="text-xs" style={{ color: "var(--color-text-brand)" }}>
                          38 of 42
                        </p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "var(--color-bg-muted)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: "90%", background: "var(--color-brand)" }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                        Recent changes
                      </p>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span style={{ color: "var(--color-text-tertiary)" }}>Button / v3</span>
                        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                          Updated
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <span style={{ color: "var(--color-text-tertiary)" }}>Input / v2</span>
                        <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                          Reviewed
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter
                    className="justify-between border-t pt-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      Use for summaries
                    </span>
                    <Button size="sm" type="button" variant="link">
                      View components
                      <ArrowUpRight aria-hidden="true" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <footer
              className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                Same content model. Pick the density that fits the workflow.
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <Check aria-hidden="true" size={14} style={{ color: "var(--color-text-brand)" }} />
                <span>Content-first card study</span>
              </div>
            </footer>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
