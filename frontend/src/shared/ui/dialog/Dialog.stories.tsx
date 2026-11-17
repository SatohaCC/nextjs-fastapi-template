import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../button/Button";
import { TextField } from "../text-field/TextField";
import { Dialog, DialogCloseButton, type DialogProps } from "./Dialog";

const meta = {
  title: "shared/ui/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  args: {
    title: "録音セッションを終了しますか？",
    description: "未保存の文字起こし下書きは現在の内容で保存されます。",
    triggerLabel: "セッションを終了",
    closeLabel: "閉じる",
    actions: (
      <>
        <DialogCloseButton variant="text">キャンセル</DialogCloseButton>
        <DialogCloseButton variant="filled" value="confirm">
          終了して保存
        </DialogCloseButton>
      </>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithFormContent: Story = {
  args: {
    title: "セッション名の変更",
    description: "一覧に表示されるセッション名を設定します。",
    triggerLabel: "名前を変更",
    defaultOpen: true,
    children: (
      <TextField
        label="セッション名"
        defaultValue="初診ヒアリング 2026-11-18"
        description="後からいつでも変更できます。"
      />
    ),
    actions: (
      <>
        <DialogCloseButton variant="text">キャンセル</DialogCloseButton>
        <DialogCloseButton variant="filled">保存する</DialogCloseButton>
      </>
    ),
  },
};

const termsParagraphs = Array.from({ length: 12 }, (_, index) => ({
  id: `term-${index + 1}`,
  text: `第${index + 1}条: 本システムは医療従事者の記録作成を補助するものであり、最終的な診察内容の確認は担当者が行います。`,
}));

export const ScrollableBody: Story = {
  args: {
    title: "利用規約の確認",
    description: "以下の内容をご確認のうえ、操作を選択してください。",
    triggerLabel: "利用規約を開く",
    defaultOpen: true,
    children: (
      <div>
        {termsParagraphs.map((paragraph) => (
          <p key={paragraph.id}>{paragraph.text}</p>
        ))}
      </div>
    ),
  },
};

function ControlledDialog(args: DialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="tonal" onClick={() => setOpen(true)}>
        外部ボタンから開く
      </Button>
      <Dialog
        {...args}
        triggerLabel={undefined}
        open={open}
        onOpenChange={setOpen}
        actions={
          <>
            <DialogCloseButton variant="text">閉じる</DialogCloseButton>
            <Button variant="filled" onClick={() => setOpen(false)}>
              確定
            </Button>
          </>
        }
      />
    </>
  );
}

export const Controlled: Story = {
  render: (args) => <ControlledDialog {...args} />,
};
