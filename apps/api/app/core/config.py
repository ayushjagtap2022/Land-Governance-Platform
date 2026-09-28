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
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
