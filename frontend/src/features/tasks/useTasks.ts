"use client";

import { useAppMutation } from "@/shared/lib/query/useAppMutation";
import { useAppQuery } from "@/shared/lib/query/useAppQuery";
import {
  createTask,
  deleteTask,
  fetchTasks,
  type TaskFilterState,
  type TaskList,
  updateTask,
} from "./tasksApi";

export const DEFAULT_TASK_FILTERS: TaskFilterState = {
  status: "all",
  priority: "all",
  q: "",
};

/** タスク一覧取得と作成・更新・削除ミューテーションを統合するカスタムフック。 */
export function useTasks(filters: TaskFilterState, initialTasks?: TaskList) {
  const normalizedQuery = filters.q.trim();
  const isDefaultFilters =
    filters.status === "all" && filters.priority === "all" && normalizedQuery === "";

  const tasksQuery = useAppQuery({
    queryKey: ["tasks", filters.status, filters.priority, normalizedQuery],
    queryFn: ({ signal }) => fetchTasks(filters, signal),
    initialData: isDefaultFilters ? initialTasks : undefined,
  });

  const createMutation = useAppMutation({
    mutationFn: createTask,
    invalidateKeys: [["tasks"]],
  });

  const updateMutation = useAppMutation({
    mutationFn: updateTask,
    invalidateKeys: [["tasks"]],
  });

  const deleteMutation = useAppMutation({
    mutationFn: deleteTask,
    invalidateKeys: [["tasks"]],
  });

  return {
    tasks: tasksQuery.data?.items ?? [],
    total: tasksQuery.data?.total ?? 0,
    isLoading: tasksQuery.isLoading,
    isFetching: tasksQuery.isFetching,
    errorMessage: tasksQuery.errorMessage,
    refetch: tasksQuery.refetch,
    createTaskAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTaskAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTaskAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
