from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import Settings, load_settings
from app.core.errors import AppError
from app.routers.health import router as health_router
from app.schemas.error import ErrorResponse


def create_app(settings: Settings | None = None) -> FastAPI:
    """設定を受け取って FastAPI アプリケーションを生成する。"""
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

    @application.exception_handler(AppError)
    async def handle_app_error(_request: Request, exc: AppError) -> JSONResponse:
        body = ErrorResponse(code=exc.code, detail=exc.message)
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    application.include_router(health_router)
    return application


app = create_app()
