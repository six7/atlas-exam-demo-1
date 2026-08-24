"use client";

import { useMemo, useState } from "react";
import { Layers, HardDrive, AlertTriangle } from "lucide-react";

import type { HubData, HubPrototype, HubSource } from "@/lib/registry/types";
import { PrototypeCard } from "./PrototypeCard";

type SortKey = "recency" | "feedback";

const ALL = "__all__";

/** Branch treated as the trunk — the canonical copy of a prototype. */
const DEFAULT_BRANCH = "main";

/**
 * One prototype, plus every branch that happens to carry a copy of it.
 */
interface DedupedPrototype extends HubPrototype {
  /** How many registry rows collapsed into this card. */
  copies: number;
  /** Branch names of the other copies, for the tooltip. */
  otherBranches: string[];
}

/**
 * Collapses the registry to one card per prototype.
 *
 * `registry.json` is committed per branch and lists *every* prototype, not
 * just the ones that branch introduced — so a branch touching one prototype
 * still registers a row for all of them. The hub was showing 8 rows for 4
 * actual prototypes, and it got worse with every branch.
 *
 * The default branch wins when it has a copy, because that is the canonical
 * version with the stable URL; otherwise the most recently updated row wins,
 * which is how a prototype that only exists on a branch still appears.
 *
 * Feedback is unioned across every copy, so collapsing never hides a
 * conversation that was left on a different branch's row.
 */
function dedupeBySlug(rows: HubPrototype[]): DedupedPrototype[] {
  const bySlug = new Map<string, HubPrototype[]>();
  for (const row of rows) {
    const group = bySlug.get(row.slug);
    if (group) group.push(row);
    else bySlug.set(row.slug, [row]);
  }

  return [...bySlug.values()].map((group) => {
    const primary =
      group.find((row) => row.branch === DEFAULT_BRANCH) ??
      [...group].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

    // Union by id: the same comment can only live on one row, but merging
    // defensively keeps this correct if that ever stops being true.
    const seen = new Set<string>();
    const feedback = group
      .flatMap((row) => row.feedback)
      .filter((comment) => {
        if (seen.has(comment.id)) return false;
        seen.add(comment.id);
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

    return {
      ...primary,
      feedback,
      copies: group.length,
      otherBranches: group
        .filter((row) => row.branch !== primary.branch)
        .map((row) => row.branch),
    };
  });
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
    // Filter the raw rows first, then collapse. Filtering by branch therefore
    // means "prototypes that branch carries", which is what you want when you
    // pick one — rather than filtering the already-collapsed cards, where a
    // branch's copy would have been thrown away before the filter ran.
    const filtered = data.prototypes.filter((prototype) => {
      if (branch !== ALL && prototype.branch !== branch) return false;
      if (author !== ALL && (prototype.author ?? "Unknown") !== author) return false;
      return true;
    });

    return dedupeBySlug(filtered).sort((a, b) => {
      if (sort === "feedback") {
        const delta = b.feedback.length - a.feedback.length;
        if (delta !== 0) return delta;
      }
      return (
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    });
  }, [data.prototypes, branch, author, sort]);

  /** Distinct prototypes in the registry, ignoring filters — the "of N". */
  const totalPrototypes = useMemo(
    () => new Set(data.prototypes.map((p) => p.slug)).size,
    [data.prototypes]
  );

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
          {visible.length} of {totalPrototypes}
        </span>
      </div>

      {/* One list, whatever branch each prototype came from. */}
      {visible.length === 0 ? (
        <EmptyState filtersActive={filtersActive} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((prototype) => (
            <PrototypeCard
              key={prototype.slug}
              prototype={prototype}
              alsoOn={prototype.otherBranches}
            />
          ))}
        </div>
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
