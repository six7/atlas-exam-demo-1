import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "Enter text…" },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { defaultValue: "Hello, Atlas" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
};

export const FileInput: Story = {
  args: { type: "file" },
};
