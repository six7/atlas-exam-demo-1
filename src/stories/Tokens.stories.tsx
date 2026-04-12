import type { Meta, StoryObj } from "@storybook/react";

// ─── Data ────────────────────────────────────────────────────────────────────

const colorGroups = [
  {
    label: "Background",
    tokens: [
      { name: "--color-bg", label: "bg", value: "#FFFFFF" },
      { name: "--color-bg-subtle", label: "bg-subtle", value: "#F6F8F1" },
      { name: "--color-bg-muted", label: "bg-muted", value: "#EEF2E7" },
      { name: "--color-bg-brand", label: "bg-brand", value: "#F5FDEB" },
      { name: "--color-bg-inverse", label: "bg-inverse", value: "#162F02" },
    ],
  },
  {
    label: "Text",
    tokens: [
      { name: "--color-text-primary", label: "text-primary", value: "#162F02" },
      { name: "--color-text-secondary", label: "text-secondary", value: "#39462D" },
      { name: "--color-text-tertiary", label: "text-tertiary", value: "#4F5E41" },
      { name: "--color-text-brand", label: "text-brand", value: "#5B9428" },
      { name: "--color-text-disabled", label: "text-disabled", value: "#94A282" },
      { name: "--color-text-inverse", label: "text-inverse", value: "#FFFFFF" },
    ],
  },
  {
    label: "Brand & Status",
    tokens: [
      { name: "--color-brand", label: "brand", value: "#73BF33" },
      { name: "--color-brand-hover", label: "brand-hover", value: "#5B9428" },
      { name: "--color-danger", label: "danger", value: "#A63B29" },
      { name: "--color-success", label: "success", value: "#3E7B2D" },
      { name: "--color-warning", label: "warning", value: "#A46F18" },
    ],
  },
  {
    label: "Border",
    tokens: [
      { name: "--color-border", label: "border", value: "#DDE5D1" },
      { name: "--color-border-strong", label: "border-strong", value: "#C4D1B3" },
      { name: "--color-border-focus", label: "border-focus", value: "#91EB4C" },
    ],
  },
];

const fontSizes = [
  { name: "--font-size-xs", label: "xs", value: "12px" },
  { name: "--font-size-sm", label: "sm", value: "14px" },
  { name: "--font-size-md", label: "md", value: "16px" },
  { name: "--font-size-lg", label: "lg", value: "18px" },
  { name: "--font-size-xl", label: "xl", value: "20px" },
  { name: "--font-size-2xl", label: "2xl", value: "24px" },
  { name: "--font-size-3xl", label: "3xl", value: "30px" },
  { name: "--font-size-4xl", label: "4xl", value: "48px" },
];

const fontWeights = [
  { name: "--font-weight-regular", label: "Regular", value: "400" },
  { name: "--font-weight-medium", label: "Medium", value: "500" },
  { name: "--font-weight-semibold", label: "Semibold", value: "600" },
  { name: "--font-weight-bold", label: "Bold", value: "700" },
];

const spacingTokens = [
  { name: "--space-1", label: "space-1", value: "4px" },
  { name: "--space-2", label: "space-2", value: "8px" },
  { name: "--space-3", label: "space-3", value: "12px" },
  { name: "--space-4", label: "space-4", value: "16px" },
  { name: "--space-5", label: "space-5", value: "20px" },
  { name: "--space-6", label: "space-6", value: "24px" },
  { name: "--space-8", label: "space-8", value: "32px" },
  { name: "--space-10", label: "space-10", value: "40px" },
  { name: "--space-12", label: "space-12", value: "48px" },
  { name: "--space-16", label: "space-16", value: "64px" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", margin: "0 0 12px" }}>
      {children}
    </h2>
  );
}

// ─── Colors ──────────────────────────────────────────────────────────────────

function ColorsStory() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: 32, background: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>Colors</h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 40 }}>
        All color tokens from <code style={{ fontFamily: "var(--font-mono)", fontSize: 13, background: "var(--color-bg-muted)", padding: "1px 6px", borderRadius: 4 }}>tokens.css</code>
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {colorGroups.map((group) => (
          <div key={group.label}>
            <SectionTitle>{group.label}</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {group.tokens.map((token) => {
                const dark = isDark(token.value);
                return (
                  <div key={token.name} style={{ width: 140 }}>
                    <div
                      style={{
                        height: 72,
                        borderRadius: 8,
                        background: `var(${token.name})`,
                        border: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "8px 10px",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 600, color: dark ? "#fff" : "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
                        {token.value}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-primary)" }}>{token.label}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>{token.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────

function TypographyStory() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: 32, background: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>Typography</h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 40 }}>
        Font families, sizes, and weights.
      </p>

      {/* Families */}
      <div style={{ marginBottom: 48 }}>
        <SectionTitle>Font Families</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {[
            { label: "Sans", variable: "--font-sans", specimen: "The quick brown fox jumps over the lazy dog" },
            { label: "Mono", variable: "--font-mono", specimen: "const token = 'var(--font-mono)'" },
          ].map((f) => (
            <div key={f.label} style={{ padding: 24, border: "1px solid var(--color-border)", borderRadius: 8, background: "var(--color-bg-subtle)" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", marginBottom: 8 }}>
                {f.label} · <span style={{ fontFamily: "var(--font-mono)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>{f.variable}</span>
              </div>
              <div style={{ fontFamily: `var(${f.variable})`, fontSize: 20, color: "var(--color-text-primary)" }}>
                {f.specimen}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div style={{ marginBottom: 48 }}>
        <SectionTitle>Font Sizes</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {fontSizes.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ width: 80, fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {t.label} · {t.value}
              </span>
              <span style={{ fontSize: `var(${t.name})`, color: "var(--color-text-primary)", lineHeight: 1.3 }}>
                The quick brown fox
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weights */}
      <div>
        <SectionTitle>Font Weights</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {fontWeights.map((t) => (
            <div key={t.name} style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
              <span style={{ width: 160, fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                {t.label} · {t.value}
              </span>
              <span style={{ fontSize: 18, fontWeight: `var(${t.name})` as never, color: "var(--color-text-primary)" }}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

function SpacingStory() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", padding: 32, background: "var(--color-bg)", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: "var(--color-text-primary)" }}>Spacing</h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 40 }}>
        Spacing scale tokens for padding, margin, and gap.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {spacingTokens.map((t) => (
          <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ width: 100, fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
              {t.label}
            </span>
            <div
              style={{
                height: 24,
                width: `var(${t.name})`,
                background: "var(--color-brand)",
                borderRadius: 3,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {t.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Story exports ────────────────────────────────────────────────────────────

const meta: Meta = {
  title: "Tokens/Overview",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Colors: StoryObj = { render: () => <ColorsStory /> };
export const Typography: StoryObj = { render: () => <TypographyStory /> };
export const Spacing: StoryObj = { render: () => <SpacingStory /> };
