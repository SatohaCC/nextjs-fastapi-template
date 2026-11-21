import { ApiError, apiRequest } from "@/shared/lib/api/apiClient";
import type { components } from "@/shared/lib/api/schema";
import {
  expectArray,
  expectNonEmptyString,
  expectNumber,
  expectRecord,
  expectString,
} from "@/shared/lib/api/validators";

export type TaskItem = components["schemas"]["TaskResponse"];
export type TaskList = components["schemas"]["TaskListResponse"];
export type TaskCreateInput = components["schemas"]["TaskCreateRequest"];
export type TaskUpdateInput = components["schemas"]["TaskUpdateRequest"];
export type TaskStatus = TaskItem["status"];
export type TaskPriority = TaskItem["priority"];

export type TaskFilterStatus = "all" | TaskStatus;
export type TaskFilterPriority = "all" | TaskPriority;

export interface TaskFilterState {
  status: TaskFilterStatus;
  priority: TaskFilterPriority;
  q: string;
}

function parseTaskStatus(value: unknown): TaskStatus {
  if (value === "open" || value === "done") {
    return value;
  }
  throw new ApiError("タスクのステータスが不正です。", { code: "INVALID_RESPONSE" });
}

function parseTaskPriority(value: unknown): TaskPriority {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }
  throw new ApiError("タスクの優先度が不正です。", { code: "INVALID_RESPONSE" });
}

/** TaskResponse ペイロードを検証・変換する。 */
export function parseTaskItem(data: unknown): TaskItem {
  const record = expectRecord(data, "タスクデータの形式が不正です。");
  return {
    id: expectNonEmptyString(record.id, "タスク ID が不正です。"),
    title: expectNonEmptyString(record.title, "タスクタイトルが不正です。"),
    description: expectString(record.description, "タスク説明が不正です。"),
    status: parseTaskStatus(record.status),
    priority: parseTaskPriority(record.priority),
    created_at: expectNonEmptyString(record.created_at, "作成日時が不正です。"),
    updated_at: expectNonEmptyString(record.updated_at, "更新日時が不正です。"),
  };
}

/** TaskListResponse ペイロードを検証・変換する。 */
export function parseTaskList(data: unknown): TaskList {
  const record = expectRecord(data, "タスク一覧データの形式が不正です。");
  const items = expectArray(record.items, parseTaskItem, "タスク一覧の配列が不正です。");
  const total = expectNumber(record.total, "タスク件数が不正です。");
  return { items, total };
}

/** 条件に一致するタスク一覧を取得する。 */
export function fetchTasks(
  filters?: Partial<TaskFilterState>,
  signal?: AbortSignal,
): Promise<TaskList> {
  const trimmedQuery = filters?.q?.trim();
  return apiRequest("/api/tasks", {
    method: "get",
    signal,
    query: {
      status: filters?.status && filters.status !== "all" ? filters.status : undefined,
      priority: filters?.priority && filters.priority !== "all" ? filters.priority : undefined,
      q: trimmedQuery ? trimmedQuery : undefined,
    },
    parse: parseTaskList,
  });
}

/** 新規タスクを作成する。 */
export function createTask(input: TaskCreateInput): Promise<TaskItem> {
  return apiRequest("/api/tasks", {
    method: "post",
    body: input,
    parse: parseTaskItem,
  });
}

/** 既存タスクを部分更新する。 */
export function updateTask({
  taskId,
  patch,
}: {
  taskId: string;
  patch: TaskUpdateInput;
}): Promise<TaskItem> {
  return apiRequest("/api/tasks/{task_id}", {
    method: "patch",
    params: { task_id: taskId },
    body: patch,
    parse: parseTaskItem,
  });
}

/** 指定 ID のタスクを削除する。 */
export function deleteTask(taskId: string): Promise<void> {
  return apiRequest("/api/tasks/{task_id}", {
    method: "delete",
    params: { task_id: taskId },
  });
}

/** ApiError の 422 構造化エラーから対象フィールド向けのエラー文言を取り出す。 */
export function extractFieldErrorMessage(error: unknown, fieldName: string): string | null {
  if (!(error instanceof ApiError) || !error.errors?.length) {
    return null;
  }
  const matched = error.errors.find((item) => item.loc.includes(fieldName));
  if (!matched) {
    return null;
  }
  return matched.msg.replace(/^Value error,\s*/, "");
}
