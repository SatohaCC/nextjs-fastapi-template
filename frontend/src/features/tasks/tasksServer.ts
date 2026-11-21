import { serverApiRequest } from "@/shared/lib/api/serverApiClient";
import { parseTaskList, type TaskList } from "./tasksApi";

/** SSR 時に Backend から初期タスク一覧を取得する。取得失敗時はクライアント側での再取得に委ねる。 */
export async function fetchInitialTasks(
  incomingHeaders?: HeadersInit,
): Promise<TaskList | undefined> {
  try {
    return await serverApiRequest("/api/tasks", {
      method: "get",
      incomingHeaders,
      parse: parseTaskList,
    });
  } catch {
    return undefined;
  }
}
