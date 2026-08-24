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
  claudeDeepLink,
  cloneCommand,
  slugify,
  vscodeCloneLink,
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
  launch: string;
  finish: string;
}

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    deepLink: claudeDeepLink,
    deepLinkLabel: "Open in Claude Code",
    deepLinkNote:
      "Opens a session in your existing clone with the prompt filled in. It does not clone — if you have never run claude in this repo, use the commands instead.",
    launch: "claude",
    finish: "Paste the prompt and press Enter.",
  },
  {
    id: "copilot",
    label: "GitHub Copilot",
    deepLink: (repo) => vscodeCloneLink(repo),
    deepLinkLabel: "Clone in VS Code",
    deepLinkNote:
      "VS Code will ask where to put the clone. Copilot Chat cannot be pre-filled from a link, so paste the prompt once it opens.",
    launch: "code .",
    finish: "Open Copilot Chat (⌃⌘I / Ctrl+Alt+I) and paste the prompt.",
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
  const [description, setDescription] = useState("");
  const [tool, setTool] = useState<ToolId>("claude");

  const prompt = useMemo(
    () => buildPrompt({ name, author, description }),
    [name, author, description]
  );

  const slug = slugify(name);
  const active = TOOLS.find((t) => t.id === tool)!;
  const ready = name.trim().length > 0 && author.trim().length > 0;

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
              Prototypes are created in your checkout, not here. Describe it,
              then hand the prompt to your coding agent.
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
              <Field
                label="What are you exploring?"
                value={description}
                onChange={setDescription}
                placeholder="Three-tier pricing with an annual toggle."
              />
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
                Add a name and your name — both end up in{" "}
                <code className="font-mono">registry.json</code> and on the hub
                card.
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
