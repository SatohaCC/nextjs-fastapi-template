"use client";

import { useQuery } from "@tanstack/react-query";

export interface AppQueryOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: (context: { signal: AbortSignal }) => Promise<TData>;
  enabled?: boolean;
}

/** React Query の useQuery をラップし、初回読込・再取得・構造化エラーを提供する。 */
export function useAppQuery<TData>({ queryKey, queryFn, enabled }: AppQueryOptions<TData>) {
  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) => queryFn({ signal }),
    enabled,
  });

  const normalizedError = error instanceof Error ? error : null;

  return {
    data: data ?? null,
    error: normalizedError,
    errorMessage: normalizedError ? normalizedError.message : null,
    isLoading: isPending,
    isFetching,
    refetch: () => {
      void refetch();
    },
  };
}
