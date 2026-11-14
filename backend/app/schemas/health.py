from pydantic import BaseModel


class HealthResponse(BaseModel):
    """ヘルスチェックのレスポンススキーマ。"""

    status: str
    service: str
