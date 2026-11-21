import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.datastructures import Headers, MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import Settings, load_settings
from app.core.errors import AppError
from app.core.logging import configure_logging, request_id_context
from app.routers.health import router as health_router
from app.schemas.error import ErrorResponse

REQUEST_ID_HEADER = "X-Request-ID"


def _resolve_request_id(headers: Headers) -> str:
    raw = headers.get(REQUEST_ID_HEADER)
    if raw is None:
        return uuid.uuid4().hex
    trimmed = raw.strip()
    if not trimmed or "\r" in trimmed or "\n" in trimmed:
        return uuid.uuid4().hex
    return trimmed


class RequestIdMiddleware:
    """リクエストごとの X-Request-ID を生成・伝播する ASGI ミドルウェア。"""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = _resolve_request_id(Headers(scope=scope))
        # ServerErrorMiddleware で捕捉された場合でも同一 ID を参照できるよう state に保持する。
        state = scope.setdefault("state", {})
        if isinstance(state, dict):
            state["request_id"] = request_id

        token = request_id_context.set(request_id)

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                MutableHeaders(scope=message)[REQUEST_ID_HEADER] = request_id
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        finally:
            request_id_context.reset(token)


def create_app(settings: Settings | None = None) -> FastAPI:
    """設定を受け取って FastAPI アプリケーションを生成する。"""
    logger = configure_logging()
    resolved_settings = settings or load_settings()
    application = FastAPI(title=resolved_settings.app_name, version="0.1.0")
    application.state.settings = resolved_settings

    application.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(RequestIdMiddleware)

    @application.exception_handler(AppError)
    async def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        body = ErrorResponse(code=exc.code, detail=exc.message)
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @application.exception_handler(Exception)
    async def handle_unexpected_error(request: Request, _exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", None)
        if not isinstance(request_id, str) or not request_id:
            request_id = request_id_context.get()
        token = request_id_context.set(request_id)
        try:
            logger.exception("未処理の例外が発生しました")
        finally:
            request_id_context.reset(token)
        body = ErrorResponse(
            code="INTERNAL_SERVER_ERROR",
            detail="サーバー内部でエラーが発生しました",
        )
        return JSONResponse(
            status_code=500,
            content=body.model_dump(),
            headers={REQUEST_ID_HEADER: request_id},
        )

    application.include_router(health_router)
    return application


app = create_app()
