import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Land Governance Platform API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Neon DB connection URL
    DATABASE_URL: str = "postgresql+asyncpg://user:password@hostname/dbname?sslmode=require"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "CHANGE-THIS-TO-A-RANDOM-SECRET-KEY"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    
    # Redis for WebSockets (Use memory:// for local dev, redis:// for production)
    REDIS_URL: str = "memory://"

    # Google Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    # Must produce 1,024 dimensions to match the pgvector column in Document.
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"

    # AWS / Supabase S3 Storage
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "land-governance-platform"
    AWS_ENDPOINT_URL: str = ""

    # Local storage fallback directory
    UPLOAD_DIR: Path = Path(__file__).resolve().parent.parent.parent / "uploads"

    # Datasets directory (defaults to relative repo root for Docker/local portability)
    DATASETS_DIR: Path = Path(os.getenv("DATASETS_DIR", Path(__file__).resolve().parent.parent.parent.parent / "Land Governance Platform Datasets"))
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
