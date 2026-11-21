"use client";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { Badge } from "@/shared/ui/badge/Badge";
import { Button } from "@/shared/ui/button/Button";
import { RadioGroup } from "@/shared/ui/radio-group/RadioGroup";
import { Select } from "@/shared/ui/select/Select";
import { Spinner } from "@/shared/ui/spinner/Spinner";
import { TextField } from "@/shared/ui/text-field/TextField";
import { createToaster, ToastViewport } from "@/shared/ui/toast/Toast";
import { Tooltip } from "@/shared/ui/tooltip/Tooltip";
import { TaskCreateForm } from "./TaskCreateForm";
import { TaskDeleteDialog } from "./TaskDeleteDialog";
import { TaskEditDialog } from "./TaskEditDialog";
import { TaskList } from "./TaskList";
import { tasksWorkspaceStyles as s } from "./TasksWorkspace.styles";
import type {
  TaskCreateInput,
  TaskFilterPriority,
  TaskFilterState,
  TaskFilterStatus,
  TaskItem,
  TaskList as TaskListData,
  TaskStatus,
  TaskUpdateInput,
} from "./tasksApi";
import { DEFAULT_TASK_FILTERS, useTasks } from "./useTasks";

const STATUS_FILTER_ITEMS = [
  { value: "all", label: "すべて" },
  { value: "open", label: "未完了" },
  { value: "done", label: "完了" },
] as const;

const PRIORITY_FILTER_ITEMS = [
  { value: "all", label: "すべての優先度" },
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
] as const;

export interface TasksWorkspaceProps {
  initialTasks?: TaskListData;
}

/** タスク一覧・絞り込み・作成・編集・削除を統括するワークスペースコンテナ。 */
export function TasksWorkspace({ initialTasks }: TasksWorkspaceProps) {
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_TASK_FILTERS);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);
  const [toaster] = useState(() => createToaster());

  const {
    tasks,
    total,
    isLoading,
    isFetching,
    errorMessage,
    refetch,
    createTaskAsync,
    isCreating,
    updateTaskAsync,
    isUpdating,
    deleteTaskAsync,
    isDeleting,
  } = useTasks(filters, initialTasks);

  const hasActiveFilters =
    filters.status !== "all" || filters.priority !== "all" || filters.q.trim() !== "";

  const handleCreate = async (input: TaskCreateInput) => {
    const created = await createTaskAsync(input);
    toaster.success("タスクを追加しました", {
      description: `「${created.title}」を保存しました。`,
    });
  };

  const handleToggleStatus = async (task: TaskItem, nextStatus: TaskStatus) => {
    try {
      const updated = await updateTaskAsync({
        taskId: task.id,
        patch: { status: nextStatus },
      });
      toaster.success(nextStatus === "done" ? "完了にしました" : "未完了に戻しました", {
        description: `「${updated.title}」の状態を更新しました。`,
      });
    } catch (error) {
      toaster.error("状態の更新に失敗しました", {
        description: error instanceof Error ? error.message : "時間をおいて再試行してください。",
      });
    }
  };

  const handleSaveEdit = async (taskId: string, patch: TaskUpdateInput) => {
    const updated = await updateTaskAsync({ taskId, patch });
    setEditingTask(null);
    toaster.success("タスクを更新しました", {
      description: `「${updated.title}」を保存しました。`,
    });
  };

  const handleConfirmDelete = async (task: TaskItem) => {
    await deleteTaskAsync(task.id);
    setDeletingTask(null);
    toaster.success("タスクを削除しました", {
      description: `「${task.title}」を削除しました。`,
    });
  };

  return (
    <div {...stylex.props(s.layout)}>
      <TaskCreateForm isSubmitting={isCreating} onCreate={handleCreate} />

      <div {...stylex.props(s.listColumn)}>
        <search aria-label="タスク絞り込み" {...stylex.props(s.filterCard)}>
          <RadioGroup
            label="状態"
            name="filterStatus"
            orientation="horizontal"
            items={STATUS_FILTER_ITEMS}
            value={filters.status}
            onValueChange={(nextStatus) => {
              if (nextStatus === "all" || nextStatus === "open" || nextStatus === "done") {
                setFilters((prev) => ({ ...prev, status: nextStatus as TaskFilterStatus }));
              }
            }}
          />

          <div {...stylex.props(s.filterGrid)}>
            <Select
              label="優先度"
              name="filterPriority"
              items={PRIORITY_FILTER_ITEMS}
              value={filters.priority}
              onValueChange={(nextPriority) => {
                if (
                  nextPriority === "all" ||
                  nextPriority === "low" ||
                  nextPriority === "medium" ||
                  nextPriority === "high"
                ) {
                  setFilters((prev) => ({
                    ...prev,
                    priority: nextPriority as TaskFilterPriority,
                  }));
                }
              }}
            />
            <TextField
              label="キーワード検索"
              name="q"
              maxLength={120}
              placeholder="タイトルや詳細で絞り込み"
              value={filters.q}
              onValueChange={(nextQuery) => setFilters((prev) => ({ ...prev, q: nextQuery }))}
            />
          </div>

          <div {...stylex.props(s.summaryBar)}>
            <div {...stylex.props(s.summaryLeft)}>
              <h2 {...stylex.props(s.summaryTitle)}>タスク一覧</h2>
              <Badge tone="neutral">{total} 件</Badge>
              <Tooltip
                toggleable
                triggerAriaLabel="永続化方式の説明"
                content="タスクは FastAPI 経由で SQLite に保存されます"
              >
                ?
              </Tooltip>
              {isFetching && !isLoading && <Spinner size="sm" label="最新の状態を取得中" />}
            </div>
            <div {...stylex.props(s.summaryActions)}>
              <Button
                type="button"
                variant="outlined"
                size="sm"
                disabled={!hasActiveFilters}
                onClick={() => setFilters(DEFAULT_TASK_FILTERS)}
              >
                条件をリセット
              </Button>
              <Button
                type="button"
                variant="tonal"
                size="sm"
                disabled={isFetching}
                onClick={refetch}
              >
                最新の状態に更新
              </Button>
            </div>
          </div>
        </search>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isUpdating={isUpdating}
          errorMessage={errorMessage}
          hasActiveFilters={hasActiveFilters}
          onRetry={refetch}
          onToggleStatus={handleToggleStatus}
          onEdit={setEditingTask}
          onDelete={setDeletingTask}
        />
      </div>

      <TaskEditDialog
        task={editingTask}
        isSaving={isUpdating}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />

      <TaskDeleteDialog
        task={deletingTask}
        isDeleting={isDeleting}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastViewport toaster={toaster} />
    </div>
  );
}
