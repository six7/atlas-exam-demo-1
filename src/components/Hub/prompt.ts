/**
 * The prompt handed to a coding agent to scaffold a prototype.
 *
 * Creating a prototype means writing two things into a git checkout: a folder
 * and a registry entry. That is local work, so the hub hands it off to whatever
 * agent you already use rather than trying to do it server-side.
 */

export interface PrototypeDraft {
  name: string;
  author: string;
  description: string;
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
 * Builds the prompt. Every field the registry requires is stated explicitly,
 * so the agent produces an entry that passes `npm run validate:registry`
 * rather than something close enough to look right.
 */
export function buildPrompt(draft: PrototypeDraft, date = today()): string {
  const slug = slugify(draft.name) || "my-prototype";
  const entry = JSON.stringify(
    {
      id: slug,
      name: draft.name.trim() || "My Prototype",
      author: draft.author.trim() || "Your Name",
      description: draft.description.trim() || "What you're exploring.",
      createdAt: date,
    },
    null,
    2
  );

  return `Create a new prototype in this repo.

1. Read AGENTS.md first — it has the conventions for this repo.

2. Create src/prototypes/${slug}/index.tsx with a single default export.

3. Add exactly this entry to the "prototypes" array in
   src/prototypes/registry.json:

${entry}

4. Run \`npm run validate:registry\` and make sure it passes. All five fields
   are required and the folder must match the id.

5. Run \`npm run dev\` and confirm /prototypes/${slug} renders.

Use the design tokens in app/tokens.css (var(--color-*)) — never hardcoded hex,
so dark mode works. Use the shared components in src/components/ui/ rather than
rebuilding them.

Do not write to Supabase. The prototype reaches the shared hub on its own when
I push the branch and CI registers the deployment.`;
}

/** `claude-cli://` accepts at most 5,000 characters in `q`. */
export const CLAUDE_PROMPT_LIMIT = 5000;

export function claudeDeepLink(repo: string, prompt: string): string {
  return `claude-cli://open?repo=${encodeURIComponent(repo)}&q=${encodeURIComponent(
    prompt.slice(0, CLAUDE_PROMPT_LIMIT)
  )}`;
}

/**
 * GitHub Copilot app deep link.
 *
 * Wrapped in GitHub's hosted launcher rather than handed out as a raw
 * `ghapp://` URL: this runs in a web page, and browsers and content filters
 * routinely refuse to render custom schemes as links. The launcher is plain
 * https and forwards to the app.
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
