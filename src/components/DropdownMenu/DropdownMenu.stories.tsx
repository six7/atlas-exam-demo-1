import type { Meta, StoryObj } from "@storybook/react";
import { DropdownMenu } from "./DropdownMenu";
import { Button } from "@/src/components/Button/Button";
import { ChevronDown, Settings, User, LogOut, CreditCard } from "lucide-react";

const meta: Meta<typeof DropdownMenu> = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Options <ChevronDown className="ml-1 h-4 w-4" /></Button>,
    groups: [
      {
        items: [
          { label: "Edit", shortcut: "⌘E" },
          { label: "Duplicate", shortcut: "⌘D" },
        ],
      },
      {
        items: [
          { label: "Archive" },
          { label: "Delete", disabled: true },
        ],
      },
    ],
  },
};

export const WithGroupLabels: Story = {
  args: {
    trigger: <Button variant="ghost">My Account <ChevronDown className="ml-1 h-4 w-4" /></Button>,
    groups: [
      {
        label: "Account",
        items: [
          { label: "Profile", shortcut: "⇧⌘P" },
          { label: "Billing", shortcut: "⌘B" },
          { label: "Settings", shortcut: "⌘S" },
        ],
      },
      {
        items: [
          { label: "Sign out", shortcut: "⇧⌘Q" },
        ],
      },
    ],
  },
};

export const AlignStart: Story = {
  args: {
    align: "start",
    trigger: <Button size="sm">Menu</Button>,
    groups: [
      {
        items: [
          { label: "New file", shortcut: "⌘N" },
          { label: "Open...", shortcut: "⌘O" },
          { label: "Save", shortcut: "⌘S" },
        ],
      },
    ],
  },
};

export const WithDisabledItems: Story = {
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    groups: [
      {
        label: "Actions",
        items: [
          { label: "View details" },
          { label: "Edit" },
          { label: "Export", disabled: true },
          { label: "Delete", disabled: true },
        ],
      },
    ],
  },
};
