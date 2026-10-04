"""
Land Governance Platform - AI/ML Inference Engine
Provides high-performance inference for:
  1. Dispute & Titling Risk prediction
  2. Urban Sprawl & Conversion rate prediction
  3. Climate & Agrarian Distress Vulnerability scoring
Supports baseline lookups by State/District and policy counterfactual sensitivity adjustments.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import joblib

_PRIMARY_DIR = Path(__file__).resolve().parent.parent / "ml_models"
MODEL_DIR = _PRIMARY_DIR if _PRIMARY_DIR.exists() else Path(__file__).resolve().parent / "models"

class LandGovernanceMLInference:
    _instance = None

    def __init__(self, model_dir: Optional[Path] = None):
        self.model_dir = model_dir or MODEL_DIR
        self._load_models_and_cache()

    @classmethod
    def get_instance(cls, model_dir: Optional[Path] = None):
        if cls._instance is None:
            cls._instance = cls(model_dir)
        return cls._instance

    def _load_models_and_cache(self):
        # 1. Load metadata
        meta_file = self.model_dir / "models_metadata.json"
        if meta_file.exists():
            with open(meta_file, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
        else:
            self.metadata = {}

        # 2. Load trained scikit-learn models
        self.m1_dispute = joblib.load(self.model_dir / "dispute_risk_model.joblib")
        self.m2_conversion = joblib.load(self.model_dir / "urban_conversion_model.joblib")
        self.m3_climate = joblib.load(self.model_dir / "climate_vulnerability_model.joblib")

        # 3. Load cached district features
        cache_csv = self.model_dir / "district_features_cache.csv"
        if cache_csv.exists():
            self.district_df = pd.read_csv(cache_csv)
            self.district_df["district_lookup"] = self.district_df["district_name"].astype(str).str.upper().str.strip()
            self.district_df["state_lookup"] = self.district_df["state_name"].astype(str).str.upper().str.strip()
        else:
            self.district_df = pd.DataFrame()

    def get_models_metadata(self) -> Dict[str, Any]:
        """Return catalog of trained models, accuracy metrics, and feature importances."""
        return self.metadata

    def predict_dispute_risk(
        self,
        state_name: str,
        district_name: Optional[str] = None,
        policy_adjustments: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Run dispute risk inference using Model 1 (Random Forest).
        Supports counterfactual policy levers (e.g. digital mutation speed, titling coverage).
        """
        state_clean = state_name.strip().upper()
        state_rows = self.district_df[self.district_df["state_lookup"] == state_clean]
        if state_rows.empty:
            # Fallback to all India average
            state_rows = self.district_df

        if district_name:
            dist_clean = district_name.strip().upper()
            target_rows = state_rows[state_rows["district_lookup"] == dist_clean]
            if target_rows.empty:
                target_rows = state_rows.head(1)
        else:
            target_rows = state_rows

        features = self.metadata["models"]["dispute_risk"]["features"]
        X = target_rows[features].copy()

        # Apply counterfactual policy adjustments if provided
        if policy_adjustments:
            # E.g. digital_land_records reduces informational asymmetry
            if "titling_coverage_pct" in policy_adjustments:
                coverage_boost = float(policy_adjustments["titling_coverage_pct"]) / 100.0
                # Higher titling reduces the effective friction of agri workers & informality
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
        min_pred = float(np.min(preds))
        max_pred = float(np.max(preds))

        return {
            "model_id": "MOD-DISPUTE-RF-01",
            "model_algorithm": "RandomForestRegressor (120 trees)",
            "predicted_dispute_risk_index": round(mean_pred, 2),
            "risk_band": "High" if mean_pred > 65 else ("Moderate" if mean_pred > 40 else "Low"),
            "district_range": {"min": round(min_pred, 2), "max": round(max_pred, 2)},
            "districts_evaluated": len(target_rows),
            "state": state_name,
            "district": district_name or "All State Districts (Mean)",
            "top_drivers": self.metadata["models"]["dispute_risk"]["feature_importances"][:4]
        }

    def predict_urban_conversion(
        self,
        state_name: str,
        district_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Run urban conversion rate prediction using Model 2 (HistGradientBoosting)."""
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

        features = self.metadata["models"]["urban_conversion"]["features"]
        X = target_rows[features].copy()
        preds = self.m2_conversion.predict(X)

        return {
            "model_id": "MOD-SPRAWL-HGB-02",
            "model_algorithm": "HistGradientBoostingRegressor",
            "predicted_annual_conversion_hectares_per_100k": round(float(np.mean(preds)), 2),
            "top_drivers": self.metadata["models"]["urban_conversion"]["feature_importances"][:3]
        }

if __name__ == "__main__":
    service = LandGovernanceMLInference()
    print("Testing ML Inference for Maharashtra...")
    res = service.predict_dispute_risk("MAHARASHTRA")
    print("Inference Result:", json.dumps(res, indent=2))
