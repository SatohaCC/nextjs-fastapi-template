export type ApiErrorCode = "HTTP_ERROR" | "INVALID_RESPONSE";

export interface ApiErrorOptions {
  status?: number | null;
  code: ApiErrorCode;
  cause?: unknown;
}

/** HTTP ステータスやレスポンス検証失敗を表す共通エラー。 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly code: ApiErrorCode;

  constructor(message: string, { status = null, code, cause }: ApiErrorOptions) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiFetchJsonOptions<T> {
  signal?: AbortSignal;
  method?: string;
  body?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  parse: (data: unknown) => T;
}

/** JSON API を呼び出し、HTTP エラーの正規化とレスポンス検証を行う。 */
export async function apiFetchJson<T>(
  path: string,
  { signal, method = "GET", body, headers, cache = "no-store", parse }: ApiFetchJsonOptions<T>,
): Promise<T> {
  const requestHeaders = new Headers(headers);
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    method,
    signal,
    cache,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(`HTTP ${response.status}`, {
      status: response.status,
      code: "HTTP_ERROR",
    });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError("Invalid JSON response", {
      status: response.status,
      code: "INVALID_RESPONSE",
      cause: error,
    });
  }

  return parse(data);
}
