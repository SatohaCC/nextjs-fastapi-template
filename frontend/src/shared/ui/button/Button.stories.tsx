import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta = {
  title: "shared/ui/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Refresh Status",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Cancel",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Retry",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Checking...",
  },
};
