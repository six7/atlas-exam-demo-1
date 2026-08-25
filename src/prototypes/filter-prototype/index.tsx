"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Copy,
  ListFilter,
  MessageSquare,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type FilterKey = "is" | "label" | "assignee" | "sort";

type QueryToken = {
  raw: string;
  key?: FilterKey;
  value?: string;
};

type FilterOption = {
  value: string;
  label: string;
  hint: string;
};

type Issue = {
  number: number;
  title: string;
  status: "open" | "closed";
  labels: string[];
  assignee: string;
  assigneeName: string;
  updatedAt: string;
  updatedLabel: string;
  comments: number;
};

type Suggestion = {
  token: string;
  label: string;
  hint: string;
};

const DEFAULT_QUERY = "is:open label:design assignee:me sort:updated";
const SAVED_VIEW_KEY = "atlas-filter-prototype:saved-view";
const DEFAULT_VIEW_KEY = "atlas-filter-prototype:default-view";
const FILTER_KEYS: FilterKey[] = ["is", "label", "assignee", "sort"];

const FILTERS: Record<
  FilterKey,
  {
    label: string;
    prompt: string;
    options: FilterOption[];
  }
> = {
  is: {
    label: "Status",
    prompt: "Choose a status",
    options: [
      { value: "open", label: "Open", hint: "Issues still in progress" },
      { value: "closed", label: "Closed", hint: "Completed issues" },
      { value: "all", label: "All", hint: "Open and closed issues" },
    ],
  },
  label: {
    label: "Label",
    prompt: "Choose a label",
    options: [
      { value: "design", label: "Design", hint: "Interface and interaction work" },
      {
        value: "design systems",
        label: "Design systems",
        hint: "Shared patterns and foundations",
      },
      {
        value: "accessibility",
        label: "Accessibility",
        hint: "Inclusive product improvements",
      },
      { value: "research", label: "Research", hint: "Discovery and validation" },
      { value: "documentation", label: "Documentation", hint: "Guides and references" },
      { value: "bug", label: "Bug", hint: "Unexpected product behaviour" },
    ],
  },
  assignee: {
    label: "Assignee",
    prompt: "Choose an assignee",
    options: [
      { value: "me", label: "Me", hint: "Jan Six" },
      { value: "sam", label: "Sam Wilson", hint: "@sam" },
      { value: "maya", label: "Maya Chen", hint: "@maya" },
      {
        value: "charlotte-wells",
        label: "Charlotte Wells",
        hint: "@charlotte-wells",
      },
      { value: "unassigned", label: "Unassigned", hint: "No owner yet" },
    ],
  },
  sort: {
    label: "Sort",
    prompt: "Choose an order",
    options: [
      { value: "updated", label: "Recently updated", hint: "Newest activity first" },
      { value: "oldest", label: "Least recently updated", hint: "Oldest activity first" },
      { value: "title", label: "Title", hint: "Alphabetical order" },
    ],
  },
};

const PRESETS = [
  { id: "empty", label: "Empty", query: "" },
  { id: "active", label: "Active", query: "is:open label:design" },
  { id: "multi", label: "Multi-filter", query: DEFAULT_QUERY },
  {
    id: "long",
    label: "Long value",
    query: 'is:open label:"design systems" assignee:charlotte-wells sort:updated',
  },
];

