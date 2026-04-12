import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OnboardingFlow() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Minimal back nav */}
      <div className="px-6 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft size={13} />
          All prototypes
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl border border-border p-8 flex flex-col gap-6"
          style={{ background: "var(--color-bg)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold text-white"
              style={{ background: "var(--color-brand)" }}
            >
              A
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Atlas
            </span>
          </div>

          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Set up your workspace
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              A few quick steps to get your system running.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {["Name your workspace", "Invite your team", "Import your tokens", "Connect your repo"].map(
              (step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-lg p-3 border border-border"
                  style={{ background: i === 0 ? "var(--color-bg-brand)" : "var(--color-bg-subtle)" }}
                >
                  <div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={
                      i < 2
                        ? { background: "var(--color-brand)", color: "#fff" }
                        : { background: "var(--color-bg-muted)", color: "var(--color-text-tertiary)" }
                    }
                  >
                    {i < 2 ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: i < 2 ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                      textDecoration: i < 2 ? "line-through" : "none",
                    }}
                  >
                    {step}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

