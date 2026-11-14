"use client";

import { useQuery } from "@tanstack/react-query";

export interface AppQueryOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: (context: { signal: AbortSignal }) => Promise<TData>;
  enabled?: boolean;
}

export function useAppQuery<TData>({ queryKey, queryFn, enabled }: AppQueryOptions<TData>) {
  const { data, error, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: ({ signal }) => queryFn({ signal }),
    enabled,
  });

  return {
    data: data ?? null,
    error: error instanceof Error ? error.message : null,
    isLoading: isFetching,
    refetch: () => {
      void refetch();
    },
  };
}
