import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const BodyOnly: Story = {
  args: {
    children: "This is the card body. It can contain any content.",
  },
};

export const WithHeader: Story = {
  args: {
    header: <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Card Title</h3>,
    children: "This card has a header and body.",
  },
};

export const WithHeaderAndFooter: Story = {
  args: {
    header: <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Card Title</h3>,
    children: (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        This card has a header, body content, and a footer with actions.
      </p>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <button className="text-sm text-zinc-500 hover:text-zinc-700">Cancel</button>
        <button className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700">
          Confirm
        </button>
      </div>
    ),
  },
};

export const FullFeatured: Story = {
  args: {
    header: (
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Account Settings</h3>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
      </div>
    ),
    children: (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Manage your account preferences and connected services.
      </p>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-400">Last updated 2 hours ago</span>
        <button className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700">
          Save changes
        </button>
      </div>
    ),
  },
};
