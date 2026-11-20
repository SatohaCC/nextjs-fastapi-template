from typing import cast

from fastapi import Request

from app.core.config import Settings


def get_settings(request: Request) -> Settings:
    """アプリケーション状態から設定オブジェクトを取得する。"""
    return cast(Settings, request.app.state.settings)
