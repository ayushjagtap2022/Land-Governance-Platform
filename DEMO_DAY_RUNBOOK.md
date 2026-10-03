# 🏆 SIH 26019: Demo-Day Presentation Runbook
**National Digital Platform for Land Governance — DoLR / NIC Demonstration Script**

---

## ⏱️ Pre-Demo Checklist (T-Minus 5 Minutes)

### 1. Wake Up the Serverless Database (Crucial!)
Neon PostgreSQL compute auto-suspends after 5 minutes of inactivity. Send a warmup request so the cold start (~3s) happens before the presentation begins:
```bash
# In PowerShell or Bash:
curl http://127.0.0.1:8000/api/v1/healthz
curl http://127.0.0.1:8000/api/v1/analytics/summary
```
Expected output: `{"status": "ok", "database": "connected"}`.

### 2. Verify Background Daemons
Ensure the FastAPI backend and Vite frontend are live:
```bash
# Check Backend:
curl http://127.0.0.1:8000/healthz

# Check Frontend:
curl http://localhost:3001
```

### 3. Pre-Open Browser Tabs
1. **Tab 1**: `http://localhost:3001/map` (Platform Home / GIS Map)
2. **Tab 2**: `http://localhost:3001/simulate` (Policy Simulation Engine)
3. **Tab 3**: `http://localhost:8000/docs` (FastAPI Swagger UI — Module 9)
4. **Tab 4**: Split Terminal ready for the 30-second Python SDK demo.

---

## 🎯 The 5-Minute Winning Pitch Flow

### Minute 0–1: Problem Statement & National GIS Spatial Layer
- **Action**: Open **Tab 1 (`/map`)**.
- **What to Say**:
  > *"Across India, land boundary disputes tie up ₹1.4 lakh crore in court litigation and delay major infrastructure projects by an average of 28 months. We built the National Land Governance Platform as an end-to-end operational operating system for the Department of Land Resources."*
- **Click Path**:
  1. Pan across the map showing **all 640 Indian districts** loaded natively.
  2. Toggle the **LULC Layer** (displaying the 1,313-feature GeoJSON).
  3. Click on **Pune, Maharashtra** (or any district card).
  4. Point to the real-time panel: Population, Agricultural Reliance, Urban Sprawl Velocity, and Composite Dispute Risk Index.

---

### Minute 1–2: Central Gazette Repository & Zero-Hallucination RAG
- **Action**: Click **Repository (`/repository`)** $\to$ **AI Assistant (`/assistant`)**.
- **What to Say**:
  > *"Officers and citizens often struggle with conflicting state tenancy codes and central circulars. Our platform indexes over 400 authentic statutory acts and uses a hybrid BM25 + Gemini pipeline with strict ungrounded inquiry refusal."*
- **Click Path**:
  1. Search for *"Model Land Leasing Act"* in the Repository. Show the instant filter by category (`Tenancy & Agriculture`).
  2. Switch to the **Assistant** tab. Type:
     > *"How does drone survey resolution work under SVAMITVA guidelines?"*
  3. Highlight the response with exact statutory page citations (`DOC-SVAMITVA-2024, Page 14`).
  4. *(Optional killer feature)*: Type *"What is the currency of Atlantis?"* Show that the AI returns `grounded=False` with an explicit administrative refusal, demonstrating **zero hallucination**.

---

### Minute 2–3: Macroeconomic Policy Simulation & RF Tree-Spread
- **Action**: Open **Tab 2 (`/simulate`)**.
- **What to Say**:
  > *"Before enacting a notification, state revenue secretaries need to stress-test policy shocks. Our simulation pairs calibrated multivariable domain equations with an active 120-tree Random Forest Regressor trained across all 640 districts."*
- **Click Path**:
  1. Click the preset **"Model Land Leasing Act, 2016"**.
  2. Adjust the sliders:
     - Modernization Budget: `₹160 Cr`
     - Fast-Track Court Window: `100 days` (or Fast-Track Benches: `10`)
  3. Click **"Evaluate Policy Shock & Trajectories"**.
  4. Walk through the results:
     - **Dispute Rate**: `38.2%` $\to$ `35.7%` (Delta `-2.5%`).
     - **Ensemble Spread**: Point to `± 4.81% (RF 120-Tree Spread)`.
     - **Trajectory Chart**: Point to the 8-year temporal projection curves (2020–2027).
     - **Explainability**: Point to the feature attribution tags derived from Census indicators.

