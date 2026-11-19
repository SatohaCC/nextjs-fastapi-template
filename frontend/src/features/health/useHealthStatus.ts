"use client";

import { useAppQuery } from "@/shared/lib/query/useAppQuery";

export interface HealthResponse {
  status: "ok";
  service: string;
}

async function fetchHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/api/health", { signal, cache: "no-store" });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data: unknown = await response.json();
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    data.status !== "ok" ||
    !("service" in data) ||
    typeof data.service !== "string" ||
    !data.service.trim()
  ) {
    throw new Error("Invalid health response");
  }
  return { status: data.status, service: data.service };
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
