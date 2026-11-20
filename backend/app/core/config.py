import os
from dataclasses import dataclass, field


def _parse_origins(raw: str | None) -> list[str]:
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


@dataclass(frozen=True)
class Settings:
    """環境変数から読み込むアプリケーション設定。"""

    app_name: str = "Template API"
    service_name: str = "template-backend"
    cors_origins: list[str] = field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )


def load_settings() -> Settings:
    """現在の環境変数からアプリケーション設定を生成する。"""
    return Settings(cors_origins=_parse_origins(os.getenv("CORS_ORIGINS")))


settings = load_settings()
