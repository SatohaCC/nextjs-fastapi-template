import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Switch, type SwitchProps } from "./Switch";

const meta = {
  title: "shared/ui/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: {
    label: "自動保存",
    description: "変更内容を自動で保存します。",
    defaultChecked: false,
    disabled: false,
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = {
  args: {
    defaultChecked: true,
  },
};

export const DisabledOff: Story = {
  args: {
    disabled: true,
    defaultChecked: false,
  },
};

export const DisabledOn: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithoutDescription: Story = {
  args: {
    description: undefined,
    label: "マイクの自動調整",
    defaultChecked: true,
  },
};

function ControlledSwitch(args: SwitchProps) {
  const [checked, setChecked] = useState(true);
  return (
    <Switch
      {...args}
      checked={checked}
      onCheckedChange={setChecked}
      description={checked ? "現在オンになっています。" : "現在オフになっています。"}
    />
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledSwitch {...args} />,
};
