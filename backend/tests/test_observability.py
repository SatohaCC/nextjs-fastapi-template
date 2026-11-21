import io
import json
import logging

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, load_settings
from app.core.logging import JsonLogFormatter, request_id_context
from app.main import REQUEST_ID_HEADER, create_app


def test_request_id_is_generated_when_header_is_missing() -> None:
    app = create_app(Settings())
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    request_id = response.headers.get(REQUEST_ID_HEADER)
    assert request_id is not None
    assert len(request_id) > 0


def test_request_id_is_propagated_from_request_header() -> None:
    app = create_app(Settings())
    client = TestClient(app)

    response = client.get("/api/health", headers={REQUEST_ID_HEADER: "req-123"})

    assert response.status_code == 200
    assert response.headers.get_list(REQUEST_ID_HEADER) == ["req-123"]
    assert request_id_context.get() == "-"


def test_invalid_or_blank_request_id_header_is_replaced_with_generated_id() -> None:
    app = create_app(Settings())
    client = TestClient(app)

    blank_response = client.get("/api/health", headers={REQUEST_ID_HEADER: "   "})
    newline_response = client.get("/api/health", headers={REQUEST_ID_HEADER: "bad\nvalue"})

    for resp in (blank_response, newline_response):
        assert resp.status_code == 200
        generated = resp.headers.get(REQUEST_ID_HEADER)
        assert generated is not None
        assert len(generated) == 32
        assert generated != "bad\nvalue"


def test_cors_exposes_request_id_header() -> None:
    app = create_app(Settings(cors_origins=["http://localhost:3000"]))
    client = TestClient(app)

    response = client.get("/api/health", headers={"Origin": "http://localhost:3000"})

    assert response.status_code == 200
    assert REQUEST_ID_HEADER in response.headers.get("access-control-expose-headers", "")


def test_docs_endpoints_can_be_disabled_via_settings() -> None:
    app = create_app(Settings(docs_enabled=False))
    client = TestClient(app)

    assert client.get("/docs").status_code == 404
    assert client.get("/redoc").status_code == 404
    assert client.get("/openapi.json").status_code == 404
    # openapi.json の公開を無効化しても、型生成で使う openapi() 辞書自体は生成できることを確認する。
    assert "/api/health" in app.openapi()["paths"]


def test_load_settings_parses_docs_and_log_level(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DOCS_ENABLED", "false")
    monkeypatch.setenv("LOG_LEVEL", "debug")

    loaded = load_settings()

    assert loaded.docs_enabled is False
    assert loaded.log_level == "DEBUG"


def test_load_settings_rejects_invalid_values(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DOCS_ENABLED", "invalid-bool")
    with pytest.raises(ValueError, match="不正な真偽値設定です"):
        load_settings()

    monkeypatch.delenv("DOCS_ENABLED")
    monkeypatch.setenv("LOG_LEVEL", "VERBOSE")
    with pytest.raises(ValueError, match="不正なログレベル設定です"):
        load_settings()


def test_access_log_includes_request_id_status_and_duration() -> None:
    app = create_app(Settings(log_level="INFO"))

    stream = io.StringIO()
    logger = logging.getLogger("app")
    stream_handler = logging.StreamHandler(stream)
    stream_handler.setFormatter(JsonLogFormatter())
    logger.addHandler(stream_handler)

    try:
        client = TestClient(app)
        response = client.get("/api/health", headers={REQUEST_ID_HEADER: "req-access-1"})
    finally:
        logger.removeHandler(stream_handler)

    assert response.status_code == 200
    entries = [json.loads(line) for line in stream.getvalue().strip().splitlines()]
    access_entry = entries[-1]
    assert access_entry["level"] == "INFO"
    assert access_entry["request_id"] == "req-access-1"
    assert access_entry["message"] == "HTTP リクエストを処理しました"
    assert access_entry["method"] == "GET"
    assert access_entry["path"] == "/api/health"
    assert access_entry["status_code"] == 200
    assert isinstance(access_entry["duration_ms"], float)


def test_unhandled_exception_returns_500_error_response_with_request_id_and_json_log() -> None:
    app = create_app(Settings())

    @app.get("/api/test-unhandled-error")
    def raise_unexpected_error() -> None:
        raise RuntimeError("予期しない不具合")

    stream = io.StringIO()
    logger = logging.getLogger("app")
    stream_handler = logging.StreamHandler(stream)
    stream_handler.setFormatter(JsonLogFormatter())
    logger.addHandler(stream_handler)

    try:
        client = TestClient(app, raise_server_exceptions=False)
        response = client.get(
            "/api/test-unhandled-error",
            headers={REQUEST_ID_HEADER: "req-500-trace"},
        )
    finally:
        logger.removeHandler(stream_handler)

    assert response.status_code == 500
    assert response.headers.get_list(REQUEST_ID_HEADER) == ["req-500-trace"]
    assert response.json() == {
        "code": "INTERNAL_SERVER_ERROR",
        "detail": "サーバー内部でエラーが発生しました",
    }

    log_entry = json.loads(stream.getvalue().strip().splitlines()[-1])
    assert log_entry["level"] == "ERROR"
    assert log_entry["request_id"] == "req-500-trace"
    assert log_entry["message"] == "未処理の例外が発生しました"
    assert "RuntimeError" in log_entry["exception"]


def test_json_log_formatter_outputs_structured_payload() -> None:
    formatter = JsonLogFormatter()
    record = logging.LogRecord(
        name="app.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="hello %s",
        args=("world",),
        exc_info=None,
    )
    token = request_id_context.set("req-log-1")
    try:
        formatted = formatter.format(record)
    finally:
        request_id_context.reset(token)

    payload = json.loads(formatted)
    assert set(payload.keys()) == {"timestamp", "level", "logger", "request_id", "message"}
    assert payload["level"] == "INFO"
    assert payload["logger"] == "app.test"
    assert payload["request_id"] == "req-log-1"
    assert payload["message"] == "hello world"
