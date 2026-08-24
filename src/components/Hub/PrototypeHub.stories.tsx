import type { Meta, StoryObj } from "@storybook/react";

import type { HubData, HubPrototype } from "@/lib/registry/types";
import type { FeedbackRow } from "@/lib/supabase/types";
import { PrototypeHub } from "./PrototypeHub";

/**
 * Fixtures for the hub, so the shared-registry UI can be reviewed without a
 * Supabase project attached. Timestamps are relative to render time to keep
 * the "3d ago" labels meaningful.
 */
const now = Date.now();
const ago = (ms: number) => new Date(now - ms).toISOString();

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function comment(
  id: string,
  prototypeId: string,
  author: string,
  body: string,
  age: number
): FeedbackRow {
  return {
    id,
    prototype_id: prototypeId,
    body,
    author_name: author,
    commit_sha: "a1b2c3d4e5f6",
    created_at: ago(age),
  };
}

function prototype(overrides: Partial<HubPrototype> & Pick<HubPrototype, "id" | "slug" | "name">): HubPrototype {
  const path = `/prototypes/${overrides.slug}`;
  return {
    repo: "six7/atlas-exam-demo-1",
    branch: "main",
    description: "",
    path,
    previewUrl: "https://atlas.vercel.app",
    screenshotUrl: null,
    commitSha: "a1b2c3d4e5f6",
    author: "Sam Wilson",
    prNumber: null,
    status: "open",
    createdAt: ago(30 * DAY),
    updatedAt: ago(DAY),
    href: `https://atlas.vercel.app${path}`,
    isExternal: true,
    feedback: [],
    ...overrides,
  };
}

const PROTOTYPES: HubPrototype[] = [
  prototype({
    id: "1",
    slug: "dashboard-v2",
    name: "Dashboard v2",
    description: "Redesigned dashboard with activity feed and quick actions.",
    branch: "main",
    updatedAt: ago(2 * HOUR),
    feedback: [
      comment("c1", "1", "Maya Chen", "The activity feed density feels right. Can we try it with 20+ items?", 5 * HOUR),
      comment("c2", "1", "Sam Wilson", "Good call — pushing a version with a longer list.", 3 * HOUR),
    ],
  }),
  prototype({
    id: "2",
    slug: "onboarding-flow",
    name: "Onboarding Flow",
    description: "Multi-step onboarding for new Atlas workspace users.",
    branch: "main",
    author: "Sam Wilson",
    updatedAt: ago(3 * DAY),
  }),
  prototype({
    id: "3",
    slug: "pricing-page",
    name: "Pricing Page",
    description: "Three-tier pricing with an annual toggle and comparison table.",
    branch: "six7-pricing-page-prototype",
    author: "Jan Six",
    prNumber: 12,
    updatedAt: ago(6 * HOUR),
    feedback: [
      comment("c3", "3", "Maya Chen", "Annual toggle should default to on — it's the cheaper option.", 4 * HOUR),
    ],
  }),
  prototype({
    id: "4",
    slug: "loading-spinners",
    name: "Loading Spinners",
    description: "Spinner and skeleton variants for slow routes.",
    branch: "prototype/loading-spinners",
    author: "Maya Chen",
    prNumber: 9,
    updatedAt: ago(2 * DAY),
  }),
  prototype({
    id: "5",
    slug: "list-of-projects",
    name: "List of projects",
    description: "Exploring projects.",
    branch: "six7-patch-1",
    author: "Jan Six",
    prNumber: 4,
    status: "merged",
    updatedAt: ago(12 * DAY),
    feedback: [
      comment("c4", "5", "Sam Wilson", "Shipped — thanks!", 11 * DAY),
    ],
  }),
];

function data(overrides: Partial<HubData> = {}): HubData {
  return { prototypes: PROTOTYPES, source: "supabase", error: null, ...overrides };
}

const meta = {
  title: "Hub/PrototypeHub",
  component: PrototypeHub,
  parameters: { layout: "padded" },
} satisfies Meta<typeof PrototypeHub>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Prototypes from several branches, grouped with main first. */
export const SharedRegistry: Story = {
  args: { data: data() },
};

/** Supabase not configured — reads this branch's registry.json instead. */
export const LocalFallback: Story = {
  args: {
    data: data({
      source: "local",
      prototypes: PROTOTYPES.slice(0, 2).map((p) => ({
        ...p,
        branch: "local",
        previewUrl: null,
        screenshotUrl: null,
        prNumber: null,
        href: p.path,
        isExternal: false,
        feedback: [],
      })),
    }),
  },
};

/** Supabase configured but unreachable — falls back and says why. */
export const RegistryUnreachable: Story = {
  args: {
    data: data({
      source: "local",
      error: "fetch failed",
      prototypes: PROTOTYPES.slice(0, 1),
    }),
  },
};

/** Nothing registered yet. */
export const Empty: Story = {
  args: { data: data({ prototypes: [] }) },
};
