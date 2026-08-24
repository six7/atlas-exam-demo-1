"use client";

import { useMemo, useState } from "react";
import { Layers, HardDrive, AlertTriangle } from "lucide-react";

import type { HubData, HubPrototype, HubSource } from "@/lib/registry/types";
import { PrototypeCard } from "./PrototypeCard";

type SortKey = "recency" | "feedback";

const ALL = "__all__";

/** Branch treated as the trunk. Its prototypes group first. */
const DEFAULT_BRANCH = "main";

interface Group {
  key: string;
  title: string;
  hint: string;
  items: HubPrototype[];
}

/**
 * The shared hub.
 *
 * Data is fetched on the server and filtered here, so changing a filter is
 * instant rather than a round trip — the whole registry is small enough that
 * shipping it once beats querying per interaction.
 */
export function PrototypeHub({ data }: { data: HubData }) {
  const [branch, setBranch] = useState<string>(ALL);
  const [author, setAuthor] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recency");

  const branches = useMemo(
    () => unique(data.prototypes.map((p) => p.branch)),
    [data.prototypes]
  );
  const authors = useMemo(
    () => unique(data.prototypes.map((p) => p.author ?? "Unknown")),
    [data.prototypes]
  );

  const visible = useMemo(() => {
    const filtered = data.prototypes.filter((prototype) => {
      if (branch !== ALL && prototype.branch !== branch) return false;
      if (author !== ALL && (prototype.author ?? "Unknown") !== author) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "feedback") {
        const delta = b.feedback.length - a.feedback.length;
        if (delta !== 0) return delta;
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, [data.prototypes, branch, author, sort]);

  // main first, then live branches, then anything already merged or closed.
  const groups = useMemo<Group[]>(() => {
    const main: HubPrototype[] = [];
    const open: HubPrototype[] = [];
    const archived: HubPrototype[] = [];

    for (const prototype of visible) {
      if (prototype.branch === DEFAULT_BRANCH) main.push(prototype);
      else if (prototype.status === "open") open.push(prototype);
      else archived.push(prototype);
    }

    return [
      {
        key: "main",
        title: "On main",
        hint: "Merged into the trunk",
        items: main,
      },
      {
        key: "open",
        title: "Open branches",
        hint: "Still in progress",
        items: open,
      },
      {
        key: "archived",
        title: "Merged & closed",
        hint: "Branch is no longer open",
        items: archived,
      },
    ].filter((group) => group.items.length > 0);
  }, [visible]);

  const filtersActive = branch !== ALL || author !== ALL;

  return (
    <div className="flex flex-col gap-6">
      <SourceNotice source={data.source} error={data.error} />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          label="Branch"
          value={branch}
          onChange={setBranch}
          options={[{ value: ALL, label: "All branches" }, ...toOptions(branches)]}
        />
        <Select
          label="Author"
          value={author}
          onChange={setAuthor}
          options={[{ value: ALL, label: "All authors" }, ...toOptions(authors)]}
        />
        <Select
          label="Sort"
          value={sort}
          onChange={(value) => setSort(value as SortKey)}
          options={[
            { value: "recency", label: "Most recent" },
            { value: "feedback", label: "Most feedback" },
          ]}
        />

        <span
          className="ml-auto text-xs tabular-nums"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {visible.length} of {data.prototypes.length}
        </span>
      </div>

      {groups.length === 0 ? (
        <EmptyState filtersActive={filtersActive} />
      ) : (
        groups.map((group) => (
          <section key={group.key} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <h2
                className="text-sm font-semibold tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                {group.title}
              </h2>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {group.hint} · {group.items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((prototype) => (
                <PrototypeCard key={prototype.id} prototype={prototype} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SourceNotice({
  source,
  error,
}: {
  source: HubSource;
  error: string | null;
}) {
  if (source === "supabase") return null;

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border px-3.5 py-3"
      style={{
        background: "var(--color-bg-subtle)",
        borderColor: "var(--color-border)",
      }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
        {error ? <AlertTriangle size={15} /> : <HardDrive size={15} />}
      </span>
      <div className="min-w-0 text-xs leading-relaxed">
        <div className="font-medium" style={{ color: "var(--color-text-primary)" }}>
          {error ? "Shared registry unreachable" : "Local registry"}
        </div>
        <p style={{ color: "var(--color-text-tertiary)" }}>
          {error
            ? `Falling back to this branch's registry.json — ${error}`
            : "Showing this branch's registry.json. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to see prototypes from every branch."}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ filtersActive }: { filtersActive: boolean }) {
  return (
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
          {filtersActive ? "Nothing matches those filters" : "No prototypes yet"}
        </div>
        <div className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {filtersActive
            ? "Try widening the branch or author filter."
            : "Create the first one to get started."}
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label
      className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs"
      style={{
        background: "var(--color-bg)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-tertiary)",
      }}
    >
      <span className="shrink-0">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="max-w-40 cursor-pointer truncate bg-transparent font-medium outline-none"
        style={{ color: "var(--color-text-primary)" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function toOptions(values: string[]) {
  return values.map((value) => ({ value, label: value }));
}
