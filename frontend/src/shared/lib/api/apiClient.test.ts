import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetchJson } from "./apiClient";

describe("apiFetchJson", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("正常な JSON レスポンスを parse 結果として返す", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await apiFetchJson("/api/sample", {
      parse: (data) => data as { status: string },
    });

    expect(result).toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sample",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
  });

  it("HTTP エラー時はステータス付きの ApiError を投げる", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ detail: "unavailable" }), { status: 503 }),
    );

    const promise = apiFetchJson("/api/sample", { parse: (data) => data });

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      message: "HTTP 503",
      status: 503,
      code: "HTTP_ERROR",
    });
  });

  it("JSON パースに失敗した場合は INVALID_RESPONSE の ApiError を投げる", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not-json", { status: 200 }));

    const promise = apiFetchJson("/api/sample", { parse: (data) => data });

    await expect(promise).rejects.toMatchObject({
      message: "Invalid JSON response",
      status: 200,
      code: "INVALID_RESPONSE",
    });
  });
});
