import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Select, type SelectOption, type SelectProps } from "./Select";

const departments: readonly SelectOption[] = [
  { value: "general", label: "総合診療科" },
  { value: "cardiology", label: "循環器内科" },
  { value: "respiratory", label: "呼吸器内科" },
  { value: "pediatrics", label: "小児科（休診中）", disabled: true },
];

const meta = {
  title: "shared/ui/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    label: "診療科",
    placeholder: "診療科を選択してください",
    description: "音声文字起こしの専門用語辞書を切り替えます。",
    items: departments,
    variant: "outlined",
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outlined: Story = {};

export const Filled: Story = {
  args: {
    variant: "filled",
    defaultValue: "cardiology",
  },
};

export const Invalid: Story = {
  args: {
    required: true,
    errorMessage: "診療科を選択してください。",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "general",
  },
};

function ControlledSelect(args: SelectProps) {
  const [value, setValue] = useState<string | null>("general");
  return (
    <Select
      {...args}
      value={value}
      onValueChange={setValue}
      description={`選択中のコード: ${value ?? "未選択"}`}
    />
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledSelect {...args} />,
};
