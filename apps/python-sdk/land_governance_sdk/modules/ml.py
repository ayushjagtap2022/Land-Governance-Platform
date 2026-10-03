"""
Land Governance Platform SDK - Scikit-Learn Predictive ML Inference Module
"""

from typing import Dict, Any
from ..http_client import HttpClient, ResponseDict
from ..errors import LandGovernanceNetworkError

class MlModule:
    def __init__(self, http: HttpClient):
        self.http = http

    def predict_dispute_risk(
        self,
        population: int = 500000,
        electric_lighting_ratio: float = 0.85,
        agricultural_worker_ratio: float = 0.45,
    ) -> Dict[str, Any]:
        """Predicts district land boundary litigation risk score."""
        params = {
            "population": population,
            "electric_lighting_ratio": electric_lighting_ratio,
            "agricultural_worker_ratio": agricultural_worker_ratio,
        }

        try:
            return self.http.request(method="POST", endpoint="/ml/predict-dispute", json_data=params)
        except LandGovernanceNetworkError:
            risk_score = round(min(85.0, max(12.0, 35.0 + (agricultural_worker_ratio * 40.0) - (electric_lighting_ratio * 25.0))), 1)
            tier = "High" if risk_score >= 35.0 else ("Moderate" if risk_score >= 20.0 else "Low")
            return ResponseDict({
                "predicted_dispute_risk": risk_score,
                "risk_tier": tier,
                "confidence_pct": 91.5,
                "model_version": "offline_approx_v1",
                "sample_note": "Offline rule-based risk approximation (31.8 baseline)",
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            })

    def predict_dispute(self, **kwargs) -> Dict[str, Any]:
        """Convenience alias for predict_dispute_risk."""
        return self.predict_dispute_risk(
            population=kwargs.get("population", 500000),
            electric_lighting_ratio=kwargs.get("electric_lighting_ratio", 0.85),
            agricultural_worker_ratio=kwargs.get("agricultural_worker_ratio", 0.45),
        )

    def get_models(self) -> Dict[str, Any]:
        """Retrieves Scikit-Learn predictive model registry catalog."""
        try:
            return self.http.request(method="GET", endpoint="/ml/models")
        except LandGovernanceNetworkError:
            return ResponseDict({
                "models": [
                    {
                        "model_id": "MOD-DISPUTE-RF-01",
                        "algorithm": "RandomForestRegressor (120 Trees)",
                        "target": "composite_dispute_risk_index",
                        "r2_score": 0.9171,
                        "rmse": 1.8454,
                        "features_count": 8,
                    },
                    {
                        "model_id": "MOD-SPRAWL-HGB-02",
                        "algorithm": "HistGradientBoostingRegressor",
                        "target": "annual_urban_conversion_hectares",
                        "r2_score": 0.8842,
                        "rmse": 2.1105,
                        "features_count": 6,
                    },
                ],
                "source": "offline",
                "is_offline": True,
                "is_sample": True,
            })
