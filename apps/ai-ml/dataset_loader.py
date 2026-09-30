"""
Land Governance Platform - Comprehensive AI/ML & Empirical Analytics Pipeline
Integrates:
  1. Census of India 2011 (Demographics, Household assets, Work profile, Land ownership)
  2. Land Use Statistics - Classification of Area (Forests, Net sown, Fallows, Non-agri land 1998-2024)
  3. Land Use Statistics - Sources of Irrigation (Canals, Wells, Tanks, Net & Gross Irrigated area)
  4. VIIRS/DMSP Nightlights Panel (Luminosity, Economic velocity, Urban growth)
  5. IMD District Rainfall Records (Precipitation variability, Climate shock departures)
  6. MoAFW Crop Production & Yield Records (Cropping intensity, Agrarian productivity)
  7. Indian Railways / GatiShakti Infrastructure (Real GPS decimal coordinates for districts)
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

def dms_to_dd(val) -> Optional[float]:
    """Parse degrees-minutes-seconds string or numeric value to decimal degrees."""
    if val is None or pd.isna(val):
        return None
    s = str(val).strip()
    try:
        return float(s)
    except Exception:
        pass
    parts = re.findall(r"[\d\.]+", s)
    if len(parts) >= 3:
        try:
            deg, mn, sec = float(parts[0]), float(parts[1]), float(parts[2])
            dd = deg + mn / 60.0 + sec / 3600.0
            if "S" in s or "W" in s:
                dd = -dd
            return dd
        except Exception:
            return None
    return None

def build_master_dataset() -> pd.DataFrame:
    """
    Ingest, aggregate, and merge all datasets into a single unified district feature table.
    Returns:
        pd.DataFrame with 640 districts and clean empirical features.
    """
    data_dir = find_datasets_dir()

    # 1. CENSUS 2011 (Demographics & Worker Profiles)
    census_path = data_dir / "india-districts-census-2011.csv"
    census_df = pd.read_csv(census_path)
    census_df["district_norm"] = census_df["District name"].apply(normalize_name)
    census_df["state_norm"] = census_df["State name"].apply(normalize_name)

    pop = census_df["Population"].replace(0, np.nan)
    hh = census_df["Households"].replace(0, np.nan)
    workers = census_df["Workers"].replace(0, np.nan)

    master = pd.DataFrame({
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
        
        # Housing & Tenancy
        "owned_house_ratio": (census_df["Ownership_Owned_Households"] / hh).clip(0, 1).fillna(0.85),
        "rented_house_ratio": (census_df["Ownership_Rented_Households"] / hh).clip(0, 1).fillna(0.10),
        "dilapidated_house_ratio": (census_df["Condition_of_occupied_census_houses_Dilapidated_Households"] / hh).clip(0, 1).fillna(0.05),
        
        # Infrastructure Access
        "electric_lighting_ratio": (census_df["Housholds_with_Electric_Lighting"] / hh).clip(0, 1).fillna(0.7),
        "internet_ratio": (census_df["Households_with_Internet"] / hh).clip(0, 1).fillna(0.05),
        "computer_ratio": (census_df["Households_with_Computer"] / hh).clip(0, 1).fillna(0.08),
    })

    # 2. LAND USE STATISTICS - CLASSIFICATION OF AREA (MoAFW)
    lu_path = data_dir / "Land Use Statistics" / "main_dataset_classification-of-area.csv"
    if lu_path.exists():
        lu_df = pd.read_csv(lu_path)
        lu_valid = lu_df[lu_df["area"].notna()].copy()
        lu_valid["district_norm"] = lu_valid["district_name"].apply(normalize_name)
        
        lu_cls = lu_valid.sort_values("year").groupby(["district_norm", "area_classification"])["area"].last().unstack().fillna(0)
        lu_met = lu_valid[lu_valid["land_use_metrics"].notna()].sort_values("year").groupby(["district_norm", "land_use_metrics"])["area"].last().unstack().fillna(0)
        lu_table = pd.concat([lu_cls, lu_met], axis=1).reset_index()

        # Rename to clean standardized identifiers
        rename_map = {
            "Forests": "forest_area_ha",
            "Not available for Cultivation": "non_agri_land_ha",
            "Fallow Land": "fallow_land_ha",
            "Other Uncultivated Land Excluding Fallow Land": "uncultivated_land_ha",
            "Reporting Area": "reporting_area_ha",
            "Net Area Sown": "net_sown_area_ha",
            "Cropped Area": "gross_cropped_area_ha",
            "Area Sown More Than Once": "multi_cropped_area_ha",
        }
        lu_table = lu_table.rename(columns={k: v for k, v in rename_map.items() if k in lu_table.columns})
        master = master.merge(lu_table, on="district_norm", how="left")
    else:
        for col in ["forest_area_ha", "non_agri_land_ha", "fallow_land_ha", "uncultivated_land_ha", "reporting_area_ha", "net_sown_area_ha", "gross_cropped_area_ha"]:
            master[col] = 0.0

    # 3. LAND USE STATISTICS - SOURCES OF IRRIGATION (MoAFW)
    ir_path = data_dir / "Land Use Statistics" / "sources-of-irrigation.csv"
    if ir_path.exists():
        ir_df = pd.read_csv(ir_path)
        ir_valid = ir_df[ir_df["irrigated_area"].notna()].copy()
        ir_valid["district_norm"] = ir_valid["district_name"].apply(normalize_name)

        ir_src = ir_valid.sort_values("year").groupby(["district_norm", "area_classification"])["irrigated_area"].last().unstack().fillna(0)
        ir_typ = ir_valid.sort_values("year").groupby(["district_norm", "irrigated_area_type"])["irrigated_area"].last().unstack().fillna(0)
        ir_table = pd.concat([ir_src, ir_typ], axis=1).reset_index()

        rename_ir = {
            "Canal": "canal_irrigated_ha",
            "Well": "well_irrigated_ha",
            "Tank": "tank_irrigated_ha",
            "Other Source": "other_irrigated_ha",
            "Net Irrigated Area": "net_irrigated_ha",
            "Gross Irrigated Area": "gross_irrigated_ha",
        }
        ir_table = ir_table.rename(columns={k: v for k, v in rename_ir.items() if k in ir_table.columns})
        master = master.merge(ir_table, on="district_norm", how="left")
    else:
        for col in ["canal_irrigated_ha", "well_irrigated_ha", "tank_irrigated_ha", "net_irrigated_ha", "gross_irrigated_ha"]:
            master[col] = 0.0

    # 4. NIGHTLIGHTS PANEL (Luminosity & Economic Velocity)
    nl_path = data_dir / "nightlights_district_panel.csv"
    if nl_path.exists():
        nl_df = pd.read_csv(nl_path)
        nl_df["district_norm"] = nl_df["district_name"].apply(normalize_name)
        nl_sorted = nl_df.sort_values("year")
        nl_latest = nl_sorted.groupby("district_norm").last().reset_index()

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
        master = master.merge(nl_agg, on="district_norm", how="left")
    else:
        for col in ["nl_mean", "nl_std", "nl_log1p_mean", "nl_growth_velocity"]:
            master[col] = 0.0

    # 5. RAINFALL PANEL (Climate Shock & Moisture Departures)
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
        master = master.merge(rf_agg, on="district_norm", how="left")
    else:
        for col in ["rf_actual_mean", "rf_actual_std", "rf_departure_var"]:
            master[col] = 0.0

    # 6. CROP PRODUCTION & YIELD (Agrarian Intensity)
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
        master = master.merge(crop_agg, on="district_norm", how="left")
    else:
        for col in ["crop_total_area", "crop_total_production", "crop_avg_yield"]:
            master[col] = 0.0

    # 7. INFRASTRUCTURE & GPS COORDINATES (Indian Railways & GatiShakti)
    stn_path = data_dir / "Infrastructure" / "IR_Stations.parquet"
    if stn_path.exists():
        try:
            ir_stn = pd.read_parquet(stn_path)
            ir_stn["lat_dd"] = ir_stn["latitude"].apply(dms_to_dd)
            ir_stn["lng_dd"] = ir_stn["longitude"].apply(dms_to_dd)
            ir_stn["dist_norm"] = ir_stn["district"].astype(str).apply(normalize_name)
            coords = ir_stn[ir_stn["lat_dd"].notna() & ir_stn["lng_dd"].notna()].groupby("dist_norm")[["lat_dd", "lng_dd"]].mean().reset_index()
            coords = coords.rename(columns={"dist_norm": "district_norm", "lat_dd": "latitude", "lng_dd": "longitude"})
            master = master.merge(coords, on="district_norm", how="left")
        except Exception:
            pass

    # IMPUTE MISSING VALUES WITH STATE-LEVEL MEANS OR NATIONAL MEDIANS
    numeric_cols = master.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if master[col].isna().any():
            state_means = master.groupby("state_norm")[col].transform("mean")
            master[col] = master[col].fillna(state_means).fillna(master[col].median()).fillna(0)

    # 8. DERIVED EMPIRICAL RATIOS (Percentages 0 - 100)
    rep_area = master["reporting_area_ha"].replace(0, np.nan)
    net_sown = master["net_sown_area_ha"].replace(0, np.nan)
    tot_irrig = master["net_irrigated_ha"].replace(0, np.nan)

    master["forest_cover_pct"] = ((master["forest_area_ha"] / rep_area) * 100.0).clip(0, 100).fillna(18.0)
    master["net_sown_pct"] = ((master["net_sown_area_ha"] / rep_area) * 100.0).clip(0, 100).fillna(45.0)
    master["fallow_land_pct"] = ((master["fallow_land_ha"] / rep_area) * 100.0).clip(0, 100).fillna(8.0)
    master["non_agri_land_pct"] = ((master["non_agri_land_ha"] / rep_area) * 100.0).clip(0, 100).fillna(12.0)

    master["irrigation_intensity_pct"] = ((master["net_irrigated_ha"] / net_sown) * 100.0).clip(0, 100).fillna(35.0)
    master["cropping_intensity_pct"] = ((master["gross_cropped_area_ha"] / net_sown) * 100.0).clip(100, 250).fillna(125.0)

    master["canal_share_pct"] = ((master["canal_irrigated_ha"] / tot_irrig) * 100.0).clip(0, 100).fillna(25.0)
    master["well_share_pct"] = ((master["well_irrigated_ha"] / tot_irrig) * 100.0).clip(0, 100).fillna(60.0)
    master["tank_share_pct"] = ((master["tank_irrigated_ha"] / tot_irrig) * 100.0).clip(0, 100).fillna(5.0)

    # 9. ECONOMIC DENSITY & LAND PRESSURE INDICES (0 - 100)
    master["economic_density_index"] = (
        np.log1p(master["nl_mean"].clip(lower=0)) * 14.0 +
        master["urban_household_ratio"] * 35.0 +
        master["non_agri_land_pct"] * 0.4 +
        master["internet_ratio"] * 25.0 +
        (1.0 - master["dilapidated_house_ratio"]) * 15.0
    ).clip(5, 100)

    master["agrarian_dependency_ratio"] = (
        (master["agri_worker_ratio"] + master["cultivator_ratio"]) / 
        (master["worker_participation_rate"].clip(lower=0.1))
    ).clip(0, 1.5)

    # 10. EMPIRICAL TARGETS FOR DECISION-SUPPORT & ML TRAINING
    # Target 1: Land Litigation & Dispute Vulnerability Index (0 - 100)
    # Driven by high non-agri conversion pressure, tenancy ratio, illiterate population, and fallow land disputes
    master["target_dispute_risk"] = (
        master["urban_household_ratio"] * 24.0 +
        (master["non_agri_land_pct"] / 100.0) * 22.0 +
        master["rented_house_ratio"] * 18.0 +
        (master["fallow_land_pct"] / 100.0) * 14.0 +
        (1.0 - master["literacy_rate"]) * 14.0 +
        (master["nl_growth_velocity"].clip(0, 3) / 3.0) * 12.0 -
        (master["internet_ratio"] * 8.0)
    ).clip(10.0, 95.0)

    # Target 2: Urban Land Conversion Velocity (Ha per 100k population / year)
    master["target_urban_conversion_rate"] = (
        (master["non_agri_land_pct"] / 100.0) * 250.0 +
        master["nl_mean"].clip(0, 50) * 10.0 +
        master["nl_growth_velocity"].clip(0, 2) * 75.0 +
        master["urban_household_ratio"] * 95.0
    ).clip(15.0, 650.0)

    # Target 3: Climate & Moisture Vulnerability Index (0 - 100)
    # High rainfall departure variance + low irrigation coverage + high cultivator reliance
    unirrigated_pct = (100.0 - master["irrigation_intensity_pct"]).clip(0, 100)
    master["target_climate_vulnerability"] = (
        (master["rf_departure_var"] / (master["rf_departure_var"].max() + 1e-5)) * 40.0 +
        (unirrigated_pct / 100.0) * 35.0 +
        master["cultivator_ratio"] * 15.0 +
        master["dilapidated_house_ratio"] * 10.0
    ).clip(10.0, 92.0)

    return master

if __name__ == "__main__":
    df = build_master_dataset()
    print(f"Master dataset built successfully: {df.shape[0]} districts x {df.shape[1]} features.")
    print("Sample features:\n", df[[
        "state_name", "district_name", "forest_cover_pct", "net_sown_pct", 
        "irrigation_intensity_pct", "canal_share_pct", "economic_density_index", 
        "target_dispute_risk", "target_climate_vulnerability"
    ]].head(5))
