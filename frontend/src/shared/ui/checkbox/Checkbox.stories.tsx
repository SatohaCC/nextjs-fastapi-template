import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Checkbox, type CheckboxProps } from "./Checkbox";

const meta = {
  title: "shared/ui/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    label: "変更内容を保存する",
    description: "後から変更内容を確認できます。",
    defaultChecked: false,
    disabled: false,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: "すべての項目を選択",
    description: "一部の項目のみが選択されています。",
    defaultChecked: "indeterminate",
  },
};

export const Invalid: Story = {
  args: {
    required: true,
    errorMessage: "続行するには同意が必要です。",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

function ControlledCheckbox(args: CheckboxProps) {
  const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");
  return (
    <Checkbox
      {...args}
      checked={checked}
      onCheckedChange={setChecked}
      description={
        checked === "indeterminate"
          ? "一部選択状態（クリックで全選択）"
          : checked
            ? "選択済み"
            : "未選択"
      }
    />
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledCheckbox {...args} />,
};
