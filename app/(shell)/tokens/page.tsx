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

const spacingTokens = [
  { name: "--space-1", label: "space-1", value: "4px", px: 4 },
  { name: "--space-2", label: "space-2", value: "8px", px: 8 },
  { name: "--space-3", label: "space-3", value: "12px", px: 12 },
  { name: "--space-4", label: "space-4", value: "16px", px: 16 },
  { name: "--space-5", label: "space-5", value: "20px", px: 20 },
  { name: "--space-6", label: "space-6", value: "24px", px: 24 },
  { name: "--space-8", label: "space-8", value: "32px", px: 32 },
  { name: "--space-10", label: "space-10", value: "40px", px: 40 },
  { name: "--space-12", label: "space-12", value: "48px", px: 48 },
  { name: "--space-16", label: "space-16", value: "64px", px: 64 },
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

function isDark(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: "var(--color-text-tertiary)" }}
    >
      {children}
    </h2>
  );
}

export default function TokensPage() {
  return (
    <div className="max-w-4xl flex flex-col gap-12">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Tokens
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          All design tokens from{" "}
          <code
            className="rounded px-1.5 py-0.5 text-xs font-mono"
            style={{
              background: "var(--color-bg-muted)",
              color: "var(--color-text-secondary)",
            }}
          >
            tokens.css
          </code>
          . Full interactive docs available in Storybook.
        </p>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-8">
        {colorGroups.map((group) => (
          <div key={group.label}>
            <SectionTitle>{group.label}</SectionTitle>
            <div className="flex flex-wrap gap-3">
              {group.tokens.map((token) => {
                const dark = isDark(token.value);
                return (
                  <div key={token.name} style={{ width: 130 }}>
                    <div
                      className="h-16 rounded-lg border border-border flex items-end p-2 mb-2"
                      style={{ background: `var(${token.name})` }}
                    >
                      <span
                        className="text-[10px] font-mono font-semibold"
                        style={{ color: dark ? "#fff" : "var(--color-text-tertiary)" }}
                      >
                        {token.value}
                      </span>
                    </div>
                    <div
                      className="text-xs font-medium"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {token.label}
                    </div>
                    <div
                      className="text-[10px] font-mono truncate"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {token.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Typography scale */}
      <div>
        <SectionTitle>Type Scale</SectionTitle>
        <div
          className="rounded-lg border border-border overflow-hidden divide-y divide-border"
          style={{ background: "var(--color-bg)" }}
        >
          {fontSizes.map((t) => (
            <div key={t.name} className="flex items-baseline gap-4 px-4 py-2.5">
              <span
                className="w-20 shrink-0 text-xs font-mono"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t.label} · {t.value}
              </span>
              <span
                style={{
                  fontSize: `var(${t.name})`,
                  color: "var(--color-text-primary)",
                  lineHeight: 1.3,
                }}
              >
                The quick brown fox
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spacing scale */}
      <div>
        <SectionTitle>Spacing Scale</SectionTitle>
        <div className="flex flex-col gap-2">
          {spacingTokens.map((t) => (
            <div key={t.name} className="flex items-center gap-4">
              <span
                className="w-24 shrink-0 text-xs font-mono"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {t.label} · {t.value}
              </span>
              <div
                className="h-5 rounded"
                style={{
                  width: t.px * 2,
                  background: "var(--color-brand)",
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
