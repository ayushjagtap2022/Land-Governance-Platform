import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "National Land Governance Platform API"
    VERSION: str = "1.0.0"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Google Gemini API (Using latest gemini-3-flash-preview)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "text-embedding-004")

    # Neon PostgreSQL + pgvector
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # AWS S3 Storage
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "ap-south-1")
    AWS_S3_BUCKET: str = os.getenv("AWS_S3_BUCKET", "land-governance-platform")

    # Local storage fallback directory
    UPLOAD_DIR: Path = Path(__file__).resolve().parent / "uploads"

    # Datasets directory (defaults to relative repo root for Docker/local portability)
    DATASETS_DIR: Path = Path(os.getenv("DATASETS_DIR", Path(__file__).resolve().parent.parent.parent / "Land Governance Platform Datasets"))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