---

### Minute 3–4: Live Python SDK Terminal Rehearsal
- **Action**: Bring up the terminal.
- **Run Scenario 1 (Online Simulation)**:
  ```bash
  python -c "
  from land_governance_sdk import LandGovernanceClient
  client = LandGovernanceClient(base_url='http://127.0.0.1:8000/api/v1')
  sim = client.simulate.run(policy_variable='digital_cadastre', target_value=90.0, investment_cr=150.0)
  print('Source:', sim.source, '| Model:', sim.model_version)
  print('Dispute Reduction:', sim.summary.dispute_reduction_pct, '%')
  print('Ensemble Range:', sim.summary.confidence_range)
  "
  ```
- **Run Scenario 2 (Offline-First Resilience)**:
  ```bash
  # Force offline mode — runs instantaneously with zero network dependencies:
  python -c "
  from land_governance_sdk import LandGovernanceClient
  client = LandGovernanceClient(offline=True)
  dists = client.geodata.get_districts()
  print('Offline Districts Count:', len(dists.districts), '| Tagged Source:', dists.source)
  "
  ```
- **Run Scenario 3 (Scenario A vs B Comparator)**:
  ```bash
  python -c "
  from land_governance_sdk import LandGovernanceClient
  client = LandGovernanceClient(offline=True)
  s1 = client.simulate.run(policy_variable='digital_cadastre', target_value=75.0)
  s2 = client.simulate.run(policy_variable='digital_cadastre', target_value=95.0)
  cmp = client.simulate.compare(s1, s2)
  print('Recommendation:', cmp.winner)
  "
  ```

---

### Minute 4–5: Module 9 Enterprise Security & Webhooks
- **Action**: Open **Tab 3 (`http://127.0.0.1:8000/docs`)**.
- **What to Say**:
  > *"For inter-departmental integration, Module 9 delivers complete enterprise API lifecycle management with rate-limiting, SSRF-protected webhooks, and hashed API keys."*
- **Walkthrough**:
  1. Highlight rate-limiting response headers: `X-RateLimit-Limit: 600`, `X-RateLimit-Remaining`.
  2. Point to `/api/v1/webhooks/subscribe` and explain SSRF protection: loopback (`127.0.0.1`), link-local (`169.254.169.254`), and private subnets are blocked.
  3. Show `/api/v1/webhooks/api-keys/generate`: raw keys are returned once and stored strictly as SHA-256 hashes.

---

## 🛡️ Judge Defense Cheat Sheet (What to Say When Asked Hard Questions)

| Question / Situation | Recommended Response |
|---|---|
| **"Why is the confidence range lower bound 0.0%?"** | *"The ensemble spread uses the empirical variance across all 120 decision trees specifically for the counterfactual policy reduction. A lower bound of 0.0% honestly reflects that under this specific shock magnitude, the tree ensemble cannot rule out a null net effect. We intentionally avoid inflating artificial precision."* |
| **"Is the fast-track court acceleration legally mandated by the Law Commission?"** | *"No. Fast-track court acceleration is structured explicitly as an illustrative capacity modeling assumption parameterized with diminishing returns. The coefficient is an adjustable user parameter rather than an empirical claim."* |
| **"Are the dispute numbers actual court cases?"** | *"No. Because district-level revenue litigation registries are not published openly, dispute risk is formulated as a calibrated composite proxy vulnerability index (0–100) combining Census 2011 agrarian indicators, VIIRS nightlight radiance, and IMD rainfall panels."* |
| **"The database took 3 seconds on the first call!"** | *"Our architecture uses serverless scale-to-zero PostgreSQL on Neon to ensure zero ongoing cloud compute expenditure when idle—a critical design choice for state and district-level budget efficiency."* |
| **"What if the internet cuts out during the demo?"** | *"The platform features dual-engine offline capability. The Python SDK, TypeScript SDK, and core modules seamlessly operate with `offline=True` using cached local baselines without raising unhandled exceptions."* |