const ISSUES: Issue[] = [
  {
    number: 284,
    title: "Keep issue filters visible after returning to the list",
    status: "open",
    labels: ["design", "research"],
    assignee: "me",
    assigneeName: "Jan Six",
    updatedAt: "2026-08-25T14:31:00Z",
    updatedLabel: "12 minutes ago",
    comments: 8,
  },
  {
    number: 279,
    title: "Document query syntax for saved issue views",
    status: "open",
    labels: ["documentation", "design"],
    assignee: "me",
    assigneeName: "Jan Six",
    updatedAt: "2026-08-25T10:15:00Z",
    updatedLabel: "4 hours ago",
    comments: 3,
  },
  {
    number: 273,
    title: "Improve keyboard flow in the filter suggestion menu",
    status: "open",
    labels: ["accessibility", "design systems"],
    assignee: "charlotte-wells",
    assigneeName: "Charlotte Wells",
    updatedAt: "2026-08-24T16:40:00Z",
    updatedLabel: "Yesterday",
    comments: 12,
  },
  {
    number: 268,
    title: "Make shared issue URLs restore the full result set",
    status: "open",
    labels: ["bug", "design systems"],
    assignee: "charlotte-wells",
    assigneeName: "Charlotte Wells",
    updatedAt: "2026-08-24T09:22:00Z",
    updatedLabel: "Yesterday",
    comments: 6,
  },
  {
    number: 261,
    title: "Test whether teams prefer defaults or named views",
    status: "open",
    labels: ["research"],
    assignee: "maya",
    assigneeName: "Maya Chen",
    updatedAt: "2026-08-22T11:18:00Z",
    updatedLabel: "3 days ago",
    comments: 15,
  },
  {
    number: 257,
    title: "Add active filter count to issue list heading",
    status: "open",
    labels: ["design", "accessibility"],
    assignee: "sam",
    assigneeName: "Sam Wilson",
    updatedAt: "2026-08-21T13:05:00Z",
    updatedLabel: "4 days ago",
    comments: 4,
  },
  {
    number: 249,
    title: "Define filter token wrapping for narrow screens",
    status: "closed",
    labels: ["design systems", "design"],
    assignee: "charlotte-wells",
    assigneeName: "Charlotte Wells",
    updatedAt: "2026-08-19T15:42:00Z",
    updatedLabel: "6 days ago",
    comments: 9,
  },
  {
    number: 242,
    title: "Remove duplicate labels from generated queries",
    status: "closed",
    labels: ["bug"],
    assignee: "me",
    assigneeName: "Jan Six",
    updatedAt: "2026-08-18T08:34:00Z",
    updatedLabel: "Last week",
    comments: 2,
  },
];

function isFilterKey(value: string): value is FilterKey {
  return FILTER_KEYS.includes(value as FilterKey);
}

