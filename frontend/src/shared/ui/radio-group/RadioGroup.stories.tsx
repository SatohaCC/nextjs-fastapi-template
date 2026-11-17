import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { RadioGroup, type RadioGroupProps, type RadioOption } from "./RadioGroup";

const modes: readonly RadioOption[] = [
  {
    value: "realtime",
    label: "リアルタイム文字起こし",
    description: "発話と同時に画面へ逐次反映します。",
  },
  {
    value: "batch",
    label: "録音後に一括要約",
    description: "通話終了後に精度優先で要約を作成します。",
  },
  {
    value: "archive",
    label: "音声のみ保存（準備中）",
    description: "文字起こしを行わず音声ファイルのみ保存します。",
    disabled: true,
  },
];

const meta = {
  title: "shared/ui/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  args: {
    label: "文字起こしモード",
    description: "診察時の記録方法を選択してください。",
    items: modes,
    defaultValue: "realtime",
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Horizontal: Story = {
  args: {
    label: "音声品質",
    description: undefined,
    orientation: "horizontal",
    defaultValue: "standard",
    items: [
      { value: "standard", label: "標準" },
      { value: "high", label: "高音質" },
      { value: "low", label: "省帯域" },
    ],
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: null,
    required: true,
    errorMessage: "記録方法のいずれかを選択してください。",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "batch",
  },
};

function ControlledRadioGroup(args: RadioGroupProps) {
  const [value, setValue] = useState<string | null>("realtime");
  return (
    <RadioGroup
      {...args}
      value={value}
      onValueChange={setValue}
      description={`選択中のモード: ${value ?? "未選択"}`}
    />
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledRadioGroup {...args} />,
};
