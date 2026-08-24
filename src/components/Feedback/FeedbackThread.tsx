"use client";

import type { FeedbackRow } from "@/lib/supabase/types";
import { formatAbsoluteTime, formatRelativeTime, initials } from "@/lib/format";

/**
 * A read-only comment list. Shared by the in-prototype overlay and the hub
 * cards so a thread looks the same wherever you read it.
 */
export function FeedbackThread({
  feedback,
  emptyLabel = "No feedback yet.",
  dense = false,
}: {
  feedback: FeedbackRow[];
  emptyLabel?: string;
  dense?: boolean;
}) {
  if (feedback.length === 0) {
    return (
      <p
        className={dense ? "text-xs" : "text-sm"}
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className={`flex flex-col ${dense ? "gap-2.5" : "gap-4"}`}>
      {feedback.map((comment) => (
        <li key={comment.id} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-0.5 flex shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
            style={{
              height: dense ? 20 : 24,
              width: dense ? 20 : 24,
              background: "var(--color-bg-brand)",
              color: "var(--color-text-brand)",
            }}
          >
            {initials(comment.author_name)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className="truncate text-xs font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {comment.author_name}
              </span>
              <time
                className="shrink-0 text-[11px]"
                dateTime={comment.created_at}
                title={formatAbsoluteTime(comment.created_at)}
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {formatRelativeTime(comment.created_at)}
              </time>
            </div>
            <p
              className="mt-0.5 whitespace-pre-wrap break-words text-xs leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {comment.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
