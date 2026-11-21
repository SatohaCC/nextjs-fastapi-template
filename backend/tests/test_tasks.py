import sqlite3
from datetime import UTC, datetime
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.clients import ClientRegistry, SqliteTaskStore
from app.core.config import Settings
from app.core.errors import AppError
from app.main import create_app
from app.routers.dependencies import TASK_STORE_CLIENT_NAME
from app.schemas.tasks import TaskCreateRequest, TaskUpdateRequest
from app.services import tasks as task_service


def test_sqlite_task_store_persists_across_reopen_and_filters(tmp_path: Path) -> None:
    db_path = tmp_path / "persist" / "tasks.db"
    t1 = datetime(2026, 11, 21, 9, 0, tzinfo=UTC)
    t2 = datetime(2026, 11, 21, 9, 5, tzinfo=UTC)
    t3 = datetime(2026, 11, 21, 9, 10, tzinfo=UTC)

    store = SqliteTaskStore(str(db_path))
    try:
        store.create_task(
            task_id="t-1",
            title="100% テスト設計",
            description="境界値を確認する",
            priority="low",
            created_at=t1,
        )
        store.create_task(
            task_id="t-2",
            title="タスク_2の実装",
            description="SQLite永続化",
            priority="high",
            created_at=t2,
        )
        store.create_task(
            task_id="t-3",
            title="通常作業",
            description="メモ",
            priority="medium",
            created_at=t3,
        )
        store.create_task(
            task_id="t-4",
            title="Über_Ｆａｓｔ検索",
            description="Unicode 大文字小文字の吸収",
            priority="medium",
            created_at=t3,
        )
        store.update_task("t-2", status="done", updated_at=t3)
        store.update_task("t-1", description="", updated_at=t3)
    finally:
        store.close()

    reopened = SqliteTaskStore(str(db_path))
    try:
        all_tasks = reopened.list_tasks()
        assert [item.id for item in all_tasks] == ["t-4", "t-3", "t-2", "t-1"]
        t2_reopened = reopened.list_tasks(status="done")[0]
        assert t2_reopened.id == "t-2"
        # 未指定フィールドが部分更新で上書きされず保持されることを検証する。
        assert t2_reopened.title == "タスク_2の実装"
        assert t2_reopened.description == "SQLite永続化"
        assert t2_reopened.priority == "high"

        t1_reopened = reopened.get_task("t-1")
        assert t1_reopened is not None
        assert t1_reopened.description == ""
        assert t1_reopened.title == "100% テスト設計"

        assert reopened.list_tasks(priority="high")[0].id == "t-2"

        # LIKE ワイルドカード（% と _）が文字どおりに検索されることを検証する。
        assert [item.id for item in reopened.list_tasks(query="%")] == ["t-1"]
        assert [item.id for item in reopened.list_tasks(query="_2")] == ["t-2"]
        # 非 ASCII の大小文字も区別せず検索できることを検証する。
        assert [item.id for item in reopened.list_tasks(query="über")] == ["t-4"]
        assert [item.id for item in reopened.list_tasks(query="ｆａｓｔ")] == ["t-4"]
    finally:
        reopened.close()


def test_task_service_crud_and_error_cases() -> None:
    store = SqliteTaskStore(":memory:")
    try:
        created = task_service.create_task(
            store,
            TaskCreateRequest(title="  仕様確認  ", description="  背景メモ  ", priority="high"),
            task_id="task-1",
            now=datetime(2026, 11, 21, 10, 0, tzinfo=UTC),
        )
        assert created.title == "仕様確認"
        assert created.description == "背景メモ"
        assert created.status == "open"
        assert created.priority == "high"

        fetched = task_service.get_task(store, "task-1")
        assert fetched.id == "task-1"

        listed = task_service.list_tasks(store, query="   ")
        assert listed.total == 1

        updated = task_service.update_task(
            store,
            "task-1",
            TaskUpdateRequest(status="done"),
            now=datetime(2026, 11, 21, 10, 5, tzinfo=UTC),
        )
        assert updated.status == "done"

        with pytest.raises(AppError) as empty_exc:
            task_service.update_task(
                store,
                "task-1",
                TaskUpdateRequest(),
                now=datetime(2026, 11, 21, 10, 6, tzinfo=UTC),
            )
        assert empty_exc.value.status_code == 400
        assert empty_exc.value.code == "EMPTY_UPDATE"

        task_service.delete_task(store, "task-1")
        with pytest.raises(AppError) as not_found_exc:
            task_service.get_task(store, "task-1")
        assert not_found_exc.value.status_code == 404
        assert not_found_exc.value.code == "TASK_NOT_FOUND"
    finally:
        store.close()


