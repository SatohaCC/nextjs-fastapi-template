from fastapi.testclient import TestClient

from app.core.config import Settings
from app.core.errors import AppError
from app.main import create_app


def test_health_check_returns_default_service_name() -> None:
    app = create_app(Settings())
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "template-backend",
    }


def test_health_check_uses_injected_settings() -> None:
    app = create_app(Settings(service_name="custom-service"))
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "custom-service",
    }


def test_app_error_handler_returns_structured_error_response() -> None:
    app = create_app(Settings())

    @app.get("/api/test-error")
    def raise_error() -> None:
        raise AppError("対象のリソースが見つかりません", code="NOT_FOUND", status_code=404)

    client = TestClient(app)

    response = client.get("/api/test-error")

    assert response.status_code == 404
    assert response.json() == {
        "code": "NOT_FOUND",
        "detail": "対象のリソースが見つかりません",
    }
