import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "Enter text..." },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: "Email address", placeholder: "you@example.com" },
};

export const WithError: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    defaultValue: "not-an-email",
    error: "Please enter a valid email address.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Username",
    defaultValue: "johndoe",
    disabled: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <Input label="Default" placeholder="Enter text..." />
      <Input label="With value" defaultValue="Hello world" />
      <Input
        label="With error"
        defaultValue="bad input"
        error="This field is invalid."
      />
      <Input label="Disabled" defaultValue="Can't touch this" disabled />
    </div>
  ),
};
