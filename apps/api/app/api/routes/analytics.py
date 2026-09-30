"""
FastAPI Router for Analytics & Decision-Support Dashboards (Module 6)
Endpoints:
  - GET /api/v1/analytics/compare: Dynamic state-to-state comparative statistics
  - GET /api/v1/analytics/radar: Multidimensional climate resilience radar data
  - GET /api/v1/analytics/trends: Multi-year historical indicators
"""

from typing import List, Optional
from fastapi import APIRouter, Query

from app.services.analytics_service import analytics_service

router = APIRouter()

@router.get("/compare", summary="Compare 2 Indian States on Real Empirical Indicators")
def compare_states(
    state_a: str = Query("Maharashtra", description="Primary state name"),
    state_b: str = Query("Madhya Pradesh", description="Comparison state name")
):
    """Calculates empirical comparative metrics between two states from Census 2011, Nightlights, and Rainfall."""
    return analytics_service.compare_states(state_a, state_b)

@router.get("/radar", summary="Climate Risk Radar Comparison")
def get_climate_radar(
    state_a: str = Query("Maharashtra", description="Primary state name"),
    state_b: str = Query("Madhya Pradesh", description="Comparison state name")
):
    """Returns 5-axis climate and agrarian vulnerability radar metrics."""
    return analytics_service.get_climate_radar(state_a, state_b)

@router.get("/trends", summary="Multi-Year Land Governance Trends")
def get_trends():
    """Returns multi-year historical trend series (2018-2024)."""
    return analytics_service.get_historical_trends()
