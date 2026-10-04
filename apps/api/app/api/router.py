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
    repository,
    ml,
    geodata,
    analytics,
    webhooks
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
api_router.include_router(assistant.router, tags=["ai"]) # Alias for direct /assistant/... endpoints

# Module 2: Central Knowledge Repository
api_router.include_router(repository.router, prefix="/repository", tags=["repository"])

# AI/ML Predictive Models Engine (Scikit-Learn)
api_router.include_router(ml.router, prefix="/ml", tags=["ml"])

# Module 5: GIS & Geospatial Visualization Engine
api_router.include_router(geodata.router, prefix="/geodata", tags=["geodata"])

# Module 6: Analytics & Decision-Support Dashboards
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Module 9: Webhooks & API Integration Layer
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])



