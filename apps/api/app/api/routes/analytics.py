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
def get_trends(
    state: Optional[str] = Query(None, description="Optional state name to get specific state historical trends")
):
    """Returns multi-year historical trend series (2000-2024) grounded in MoAFW 181k records."""
    return analytics_service.get_historical_trends(state=state)

@router.get("/dashboards/{category}", summary="Fetch Data for Specific PS Point 16 Dashboard")
def get_dashboard_category(
    category: str,
    state: Optional[str] = Query("Maharashtra", description="State name for state-specific indicators")
):
    """
    Returns empirical datasets for any of the 7 specific dashboards required by SIH PS 26019:
    - research_output
    - policy_performance
    - land_use_trends
    - climate_resilience
    - dispute_statistics
    - project_outcomes
    - geospatial_insights
    """
    return analytics_service.get_dashboard_data(category=category, state=state)

