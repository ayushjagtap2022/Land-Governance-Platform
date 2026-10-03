# Official Python SDK: `land_governance_sdk`

**National Digital Platform for Land Governance (SIH PS 26019)**  
Official Python Client Library for DoLR Officers, Data Scientists, Policy Analysts, and Hackathon Judges.

---

## 🌟 Key Features

- **Dual Execution Engine (Online + Explicit Offline)**:
  - **Online Mode (Default)**: Connects over HTTP/JSON to the Python FastAPI backend server (`http://127.0.0.1:8000/api/v1`).
  - **Explicit Offline Mode (`offline=True`)**: Operates 100% offline with zero network requests using sample baseline datasets and deterministic policy simulation math.
  - **Opt-in Fallback (`fallback_to_offline=True`)**: Falls back to offline datasets **only** on network connection errors, timeouts, or 5xx server crashes. Emits an explicit warning and tags responses with `source: "offline"`.
  - **Strict Error Handling**: HTTP 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), and 429 (Rate Limited) errors **always raise `LandGovernanceApiError`** and never fall back silently.
  - **Write Operation Protection**: Write calls (`submit_proposal()`, `upload()`, `register()`) raise `LandGovernanceOfflineError` when offline.
- **Sample Offline Dataset Disclosure**:
  - The offline engine includes a 5-district sample baseline dataset (Pune, Mumbai Suburban, Nagpur, Nashik, Chhatrapati Sambhajinagar) for offline demos and testing. Live API requests access the full database.
- **Decision-Support Range & Hybrid Engine Disclosure**:
  - **Offline mode** (`offline_approx_v1`): Deterministic demo approximation computed from baseline variance scaling for offline rehearsals.
  - **Live mode** (`v1.2_hybrid_rf_linear`): Combines multivariable domain econometric equations (calibrated against Census 2011, VIIRS nightlights, and IMD rainfall) with an active 120-tree Random Forest Regressor (`MOD-DISPUTE-RF-01`).
  - **`confidence_range`**: Decision-support dispersion indicator (derived from the empirical spread across all 120 estimator trees in live mode, or heuristic sensitivity spread in offline mode). *Note: This is an empirical dispersion index for cabinet deliberations, not a parametric statistical confidence interval.*
- **Native Pandas Integration**:
  - Call `.to_dataframe()` on GIS district queries, policy document searches, and simulation trajectories.
- **11 Specialized Modules + Aliases**:
  - `client.documents` (Repository), `client.ai` (RAG Assistant), `client.gis` (Geodata), `client.simulation` (Policy Simulation), `client.ml`, `client.auth`, `client.analytics`, `client.innovation`, `client.workspaces`, `client.admin`, `client.health`.
- **Policy Scenario Side-by-Side Comparison**:
  - `client.simulation.compare(scenario_a, scenario_b)` for side-by-side policy trade-off evaluation.

---

## 🚀 Installation

```bash
# Basic Installation
pip install land-governance-sdk

# Installation with Pandas Dataframe support
pip install land-governance-sdk[pandas]

# Local Monorepo Editable Installation
pip install -e apps/python-sdk[pandas]
```

---

## 💡 Quickstart Example

```python
from land_governance_sdk import create_client

# 1. Initialize Client
client = create_client(
    base_url="http://127.0.0.1:8000/api/v1",
    fallback_to_offline=True  # Opt-in to fallback on connection failures/5xx
)

# 2. Search Policy Documents
docs = client.documents.search(query="drone survey", state="Maharashtra")
print(f"Found {docs.count} guidelines: {docs.documents[0].title}")

# 3. Query District GIS Indicators & Convert to Pandas DataFrame
df_districts = client.gis.get_districts(state="Maharashtra").to_dataframe()
print(df_districts[["district", "dispute_risk", "modernization_index"]].head())
print("DataFrame Data Source:", df_districts.attrs.get("source"))

# 4. Run Policy Shock Simulation
sim = client.simulation.run(
    policy_variable="digital_cadastre",
    target_value=85.0,
    investment_cr=150.0,
    state="Maharashtra"
)
print(f"Litigation Savings: Rs.{sim.summary.projected_litigation_savings_cr} Cr")
print(f"Estimated Range (Decision-Support Estimate): {sim.summary.confidence_range}")

# 5. Compare Scenarios Side-by-Side
scen_a = client.simulation.run(policy_variable="digital_cadastre", target_value=60.0, investment_cr=50.0)
scen_b = client.simulation.run(policy_variable="digital_cadastre", target_value=95.0, investment_cr=250.0)
cmp = client.simulation.compare(scen_a, scen_b)
print(f"Scenario Comparison Winner: {cmp.winner}")
```

---

## 🔬 Testing

Run the test suite with `pytest`:

```bash
pytest -v
```

---

## 📄 License

MIT License © 2026 Land Governance Platform Team (SIH PS 26019).

