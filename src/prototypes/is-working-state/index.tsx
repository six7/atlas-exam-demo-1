"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";

// ─── Script: what the agent is "doing", shared across all three styles ───

type Step = {
  text: string;
  /** ms this step spends "thinking" before text lands, at 1x speed */
  thinkMs: number;
};

const STEPS: Step[] = [
  { text: "Reading src/prototypes/registry.json", thinkMs: 600 },
  { text: "Found 3 existing prototypes, id \"is-working-state\" is free", thinkMs: 900 },
  { text: "Scaffolding src/prototypes/is-working-state/index.tsx", thinkMs: 700 },
  { text: "Wiring up design tokens from app/tokens.css", thinkMs: 1100 },
  // The awkward case: a step with a long, silent think and nothing new to say.
  { text: "Running npm install — this one just takes a while", thinkMs: 30000 },
  { text: "Running npm run validate:registry — all five fields present", thinkMs: 850 },
  { text: "Done. /prototypes/is-working-state is live.", thinkMs: 500 },
];

const SPEEDS = [1, 2, 4, 10] as const;
type Speed = (typeof SPEEDS)[number];

// ─── Shared run engine: figures out, for a given elapsed time, which step
// we're "in" and whether that step's text has landed yet. Each visual style
// consumes this the same way but renders the reveal differently. ───

type RunState = {
  stepIndex: number; // -1 = not started, STEPS.length = finished
  elapsedInStep: number; // ms spent thinking in the current step
  landed: boolean; // has the current step's text arrived
};

function useRunner(running: boolean, resetKey: number, speed: Speed) {
  const [state, setState] = useState<RunState>({ stepIndex: -1, elapsedInStep: 0, landed: false });
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setState({ stepIndex: -1, elapsedInStep: 0, landed: false });
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (!running) return;

    let stepIndex = 0;
    let stepStart = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - stepStart) * speed;
      const step = STEPS[stepIndex];
      if (!step) return;

      if (elapsed >= step.thinkMs) {
        setState({ stepIndex, elapsedInStep: step.thinkMs, landed: true });
        stepIndex += 1;
        stepStart = now;
        if (stepIndex >= STEPS.length) return;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      setState({ stepIndex, elapsedInStep: elapsed, landed: false });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, resetKey, speed]);

  return state;
}

// ─── Style 1: Shimmer ───
// Landed lines sit still. The active line is a shimmering skeleton bar until
// it lands, then the real text fades in. On the 30s silent step, the shimmer
// just... keeps shimmering. Nothing else to say.

