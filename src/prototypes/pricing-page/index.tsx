"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";

type Billing = "monthly" | "annual";

type Tier = {
  id: string;
  name: string;
  description: string;
  monthly: number | null;
  annual: number | null;
  priceNote: string;
  unit?: string;
  cta: string;
  ctaVariant: "default" | "outline";
  features: string[];
  recommended?: boolean;
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals defining their first system.",
    monthly: 0,
    annual: 0,
    priceNote: "Free forever",
    cta: "Start for free",
    ctaVariant: "outline",
    features: [
      "1 workspace",
      "Up to 3 projects",
      "Core structure tools",
      "Community support",
    ],
  },
  {
    id: "team",
    name: "Team",
    description: "For teams building shared structure.",
    monthly: 24,
    annual: 19,
    priceNote: "per editor / month",
    unit: "/editor",
    cta: "Start 14-day trial",
    ctaVariant: "default",
    recommended: true,
    features: [
      "Everything in Starter",
      "Unlimited projects",
      "Shared component library",
      "Roles and permissions",
      "Version history",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organisations scaling across many products.",
    monthly: null,
    annual: null,
    priceNote: "Custom pricing",
    cta: "Contact sales",
    ctaVariant: "outline",
    features: [
      "Everything in Team",
      "SSO and SCIM",
      "Audit logs",
      "Dedicated environments",
      "SLA and onboarding",
      "Named support contact",
    ],
  },
];

function formatPrice(tier: Tier, billing: Billing): string {
  const value = billing === "monthly" ? tier.monthly : tier.annual;
  if (value === null) return "Custom";
  if (value === 0) return "$0";
  return `$${value}`;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
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

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            <h1
              className="text-3xl sm:text-4xl font-semibold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Plans that scale with your system
            </h1>
            <p
              className="mt-3 max-w-xl text-sm sm:text-base"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Start with structure. Add your team when you&apos;re ready. Every
              plan keeps your decisions in one place.
            </p>

            {/* Billing toggle */}
            <div
              className="mt-8 inline-flex items-center gap-1 rounded-full border p-1"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg-subtle)",
              }}
              role="tablist"
              aria-label="Billing period"
            >
              {(["monthly", "annual"] as const).map((period) => {
                const active = billing === period;
                return (
                  <button
                    key={period}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setBilling(period)}
                    className="rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      background: active ? "var(--color-brand)" : "transparent",
                      color: active
                        ? "var(--color-text-inverse)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {period === "monthly" ? "Monthly" : "Annual"}
                    {period === "annual" && (
                      <span
                        className="ml-1.5"
                        style={{
                          color: active
                            ? "var(--color-text-inverse)"
                            : "var(--color-text-brand)",
                        }}
                      >
                        −20%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiers */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start">
            {tiers.map((tier) => {
              const recommended = tier.recommended;
              return (
                <div
                  key={tier.id}
                  className="relative flex flex-col rounded-xl border p-6"
                  style={{
                    borderColor: recommended
                      ? "var(--color-brand)"
                      : "var(--color-border)",
                    background: recommended
                      ? "var(--color-bg-brand)"
                      : "var(--color-bg)",
                    boxShadow: recommended
                      ? "var(--shadow-lg)"
                      : "var(--shadow-sm)",
                  }}
                >
                  {recommended && (
                    <span
                      className="absolute -top-3 left-6 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "var(--color-brand)",
                        color: "var(--color-text-inverse)",
                      }}
                    >
                      Recommended
                    </span>
                  )}

                  <div>
                    <h2
                      className="text-lg font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {tier.name}
                    </h2>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {tier.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span
                      className="text-3xl font-semibold tracking-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {formatPrice(tier, billing)}
                    </span>
                    {tier.unit && (
                      <span
                        className="text-sm"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {tier.unit}
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {tier.monthly && tier.monthly > 0
                      ? billing === "annual"
                        ? "Billed annually, per editor"
                        : tier.priceNote
                      : tier.priceNote}
                  </p>

                  <Button
                    variant={tier.ctaVariant}
                    className="mt-6 w-full"
                    style={
                      recommended
                        ? undefined
                        : { borderColor: "var(--color-border-strong)" }
                    }
                  >
                    {tier.cta}
                  </Button>

                  <ul className="mt-6 flex flex-col gap-3">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: "var(--color-text-brand)" }}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Footnote */}
          <p
            className="mt-10 text-center text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Prices in USD. Switch or cancel any time. Taxes calculated at
            checkout.
          </p>
        </div>
      </main>
    </div>
  );
}
