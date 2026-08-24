"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Copy, ExternalLink, Terminal } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import {
  buildPrompt,
  claudeAppDeepLink,
  claudeCliDeepLink,
  cloneCommand,
  copilotDeepLink,
  slugify,
} from "./prompt";

type ToolId = "claude" | "copilot" | "codex";

interface Tool {
  id: ToolId;
  label: string;
  /** One-click launch, where the tool actually provides one. */
  deepLink: ((repo: string, prompt: string) => string) | null;
  deepLinkLabel: string;
  /** What the deep link does and does not do — stated, not implied. */
  deepLinkNote: string;
  /** A second link where the tool offers a meaningfully different surface. */
  altLink?: (repo: string, prompt: string) => string;
  altLabel?: string;
  launch: string;
  finish: string;
}

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    // The desktop app, not the terminal. `claude://code/new` opens an in-app
    // Code session; `claude-cli://open` opens a terminal window instead.
    deepLink: (_repo, prompt) => claudeAppDeepLink(prompt),
    deepLinkLabel: "Open in the Claude app",
    deepLinkNote:
      "Opens a Code session in the Claude desktop app with the prompt ready. The app asks which folder to work in — a folder from a link is always confirmed first.",
    altLink: claudeCliDeepLink,
    altLabel: "Open in a terminal instead",
    launch: "claude",
    finish: "Review the prompt and send it.",
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    deepLink: copilotDeepLink,
    deepLinkLabel: "Open in GitHub Copilot",
    deepLinkNote:
      "Opens the GitHub Copilot app on this repo with the prompt filled in. Deep links are repo-centric, so it works from a fresh machine.",
    launch: "copilot",
    finish: "Review the prompt and start the session.",
  },
  {
    id: "codex",
    label: "Codex",
    deepLink: null,
    deepLinkLabel: "",
    deepLinkNote: "",
    launch: "codex",
    finish: "Paste the prompt when Codex starts.",
  },
];

export function StartPrototypeDialog({ repo }: { repo: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");
  const [brief, setBrief] = useState("");
  const [tool, setTool] = useState<ToolId>("claude");

  const prompt = useMemo(
    () => buildPrompt({ name, author, prompt: brief }),
    [name, author, brief]
  );

  const slug = slugify(name);
  const active = TOOLS.find((t) => t.id === tool)!;
  const ready =
    name.trim().length > 0 && author.trim().length > 0 && brief.trim().length > 0;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white transition-colors"
        style={{ background: "var(--color-brand)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "var(--color-brand-hover)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "var(--color-brand)")
        }
      >
        <Plus size={14} />
        New prototype
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[88vh] max-w-lg overflow-y-auto"
          style={{ background: "var(--color-bg)" }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: "var(--color-text-primary)" }}>
              Start a prototype
            </DialogTitle>
            <DialogDescription style={{ color: "var(--color-text-tertiary)" }}>
              Prototypes are created in your checkout, not here. Say what you
              want, then hand it to your coding agent.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-1 flex flex-col gap-5">
            {/* ── What you're building ─────────────────────────── */}
            <div className="flex flex-col gap-3">
              <Field
                label="Prototype name"
                value={name}
                onChange={setName}
                placeholder="Pricing page"
                required
                hint={slug ? `/prototypes/${slug}` : undefined}
              />
              <Field
                label="Your name"
                value={author}
                onChange={setAuthor}
                placeholder="Sam Wilson"
                required
              />
              {/* The one thing only the author can supply. Everything else in
                  the generated prompt is metadata. */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="prototype-brief"
                  className="text-xs font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  What should it do?
                  <span style={{ color: "var(--color-danger)" }}> *</span>
                </label>
                <textarea
                  id="prototype-brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  rows={5}
                  placeholder={
                    "Three pricing tiers with a monthly/annual toggle.\n\n" +
                    "Annual should default to on and show the saving as a badge. " +
                    "Compare features in a table below the cards."
                  }
                  className="resize-y rounded-md border px-3 py-2 text-sm leading-relaxed outline-none transition-colors"
                  style={{
                    background: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-brand)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-border)")
                  }
                />
                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Goes to your agent as written. Repo conventions come from
                  AGENTS.md, so there is no need to repeat them here.
                </p>
              </div>
            </div>

            {/* ── Tool picker ──────────────────────────────────── */}
            <div className="flex flex-col gap-2.5">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Open in
              </span>
              <div
                className="flex gap-1 rounded-lg p-1"
                style={{ background: "var(--color-bg-muted)" }}
                role="tablist"
              >
                {TOOLS.map((t) => (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={tool === t.id}
                    onClick={() => setTool(t.id)}
                    className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
                    style={{
                      background: tool === t.id ? "var(--color-bg)" : "transparent",
                      color:
                        tool === t.id
                          ? "var(--color-text-primary)"
                          : "var(--color-text-tertiary)",
                      boxShadow: tool === t.id ? "var(--shadow-sm)" : undefined,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {!ready ? (
              <p
                className="rounded-lg border border-dashed px-3.5 py-3 text-xs"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                Fill in the name, your name, and what it should do. The first
                two end up in <code className="font-mono">registry.json</code>;
                the last is the prompt your agent receives.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {/* One-click, where the tool really offers one */}
                {active.deepLink && (
                  <div className="flex flex-col gap-1.5">
                    <a
                      href={active.deepLink(repo, prompt)}
                      className="flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-white"
                      style={{ background: "var(--color-brand)" }}
                    >
                      <ExternalLink size={13} />
                      {active.deepLinkLabel}
                    </a>
                    <p
                      className="text-[11px] leading-relaxed"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {active.deepLinkNote}
                    </p>
                    {active.altLink && (
                      <a
                        href={active.altLink(repo, prompt)}
                        className="self-start text-[11px] underline underline-offset-2"
                        style={{ color: "var(--color-text-brand)" }}
                      >
                        {active.altLabel}
                      </a>
                    )}
                  </div>
                )}

                <Block
                  icon={<Terminal size={12} />}
                  title={active.deepLink ? "Or from a fresh clone" : "In your terminal"}
                  body={cloneCommand(repo, active.launch)}
                />

                <Block title="The prompt" body={prompt} scroll />

                <p
                  className="text-[11px] leading-relaxed"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {active.finish} It writes the folder and the{" "}
                  <code className="font-mono">registry.json</code> entry. Push
                  the branch and CI puts it on this hub.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Block({
  icon,
  title,
  body,
  scroll,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  scroll?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — the text is on screen and selectable.
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {icon}
          {title}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors"
          style={{ color: copied ? "var(--color-success)" : "var(--color-text-tertiary)" }}
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        className={`whitespace-pre-wrap break-words rounded-lg border px-3 py-2.5 font-mono text-[11.5px] leading-relaxed ${
          scroll ? "max-h-52 overflow-y-auto" : ""
        }`}
        style={{
          background: "var(--color-bg-subtle)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-secondary)",
        }}
      >
        {body}
      </pre>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-baseline gap-2 text-xs font-medium">
        <span style={{ color: "var(--color-text-secondary)" }}>
          {label}
          {required && <span style={{ color: "var(--color-danger)" }}> *</span>}
        </span>
        {hint && (
          <span className="font-mono text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            {hint}
          </span>
        )}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border px-3 py-2 text-sm outline-none transition-colors"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
          color: "var(--color-text-primary)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-brand)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
      />
    </div>
  );
}
