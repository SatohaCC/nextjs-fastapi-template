import os
from dataclasses import dataclass, field

_VALID_LOG_LEVELS = frozenset({"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"})


def _parse_origins(raw: str | None) -> list[str]:
    if not raw:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def _parse_bool(raw: str | None, *, default: bool) -> bool:
    if raw is None or not raw.strip():
        return default
    normalized = raw.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"不正な真偽値設定です: {raw}")


def _parse_log_level(raw: str | None, *, default: str = "INFO") -> str:
    if raw is None or not raw.strip():
        return default
    normalized = raw.strip().upper()
    if normalized in _VALID_LOG_LEVELS:
        return normalized
    raise ValueError(f"不正なログレベル設定です: {raw}")


def _parse_database_path(raw: str | None, *, default: str = "data/app.db") -> str:
    if raw is None or not raw.strip():
        return default
    return raw.strip()


@dataclass(frozen=True)
class Settings:
    """環境変数から読み込むアプリケーション設定。"""

    app_name: str = "Template API"
    service_name: str = "template-backend"
    cors_origins: list[str] = field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    docs_enabled: bool = True
    log_level: str = "INFO"
    database_path: str = "data/app.db"


def load_settings() -> Settings:
    """現在の環境変数からアプリケーション設定を生成する。"""
    return Settings(
        cors_origins=_parse_origins(os.getenv("CORS_ORIGINS")),
        docs_enabled=_parse_bool(os.getenv("DOCS_ENABLED"), default=True),
        log_level=_parse_log_level(os.getenv("LOG_LEVEL"), default="INFO"),
        database_path=_parse_database_path(os.getenv("DATABASE_PATH")),
    )


settings = load_settings()
