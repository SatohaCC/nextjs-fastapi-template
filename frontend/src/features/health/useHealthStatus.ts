"use client";

import { ApiError, apiFetchJson } from "@/shared/lib/api/apiClient";
import { useAppQuery } from "@/shared/lib/query/useAppQuery";

export interface HealthResponse {
  status: "ok";
  service: string;
}

function parseHealthResponse(data: unknown): HealthResponse {
  if (
    typeof data !== "object" ||
    data === null ||
    !("status" in data) ||
    data.status !== "ok" ||
    !("service" in data) ||
    typeof data.service !== "string" ||
    !data.service.trim()
  ) {
    throw new ApiError("Invalid health response", { code: "INVALID_RESPONSE" });
  }
  return { status: data.status, service: data.service };
}

function fetchHealth(signal: AbortSignal): Promise<HealthResponse> {
  return apiFetchJson("/api/health", {
    signal,
    parse: parseHealthResponse,
  });
}

export function useHealthStatus() {
  const { data, errorMessage, isLoading, isFetching, refetch } = useAppQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => fetchHealth(signal),
  });

  return {
    data,
    error: errorMessage,
    isLoading: isLoading || isFetching,
    onRefresh: refetch,
  };
}
