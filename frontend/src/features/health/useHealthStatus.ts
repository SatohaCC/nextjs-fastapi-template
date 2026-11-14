"use client";

import { useAppQuery } from "@/shared/lib/query/useAppQuery";

export interface HealthResponse {
  status: string;
  service: string;
}

async function fetchHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/api/health", { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as HealthResponse;
}

export function useHealthStatus() {
  const { data, error, isLoading, refetch } = useAppQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
  });

  return {
    data,
    error,
    isLoading,
    onRefresh: refetch,
  };
}
