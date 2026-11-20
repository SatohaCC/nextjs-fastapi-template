from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """エラーレスポンスの共通スキーマ。"""

    code: str
    detail: str
