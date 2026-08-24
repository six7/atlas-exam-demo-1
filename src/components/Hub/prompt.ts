/**
 * The prompt handed to a coding agent to scaffold a prototype.
 *
 * Creating a prototype means writing into a git checkout, so the hub hands the
 * work off rather than doing it server-side.
 *
 * The prompt carries the author's own words plus the registry metadata, and
 * nothing else. Repo conventions — read AGENTS.md, use design tokens, never
 * write to Supabase — live in AGENTS.md, which every agent reads anyway.
 * Restating them here made every prompt a wall of boilerplate that buried the
 * one part only the author could supply.
 */

export interface PrototypeDraft {
  name: string;
  author: string;
  /** What the author actually wants built. Their words, passed through. */
  prompt: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Today as YYYY-MM-DD, in the author's own timezone. */
export function today(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * A one-line `description` for the registry, taken from the author's prompt.
 *
 * The field is required and shows on the hub card, so it cannot be left to
 * chance — but asking for it separately duplicated what they just typed.
 */
export function descriptionFrom(prompt: string, max = 140): string {
  const firstLine =
    prompt
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";
  const sentence = firstLine.split(/(?<=[.!?])\s/)[0] ?? firstLine;
  const text = sentence.length > max ? sentence.slice(0, max - 1).trimEnd() + "…" : sentence;
  return text;
}

/**
 * Metadata block plus the author's prompt verbatim.
 *
 * Every field the registry requires is named, so the agent can write a valid
 * entry without being told the schema — but *how* to create a prototype is
 * AGENTS.md's job, not this string's.
 */
export function buildPrompt(draft: PrototypeDraft, date = today()): string {
  const slug = slugify(draft.name) || "my-prototype";
  const body = draft.prompt.trim();

  const meta = [
    `  id           ${slug}`,
    `  name         ${draft.name.trim() || slug}`,
    `  author       ${draft.author.trim() || "Unknown"}`,
    `  description  ${descriptionFrom(body) || "A new prototype."}`,
    `  createdAt    ${date}`,
  ].join("\n");

  return `New prototype for this repo — see AGENTS.md for how to create one.

${meta}

${body || "Describe what you want to build."}`;
}

/** `claude-cli://` accepts at most 5,000 characters in `q`. */
export const CLAUDE_PROMPT_LIMIT = 5000;

/**
 * Claude Code in the **desktop app**.
 *
 * `claude://code/new` opens an in-app Code session; `claude-cli://open` opens a
 * terminal instead. The app takes an absolute `folder`, not a repo slug, and a
 * folder from a link is treated as untrusted anyway — so we send only the
 * prompt and let the session pick up the working directory.
 */
export function claudeAppDeepLink(prompt: string): string {
  return `claude://code/new?q=${encodeURIComponent(
    prompt.slice(0, CLAUDE_PROMPT_LIMIT)
  )}`;
}

/**
 * Claude Code in a terminal. Unlike the app link this one can target the repo,
 * but only resolves to a clone Claude Code has already seen.
 */
export function claudeCliDeepLink(repo: string, prompt: string): string {
  return `claude-cli://open?repo=${encodeURIComponent(repo)}&q=${encodeURIComponent(
    prompt.slice(0, CLAUDE_PROMPT_LIMIT)
  )}`;
}

/**
 * GitHub Copilot app deep link.
 *
 * Wrapped in GitHub's hosted launcher rather than handed out as a raw
 * `ghapp://` URL: this runs in a web page, and browsers and content filters
 * routinely refuse to render custom schemes as links.
 */
export function copilotDeepLink(repo: string, prompt: string): string {
  const appLink =
    `ghapp://session/new?repo=${encodeURIComponent(repo)}` +
    `&mode=interactive&prompt=${encodeURIComponent(prompt)}`;
  return `https://github.com/copilot/app/launch?open=${encodeURIComponent(appLink)}`;
}

export function cloneCommand(repo: string, launch: string): string {
  const dir = repo.split("/")[1] ?? "repo";
  return [
    `git clone https://github.com/${repo}.git`,
    `cd ${dir}`,
    `npm install --legacy-peer-deps`,
    launch,
  ].join("\n");
}
