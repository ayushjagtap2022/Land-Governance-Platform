"""
Land Governance Platform - AI/ML Model Training Pipeline
Trains real Scikit-Learn models using Census 2011, Nightlights Panel, Rainfall, and Crop statistics:
  1. Dispute & Titling Risk Regressor (Random Forest)
  2. Urban Sprawl & Land Conversion Forecaster (HistGradientBoosting)
  3. Agrarian Climate Distress Vulnerability Model (Random Forest)
"""

import json
import os
import shutil
import time
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, HistGradientBoostingRegressor
from sklearn.inspection import permutation_importance
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, cross_val_score, train_test_split
import joblib

from dataset_loader import build_master_dataset

OUTPUT_DIR = Path(__file__).resolve().parent / "models"
API_ML_DIR = Path(__file__).resolve().parent.parent / "api" / "app" / "ml_models"

def train_and_export():
    start_time = time.time()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    API_ML_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("LAND GOVERNANCE PLATFORM - ML TRAINING PIPELINE (SCIKIT-LEARN)")
    print("=" * 70)

    # 1. Build unified master dataset
    print("\n[1/4] Ingesting and engineering features from Census, Nightlights, Rainfall, and Crop datasets...")
    df = build_master_dataset()
    print(f"Loaded {len(df)} districts with {df.shape[1]} engineered features.")

    # Save cached master features CSV for instant lookups
    cached_features_path = OUTPUT_DIR / "district_features_cache.csv"
    df.to_csv(cached_features_path, index=False)
    print(f"Cached district features to {cached_features_path}")

    metadata = {
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_districts": len(df),
        "total_states": int(df["state_name"].nunique()),
        "models": {},
        "training_datasets": [
            {"name": "Census of India 2011", "rows": 640, "citation": "Office of the Registrar General & Census Commissioner, India"},
            {"name": "VIIRS/DMSP Nighttime Lights Panel (2014-2020)", "rows": 8333, "citation": "Earth Observation Group, NOAA / VIIRS"},
            {"name": "IMD District Precipitation Records", "rows": 24000, "citation": "India Meteorological Department (IMD)"},
            {"name": "District Crop Production & Yield Panel", "rows": 246000, "citation": "Ministry of Agriculture & Farmers Welfare, GoI"}
        ]
    }

    # =========================================================================
    # MODEL 1: Land Dispute & Litigation Risk Index (Random Forest Regressor)
    # =========================================================================
    print("\n[2/4] Training Model 1: Land Dispute & Titling Risk Regressor...")
    features_m1 = [
        "urban_household_ratio",
        "agri_worker_ratio",
        "cultivator_ratio",
        "marginal_worker_ratio",
        "literacy_rate",
        "rented_house_ratio",
        "sc_st_ratio",
        "dilapidated_house_ratio",
        "nl_mean",
        "nl_growth_velocity",
        "internet_ratio",
        "economic_density_index"
    ]
    target_m1 = "target_dispute_risk"

    X1 = df[features_m1]
    y1 = df[target_m1]

    X1_train, X1_test, y1_train, y1_test = train_test_split(X1, y1, test_size=0.20, random_state=42)

    rf_dispute = RandomForestRegressor(
        n_estimators=120,
        max_depth=9,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_dispute.fit(X1_train, y1_train)

    y1_pred = rf_dispute.predict(X1_test)
    r2_m1 = float(r2_score(y1_test, y1_pred))
    mae_m1 = float(mean_absolute_error(y1_test, y1_pred))
    rmse_m1 = float(np.sqrt(mean_squared_error(y1_test, y1_pred)))

    cv_scores_m1 = cross_val_score(rf_dispute, X1, y1, cv=5, scoring="r2")
    cv_mean_m1 = float(np.mean(cv_scores_m1))
    cv_std_m1 = float(np.std(cv_scores_m1))

    # Feature importances
    importances_m1 = [
        {"feature": feat, "importance": round(float(imp), 4), "percentage": round(float(imp) * 100, 2)}
        for feat, imp in sorted(zip(features_m1, rf_dispute.feature_importances_), key=lambda x: x[1], reverse=True)
    ]

    m1_path = OUTPUT_DIR / "dispute_risk_model.joblib"
    joblib.dump(rf_dispute, m1_path)
    print(f"  Model 1 saved -> {m1_path.name}")
    print(f"  Test R2: {r2_m1:.4f} | MAE: {mae_m1:.3f} | RMSE: {rmse_m1:.3f} | 5-Fold CV R2: {cv_mean_m1:.4f} +/- {cv_std_m1:.4f}")
    print(f"  Top 3 features: {[f['feature'] + ' (' + str(f['percentage']) + '%)' for f in importances_m1[:3]]}")

    metadata["models"]["dispute_risk"] = {
        "model_id": "MOD-DISPUTE-RF-01",
        "name": "Land Dispute & Titling Risk Regressor",
        "algorithm": "RandomForestRegressor",
        "framework": "scikit-learn",
        "n_estimators": 120,
        "features": features_m1,
        "target": "district_dispute_risk_index_0_to_100",
        "metrics": {
            "r2_score": round(r2_m1, 4),
            "mae": round(mae_m1, 4),
            "rmse": round(rmse_m1, 4),
            "cv_5fold_r2_mean": round(cv_mean_m1, 4),
            "cv_5fold_r2_std": round(cv_std_m1, 4)
        },
        "feature_importances": importances_m1
    }

    # =========================================================================
    # MODEL 2: Urban Sprawl & Land Conversion Forecaster (HistGradientBoosting)
    # =========================================================================
    print("\n[3/4] Training Model 2: Urban Sprawl & Land Conversion Forecaster...")
    features_m2 = [
        "nl_mean",
        "nl_growth_velocity",
        "nl_std",
        "urban_household_ratio",
        "rural_household_ratio",
        "economic_density_index",
        "internet_ratio",
        "literacy_rate"
    ]
    target_m2 = "target_urban_conversion_rate"

    X2 = df[features_m2]
    y2 = df[target_m2]

    X2_train, X2_test, y2_train, y2_test = train_test_split(X2, y2, test_size=0.20, random_state=42)

    hgb_conversion = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_depth=7,
        random_state=42
    )
    hgb_conversion.fit(X2_train, y2_train)

    y2_pred = hgb_conversion.predict(X2_test)
    r2_m2 = float(r2_score(y2_test, y2_pred))
    mae_m2 = float(mean_absolute_error(y2_test, y2_pred))
    rmse_m2 = float(np.sqrt(mean_squared_error(y2_test, y2_pred)))

    # Permutation importance for HistGradientBoosting
    perm = permutation_importance(hgb_conversion, X2_test, y2_test, n_repeats=10, random_state=42)
    total_perm = max(np.sum(perm.importances_mean), 1e-6)
    importances_m2 = [
        {"feature": feat, "importance": round(float(imp / total_perm), 4), "percentage": round(float(imp / total_perm) * 100, 2)}
        for feat, imp in sorted(zip(features_m2, perm.importances_mean), key=lambda x: x[1], reverse=True)
    ]

    m2_path = OUTPUT_DIR / "urban_conversion_model.joblib"
    joblib.dump(hgb_conversion, m2_path)
    print(f"  Model 2 saved -> {m2_path.name}")
    print(f"  Test R2: {r2_m2:.4f} | MAE: {mae_m2:.3f} | RMSE: {rmse_m2:.3f}")
    print(f"  Top 3 features: {[f['feature'] + ' (' + str(f['percentage']) + '%)' for f in importances_m2[:3]]}")

    metadata["models"]["urban_conversion"] = {
        "model_id": "MOD-SPRAWL-HGB-02",
        "name": "Urban Land Conversion & Sprawl Forecaster",
        "algorithm": "HistGradientBoostingRegressor",
        "framework": "scikit-learn",
        "features": features_m2,
        "target": "annual_agricultural_to_urban_conversion_hectares_per_100k",
        "metrics": {
            "r2_score": round(r2_m2, 4),
            "mae": round(mae_m2, 4),
            "rmse": round(rmse_m2, 4)
        },
        "feature_importances": importances_m2
    }

    # =========================================================================
    # MODEL 3: Agrarian & Climate Distress Vulnerability Model (Random Forest)
    # =========================================================================
    print("\n[4/4] Training Model 3: Agrarian & Climate Distress Vulnerability Model...")
    features_m3 = [
        "rf_actual_mean",
        "rf_actual_std",
        "rf_departure_var",
        "cultivator_ratio",
        "agri_worker_ratio",
        "crop_avg_yield",
        "electric_lighting_ratio",
        "dilapidated_house_ratio",
        "agrarian_dependency_ratio"
    ]
    target_m3 = "target_climate_vulnerability"

    X3 = df[features_m3]
    y3 = df[target_m3]

    X3_train, X3_test, y3_train, y3_test = train_test_split(X3, y3, test_size=0.20, random_state=42)

    rf_climate = RandomForestRegressor(
        n_estimators=100,
        max_depth=8,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    rf_climate.fit(X3_train, y3_train)

    y3_pred = rf_climate.predict(X3_test)
    r2_m3 = float(r2_score(y3_test, y3_pred))
    mae_m3 = float(mean_absolute_error(y3_test, y3_pred))
    rmse_m3 = float(np.sqrt(mean_squared_error(y3_test, y3_pred)))

    importances_m3 = [
        {"feature": feat, "importance": round(float(imp), 4), "percentage": round(float(imp) * 100, 2)}
        for feat, imp in sorted(zip(features_m3, rf_climate.feature_importances_), key=lambda x: x[1], reverse=True)
    ]

    m3_path = OUTPUT_DIR / "climate_vulnerability_model.joblib"
    joblib.dump(rf_climate, m3_path)
    print(f"  Model 3 saved -> {m3_path.name}")
    print(f"  Test R2: {r2_m3:.4f} | MAE: {mae_m3:.3f} | RMSE: {rmse_m3:.3f}")

    metadata["models"]["climate_vulnerability"] = {
        "model_id": "MOD-CLIMATE-RF-03",
        "name": "Agrarian & Climate Distress Vulnerability Model",
        "algorithm": "RandomForestRegressor",
        "framework": "scikit-learn",
        "n_estimators": 100,
        "features": features_m3,
        "target": "climate_distress_vulnerability_index_0_to_100",
        "metrics": {
            "r2_score": round(r2_m3, 4),
            "mae": round(mae_m3, 4),
            "rmse": round(rmse_m3, 4)
        },
        "feature_importances": importances_m3
    }

    # Save metadata JSON
    meta_path = OUTPUT_DIR / "models_metadata.json"
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"\nMetadata exported to {meta_path}")

    # Copy artifacts to FastAPI app for runtime inference
    print("\nCopying model artifacts to FastAPI runtime directory...")
    for artifact in [m1_path, m2_path, m3_path, cached_features_path, meta_path]:
        shutil.copy2(artifact, API_ML_DIR / artifact.name)
    print(f"Copied all 5 artifacts to {API_ML_DIR}")

    elapsed = round(time.time() - start_time, 2)
    print("=" * 70)
    print(f"ML PIPELINE TRAINING & ARTIFACT EXPORT COMPLETE IN {elapsed}s!")
    print("=" * 70)

if __name__ == "__main__":
    train_and_export()
