"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Alert } from "@/shared/ui/alert/Alert";
import { Button } from "@/shared/ui/button/Button";
import { Dialog, DialogCloseButton } from "@/shared/ui/dialog/Dialog";
import { taskDeleteDialogStyles as s } from "./TaskDeleteDialog.styles";
import type { TaskItem } from "./tasksApi";

export interface TaskDeleteDialogProps {
  task: TaskItem | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: (task: TaskItem) => Promise<void>;
}

function TaskDeleteDialogBody({
  task,
  isDeleting,
  onConfirm,
}: {
  task: TaskItem;
  isDeleting: boolean;
  onConfirm: (task: TaskItem) => Promise<void>;
}) {
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleteError(null);
    try {
      await onConfirm(task);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "タスクの削除に失敗しました。");
    }
  };

  return (
    <div {...stylex.props(s.body)}>
      {deleteError && (
        <Alert tone="error" title="削除できませんでした">
          {deleteError}
        </Alert>
      )}
      <div {...stylex.props(s.actions)}>
        <DialogCloseButton variant="text" disabled={isDeleting}>
          キャンセル
        </DialogCloseButton>
        <Button type="button" variant="filled" disabled={isDeleting} onClick={handleConfirm}>
          {isDeleting ? "削除中..." : "削除する"}
        </Button>
      </div>
    </div>
  );
}

/** タスク削除前に確認を求めるモーダルダイアログ。 */
export function TaskDeleteDialog({ task, isDeleting, onClose, onConfirm }: TaskDeleteDialogProps) {
  return (
    <Dialog
      open={task !== null}
      dismissible={!isDeleting}
      onOpenChange={(open, details) => {
        if (!open) {
          if (isDeleting) {
            details.cancel();
            return;
          }
          onClose();
        }
      }}
      title="タスクを削除"
      description={
        task
          ? `「${task.title}」を削除します。削除すると元に戻せません。`
          : "このタスクを削除します。"
      }
      closeLabel={isDeleting ? undefined : "閉じる"}
    >
      {task && (
        <TaskDeleteDialogBody
          key={task.id}
          task={task}
          isDeleting={isDeleting}
          onConfirm={onConfirm}
        />
      )}
    </Dialog>
  );
}