def test_tasks_api_crud_and_validation_flow(tmp_path: Path) -> None:
    app = create_app(Settings(database_path=str(tmp_path / "api.db")))

    with TestClient(app) as client:
        invalid_create = client.post("/api/tasks", json={"title": "   ", "priority": "high"})
        assert invalid_create.status_code == 422
        invalid_body = invalid_create.json()
        assert invalid_body["code"] == "VALIDATION_ERROR"
        assert isinstance(invalid_body["errors"], list)

        created_res = client.post(
            "/api/tasks",
            json={"title": "初期タスク", "description": "SQLite へ保存", "priority": "high"},
        )
        assert created_res.status_code == 201
        created = created_res.json()
        task_id = created["id"]
        assert created["title"] == "初期タスク"
        assert created["status"] == "open"
        assert created["priority"] == "high"

        list_res = client.get("/api/tasks", params={"priority": "high", "q": "初期"})
        assert list_res.status_code == 200
        assert list_res.json()["total"] == 1

        get_res = client.get(f"/api/tasks/{task_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "初期タスク"

        empty_patch = client.patch(f"/api/tasks/{task_id}", json={})
        assert empty_patch.status_code == 400
        assert empty_patch.json()["code"] == "EMPTY_UPDATE"

        null_patch = client.patch(f"/api/tasks/{task_id}", json={"status": None})
        assert null_patch.status_code == 400
        assert null_patch.json()["code"] == "INVALID_UPDATE"

        partial_status_patch = client.patch(f"/api/tasks/{task_id}", json={"status": "done"})
        assert partial_status_patch.status_code == 200
        partial_status_body = partial_status_patch.json()
        assert partial_status_body["status"] == "done"
        assert partial_status_body["title"] == "初期タスク"
        assert partial_status_body["description"] == "SQLite へ保存"
        assert partial_status_body["priority"] == "high"

        clear_desc_patch = client.patch(f"/api/tasks/{task_id}", json={"description": ""})
        assert clear_desc_patch.status_code == 200
        clear_desc_body = clear_desc_patch.json()
        assert clear_desc_body["description"] == ""
        assert clear_desc_body["title"] == "初期タスク"
        assert clear_desc_body["status"] == "done"

        blank_title_patch = client.patch(f"/api/tasks/{task_id}", json={"title": "   "})
        assert blank_title_patch.status_code == 422
        assert blank_title_patch.json()["code"] == "VALIDATION_ERROR"

        missing_patch = client.patch("/api/tasks/nonexistent", json={"title": "存在しない"})
        assert missing_patch.status_code == 404
        assert missing_patch.json()["code"] == "TASK_NOT_FOUND"

        patch_res = client.patch(
            f"/api/tasks/{task_id}",
            json={"title": "更新済みタスク", "status": "open", "priority": "low"},
        )
        assert patch_res.status_code == 200
        patched = patch_res.json()
        assert patched["title"] == "更新済みタスク"
        assert patched["description"] == ""
        assert patched["status"] == "open"
        assert patched["priority"] == "low"

        delete_res = client.delete(f"/api/tasks/{task_id}")
        assert delete_res.status_code == 204
        assert delete_res.text == ""

        missing_res = client.get(f"/api/tasks/{task_id}")
        assert missing_res.status_code == 404
        assert missing_res.json()["code"] == "TASK_NOT_FOUND"

        missing_delete = client.delete(f"/api/tasks/{task_id}")
        assert missing_delete.status_code == 404


def test_task_store_can_be_overridden_by_client_startup(tmp_path: Path) -> None:
    custom_store = SqliteTaskStore(":memory:")

    def startup(_application: object, registry: ClientRegistry) -> None:
        registry.register(TASK_STORE_CLIENT_NAME, custom_store)

    unused_db = tmp_path / "unused.db"
    app = create_app(
        Settings(database_path=str(unused_db)),
        client_startup=startup,
    )
    with TestClient(app) as client:
        res = client.post("/api/tasks", json={"title": "モックストア経由"})
        assert res.status_code == 201
        assert client.get("/api/tasks").json()["total"] == 1
        assert not unused_db.exists()

    with pytest.raises(sqlite3.ProgrammingError):
        custom_store.list_tasks()
