"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  GitBranch,
  ImageOff,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

import type { HubPrototype } from "@/lib/registry/types";
import { formatAbsoluteTime, formatRelativeTime, shortSha } from "@/lib/format";
import { FeedbackThread } from "@/src/components/Feedback/FeedbackThread";
import { StatusBadge } from "./StatusBadge";

/**
 * One prototype on the hub.
 *
 * The title links to `preview_url + path`, i.e. the deployment the prototype
 * actually lives on — clicking a card from another branch opens that branch's
 * build, not this one. Its feedback thread is readable inline so you can scan
 * everything without opening each prototype.
 */
export function PrototypeCard({
  prototype,
  /**
   * Other branches carrying a copy of this prototype. The hub shows one card
   * per prototype, so this is the only trace of the rows that collapsed into
   * it — worth surfacing quietly rather than pretending they don't exist.
   */
  alsoOn = [],
}: {
  prototype: HubPrototype;
  alsoOn?: string[];
}) {
  const [threadOpen, setThreadOpen] = useState(false);
  const commentCount = prototype.feedback.length;
  const sha = shortSha(prototype.commitSha);

  const linkProps = prototype.isExternal
    ? { href: prototype.href, target: "_blank" as const, rel: "noreferrer" }
    : { href: prototype.href };

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl border transition-colors"
      style={{
        background: "var(--color-bg)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Screenshot — 1280x800 from CI, so 16:10 */}
      <Link
        {...linkProps}
        className="relative block aspect-[16/10] overflow-hidden"
        style={{ background: "var(--color-bg-muted)" }}
        aria-label={`Open ${prototype.name}`}
      >
        {prototype.screenshotUrl ? (
          // Plain <img>: screenshots come from Supabase storage, and the repo
          // has no next/image remotePatterns configured for that host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={prototype.screenshotUrl}
            alt={`Screenshot of ${prototype.name}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1.5"
            style={{ color: "var(--color-text-disabled)" }}
          >
            <ImageOff size={20} />
            <span className="text-[11px]">No screenshot yet</span>
          </div>
        )}

        <span
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100"
          style={{ background: "var(--color-bg)", color: "var(--color-text-secondary)" }}
        >
          <ArrowUpRight size={13} />
        </span>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link {...linkProps} className="min-w-0">
            <h3
              className="truncate text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {prototype.name}
            </h3>
          </Link>
          <StatusBadge status={prototype.status} />
        </div>

        {prototype.description && (
          <p
            className="line-clamp-2 text-xs leading-relaxed"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {prototype.description}
          </p>
        )}

        {/* Branch + commit */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px]"
            style={{
              background: "var(--color-bg-muted)",
              color: "var(--color-text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
            title={prototype.branch}
          >
            <GitBranch size={11} className="shrink-0" />
            <span className="truncate">{prototype.branch}</span>
          </span>

          {alsoOn.length > 0 && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[11px]"
              style={{
                background: "var(--color-bg-muted)",
                color: "var(--color-text-tertiary)",
              }}
              title={`Also carried by: ${alsoOn.join(", ")}`}
            >
              +{alsoOn.length}
            </span>
          )}

          {prototype.prNumber !== null && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[11px]"
              style={{
                background: "var(--color-bg-muted)",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              #{prototype.prNumber}
            </span>
          )}

          {sha && (
            <span
              className="rounded-md px-1.5 py-0.5 text-[11px]"
              style={{
                background: "var(--color-bg-muted)",
                color: "var(--color-text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}
              title={prototype.commitSha ?? undefined}
            >
              {sha}
            </span>
          )}
        </div>

        {/* Author + freshness */}
        <div
          className="mt-auto flex items-center justify-between gap-2 border-t pt-3 text-xs"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
        >
          <span className="truncate">{prototype.author ?? "Unknown"}</span>
          <time
            dateTime={prototype.updatedAt}
            title={formatAbsoluteTime(prototype.updatedAt)}
            className="shrink-0"
          >
            {formatRelativeTime(prototype.updatedAt)}
          </time>
        </div>

        {/* Feedback, readable without leaving the hub */}
        <div>
          <button
            type="button"
            onClick={() => setThreadOpen((value) => !value)}
            aria-expanded={threadOpen}
            className="flex w-full items-center gap-1.5 rounded-md py-1 text-xs transition-colors"
            style={{
              color:
                commentCount > 0
                  ? "var(--color-text-secondary)"
                  : "var(--color-text-tertiary)",
            }}
          >
            <MessageSquare size={12} />
            <span>
              {commentCount === 0
                ? "No feedback"
                : `${commentCount} comment${commentCount === 1 ? "" : "s"}`}
            </span>
            {commentCount > 0 && (
              <ChevronDown
                size={12}
                className="ml-auto transition-transform"
                style={{ transform: threadOpen ? "rotate(180deg)" : undefined }}
              />
            )}
          </button>

          {threadOpen && commentCount > 0 && (
            <div
              className="mt-2 max-h-56 overflow-y-auto rounded-lg p-3"
              style={{ background: "var(--color-bg-subtle)" }}
            >
              <FeedbackThread feedback={prototype.feedback} dense />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
