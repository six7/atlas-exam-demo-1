import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { InputField } from "./input-field";

const meta: Meta = {
  title: "Components/Sheet",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>
            This is a side panel. It slides in from the right edge.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">Your content goes here.</p>
        </div>
        <SheetFooter>
          <Button>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Edit settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Profile settings</SheetTitle>
          <SheetDescription>Update your display name and email address.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <InputField label="Display name" defaultValue="Maya Keller" />
          <InputField label="Email" defaultValue="maya@atlas.design" />
          <InputField label="Role" defaultValue="Design Lead" />
        </div>
        <SheetFooter>
          <Button variant="ghost">Cancel</Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">Open left sheet</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-4">
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Dashboard</a>
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Projects</a>
          <a href="#" className="text-sm px-2 py-2 rounded hover:bg-muted">Settings</a>
        </nav>
      </SheetContent>
    </Sheet>
  ),
};
