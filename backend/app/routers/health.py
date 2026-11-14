from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health import get_health_status

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    """サービスのヘルスステータスを返す。"""
    return get_health_status()
