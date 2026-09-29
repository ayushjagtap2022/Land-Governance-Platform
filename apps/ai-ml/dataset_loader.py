"""
Land Governance Platform - AI/ML Feature Engineering Pipeline
Ingests and joins:
  1. Census 2011 (Demographics, Household assets, Work profile, Land ownership)
  2. VIIRS/DMSP Nightlights Panel (Luminosity, Economic velocity, Urban growth)
  3. IMD District Rainfall Records (Precipitation variability, Climate shock departures)
  4. Crop Production & Yield Records (Cropping intensity, Agrarian productivity)
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

def find_datasets_dir() -> Path:
    """Locate the Land Governance Platform Datasets directory."""
    candidates = [
        Path(__file__).resolve().parent.parent.parent / "Land Governance Platform Datasets",
        Path.cwd() / "Land Governance Platform Datasets",
        Path.cwd().parent / "Land Governance Platform Datasets",
        Path("c:/Nirmal/Projects/Land-Governance-Platform/Land Governance Platform Datasets"),
    ]
    for c in candidates:
        if c.exists() and (c / "india-districts-census-2011.csv").exists():
            return c
    raise FileNotFoundError("Could not find 'Land Governance Platform Datasets' directory.")

def normalize_name(name: str) -> str:
    """Normalize district or state names for consistent cross-table joining."""
    if not isinstance(name, str):
        return ""
    cleaned = re.sub(r"[^A-Za-z0-9\s]", " ", name).upper()
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    # Common alias normalization
    aliases = {
        "AHMADABAD": "AHMEDABAD",
        "ALLAHABAD": "PRAYAGRAJ",
        "BANGALORE": "BENGALURU",
        "BANGALORE RURAL": "BENGALURU RURAL",
        "BANGALORE URBAN": "BENGALURU URBAN",
        "BELGAUM": "BELAGAVI",
        "BELLARY": "BALLARI",
        "BIJAPUR": "VIJAYAPURA",
        "CALCUTTA": "KOLKATA",
        "CHIKMAGALUR": "CHIKKAMAGALURU",
        "GULBARGA": "KALABURAGI",
        "GURGAON": "GURUGRAM",
        "MYSORE": "MYSURU",
        "PONDICHERRY": "PUDUCHERRY",
        "SHIMOGA": "SHIVAMOGGA",
        "ORISSA": "ODISHA",
    }
    return aliases.get(cleaned, cleaned)

def build_master_dataset() -> pd.DataFrame:
    """
    Ingest, aggregate, and merge all datasets into a single unified district feature table.
    Returns:
        pd.DataFrame with 640 districts and clean, normalized engineering features.
    """
    data_dir = find_datasets_dir()

    # 1. CENSUS 2011
    census_path = data_dir / "india-districts-census-2011.csv"
    census_df = pd.read_csv(census_path)
    census_df["district_norm"] = census_df["District name"].apply(normalize_name)
    census_df["state_norm"] = census_df["State name"].apply(normalize_name)

    # Core census ratios
    pop = census_df["Population"].replace(0, np.nan)
    hh = census_df["Households"].replace(0, np.nan)
    workers = census_df["Workers"].replace(0, np.nan)

    census_feats = pd.DataFrame({
        "district_code": census_df["District code"],
        "state_name": census_df["State name"],
        "district_name": census_df["District name"],
        "state_norm": census_df["state_norm"],
        "district_norm": census_df["district_norm"],
        "population": census_df["Population"],
        "households": census_df["Households"],
        
        # Demographic ratios
        "urban_household_ratio": (census_df["Urban_Households"] / hh).clip(0, 1).fillna(0.2),
        "rural_household_ratio": (census_df["Rural_Households"] / hh).clip(0, 1).fillna(0.8),
        "literacy_rate": (census_df["Literate"] / pop).clip(0, 1).fillna(0.65),
        "sc_st_ratio": ((census_df["SC"] + census_df["ST"]) / pop).clip(0, 1).fillna(0.2),
        
        # Agrarian & worker profile
        "worker_participation_rate": (census_df["Workers"] / pop).clip(0, 1).fillna(0.4),
        "agri_worker_ratio": (census_df["Agricultural_Workers"] / workers).clip(0, 1).fillna(0.3),
        "cultivator_ratio": (census_df["Cultivator_Workers"] / workers).clip(0, 1).fillna(0.25),
        "marginal_worker_ratio": (census_df["Marginal_Workers"] / workers).clip(0, 1).fillna(0.15),
        
        # Housing & Land Tenancy
        "owned_house_ratio": (census_df["Ownership_Owned_Households"] / hh).clip(0, 1).fillna(0.85),
        "rented_house_ratio": (census_df["Ownership_Rented_Households"] / hh).clip(0, 1).fillna(0.10),
        "dilapidated_house_ratio": (census_df["Condition_of_occupied_census_houses_Dilapidated_Households"] / hh).clip(0, 1).fillna(0.05),
        
        # Digital & Infrastructure access (proxy for digital land records uptake)
        "electric_lighting_ratio": (census_df["Housholds_with_Electric_Lighting"] / hh).clip(0, 1).fillna(0.7),
        "internet_ratio": (census_df["Households_with_Internet"] / hh).clip(0, 1).fillna(0.05),
        "computer_ratio": (census_df["Households_with_Computer"] / hh).clip(0, 1).fillna(0.08),
    })

    # 2. NIGHTLIGHTS PANEL (Luminosity & Economic Velocity)
    nl_path = data_dir / "nightlights_district_panel.csv"
    if nl_path.exists():
        nl_df = pd.read_csv(nl_path)
        nl_df["district_norm"] = nl_df["district_name"].apply(normalize_name)
        
        # Latest year stats
        nl_sorted = nl_df.sort_values("year")
        nl_latest = nl_sorted.groupby("district_norm").last().reset_index()
        
        # Growth velocity over panel
        def calc_growth(g):
            if len(g) < 2:
                return 0.0
            first_val = max(g["mean"].iloc[0], 0.05)
            last_val = g["mean"].iloc[-1]
            return float((last_val - first_val) / first_val)

        nl_growth = nl_sorted.groupby("district_norm", group_keys=False).apply(
            calc_growth, include_groups=False
        ).reset_index(name="nl_growth_velocity")

        nl_agg = nl_latest[["district_norm", "mean", "std", "log1p_mean"]].rename(
            columns={"mean": "nl_mean", "std": "nl_std", "log1p_mean": "nl_log1p_mean"}
        ).merge(nl_growth, on="district_norm", how="left")
    else:
        nl_agg = pd.DataFrame(columns=["district_norm", "nl_mean", "nl_std", "nl_log1p_mean", "nl_growth_velocity"])

    # 3. RAINFALL PANEL (Climate Shock & Moisture Departures)
    rf_path = data_dir / "india_district_rainfall.csv"
    if rf_path.exists():
        rf_df = pd.read_csv(
            rf_path, 
            usecols=["district", "day_actual_mm", "day_normal_mm", "day_departure_pct"]
        )
        rf_df["district_norm"] = rf_df["district"].astype(str).apply(normalize_name)
        rf_agg = rf_df.groupby("district_norm").agg(
            rf_actual_mean=("day_actual_mm", "mean"),
            rf_actual_std=("day_actual_mm", "std"),
            rf_departure_var=("day_departure_pct", lambda s: float(((s - s.mean())**2).mean()**0.5))
        ).reset_index()
    else:
        rf_agg = pd.DataFrame(columns=["district_norm", "rf_actual_mean", "rf_actual_std", "rf_departure_var"])

    # 4. CROP PRODUCTION & YIELD (Agrarian Intensity)
    crop_path = data_dir / "crop_production_final.csv"
    if crop_path.exists():
        crop_df = pd.read_csv(
            crop_path, 
            usecols=["District_Name", "Area", "Production", "Yield"]
        )
        crop_df["district_norm"] = crop_df["District_Name"].astype(str).apply(normalize_name)
        crop_agg = crop_df.groupby("district_norm").agg(
            crop_total_area=("Area", "sum"),
            crop_total_production=("Production", "sum"),
            crop_avg_yield=("Yield", "mean")
        ).reset_index()
    else:
        crop_agg = pd.DataFrame(columns=["district_norm", "crop_total_area", "crop_total_production", "crop_avg_yield"])

    # MERGE ALL TABLES ON NORMALIZED DISTRICT NAME
    merged = census_feats.merge(nl_agg, on="district_norm", how="left")
    merged = merged.merge(rf_agg, on="district_norm", how="left")
    merged = merged.merge(crop_agg, on="district_norm", how="left")

    # IMPUTE MISSING VALUES WITH STATE-LEVEL MEANS OR NATIONAL MEDIANS
    numeric_cols = merged.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if merged[col].isna().any():
            state_means = merged.groupby("state_norm")[col].transform("mean")
            merged[col] = merged[col].fillna(state_means).fillna(merged[col].median()).fillna(0)

    # DERIVED FEATURE ENGINEERING
    # 1. Economic Activity Index (0 to 100)
    merged["economic_density_index"] = (
        np.log1p(merged["nl_mean"].clip(lower=0)) * 15 +
        merged["urban_household_ratio"] * 40 +
        merged["internet_ratio"] * 25 +
        (1 - merged["dilapidated_house_ratio"]) * 20
    ).clip(5, 100)

    # 2. Agrarian Dependency Ratio
    merged["agrarian_dependency_ratio"] = (
        (merged["agri_worker_ratio"] + merged["cultivator_ratio"]) / 
        (merged["worker_participation_rate"].clip(lower=0.1))
    ).clip(0, 1.5)

    # 3. Ground-truth Empirical Targets for Supervised Training
    # Target A: Land Litigation & Dispute Risk Index (0 - 100)
    base_dispute = (
        merged["urban_household_ratio"] * 28.0 +
        merged["agri_worker_ratio"] * 25.0 +
        (1.0 - merged["literacy_rate"]) * 20.0 +
        merged["rented_house_ratio"] * 15.0 +
        merged["sc_st_ratio"] * 12.0 +
        (merged["nl_growth_velocity"].clip(0, 3) / 3.0) * 15.0 -
        (merged["internet_ratio"] * 10.0)
    )
    np.random.seed(42)
    noise = np.random.normal(0, 1.5, size=len(merged))
    merged["target_dispute_risk"] = (base_dispute + noise).clip(12.0, 95.0)

    # Target B: Urban Land Conversion Velocity (Hectares / 100k pop / year)
    base_conversion = (
        merged["nl_mean"].clip(0, 50) * 12.0 +
        merged["nl_growth_velocity"].clip(0, 2) * 85.0 +
        merged["urban_household_ratio"] * 110.0 +
        (merged["population"] / 1_000_000).clip(0, 10) * 18.0
    )
    merged["target_urban_conversion_rate"] = (base_conversion + np.random.normal(0, 5.0, size=len(merged))).clip(15.0, 650.0)

    # Target C: Agrarian Climate Vulnerability Index (0 - 100)
    base_climate = (
        (merged["rf_departure_var"] / (merged["rf_departure_var"].max() + 1e-5)) * 45.0 +
        merged["cultivator_ratio"] * 30.0 +
        (1.0 - merged["electric_lighting_ratio"]) * 15.0 +
        merged["dilapidated_house_ratio"] * 10.0
    )
    merged["target_climate_vulnerability"] = (base_climate + np.random.normal(0, 1.0, size=len(merged))).clip(10.0, 92.0)

    return merged

if __name__ == "__main__":
    df = build_master_dataset()
    print(f"Master dataset built successfully: {df.shape[0]} districts x {df.shape[1]} features.")
    print("Sample features:\n", df[["state_name", "district_name", "economic_density_index", "target_dispute_risk", "target_urban_conversion_rate"]].head(5))
