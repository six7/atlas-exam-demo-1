import { StartPrototypeDialog } from "@/src/components/Hub/StartPrototypeDialog";
import { ThemeToggle } from "@/src/components/AppShell/ThemeToggle";
import { PrototypeHub } from "@/src/components/Hub/PrototypeHub";
import { getHubData } from "@/lib/registry/hub";
import { getDeploymentContext } from "@/lib/registry/deployment";

/**
 * The shared hub.
 *
 * Reads the central Supabase registry, which every branch's CI pushes into,
 * so this page shows prototypes from every branch rather than only the ones
 * committed to whichever branch this deployment was built from. Falls back to
 * the local `registry.json` when Supabase is not configured.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHubData();
  const { repo } = getDeploymentContext();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b px-6"
        style={{
          background: "var(--color-bg)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/atlas-logo.png"
            alt="Atlas"
            className="h-7 w-7 rounded-md object-cover"
          />
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Atlas
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Prototypes
            </h1>
            <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              Every prototype across every branch. Cards open on the deployment
              they live on.
            </p>
          </div>
          <StartPrototypeDialog repo={repo} />
        </div>

        <PrototypeHub data={data} />
      </main>
    </div>
  );
}
