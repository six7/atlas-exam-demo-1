import type { Meta, StoryObj } from "@storybook/react";
import { InputField } from "./input-field";

const meta: Meta<typeof InputField> = {
  title: "Components/InputField",
  component: InputField,
  tags: ["autodocs"],
  args: { placeholder: "Enter text..." },
};

export default meta;
type Story = StoryObj<typeof InputField>;

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
  args: { label: "Username", defaultValue: "johndoe", disabled: true },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-72">
      <InputField label="Default" placeholder="Enter text..." />
      <InputField label="With value" defaultValue="Hello world" />
      <InputField label="With error" defaultValue="bad input" error="This field is invalid." />
      <InputField label="Disabled" defaultValue="Can't touch this" disabled />
    </div>
  ),
};
