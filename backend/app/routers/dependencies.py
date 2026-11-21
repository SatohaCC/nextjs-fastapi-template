from typing import cast

from fastapi import Request

from app.clients import ClientRegistry
from app.core.config import Settings


def get_settings(request: Request) -> Settings:
    """アプリケーション状態から設定オブジェクトを取得する。"""
    return cast(Settings, request.app.state.settings)


def get_client_registry(request: Request) -> ClientRegistry:
    """アプリケーション状態から外部クライアントレジストリを取得する。"""
    return cast(ClientRegistry, request.app.state.clients)
