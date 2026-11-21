"""外部サービスおよび SDK アダプタ層。"""

from app.clients.registry import AsyncCloseable, ClientRegistry, SyncCloseable

__all__ = ["AsyncCloseable", "ClientRegistry", "SyncCloseable"]
