from app.core.config import settings
from app.schemas.health import HealthResponse


def get_health_status() -> HealthResponse:
    """現在のサービスヘルスステータスを返す。"""
    return HealthResponse(status="ok", service=settings.service_name)
