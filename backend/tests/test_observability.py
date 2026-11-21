import io
import json
import logging

from fastapi.testclient import TestClient

from app.core.config import Settings
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