function ShimmerPanel({ running, resetKey, speed }: { running: boolean; resetKey: number; speed: Speed }) {
  const state = useRunner(running, resetKey, speed);
  const landedSteps = STEPS.slice(0, state.stepIndex + (state.landed ? 1 : 0));
  const activeStep = !state.landed && state.stepIndex >= 0 && state.stepIndex < STEPS.length ? STEPS[state.stepIndex] : null;

  return (
    <div className="flex flex-col gap-2 font-mono text-[13px] leading-relaxed">
      {landedSteps.map((s, i) => (
        <div key={i} className="opacity-100" style={{ color: "var(--color-text-secondary)" }}>
          {s.text}
        </div>
      ))}
      {activeStep && (
        <div
          className="h-[18px] rounded-sm animate-shimmer"
          style={{
            width: `${Math.min(90, 30 + (activeStep.text.length % 40))}%`,
            background:
              "linear-gradient(90deg, var(--color-bg-muted) 25%, var(--color-border-strong) 50%, var(--color-bg-muted) 75%)",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      {state.stepIndex >= STEPS.length && (
        <div className="text-xs pt-1" style={{ color: "var(--color-text-brand)" }}>
          ✓ finished
        </div>
      )}
    </div>
  );
}

// ─── Style 2: Typewriter ───
// Each landed line is fully there. The active line reveals character by
// character. During the silent step, the caret just blinks at the end of an
// empty line — there's no text to type yet, so it idles.

function TypewriterPanel({ running, resetKey, speed }: { running: boolean; resetKey: number; speed: Speed }) {
  const state = useRunner(running, resetKey, speed);
  const landedSteps = STEPS.slice(0, state.stepIndex + (state.landed ? 1 : 0));
  const activeStep = !state.landed && state.stepIndex >= 0 && state.stepIndex < STEPS.length ? STEPS[state.stepIndex] : null;

  // Reveal characters over the first ~40% of thinkMs (a long think shouldn't
  // mean a slow-motion typewriter — it should mean an idle typewriter).
  let visibleChars = 0;
  if (activeStep) {
    const typingWindow = Math.min(activeStep.thinkMs * 0.4, 900);
    const progress = Math.min(1, state.elapsedInStep / typingWindow);
    visibleChars = Math.round(progress * activeStep.text.length);
  }

  return (
    <div className="flex flex-col gap-2 font-mono text-[13px] leading-relaxed">
      {landedSteps.map((s, i) => (
        <div key={i} style={{ color: "var(--color-text-secondary)" }}>
          {s.text}
        </div>
      ))}
      {activeStep && (
        <div style={{ color: "var(--color-text-secondary)" }}>
          {activeStep.text.slice(0, visibleChars)}
          <span className="inline-block w-[7px] h-[14px] -mb-[2px] ml-[1px] animate-caret" style={{ background: "var(--color-text-brand)" }} />
        </div>
      )}
      {state.stepIndex >= STEPS.length && (
        <div className="text-xs pt-1" style={{ color: "var(--color-text-brand)" }}>
          ✓ finished
        </div>
      )}
    </div>
  );
}

// ─── Style 3: Word-by-word fade ───
// Each landed line is fully there. The active line's words fade in one at a
// time as they "arrive". During the silent step there are no words yet, so a
// single pulsing dot stands in for "still working" — the awkward case made
// visible instead of pretending there's something to reveal.

function WordFadePanel({ running, resetKey, speed }: { running: boolean; resetKey: number; speed: Speed }) {
  const state = useRunner(running, resetKey, speed);
  const landedSteps = STEPS.slice(0, state.stepIndex + (state.landed ? 1 : 0));
  const activeStep = !state.landed && state.stepIndex >= 0 && state.stepIndex < STEPS.length ? STEPS[state.stepIndex] : null;

  const words = useMemo(() => (activeStep ? activeStep.text.split(" ") : []), [activeStep]);
  let visibleWords = 0;
  if (activeStep) {
    const fadeWindow = Math.min(activeStep.thinkMs * 0.6, 1400);
    const progress = Math.min(1, state.elapsedInStep / fadeWindow);
    visibleWords = Math.max(activeStep.thinkMs > 5000 && progress < 0.02 ? 0 : 1, Math.round(progress * words.length));
  }
  const showIdleDot = activeStep && visibleWords === 0;

  return (
    <div className="flex flex-col gap-2 font-mono text-[13px] leading-relaxed">
      {landedSteps.map((s, i) => (
        <div key={i} style={{ color: "var(--color-text-secondary)" }}>
          {s.text}
        </div>
      ))}
      {activeStep && (
        <div style={{ color: "var(--color-text-secondary)" }}>
          {showIdleDot ? (
            <span className="inline-block w-[6px] h-[6px] rounded-full animate-idle-dot" style={{ background: "var(--color-text-tertiary)" }} />
          ) : (
            words.slice(0, visibleWords).map((w, i) => (
              <span key={i} className="inline-block animate-word-in mr-[0.3em]">
                {w}
              </span>
            ))
          )}
        </div>
      )}
      {state.stepIndex >= STEPS.length && (
        <div className="text-xs pt-1" style={{ color: "var(--color-text-brand)" }}>
          ✓ finished
        </div>
      )}
    </div>
  );
}

// ─── Page ───

const PANELS = [
  { key: "shimmer", label: "Shimmer", blurb: "Skeleton bar until text lands, then it just appears.", Comp: ShimmerPanel },
  { key: "typewriter", label: "Typewriter", blurb: "Reveals character by character, caret idles when there's nothing to type.", Comp: TypewriterPanel },
  { key: "word-fade", label: "Word-by-word fade", blurb: "Words fade in as they arrive; a pulsing dot stands in for silence.", Comp: WordFadePanel },
] as const;

export default function IsWorkingState() {
  const [running, setRunning] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [speed, setSpeed] = useState<Speed>(4);

  const handleRun = () => {
    setResetKey((k) => k + 1);
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setResetKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
      <style>{`
        @keyframes shimmer-sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer { animation: shimmer-sweep 1.4s linear infinite; }

        @keyframes caret-blink {
          0%, 45% { opacity: 1; }
          50%, 95% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-caret { animation: caret-blink 1s step-end infinite; }

        @keyframes word-in {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-word-in { animation: word-in 260ms ease-out both; }

        @keyframes idle-dot-pulse {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        .animate-idle-dot { animation: idle-dot-pulse 1.1s ease-in-out infinite; }
      `}</style>

      <div className="px-6 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft size={13} />
          All prototypes
        </Link>
      </div>

      <main className="flex-1 px-6 pb-16 pt-6 max-w-[1100px] mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Is working state
          </h1>
          <p className="text-sm mt-1.5 max-w-[640px]" style={{ color: "var(--color-text-tertiary)" }}>
            What should an agent show while it&apos;s working? Same script, three reveal styles, run
            side by side. Step 5 is the awkward one: a real think that takes a while with nothing new
            to report — watch how each style handles it.
          </p>
        </div>

        {/* Controls */}
        <div
          className="flex flex-wrap items-center gap-4 rounded-lg border p-4 mb-6"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-subtle)" }}
        >
          <button
            onClick={handleRun}
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{ background: "var(--color-brand)", color: "var(--color-text-inverse)" }}
          >
            <Play size={14} />
            {running ? "Restart" : "Run"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium border transition-colors"
            style={{ borderColor: "var(--color-border-strong)", color: "var(--color-text-secondary)" }}
          >
            <RotateCcw size={14} />
            Reset
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Speed
            </span>
            <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border-strong)" }}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: speed === s ? "var(--color-brand)" : "transparent",
                    color: speed === s ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
            <span className="text-[11px]" style={{ color: "var(--color-text-disabled)" }}>
              (30s step ≈ {Math.round(30 / speed)}s at this speed)
            </span>
          </div>
        </div>

        {/* Three panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PANELS.map(({ key, label, blurb, Comp }) => (
            <div
              key={key}
              className="rounded-lg border p-4 min-h-[280px] flex flex-col"
              style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
            >
              <div className="mb-3">
                <div className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  {label}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {blurb}
                </div>
              </div>
              <div
                className="flex-1 rounded-md border p-3 overflow-auto"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-subtle)" }}
              >
                <Comp running={running} resetKey={resetKey} speed={speed} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs mt-6" style={{ color: "var(--color-text-disabled)" }}>
          Script is fixed: read registry → scan existing ids → scaffold file → wire tokens →{" "}
          <strong>30s silent install</strong> → validate → done.
        </p>
      </main>
    </div>
  );
}
