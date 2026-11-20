import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { QueryProvider } from "./QueryProvider";
import { useAppQuery } from "./useAppQuery";

function wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

describe("useAppQuery", () => {
  it("enabled が false の待機クエリでは isLoading を true にしない", () => {
    const queryFn = vi.fn(async () => "value");

    const { result } = renderHook(
      () =>
        useAppQuery({
          queryKey: ["disabled-query"],
          queryFn,
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeNull();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("初回取得中は isLoading と isFetching が true になり、完了後に data を返す", async () => {
    let resolveQuery!: (value: string) => void;
    const queryFn = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveQuery = resolve;
        }),
    );

    const { result } = renderHook(
      () =>
        useAppQuery({
          queryKey: ["active-query"],
          queryFn,
        }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);

    resolveQuery("loaded");

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBe("loaded");
  });
});
