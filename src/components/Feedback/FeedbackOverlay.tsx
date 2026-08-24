"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

import type { FeedbackRow } from "@/lib/supabase/types";
import { FeedbackThread } from "./FeedbackThread";
import { useDisplayName } from "./useDisplayName";

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "unavailable"; message: string };

/**
 * Floating feedback affordance for a prototype.
 *
 * Mounted once by `app/prototypes/[id]/page.tsx`, so it appears inside every
 * prototype shell without prototypes having to opt in. It knows only its own
 * slug: `/api/feedback` resolves that to a registry row using the
 * deployment's repo and branch, and posts go through that handler rather than
 * from here to Supabase directly.
 */
export function FeedbackOverlay({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [state, setState] = useState<LoadState>({ kind: "idle" });
  const [draft, setDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { name, ready: nameReady, save: saveName } = useDisplayName();
  const panelRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const response = await fetch(
        `/api/feedback?slug=${encodeURIComponent(slug)}`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setState({
          kind: "unavailable",
          message: payload?.error ?? "Feedback is unavailable right now.",
        });
        return;
      }

      setFeedback(payload.feedback ?? []);
      setState({ kind: "ready" });
    } catch {
      setState({
        kind: "unavailable",
        message: "Could not reach the feedback service.",
      });
    }
  }, [slug]);

  // Fetch lazily, so a prototype that nobody comments on costs nothing.
  useEffect(() => {
    if (open && state.kind === "idle") void load();
  }, [open, state.kind, load]);

  // Escape closes the panel.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handlePost(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || posting) return;

    setPosting(true);
    setError(null);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          body: draft.trim(),
          authorName: name ?? "Anonymous",
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload?.error ?? "Could not post your comment.");
        return;
      }

      setFeedback((current) => [...current, payload.feedback]);
      setDraft("");
    } catch {
      setError("Could not reach the feedback service.");
    } finally {
      setPosting(false);
    }
  }

  const needsName = nameReady && !name;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        // CI screenshots hide anything marked this way — the overlay is our
        // chrome, not part of the prototype being captured.
        data-screenshot-hide=""
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close feedback" : "Open feedback"}
        className="fixed bottom-5 right-5 z-50 flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]"
        style={{ background: "var(--color-brand)", boxShadow: "var(--shadow-lg)" }}
      >
        {open ? <X size={16} /> : <MessageSquare size={16} />}
        <span>Feedback</span>
        {feedback.length > 0 && !open && (
          <span
            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold"
            style={{ background: "rgba(255,255,255,0.24)" }}
          >
            {feedback.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Prototype feedback"
          data-screenshot-hide=""
          className="fixed bottom-20 right-5 z-50 flex max-h-[min(32rem,calc(100vh-7rem))] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border"
          style={{
            background: "var(--color-bg)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <header
            className="flex shrink-0 items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="min-w-0">
              <div
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Feedback
              </div>
              <div
                className="truncate text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {slug}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
              className="rounded-md p-1.5 transition-colors"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <X size={15} />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-3.5">
            {state.kind === "loading" && (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                <Loader2 size={13} className="animate-spin" />
                Loading feedback…
              </div>
            )}

            {state.kind === "unavailable" && (
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-tertiary)" }}>
                {state.message}
              </p>
            )}

            {state.kind === "ready" && (
              <FeedbackThread
                feedback={feedback}
                emptyLabel="No feedback yet. Be the first."
                dense
              />
            )}
          </div>

          {state.kind === "ready" && (
            <div
              className="shrink-0 border-t p-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              {needsName ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveName(nameDraft);
                    // Hand focus to the composer once the name is in.
                    requestAnimationFrame(() => composerRef.current?.focus());
                  }}
                  className="flex flex-col gap-2"
                >
                  <label
                    htmlFor="feedback-display-name"
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    What should we call you?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="feedback-display-name"
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      placeholder="Sam Wilson"
                      maxLength={80}
                      autoFocus
                      className="min-w-0 flex-1 rounded-md border px-2.5 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--color-bg)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!nameDraft.trim()}
                      className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      style={{ background: "var(--color-brand)" }}
                    >
                      Save
                    </button>
                  </div>
                  <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                    Stored in this browser only. You will not be asked again.
                  </p>
                </form>
              ) : (
                <form onSubmit={handlePost} className="flex flex-col gap-2">
                  <textarea
                    ref={composerRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      // ⌘/Ctrl+Enter posts, matching every other comment box.
                      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                        void handlePost(event);
                      }
                    }}
                    rows={2}
                    maxLength={4000}
                    placeholder={`Comment as ${name}…`}
                    className="w-full resize-none rounded-md border px-2.5 py-2 text-xs outline-none"
                    style={{
                      background: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)",
                    }}
                  />

                  {error && (
                    <p className="text-[11px]" style={{ color: "var(--color-danger)" }}>
                      {error}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      as {name}
                    </span>
                    <button
                      type="submit"
                      disabled={!draft.trim() || posting}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      style={{ background: "var(--color-brand)" }}
                    >
                      {posting ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Post
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
