from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.router import api_router
from app.core.websockets import connect_broadcaster, disconnect_broadcaster

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to Redis
    await connect_broadcaster()
    yield
    # Disconnect from Redis
    await disconnect_broadcaster()

import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

RATE_LIMIT_MAX = 600
RATE_WINDOW_SEC = 60
_request_timestamps = {}

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        # Exempt health check and documentation endpoints from rate-limiting
        if path in ("/healthz", "/docs", "/redoc", "/favicon.ico") or path.endswith("/openapi.json"):
            return await call_next(request)

        # Extract client IP securely (prioritize X-Real-IP set by nginx, then rightmost X-Forwarded-For)
        x_real_ip = request.headers.get("X-Real-IP")
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_real_ip:
            client_ip = x_real_ip.strip()
        elif x_forwarded_for:
            client_ip = x_forwarded_for.split(",")[-1].strip()
        elif request.client:
            client_ip = request.client.host
        else:
            client_ip = "127.0.0.1"

        api_key = request.headers.get("X-API-Key", "")
        ident = api_key or client_ip
        now = time.time()

        # Prune older than 60s
        records = [ts for ts in _request_timestamps.get(ident, []) if now - ts < RATE_WINDOW_SEC]
        remaining = max(0, RATE_LIMIT_MAX - len(records))

        if len(records) >= RATE_LIMIT_MAX:
            from fastapi.responses import JSONResponse
            return JSONResponse(
                status_code=429,
                content={"detail": f"Rate limit exceeded. Maximum {RATE_LIMIT_MAX} requests per minute."},
                headers={
                    "X-RateLimit-Limit": str(RATE_LIMIT_MAX),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(now + RATE_WINDOW_SEC)),
                    "Retry-After": "60",
                }
            )

        records.append(now)
        _request_timestamps[ident] = records

        response: Response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(now + RATE_WINDOW_SEC))
        return response

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    app.add_middleware(RateLimitMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/")
    def read_root():
        return {"message": f"Welcome to the {settings.PROJECT_NAME}. Go to /docs for the Swagger UI."}

    # Include the main API router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app

app = create_app()
