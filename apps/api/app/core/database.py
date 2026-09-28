from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings

def get_database_url() -> str:
    url = settings.DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        
    # asyncpg uses 'ssl' instead of 'sslmode' and doesn't support 'channel_binding'
    url = url.replace("sslmode=require", "ssl=require")
    url = url.replace("&channel_binding=require", "")
    url = url.replace("?channel_binding=require", "")
    
    return url

# Create the Async SQLAlchemy engine
engine = create_async_engine(
    get_database_url(),
    echo=True, # Logs SQL queries, disable in production
    pool_pre_ping=True
)

# Create a configured "Session" class using SQLModel's AsyncSession
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
