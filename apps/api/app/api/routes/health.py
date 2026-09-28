from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import text
from app.api.dependencies import get_db

router = APIRouter()

@router.get("/healthz")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Check if the API and the Neon Database are up and running.
    """
    try:
        # Simple query to test the database connection
        await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
