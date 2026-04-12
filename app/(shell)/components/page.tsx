"use client";

import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/src/components/ui/card";
import { InputField } from "@/src/components/ui/input-field";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/src/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function ComponentsPage() {
  return (
    <div className="max-w-2xl flex flex-col gap-10">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Components
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Built on shadcn/ui, styled with design tokens. Run{" "}
          <code
            className="rounded px-1.5 py-0.5 text-xs font-mono"
            style={{
              background: "var(--color-bg-muted)",
              color: "var(--color-text-secondary)",
            }}
          >
            npm run storybook
          </code>{" "}
          to explore all stories.
        </p>
      </div>

      <Section title="Button">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Input">
        <div className="flex flex-col gap-4 max-w-sm">
          <InputField label="Default" placeholder="Enter text..." />
          <InputField
            label="With error"
            defaultValue="bad input"
            error="This field is required."
          />
          <InputField label="Disabled" defaultValue="Read only" disabled />
        </div>
      </Section>

      <Section title="Card">
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent>Body-only card with some content inside.</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-foreground">Card with Header</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card has a header slot and a body.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Full Card</h3>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card uses all three slots: header, body, and footer.
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="ghost" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </CardFooter>
          </Card>
        </div>
      </Section>

      <Section title="Dropdown Menu">
        <div className="flex flex-wrap gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary">
                My Account <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Billing <DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Settings <DropdownMenuShortcut>⌘S</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                Actions <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit <DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuItem>Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2
        className="text-base font-semibold border-b border-border pb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
