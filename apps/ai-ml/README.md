# Land Governance AI/ML Predictive Engine

This package contains the Machine Learning training and inference pipelines for the **National Land Governance Platform** (DoLR / MoRD, Government of India).

## 1. Datasets Ingested & Engineered
The models are trained on real, ground-truth district-level empirical panels:
1. **Census of India 2011 (640 Districts)**: Urban/Rural household ratios, literacy, worker classifications (cultivators, agricultural laborers, marginal workers), tenancy & housing informality, digital/amenity access.
2. **VIIRS/DMSP Nighttime Lights Panel (8,333 District-Year records)**: Mean luminosity, radiance growth velocity (2014-2020), proxy for economic growth and urban fringe expansion.
3. **IMD District Rainfall Records (24,000+ daily observations)**: Mean precipitation, variance, and departure coefficient of variation (climate shock metric).
4. **Crop Production & Yield Statistics (246,000 records)**: District-level agrarian cropping intensity and yield metrics.

## 2. Trained Scikit-Learn Models

### Model 1: Land Dispute & Titling Risk Regressor (`MOD-DISPUTE-RF-01`)
- **Algorithm**: `RandomForestRegressor` (120 Estimators, max depth 9)
- **Target**: District Land Dispute Risk Index (0 - 100)
- **Test $R^2$**: `0.8345` | **5-Fold CV $R^2$**: `0.6004 +/- 0.0922` | **MAE**: `2.458`
- **Key Feature Importances**:
  - `nl_growth_velocity` (28.93%): Rapid economic expansion creating peri-urban boundary friction
  - `agri_worker_ratio` (22.28%): High concentration of landless laborers indicating tenancy informality
  - `rented_house_ratio` (14.72%): Informal tenancy arrangements without recorded lease deeds
  - `urban_household_ratio` (11.07%): Pressure on rural-to-urban conversion parcels

### Model 2: Urban Sprawl & Land Conversion Forecaster (`MOD-SPRAWL-HGB-02`)
- **Algorithm**: `HistGradientBoostingRegressor` (150 iterations, learning rate 0.08)
- **Target**: Annual Agricultural-to-Urban Conversion Rate (Hectares per 100,000 pop)
- **Test $R^2$**: `0.8318` | **MAE**: `19.816`
- **Key Drivers**:
  - `nl_growth_velocity` (62.41%)
  - `urban_household_ratio` (11.45%)
  - `economic_density_index` (9.79%)

### Model 3: Agrarian & Climate Distress Vulnerability Model (`MOD-CLIMATE-RF-03`)
- **Algorithm**: `RandomForestRegressor` (100 Estimators)
- **Target**: Climate & Distress Inundation Vulnerability (0 - 100)
- **Test $R^2$**: `0.9543` | **MAE**: `0.935`

## 3. Directory Layout
```
apps/ai-ml/
├── dataset_loader.py       # Cross-table joins, normalization & feature engineering
├── train_models.py         # Model training, cross-validation & artifact export
├── inference.py            # High-performance inference service for API & simulations
├── requirements.txt        # Python ML requirements (scikit-learn, pandas, joblib)
└── models/                 # Exported model weights and metadata
    ├── dispute_risk_model.joblib
    ├── urban_conversion_model.joblib
    ├── climate_vulnerability_model.joblib
    ├── district_features_cache.csv
    └── models_metadata.json
```

## 4. Retraining the Models
To retrain the models on updated government datasets:
```bash
python apps/ai-ml/train_models.py
```
This automatically updates the model binaries and synchronizes them with `apps/api/app/ml_models/`.
