"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";

// ─── Frame-cycling hook for ASCII spinners ────────────────────────────────────
function useFrame(frames: string[], ms = 100) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % frames.length), ms);
    return () => clearInterval(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return frames[i];
}

// ─── Keyframes injected once for this prototype ───────────────────────────────
const KEYFRAMES = `
  @keyframes spinner-dots-bounce {
    0%, 100% { transform: translateY(0);     opacity: 1;   }
    50%       { transform: translateY(-10px); opacity: 0.5; }
  }
  @keyframes spinner-bar-eq {
    0%   { transform: scaleY(0.25); }
    100% { transform: scaleY(1);    }
  }
  @keyframes spinner-progress {
    0%   { left: -40%; }
    100% { left: 110%; }
  }
  @keyframes spinner-orbit {
    to { transform: rotate(360deg); }
  }
`;

// ─── 1. Ring ──────────────────────────────────────────────────────────────────
function RingSpinner() {
  return (
    <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24" fill="none" aria-label="Loading">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── 2. Dots bounce ───────────────────────────────────────────────────────────
function DotsBounce() {
  return (
    <div className="flex items-end gap-2" style={{ height: 32 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block h-2.5 w-2.5 rounded-full"
          style={{
            background: "currentColor",
            animation: `spinner-dots-bounce 0.9s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── 3. CLI pipe / dash ───────────────────────────────────────────────────────
const PIPE_FRAMES = ["|", "/", "—", "\\"];
function CliPipeSpinner() {
  const frame = useFrame(PIPE_FRAMES, 130);
  return (
    <div
      className="rounded-md px-4 py-3 text-sm w-full"
      style={{ background: "var(--color-bg-inverse)", color: "var(--color-text-inverse)", fontFamily: "var(--font-mono)" }}
    >
      <span style={{ color: "#6ee7b7" }}>$</span>
      <span className="ml-2 opacity-70">npm install</span>
      <span className="ml-2" style={{ color: "#fbbf24" }}>{frame}</span>
    </div>
  );
}

// ─── 4. Braille ───────────────────────────────────────────────────────────────
const BRAILLE_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
function BrailleSpinner() {
  const frame = useFrame(BRAILLE_FRAMES, 80);
  return (
    <div
      className="rounded-md px-4 py-3 text-sm w-full"
      style={{ background: "var(--color-bg-inverse)", color: "var(--color-text-inverse)", fontFamily: "var(--font-mono)" }}
    >
      <span style={{ color: "#818cf8" }}>{frame}</span>
      <span className="ml-2 opacity-70">building</span>
      <span className="ml-1 opacity-40">...</span>
    </div>
  );
}

// ─── 5. Equalizer bars ────────────────────────────────────────────────────────
function EqualizerBars() {
  return (
    <div className="flex items-end gap-1.5" style={{ height: 36 }}>
      {[0.6, 1, 0.75, 1, 0.5].map((delay, i) => (
        <span
          key={i}
          className="block w-2 rounded-t-sm"
          style={{
            background: "currentColor",
            height: "100%",
            transformOrigin: "bottom",
            animation: `spinner-bar-eq ${0.7 + delay * 0.3}s ease-in-out ${i * 0.08}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

// ─── 6. Skeleton placeholder ──────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
        <Skeleton className="h-3 w-28" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

// ─── 7. Indeterminate progress bar ────────────────────────────────────────────
function ProgressBar() {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--color-bg-muted)" }}
      >
        <span
          className="absolute h-full w-[40%] rounded-full"
          style={{
            background: "currentColor",
            animation: "spinner-progress 1.6s ease-in-out infinite",
          }}
        />
      </div>
      <p className="text-xs text-center" style={{ color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
        syncing workspace…
      </p>
    </div>
  );
}

// ─── 8. Orbit ─────────────────────────────────────────────────────────────────
function OrbitSpinner() {
  return (
    <div className="relative h-10 w-10 flex items-center justify-center">
      {/* static center */}
      <span
        className="block h-2 w-2 rounded-full"
        style={{ background: "currentColor", opacity: 0.3 }}
      />
      {/* rotating arm */}
      <span
        className="absolute inset-0"
        style={{ animation: "spinner-orbit 1s linear infinite" }}
      >
        <span
          className="absolute block h-2.5 w-2.5 rounded-full"
          style={{ background: "currentColor", top: 1, left: "50%", transform: "translateX(-50%)" }}
        />
      </span>
    </div>
  );
}

// ─── Wrapper card ─────────────────────────────────────────────────────────────
function SpinnerCard({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border border-border flex flex-col items-center justify-between gap-5 p-6 min-h-[180px]"
      style={{ background: "var(--color-bg-subtle)", color: "var(--color-brand)" }}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        {children}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ALoadingSpinner() {
  return (
    <>
      <style>{KEYFRAMES}</style>
      <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
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

        <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Loading spinners
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
              8 variations — rings, dots, CLI frames, skeleton, progress, orbit.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SpinnerCard label="Ring" description="SVG arc, animate-spin">
              <RingSpinner />
            </SpinnerCard>

            <SpinnerCard label="Dots" description="Staggered bounce">
              <DotsBounce />
            </SpinnerCard>

            <SpinnerCard label="CLI — pipe" description="| / — \ frame cycle">
              <CliPipeSpinner />
            </SpinnerCard>

            <SpinnerCard label="CLI — braille" description="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏ frame cycle">
              <BrailleSpinner />
            </SpinnerCard>

            <SpinnerCard label="Equalizer" description="Staggered bar pulse">
              <EqualizerBars />
            </SpinnerCard>

            <SpinnerCard label="Skeleton" description="Content placeholder">
              <SkeletonLoader />
            </SpinnerCard>

            <SpinnerCard label="Progress bar" description="Indeterminate slide">
              <ProgressBar />
            </SpinnerCard>

            <SpinnerCard label="Orbit" description="Dot on a rotating arm">
              <OrbitSpinner />
            </SpinnerCard>
          </div>
        </main>
      </div>
    </>
  );
}

