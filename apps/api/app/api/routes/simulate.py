from fastapi import APIRouter, HTTPException
from app.services.simulation_service import simulation_service, SimulationInput, SimulationOutput, STATE_BASELINES
from typing import Dict, Any

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
    return STATE_BASELINES
