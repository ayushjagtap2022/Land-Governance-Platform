from fastapi import APIRouter
from app.api.routes import (
    health,
    auth,
    innovation,
    workspaces,
    chat,
    notifications,
    admin,
    simulate,
    assistant,
    repository
)

api_router = APIRouter()

# Health check
api_router.include_router(health.router, tags=["health"])

# Module 1: Authentication & Role-Based Access
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Module 8: Innovation Portal
api_router.include_router(innovation.router, prefix="/innovation", tags=["innovation"])

# Module 4: Collaborative Workspaces
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(chat.router, tags=["chat"])

# Module 11: Real-Time Notifications
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

# Module 10: Admin Portal
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

# Module 7: Policy Simulation & Scenario Modeling Engine
api_router.include_router(simulate.router, prefix="/simulate", tags=["simulate"])

# Module 3: Conversational RAG & Policy Synthesis
api_router.include_router(assistant.router, prefix="/ai", tags=["ai"])

# Module 2: Central Knowledge Repository
api_router.include_router(repository.router, prefix="/repository", tags=["repository"])
