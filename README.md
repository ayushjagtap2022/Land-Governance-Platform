# 🏛️ National Digital Platform for Land Governance

**SIH Problem Statement 26019** | Ministry of Rural Development | Department of Land Resources (DoLR)

A unified national research-and-policy ecosystem for land governance — integrating a centralized knowledge repository, AI-assisted policy synthesis, GIS geospatial visualization, empirical analytics dashboards, what-if policy simulation, collaborative workspaces, and an innovation challenges portal, protected under role-based access control (RBAC).

---

## 📦 Monorepo Architecture

```
Land-Governance-Platform/
├── apps/
│   ├── api/                       # Live FastAPI backend (Python 3.12, SQLModel, PostgreSQL + pgvector)
│   ├── frontend/                  # React + Vite + TailwindCSS frontend (Port 5173 / 3000)
│   ├── ai-ml/                     # Trained Scikit-Learn models, training pipelines & district caches
│   ├── python-sdk/                # Official Python SDK (`land-governance-sdk`) with offline demo engine
│   └── sdk/                       # Official TypeScript/JavaScript SDK (`land-governance-sdk`)
├── Land Governance Platform Datasets/ # Real Census 2011 (640 districts), Nightlights & Rainfall panels
├── tests/
│   └── fixtures/                  # Canonical golden test vectors (simulation_golden_vectors.json, openapi.json)
├── PROJECT_STATE_REPORT.md        # Comprehensive evidence-based system audit report
└── package.json                   # Root monorepo configuration
```

---

## 🚀 Quick Start

### 1. Backend (FastAPI + PostgreSQL)
```bash
# Navigate to API directory
cd apps/api

# Create & activate virtual environment (optional if using global Python 3.12)
python -m venv .venv
.venv\Scripts\activate   # Windows (or source .venv/bin/activate on Linux/macOS)

# Install dependencies
pip install -r requirements.txt

# Start FastAPI development server (port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`
* Health Check: `http://127.0.0.1:8000/healthz`

### 2. Frontend (React + Vite)
```bash
# Navigate to frontend directory
cd apps/frontend

# Install dependencies & start dev server
npm install
npm run dev
```
* Web Application: `http://localhost:5173`

### 3. Testing the SDKs
```bash
# Python SDK Test Suite (16 unit, fallback & golden vector tests)
cd apps/python-sdk
pytest tests -v

# TypeScript SDK Test Suite (11 parity & network fallback tests)
cd apps/sdk
npm test
```

---

## 🧩 SIH 26019 Module Implementation Status

| # | Module | Core Implementation | Interface / Route | Status |
|---|--------|---------------------|-------------------|--------|
| 1 | **Auth & RBAC** | JWT (HS256), bcrypt password hashing, role permissions (`Researcher`, `Official`, `Admin`, `Public`) | `/api/v1/auth/*` | ✅ Functional (OTP/SSO hooks) |
| 2 | **Knowledge Repository** | Multi-faceted search, document metadata, OCR text extraction, PostgreSQL storage | `/api/v1/repository/*` | ✅ Functional |
| 3 | **AI Policy Assistant** | Multilingual Hindi term expansion + BM25 retrieval; Gemini API RAG pipeline with strict ungrounded refusal | `/api/v1/assistant/*` | ✅ Functional |
| 4 | **Collaborative Workspaces** | Workspace CRUD, role-based member assignment, task tracking, real-time WebSockets | `/api/v1/workspaces/*` | ✅ Functional |
| 5 | **GIS & Geospatial** | 640 Indian districts with coordinates & Census indicators; 1,313-feature LULC GeoJSON; WMS layers | `/api/v1/geodata/*` | ✅ Functional |
| 6 | **Analytics Dashboards** | State comparative analysis, 5-axis climate resilience radar, 25-year land-use trends (38 states/UTs) | `/api/v1/analytics/*` | ✅ Functional |
| 7 | **Policy Simulation** ⭐ | Macroeconomic lever simulation (Ceiling, Conversion Tax, Survey Budget, Fast-Track Court Window); 8-year trajectories | `/api/v1/simulate/*` | ✅ Functional |
| 8 | **Innovation Portal** | Hackathon/grant challenges, proposal submissions with PDF attachments, public voting | `/api/v1/innovation/*` | ✅ Functional |
| 9 | **API & Integration Layer** | Public REST API, OpenAPI 3.1 schema specification, Python & TypeScript SDKs | `/api/v1/*`, `/docs` | ✅ Functional |
| 10 | **Admin & Platform Mgmt** | User approval/verification, content moderation, tamper-evident audit logging | `/api/v1/admin/*` | ✅ Functional |
| 11 | **Notifications & Alerts** | In-app notification center, real-time WebSocket push broadcasting | `/api/v1/notifications/*` | ✅ Functional |

---

## 🔬 Predictive Machine Learning & Simulation Architecture

The platform's analytical engine pairs empirical statistical calibration with machine learning inference:

1. **Hybrid Policy Simulation Engine (`v1.2_hybrid_rf_linear`)**:
   - Computes policy shock projections via econometric domain equations calibrated against Census 2011, VIIRS nightlight radiance, and IMD rainfall statistics.
   - Outputs dynamic decision-support dispersion ranges derived from the spread of 120 estimator trees in the trained Random Forest model.
2. **Dispute Vulnerability Model (`MOD-DISPUTE-RF-01`)**:
   - `RandomForestRegressor` (120 Trees) trained on 640 Indian districts to predict a composite land dispute vulnerability index (0–100) based on agricultural workforce ratios, economic density, and cadastral coverage.
3. **Urban Sprawl & Conversion Forecaster (`MOD-SPRAWL-HGB-02`)**:
   - `HistGradientBoostingRegressor` predicting agricultural-to-urban parcel conversion velocity per 100k population.
4. **Agrarian Climate Vulnerability Model (`MOD-CLIMATE-RF-03`)**:
   - Estimates agrarian distress vulnerability index where irrigation intensity and canal/well infrastructure serve as primary buffering factors.

---

## 🛠️ Technology Stack

* **Backend**: FastAPI, SQLModel, Pydantic v2, PostgreSQL (Neon / Supabase), pgvector, Alembic, Uvicorn
* **Frontend**: React 18, Vite, TailwindCSS, Radix UI primitives, Lucide Icons, Leaflet GIS
* **AI / ML**: Scikit-Learn (Joblib models), Pandas, NumPy, Google GenAI SDK (Gemini)
* **SDKs**: Python 3.10+ (httpx, pydantic), TypeScript / JavaScript (ES2022, zero external runtime dependencies)

---

## 📜 Architectural Disclosures & Operational Notes

- **Simulation Ranges**: The simulation engine outputs decision-support dispersion intervals (derived from ensemble tree spreads or sensitivity elasticities), intended for cabinet and policy deliberations rather than definitive parametric forecasts.
- **RAG Policy Refusal**: When no verified circular or act in the knowledge repository matches an inquiry, the AI assistant strictly refuses to speculate (`grounded=False`) in accordance with civil-service policy guidelines.
- **Enterprise Hooks**: Password reset via SMTP and Government SSO (DigiLocker / Jan Parichay) are implemented as architectural endpoints (returning HTTP 501 in demo deployments) designed for seamless enterprise identity hookup.

---

## ⚖️ License

MIT License. Designed and developed for the Ministry of Rural Development / DoLR (SIH PS 26019).
