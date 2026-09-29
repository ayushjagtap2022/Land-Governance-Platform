"""
Land Governance Platform - Machine Learning Service
Loads and serves trained Scikit-Learn models:
  1. Dispute & Titling Risk Regressor (Random Forest)
  2. Urban Sprawl & Land Conversion Forecaster (HistGradientBoosting)
  3. Agrarian & Climate Distress Vulnerability Model (Random Forest)
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import joblib

logger = logging.getLogger(__name__)

# Search paths for model artifacts
POSSIBLE_DIRS = [
    Path(__file__).resolve().parent.parent / "ml_models",
    Path(__file__).resolve().parent.parent.parent.parent / "ai-ml" / "models",
    Path("c:/Nirmal/Projects/Land-Governance-Platform/apps/ai-ml/models"),
    Path("c:/Nirmal/Projects/Land-Governance-Platform/apps/api/app/ml_models"),
]

class MLService:
    _instance = None

    def __init__(self):
        self.model_dir = None
        for d in POSSIBLE_DIRS:
            if d.exists() and (d / "dispute_risk_model.joblib").exists():
                self.model_dir = d
                break

        if not self.model_dir:
            logger.warning("ML models directory not found in candidate paths.")
            self.metadata = {}
            self.m1_dispute = None
            self.m2_conversion = None
            self.m3_climate = None
            self.district_df = pd.DataFrame()
            return

        # 1. Load metadata
        meta_file = self.model_dir / "models_metadata.json"
        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {}

        # 2. Load trained models
        try:
            self.m1_dispute = joblib.load(self.model_dir / "dispute_risk_model.joblib")
            self.m2_conversion = joblib.load(self.model_dir / "urban_conversion_model.joblib")
            self.m3_climate = joblib.load(self.model_dir / "climate_vulnerability_model.joblib")
        except Exception as e:
            logger.error(f"Error loading joblib models: {e}")
            self.m1_dispute = None
            self.m2_conversion = None
            self.m3_climate = None

        # 3. Load cached district features
        cache_csv = self.model_dir / "district_features_cache.csv"
        if cache_csv.exists():
            self.district_df = pd.read_csv(cache_csv)
            self.district_df["district_lookup"] = self.district_df["district_name"].astype(str).str.upper().str.strip()
            self.district_df["state_lookup"] = self.district_df["state_name"].astype(str).str.upper().str.strip()
        else:
            self.district_df = pd.DataFrame()

    @classmethod
    def get_instance(cls) -> "MLService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_model_catalog(self) -> Dict[str, Any]:
        """Return catalog of trained ML models, validation metrics, and training dataset citations."""
        return {
            "status": "active" if self.m1_dispute is not None else "unavailable",
            "framework": "scikit-learn",
            "active_models_count": len(self.metadata.get("models", {})),
            "trained_at": self.metadata.get("trained_at"),
            "training_datasets": self.metadata.get("training_datasets", []),
            "models": self.metadata.get("models", {})
        }

    def predict_dispute_risk(
        self,
        state_name: str,
        district_name: Optional[str] = None,
        policy_adjustments: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """Run inference using trained RandomForestRegressor."""
        if self.m1_dispute is None or self.district_df.empty:
            return {"error": "ML models not loaded"}

        state_clean = state_name.strip().upper()
        state_rows = self.district_df[self.district_df["state_lookup"] == state_clean]
        if state_rows.empty:
            state_rows = self.district_df

        if district_name:
            dist_clean = district_name.strip().upper()
            target_rows = state_rows[state_rows["district_lookup"] == dist_clean]
            if target_rows.empty:
                target_rows = state_rows.head(1)
        else:
            target_rows = state_rows

        features = self.metadata.get("models", {}).get("dispute_risk", {}).get("features", [])
        if not features:
            features = [
                "urban_household_ratio", "agri_worker_ratio", "cultivator_ratio",
                "marginal_worker_ratio", "literacy_rate", "rented_house_ratio",
                "sc_st_ratio", "dilapidated_house_ratio", "nl_mean",
                "nl_growth_velocity", "internet_ratio", "economic_density_index"
            ]

        X = target_rows[features].copy()

        # Counterfactual policy simulation shifts
        if policy_adjustments:
            if "titling_coverage_pct" in policy_adjustments:
                coverage_boost = float(policy_adjustments["titling_coverage_pct"]) / 100.0
                if "agri_worker_ratio" in X.columns:
                    X["agri_worker_ratio"] = (X["agri_worker_ratio"] * (1.0 - 0.4 * coverage_boost)).clip(lower=0.01)
                if "rented_house_ratio" in X.columns:
                    X["rented_house_ratio"] = (X["rented_house_ratio"] * (1.0 - 0.3 * coverage_boost)).clip(lower=0.01)

            if "digital_mutation_speed_pct" in policy_adjustments:
                speed_boost = float(policy_adjustments["digital_mutation_speed_pct"]) / 100.0
                if "internet_ratio" in X.columns:
                    X["internet_ratio"] = (X["internet_ratio"] + 0.3 * speed_boost).clip(upper=0.95)

        preds = self.m1_dispute.predict(X)
        mean_pred = float(np.mean(preds))

        return {
            "model_id": "MOD-DISPUTE-RF-01",
            "algorithm": "RandomForestRegressor (120 Trees)",
            "predicted_dispute_risk_index": round(mean_pred, 2),
            "risk_band": "High" if mean_pred > 65 else ("Moderate" if mean_pred > 40 else "Low"),
            "district_min": round(float(np.min(preds)), 2),
            "district_max": round(float(np.max(preds)), 2),
            "districts_evaluated": len(target_rows),
            "top_drivers": self.metadata.get("models", {}).get("dispute_risk", {}).get("feature_importances", [])[:4]
        }

    def predict_urban_conversion(
        self,
        state_name: str,
        district_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run inference using trained HistGradientBoostingRegressor."""
        if self.m2_conversion is None or self.district_df.empty:
            return {"error": "ML models not loaded"}

        state_clean = state_name.strip().upper()
        state_rows = self.district_df[self.district_df["state_lookup"] == state_clean]
        if state_rows.empty:
            state_rows = self.district_df

        if district_name:
            dist_clean = district_name.strip().upper()
            target_rows = state_rows[state_rows["district_lookup"] == dist_clean]
            if target_rows.empty:
                target_rows = state_rows.head(1)
        else:
            target_rows = state_rows

        features = self.metadata.get("models", {}).get("urban_conversion", {}).get("features", [])
        if not features:
            features = [
                "nl_mean", "nl_growth_velocity", "nl_std", "urban_household_ratio",
                "rural_household_ratio", "economic_density_index", "internet_ratio", "literacy_rate"
            ]

        X = target_rows[features].copy()
        preds = self.m2_conversion.predict(X)

        return {
            "model_id": "MOD-SPRAWL-HGB-02",
            "algorithm": "HistGradientBoostingRegressor",
            "predicted_annual_conversion_hectares_per_100k": round(float(np.mean(preds)), 2),
            "top_drivers": self.metadata.get("models", {}).get("urban_conversion", {}).get("feature_importances", [])[:3]
        }

ml_service = MLService.get_instance()
