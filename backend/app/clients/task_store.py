import sqlite3
import threading
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal, Protocol, runtime_checkable

TaskStatus = Literal["open", "done"]
TaskPriority = Literal["low", "medium", "high"]

_BACKEND_DIR = Path(__file__).resolve().parents[2]


@dataclass(frozen=True)
class TaskRecord:
    """永続化されたタスク 1 件分のレコード。"""

    id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    created_at: datetime
    updated_at: datetime


@runtime_checkable
class TaskStore(Protocol):
    """タスク永続化ストアの抽象プロトコル。"""

    def list_tasks(
        self,
        *,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        query: str | None = None,
    ) -> list[TaskRecord]: ...

    def get_task(self, task_id: str) -> TaskRecord | None: ...

    def create_task(
        self,
        *,
        task_id: str,
        title: str,
        description: str,
        priority: TaskPriority,
        created_at: datetime,
    ) -> TaskRecord: ...

    def update_task(
        self,
        task_id: str,
        *,
        title: str | None = None,
        description: str | None = None,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        updated_at: datetime,
    ) -> TaskRecord | None: ...

    def delete_task(self, task_id: str) -> bool: ...

    def close(self) -> None: ...


def _resolve_db_path(database_path: str) -> str:
    if database_path == ":memory:":
        return ":memory:"
    candidate = Path(database_path)
    resolved = candidate if candidate.is_absolute() else _BACKEND_DIR / candidate
    resolved.parent.mkdir(parents=True, exist_ok=True)
    return str(resolved)


def _format_timestamp(value: datetime) -> str:
    aware = value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)
    return aware.isoformat()


def _parse_timestamp(raw: str) -> datetime:
    parsed = datetime.fromisoformat(raw)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC)


def _escape_like(term: str) -> str:
    return term.replace("!", "!!").replace("%", "!%").replace("_", "!_")


def _unicode_lower(value: str | None) -> str | None:
    return value.lower() if value is not None else None


def _row_to_record(row: sqlite3.Row) -> TaskRecord:
    status_val: TaskStatus = "done" if row["status"] == "done" else "open"
    raw_priority = row["priority"]
    priority_val: TaskPriority = (
        "low" if raw_priority == "low" else "high" if raw_priority == "high" else "medium"
    )
    return TaskRecord(
        id=str(row["id"]),
        title=str(row["title"]),
        description=str(row["description"]),
        status=status_val,
        priority=priority_val,
        created_at=_parse_timestamp(str(row["created_at"])),
        updated_at=_parse_timestamp(str(row["updated_at"])),
    )


class SqliteTaskStore:
    """標準ライブラリ sqlite3 を用いたタスク永続化アダプタ。"""

    def __init__(self, database_path: str = "data/app.db") -> None:
        resolved = _resolve_db_path(database_path)
        self._lock = threading.Lock()
        self._conn = sqlite3.connect(resolved, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._closed = False

        try:
            # SQLite 標準の LOWER() は ASCII のみ対象のため Unicode 小文字変換関数を登録する。
            self._conn.create_function("UNICODE_LOWER", 1, _unicode_lower, deterministic=True)
            with self._lock, self._conn:
                self._conn.execute("PRAGMA busy_timeout = 5000;")
                if resolved != ":memory:":
                    self._conn.execute("PRAGMA journal_mode = WAL;")
                self._conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS tasks (
                        id TEXT PRIMARY KEY,
                        title TEXT NOT NULL,
                        description TEXT NOT NULL,
                        status TEXT NOT NULL CHECK (status IN ('open', 'done')),
                        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    );
                    """
                )
                self._conn.execute(
                    """
                    CREATE INDEX IF NOT EXISTS idx_tasks_created_at
                    ON tasks (created_at DESC);
                    """
                )
        except Exception:
            self._closed = True
            self._conn.close()
            raise

    def list_tasks(
        self,
        *,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        query: str | None = None,
    ) -> list[TaskRecord]:
        """絞り込み条件に一致するタスクを新しい順で返す。"""
        conditions: list[str] = []
        params: list[str] = []

        if status is not None:
            conditions.append("status = ?")
            params.append(status)
        if priority is not None:
            conditions.append("priority = ?")
            params.append(priority)
        if query is not None:
            pattern = f"%{_escape_like(query.lower())}%"
            conditions.append(
                "(UNICODE_LOWER(title) LIKE ? ESCAPE '!'"
                " OR UNICODE_LOWER(description) LIKE ? ESCAPE '!')"
            )
            params.extend([pattern, pattern])

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        sql = f"""
            SELECT id, title, description, status, priority, created_at, updated_at
            FROM tasks
            {where_clause}
            ORDER BY created_at DESC, rowid DESC
        """
        with self._lock:
            rows = self._conn.execute(sql, params).fetchall()
        return [_row_to_record(row) for row in rows]

    def get_task(self, task_id: str) -> TaskRecord | None:
        """指定 ID のタスクを取得する。存在しない場合は None を返す。"""
        with self._lock:
            row = self._conn.execute(
                """
                SELECT id, title, description, status, priority, created_at, updated_at
                FROM tasks
                WHERE id = ?
                """,
                (task_id,),
            ).fetchone()
        return _row_to_record(row) if row is not None else None

    def create_task(
        self,
        *,
        task_id: str,
        title: str,
        description: str,
        priority: TaskPriority,
        created_at: datetime,
    ) -> TaskRecord:
        """新しいタスクを SQLite に保存して返す。"""
        timestamp = _format_timestamp(created_at)
        with self._lock, self._conn:
            self._conn.execute(
                """
                INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at)
                VALUES (?, ?, ?, 'open', ?, ?, ?)
                """,
                (task_id, title, description, priority, timestamp, timestamp),
            )
            row = self._conn.execute(
                """
                SELECT id, title, description, status, priority, created_at, updated_at
                FROM tasks
                WHERE id = ?
                """,
                (task_id,),
            ).fetchone()
        if row is None:
            raise RuntimeError("作成したタスクの再取得に失敗しました。")
        return _row_to_record(row)

    def update_task(
        self,
        task_id: str,
        *,
        title: str | None = None,
        description: str | None = None,
        status: TaskStatus | None = None,
        priority: TaskPriority | None = None,
        updated_at: datetime,
    ) -> TaskRecord | None:
        """指定 ID のタスクを更新して返す。存在しない場合は None を返す。"""
        assignments: list[str] = ["updated_at = ?"]
        params: list[str] = [_format_timestamp(updated_at)]

        if title is not None:
            assignments.append("title = ?")
            params.append(title)
        if description is not None:
            assignments.append("description = ?")
            params.append(description)
        if status is not None:
            assignments.append("status = ?")
            params.append(status)
        if priority is not None:
            assignments.append("priority = ?")
            params.append(priority)

        params.append(task_id)
        sql = f"""
            UPDATE tasks
            SET {", ".join(assignments)}
            WHERE id = ?
        """
        with self._lock, self._conn:
            cursor = self._conn.execute(sql, params)
            if cursor.rowcount == 0:
                return None
            row = self._conn.execute(
                """
                SELECT id, title, description, status, priority, created_at, updated_at
                FROM tasks
                WHERE id = ?
                """,
                (task_id,),
            ).fetchone()
        return _row_to_record(row) if row is not None else None

    def delete_task(self, task_id: str) -> bool:
        """指定 ID のタスクを削除する。削除できた場合 True を返す。"""
        with self._lock, self._conn:
            cursor = self._conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        return cursor.rowcount > 0

    def close(self) -> None:
        """SQLite 接続を閉じる。"""
        with self._lock:
            if not self._closed:
                self._conn.close()
                self._closed = True
