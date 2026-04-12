import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta = {
  title: "Components/Separator",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Horizontal: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-64">
      <p className="text-sm text-muted-foreground">Above the separator</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Below the separator</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-8">
      <span className="text-sm">Item one</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item two</span>
      <Separator orientation="vertical" />
      <span className="text-sm">Item three</span>
    </div>
  ),
};

export const InNav: Story = {
  render: () => (
    <nav className="flex flex-col gap-1 w-48">
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Dashboard</a>
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Projects</a>
      <Separator className="my-1" />
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted">Settings</a>
      <a href="#" className="text-sm px-2 py-1.5 rounded hover:bg-muted text-destructive">Sign out</a>
    </nav>
  ),
};
