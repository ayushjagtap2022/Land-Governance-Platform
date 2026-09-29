"""
FastAPI Router for Machine Learning Model Management & Inference
Endpoints:
  - GET /api/v1/ml/models: Catalog of trained Scikit-Learn models, accuracy ($R^2$, MAE), and features
  - POST /api/v1/ml/predict-dispute: Random Forest inference for land dispute risk
  - POST /api/v1/ml/predict-urban-conversion: HistGradientBoosting inference for urban conversion
"""

from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ml_service import ml_service

router = APIRouter()

class DisputeRiskRequest(BaseModel):
    state_name: str = Field(default="MAHARASHTRA", description="Indian state name")
    district_name: Optional[str] = Field(default=None, description="Optional specific district")
    policy_adjustments: Optional[Dict[str, float]] = Field(
        default=None,
        description="Counterfactual policy levers e.g. titling_coverage_pct, digital_mutation_speed_pct"
    )

class UrbanConversionRequest(BaseModel):
    state_name: str = Field(default="MAHARASHTRA", description="Indian state name")
    district_name: Optional[str] = Field(default=None, description="Optional specific district")

@router.get("/models")
def get_ml_models_catalog():
    """Returns all trained Scikit-Learn models, performance scores (R^2, RMSE), and feature importances."""
    return ml_service.get_model_catalog()

@router.post("/predict-dispute")
def predict_dispute_risk(payload: DisputeRiskRequest):
    """Executes RandomForestRegressor inference on district features with optional policy counterfactuals."""
    res = ml_service.predict_dispute_risk(
        state_name=payload.state_name,
        district_name=payload.district_name,
        policy_adjustments=payload.policy_adjustments
    )
    if "error" in res:
        raise HTTPException(status_code=500, detail=res["error"])
    return res

@router.post("/predict-urban-conversion")
def predict_urban_conversion(payload: UrbanConversionRequest):
    """Executes HistGradientBoostingRegressor inference for urban land conversion velocity."""
    res = ml_service.predict_urban_conversion(
        state_name=payload.state_name,
        district_name=payload.district_name
    )
    if "error" in res:
        raise HTTPException(status_code=500, detail=res["error"])
    return res
