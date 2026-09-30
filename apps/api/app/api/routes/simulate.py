from fastapi import APIRouter, HTTPException
from app.services.simulation_service import (
    simulation_service, 
    SimulationInput, 
    SimulationOutput, 
    InfrastructureDelayInput,
    InfrastructureDelayOutput,
    STATE_BASELINES
)
from typing import Dict, Any, List

router = APIRouter()

@router.post("/evaluate", response_model=SimulationOutput)
async def evaluate_policy_simulation(payload: SimulationInput):
    """
    Evaluates policy variable manipulations (ceiling, conversion tax, survey budget, fast-track window)
    and returns projected outcome metrics with 95% confidence intervals, 8-year trajectories,
    sensitivity analysis, and explainability drivers.
    """
    try:
        return simulation_service.run_simulation(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation calculation error: {str(e)}")

@router.get("/baselines")
async def get_state_baselines() -> Dict[str, Any]:
    """Returns historical baseline indicators for all supported states."""
    return simulation_service.baselines

@router.get("/presets", summary="Get Policy Presets (Model Leasing, SVAMITVA, Land Pooling)")
async def get_policy_presets() -> List[Dict[str, Any]]:
    """Returns 3 verified real policy reform templates for instant 1-click simulation."""
    return simulation_service.get_presets()

@router.post("/infrastructure-delay", response_model=InfrastructureDelayOutput, summary="Estimate Infrastructure Land Acquisition Delay & Cost Overrun")
async def estimate_infrastructure_delay(payload: InfrastructureDelayInput):
    """
    Predicts project clearance delay, litigation probability, and financial cost escalation 
    under RFCTLARR Act 2013 across Highways, Railways, SEZs, and Metros (PS 25017 & PS 26016).
    """
    try:
        return simulation_service.estimate_infrastructure_delay(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Infrastructure delay calculation error: {str(e)}")