function parseQuery(query: string): QueryToken[] {
  const rawTokens = query.match(/[^\s"]+:"[^"]*"|\S+/g) ?? [];

  return rawTokens.map((raw) => {
    const match = raw.match(/^([a-z]+):(?:"([^"]*)"|(.+))$/i);
    if (!match) {
      return { raw };
    }

    const key = match[1].toLowerCase();
    if (!isFilterKey(key)) {
      return { raw };
    }

    return {
      raw,
      key,
      value: (match[2] ?? match[3] ?? "").trim(),
    };
  });
}

function formatFilterToken(key: FilterKey, value: string) {
  return `${key}:${value.includes(" ") ? `"${value}"` : value}`;
}

function joinTokens(tokens: QueryToken[]) {
  return tokens
    .map((token) => token.raw)
    .filter(Boolean)
    .join(" ");
}

function getOptionLabel(key: FilterKey, value: string) {
  return FILTERS[key].options.find((option) => option.value === value)?.label ?? value;
}

function getInputSuggestions(query: string): Suggestion[] {
  const fragment = query.match(/(?:^|\s)(\S*)$/)?.[1] ?? "";
  const [possibleKey, possibleValue = ""] = fragment.split(":");

  if (fragment.includes(":") && isFilterKey(possibleKey)) {
    return FILTERS[possibleKey].options
      .filter((option) =>
        `${option.value} ${option.label}`.toLowerCase().includes(possibleValue.toLowerCase())
      )
      .slice(0, 5)
      .map((option) => ({
        token: formatFilterToken(possibleKey, option.value),
        label: `${FILTERS[possibleKey].label}: ${option.label}`,
        hint: option.hint,
      }));
  }

  const suggestions: Suggestion[] = [
    { token: "is:open", label: "Status: Open", hint: "Issues still in progress" },
    { token: "label:design", label: "Label: Design", hint: "Interface and interaction work" },
    { token: "assignee:me", label: "Assignee: Me", hint: "Assigned to Jan Six" },
    {
      token: "sort:updated",
      label: "Sort: Recently updated",
      hint: "Newest activity first",
    },
  ];

  if (!fragment) {
    return suggestions;
  }

  return suggestions.filter((suggestion) =>
    `${suggestion.token} ${suggestion.label}`.toLowerCase().includes(fragment.toLowerCase())
  );
}

function applyInputSuggestion(query: string, token: string) {
  if (!query.trim()) {
    return token;
  }

  if (/\s$/.test(query)) {
    return `${query}${token}`;
  }

  return query.replace(/(?:[^\s"]+:"[^"]*"|\S+)$/, token);
}

function filterIssues(issues: Issue[], tokens: QueryToken[]) {
  const labels = tokens
    .filter((token) => token.key === "label")
    .map((token) => token.value?.toLowerCase())
    .filter((value): value is string => Boolean(value));
  const status = tokens.findLast((token) => token.key === "is")?.value;
  const assignee = tokens.findLast((token) => token.key === "assignee")?.value;
  const sort = tokens.findLast((token) => token.key === "sort")?.value;
  const searchTerms = tokens
    .filter((token) => !token.key)
    .map((token) => token.raw.replaceAll('"', "").toLowerCase());

  const filtered = issues.filter((issue) => {
    const matchesStatus = !status || status === "all" || issue.status === status;
    const matchesLabels = labels.every((label) => issue.labels.includes(label));
    const matchesAssignee =
      !assignee ||
      (assignee === "unassigned" ? !issue.assignee : issue.assignee === assignee);
    const searchable = `${issue.title} ${issue.number} ${issue.labels.join(" ")}`.toLowerCase();
    const matchesSearch = searchTerms.every((term) => searchable.includes(term));

    return matchesStatus && matchesLabels && matchesAssignee && matchesSearch;
  });

  return filtered.sort((first, second) => {
    if (sort === "title") {
      return first.title.localeCompare(second.title);
    }

    const direction = sort === "oldest" ? 1 : -1;
    return (
      direction *
      (new Date(first.updatedAt).getTime() - new Date(second.updatedAt).getTime())
    );
  });
}

function FilterButton({
  filterKey,
  menuId,
  value,
  isOpen,
  onToggle,
  onSelect,
  onRemove,
}: {
  filterKey: FilterKey;
  menuId: string;
  value?: string;
  isOpen: boolean;
  onToggle: (menuId: string) => void;
  onSelect: (value: string) => void;
  onRemove?: () => void;
}) {
  const config = FILTERS[filterKey];
  const active = value !== undefined;

  return (
    <div className="relative">
      <div
        className="inline-flex min-h-9 items-stretch overflow-hidden rounded-md border"
        style={{
          borderColor: active ? "var(--color-border-strong)" : "var(--color-border)",
          background: active ? "var(--color-bg-brand)" : "var(--color-bg)",
        }}
      >
        <button
          type="button"
          className="flex items-center gap-2 px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]"
          style={{
            color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
          }}
          aria-expanded={isOpen}
          onClick={() => onToggle(menuId)}
        >
          {!active && <Plus className="size-3.5" aria-hidden="true" />}
          <span style={{ color: active ? "var(--color-text-tertiary)" : undefined }}>
            {config.label}
          </span>
          {active && (
            <>
              <span aria-hidden="true" style={{ color: "var(--color-border-strong)" }}>
                /
              </span>
              <span>{getOptionLabel(filterKey, value)}</span>
            </>
          )}
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </button>
        {active && onRemove && (
          <button
            type="button"
            className="flex w-8 items-center justify-center border-l transition-transform duration-150 ease-out active:scale-[0.96]"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-tertiary)",
            }}
            aria-label={`Remove ${config.label.toLowerCase()} filter`}
            onClick={onRemove}
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-lg border py-1"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            className="border-b px-3 py-2 text-xs font-semibold"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-secondary)",
            }}
          >
            {config.prompt}
          </div>
          {config.options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
              onClick={() => onSelect(option.value)}
            >
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                {value === option.value && (
                  <Check
                    className="size-4"
                    style={{ color: "var(--color-text-brand)" }}
                    aria-hidden="true"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className="block text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {option.label}
                </span>
                <span
                  className="block truncate text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {option.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  return (
    <article className="flex gap-3 px-4 py-4 sm:px-5" data-feedback-id={`issue-${issue.number}`}>
      <span className="mt-0.5 shrink-0">
        {issue.status === "open" ? (
          <CircleDot
            className="size-5"
            style={{ color: "var(--color-text-brand)" }}
            aria-label="Open issue"
          />
        ) : (
          <CheckCircle2
            className="size-5"
            style={{ color: "var(--color-success)" }}
            aria-label="Closed issue"
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3
            className="text-sm font-semibold sm:text-base"
            style={{ color: "var(--color-text-primary)" }}
          >
            {issue.title}
          </h3>
          {issue.labels.map((label) => (
            <span
              key={label}
              className="rounded-full border px-2 py-0.5 text-xs font-medium"
              style={{
                borderColor:
                  label === "bug" ? "var(--color-danger)" : "var(--color-border-strong)",
                background:
                  label === "bug" ? "var(--color-bg-subtle)" : "var(--color-bg-brand)",
                color:
                  label === "bug" ? "var(--color-danger)" : "var(--color-text-brand)",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          #{issue.number} updated {issue.updatedLabel} by {issue.assigneeName}
        </p>
      </div>

      <div
        className="hidden shrink-0 items-center gap-1 self-center text-xs sm:flex"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        <MessageSquare className="size-3.5" aria-hidden="true" />
        {issue.comments}
      </div>
    </article>
  );
}

export default function FilterPrototype() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [ready, setReady] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [savedQuery, setSavedQuery] = useState<string | null>(null);
  const [defaultQuery, setDefaultQuery] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const controlsRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => parseQuery(query), [query]);
  const suggestions = useMemo(() => getInputSuggestions(query), [query]);
  const issues = useMemo(() => filterIssues(ISSUES, tokens), [tokens]);
  const activeFilters = tokens.filter((token) => token.key).length;
  const activePreset = PRESETS.find((preset) => preset.query === query)?.id;
  const saved = Boolean(query) && savedQuery === query;
  const isDefault = Boolean(query) && defaultQuery === query;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const urlQuery = params.get("q");
      const storedDefault = window.localStorage.getItem(DEFAULT_VIEW_KEY);
      const initialQuery = params.has("q") ? (urlQuery ?? "") : (storedDefault ?? DEFAULT_QUERY);

      setQuery(initialQuery);
      setSavedQuery(window.localStorage.getItem(SAVED_VIEW_KEY));
      setDefaultQuery(storedDefault);
      setReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    params.set("q", query);
    const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [query, ready]);

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", closeMenus);
    return () => document.removeEventListener("pointerdown", closeMenus);
  }, []);

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  function updateFilter(filterKey: FilterKey, value: string, tokenIndex?: number) {
    const nextTokens = parseQuery(query);
    const nextToken = { raw: formatFilterToken(filterKey, value), key: filterKey, value };

    if (tokenIndex !== undefined) {
      nextTokens[tokenIndex] = nextToken;
    } else if (filterKey === "label") {
      nextTokens.push(nextToken);
    } else {
      const existingIndex = nextTokens.findIndex((token) => token.key === filterKey);
      if (existingIndex >= 0) {
        nextTokens[existingIndex] = nextToken;
      } else {
        nextTokens.push(nextToken);
      }
    }

    setQuery(joinTokens(nextTokens));
    setOpenMenu(null);
  }

  function removeFilter(tokenIndex: number) {
    setQuery(joinTokens(tokens.filter((_, index) => index !== tokenIndex)));
    setOpenMenu(null);
  }

  function toggleMenu(menuId: string) {
    setInputFocused(false);
    setOpenMenu((current) => (current === menuId ? null : menuId));
  }

  function resetFilters() {
    setQuery("");
    setOpenMenu(null);
    setInputFocused(false);
  }

  function saveView() {
    window.localStorage.setItem(SAVED_VIEW_KEY, query);
    setSavedQuery(query);
  }

  function toggleDefault() {
    if (isDefault) {
      window.localStorage.removeItem(DEFAULT_VIEW_KEY);
      setDefaultQuery(null);
      return;
    }

    window.localStorage.setItem(DEFAULT_VIEW_KEY, query);
    setDefaultQuery(query);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-subtle)" }}>
      <header
        className="border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.98]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All prototypes
          </Link>
          <span
            className="h-5 w-px"
            style={{ background: "var(--color-border)" }}
            aria-hidden="true"
          />
          <div
            className="flex size-7 items-center justify-center rounded-md text-xs font-bold"
            style={{
              background: "var(--color-bg-inverse)",
              color: "var(--color-text-inverse)",
            }}
          >
            A
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Issues
          </span>
          <span
            className="ml-auto hidden text-xs sm:inline"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Product foundations / atlas
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          data-feedback-id="filter-page-heading"
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className="rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  borderColor: "var(--color-border-strong)",
                  background: "var(--color-bg-brand)",
                  color: "var(--color-text-brand)",
                }}
              >
                Pattern prototype
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Query text + visible filters
              </span>
            </div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Find the issues you need
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              One query controls the filter buttons, results, and shared URL.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            data-feedback-id="persistence-controls"
          >
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: "var(--color-border)",
                background: saved ? "var(--color-bg-brand)" : "var(--color-bg)",
                color: saved ? "var(--color-text-brand)" : "var(--color-text-secondary)",
              }}
              disabled={!query}
              onClick={saveView}
            >
              {saved ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Bookmark className="size-4" aria-hidden="true" />
              )}
              {saved ? "View saved" : "Save view"}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: isDefault
                  ? "var(--color-border-focus)"
                  : "var(--color-border)",
                background: isDefault ? "var(--color-bg-brand)" : "var(--color-bg)",
                color: isDefault ? "var(--color-text-brand)" : "var(--color-text-secondary)",
              }}
              disabled={!query}
              aria-pressed={isDefault}
              onClick={toggleDefault}
            >
              <CircleDot className="size-4" aria-hidden="true" />
              {isDefault ? "Default view" : "Use as default"}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color:
                  copyState === "error"
                    ? "var(--color-danger)"
                    : "var(--color-text-secondary)",
              }}
              onClick={copyLink}
            >
              {copyState === "copied" ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copyState === "copied"
                ? "Link copied"
                : copyState === "error"
                  ? "Copy failed"
                  : "Copy link"}
            </button>
          </div>
        </section>

        <section
          ref={controlsRef}
          className="relative rounded-xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
            boxShadow: "var(--shadow-sm)",
          }}
          data-feedback-id="filter-query-builder"
        >
          <div
            className="flex flex-wrap items-center gap-2 border-b px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="mr-1 text-xs font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Try a state
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="rounded-md border px-2.5 py-1 text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
                style={{
                  borderColor:
                    activePreset === preset.id
                      ? "var(--color-border-focus)"
                      : "var(--color-border)",
                  background:
                    activePreset === preset.id
                      ? "var(--color-bg-brand)"
                      : "var(--color-bg)",
                  color:
                    activePreset === preset.id
                      ? "var(--color-text-brand)"
                      : "var(--color-text-tertiary)",
                }}
                aria-pressed={activePreset === preset.id}
                onClick={() => {
                  setQuery(preset.query);
                  setOpenMenu(null);
                  setInputFocused(false);
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-transform duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--color-text-tertiary)" }}
              disabled={!query}
              onClick={resetFilters}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="p-4 sm:p-5">
            <label
              htmlFor="issue-query"
              className="mb-2 block text-xs font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Query
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2"
                style={{ color: "var(--color-text-tertiary)" }}
                aria-hidden="true"
              />
              <input
                id="issue-query"
                value={query}
                autoComplete="off"
                spellCheck={false}
                className="h-11 w-full rounded-lg border bg-transparent pl-10 pr-4 font-mono text-sm outline-none focus:ring-2"
                style={{
                  borderColor: inputFocused
                    ? "var(--color-border-focus)"
                    : "var(--color-border-strong)",
                  color: "var(--color-text-primary)",
                  background: "var(--color-bg)",
                  boxShadow: inputFocused ? "0 0 0 var(--space-1) var(--color-bg-brand)" : "none",
                }}
                placeholder="Filter issues with is:, label:, assignee:, or sort:"
                role="combobox"
                aria-expanded={inputFocused && suggestions.length > 0}
                aria-autocomplete="list"
                aria-controls={inputFocused ? "query-suggestions" : undefined}
                onFocus={() => {
                  setInputFocused(true);
                  setOpenMenu(null);
                }}
                onBlur={() => setInputFocused(false)}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setInputFocused(false);
                    event.currentTarget.blur();
                  }
                }}
              />

              {inputFocused && suggestions.length > 0 && (
                <div
                  id="query-suggestions"
                  className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-lg border py-1"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg)",
                    boxShadow: "var(--shadow-lg)",
                  }}
                  role="listbox"
                >
                  <div
                    className="flex items-center gap-2 border-b px-3 py-2 text-xs font-semibold"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                    Filter suggestions
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.token}
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      role="option"
                      aria-selected={false}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setQuery(applyInputSuggestion(query, suggestion.token));
                      }}
                    >
                      <code
                        className="shrink-0 rounded-md border px-2 py-1 text-xs"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {suggestion.token}
                      </code>
                      <span className="min-w-0">
                        <span
                          className="block text-sm font-medium"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {suggestion.label}
                        </span>
                        <span
                          className="block truncate text-xs"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {suggestion.hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                  Visible filters
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {activeFilters === 0
                    ? "No filters applied"
                    : `${activeFilters} ${activeFilters === 1 ? "filter" : "filters"} applied`}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTER_KEYS.flatMap((filterKey) => {
                  const matchingTokens = tokens
                    .map((token, index) => ({ token, index }))
                    .filter(({ token }) => token.key === filterKey);

                  if (matchingTokens.length === 0) {
                    const menuId = `add-${filterKey}`;
                    return [
                      <FilterButton
                        key={menuId}
                        filterKey={filterKey}
                        menuId={menuId}
                        isOpen={openMenu === menuId}
                        onToggle={toggleMenu}
                        onSelect={(value) => updateFilter(filterKey, value)}
                      />,
                    ];
                  }

                  const filterButtons = matchingTokens.map(({ token, index }) => {
                    const menuId = `edit-${index}`;
                    return (
                      <FilterButton
                        key={menuId}
                        filterKey={filterKey}
                        menuId={menuId}
                        value={token.value}
                        isOpen={openMenu === menuId}
                        onToggle={toggleMenu}
                        onSelect={(value) => updateFilter(filterKey, value, index)}
                        onRemove={() => removeFilter(index)}
                      />
                    );
                  });

                  if (filterKey === "label") {
                    const menuId = "add-another-label";
                    filterButtons.push(
                      <FilterButton
                        key={menuId}
                        filterKey={filterKey}
                        menuId={menuId}
                        isOpen={openMenu === menuId}
                        onToggle={toggleMenu}
                        onSelect={(value) => updateFilter(filterKey, value)}
                      />
                    );
                  }

                  return filterButtons;
                })}
              </div>
            </div>

            <div
              className="mt-4 flex flex-col gap-1 border-t pt-3 text-xs sm:flex-row sm:items-center sm:justify-between"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-tertiary)",
              }}
            >
              <span>Use quotes for long values, for example label:&quot;design systems&quot;.</span>
              <span className="font-mono">URL updates as you type</span>
            </div>
          </div>
        </section>

        <section
          className="mt-5 overflow-hidden rounded-xl border"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
            boxShadow: "var(--shadow-sm)",
          }}
          data-feedback-id="filtered-issue-list"
        >
          <div
            className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-5"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <ListFilter
                className="size-4"
                style={{ color: "var(--color-text-secondary)" }}
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {issues.length} {issues.length === 1 ? "issue" : "issues"}
              </h2>
            </div>
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              {activeFilters > 0 ? `Filtered by ${activeFilters} values` : "Showing everything"}
            </span>
          </div>

          {issues.length > 0 ? (
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {issues.map((issue) => (
                <IssueRow key={issue.number} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <div
                className="flex size-10 items-center justify-center rounded-full"
                style={{ background: "var(--color-bg-muted)", color: "var(--color-text-secondary)" }}
              >
                <Search className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                No issues match this query
              </h2>
              <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                Remove a filter or reset the query to return to the full issue list.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text-secondary)",
                }}
                onClick={resetFilters}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset filters
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
