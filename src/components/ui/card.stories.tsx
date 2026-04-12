import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardContent, CardFooter } from "./card";
import { Button } from "./button";

const meta: Meta = {
  title: "Components/Card",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const BodyOnly: Story = {
  render: () => (
    <Card>
      <CardContent>This is the card body. It can contain any content.</CardContent>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-foreground">Card Title</h3>
      </CardHeader>
      <CardContent>This card has a header and body.</CardContent>
    </Card>
  ),
};

export const WithHeaderAndFooter: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className="text-base font-semibold text-foreground">Card Title</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This card has a header, body content, and a footer with actions.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button size="sm">Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const FullFeatured: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Account Settings</h3>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and connected services.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-xs text-muted-foreground">Last updated 2 hours ago</span>
        <Button size="sm">Save changes</Button>
      </CardFooter>
    </Card>
  ),
};
