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

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    # Set all CORS enabled origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173"],
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
