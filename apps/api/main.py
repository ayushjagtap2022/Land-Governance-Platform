import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import simulate, assistant, repository

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("api_server")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Backend API services for SIH Problem Statement 26019 - Department of Land Resources (DoLR)"
)

# CORS configuration for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount module routers
app.include_router(simulate.router)
app.include_router(assistant.router)
app.include_router(repository.router)

@app.get("/healthz", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "gemini_model": settings.GEMINI_MODEL,
        "modules_active": ["Module 2 (Repository)", "Module 3 (AI RAG & Synthesis)", "Module 7 (Policy Simulation)"]
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to the National Digital Platform for Land Governance API (SIH 26019)",
        "docs": "/docs",
        "health": "/healthz"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting {settings.APP_NAME} on {settings.HOST}:{settings.PORT}")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
