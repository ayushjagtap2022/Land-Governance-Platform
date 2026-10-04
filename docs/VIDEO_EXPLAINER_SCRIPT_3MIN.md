# ⚡ 3-Minute Defensible Pitch: National Digital Platform for Land Governance
## Grounded Video Walkthrough Script (SIH PS 26019)

**Persona Journey:** A State Revenue Secretary evaluating a land policy intervention  
**Target Duration:** Under 3:00 minutes (Spoken Word Count: ~350 words @ ~130 wpm = ~2:40 min + pauses)  
**Tone:** Confident, grounded, transparent, technically defensible  

---

## ⏱️ Master 3-Minute Timeline

```
[0:00 - 0:25] The Crisis & The Official's Task  ──▶ 66% civil disputes (Daksh 2016); need for evidence-based policy
[0:25 - 0:55] Step 1: Grounded Statutory Search ──▶ Indexed gazettes, source citations, off-topic GST refusal
[0:55 - 1:15] Step 2: District Spatial Audit    ──▶ 640 districts (Census 2011 boundaries), Pune intelligence drawer
[1:15 - 2:00] Step 3: Flagship Policy Simulator ──▶ 4 levers, 8-yr trajectory, 120-tree spread on composite proxy index
[2:00 - 2:20] Step 4: Collaboration & Real RBAC ──▶ Workspace Kanban; real backend HTTP 403 on admin endpoint
[2:20 - 2:45] Step 5: Data Pipeline via SDK     ──▶ Offline sample demo (24.9% delta), route coverage guardrail
[2:45 - 2:55] Closing & Realistic Roadmap       ──▶ Working prototype designed for deployment on NIC MeghRaj
```

---

## 🎬 Scene-by-Scene Action & Spoken Narration

---

### [0:00 – 0:25] SCENE 1: The Problem & The Official's Mandate
**Visual:** Full screen on [`Landing Page`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/landing-page.tsx). Smooth scroll over national context cards.  
**Lower-Third:** `🏛️ SIH PS 26019: Department of Land Resources (DoLR) | Ministry of Rural Development`  
**On-Screen Citation Tag:** `*Data Context: Daksh Access to Justice Survey (2016)`

> **Spoken Narration (34 words | ~15s):**  
> *"Land boundary disputes account for sixty-six percent of all civil court cases in India according to the Daksh Access to Justice Survey.  
> Imagine you are a state revenue secretary preparing a new land-leasing policy."*

---

### [0:25 – 0:55] SCENE 2: Step 1 — Grounded Statutory Search & The Refusal Test
**Visual:**  
1. Open [`/repository`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/repository-page.tsx): Show indexed circulars and acts with category filters.  
2. Switch to [`/assistant`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/assistant-page.tsx): Submit query: *"How does drone survey resolution work under SVAMITVA guidelines?"*  
   - Highlight citation badge on screen: `[DoLR-2024-DOC-108, Page 14]` and click to show the excerpt.  
3. Submit off-topic query: *"What is the GST rate on gold?"*  
   - Show instant refusal badge: `grounded=False` with no citations.  
**Lower-Third:** `Module 2 & 3: Keyword Search + Hindi Terms | Verified Document Citations | Out-of-Domain Refusal`

> **Spoken Narration (59 words | ~27s):**  
> *"First, you check statutory precedents in our repository of indexed circulars and acts.  
> Our AI assistant uses keyword retrieval with Hindi term expansion to answer policy queries, and every finding cites its source document, such as the SVAMITVA guidelines.  
> Ask it an off-topic question like the GST rate on gold, and it refuses because no matching land record exists."*

---

### [0:55 – 1:15] SCENE 3: Step 2 — Spatial Baseline Audit Across 640 Districts
**Visual:** Switch to [`/map`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/map-page.tsx). Pan across India. Toggle **1,313-feature LULC GeoJSON overlay**. Click on **Pune District** to slide open the district intelligence drawer.  
**Lower-Third:** `Module 5: 640 Districts (Census 2011 Boundaries) | VIIRS Nightlights + LULC GeoJSON`

> **Spoken Narration (47 words | ~21s):**  
> *"Next, you evaluate your jurisdiction on the GIS map.  
> The platform integrates Census 2011 indicators across six hundred and forty districts with NASA-NOAA nightlights radiance and land-use GeoJSON layers.  
> Clicking Pune reveals agricultural reliance, urbanization velocity, and a composite dispute risk score, providing an empirical baseline before changing any rule."*

---

### [1:15 – 2:00] SCENE 4: Step 3 — Flagship Policy Simulation & Decision Variance ⭐
**Visual:** Open [`/simulate`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/simulate-page.tsx). Select Maharashtra. Click preset **"Model Land Leasing Act, 2016"** (sets Ceiling: 65 acres, Tax: 4.5%, Budget: ₹180 Cr, Window: 90 days). Click **"Evaluate Policy Shock"**.  
- Point cursor to dispute delta (`-3.5%`).  
- Point cursor to ensemble dispersion: `± 3.99% (RF 120-Tree Spread)`.  
- Scroll down to show the **8-Year Temporal Trajectory Curve (2020–2027)**.  
**Lower-Third:** `Module 7: Hybrid Econometric & 120-Tree Random Forest Model | 8-Year Trajectory`  
**On-Screen Disclosure Tag:** `*Dispute risk is a composite proxy index (0–100) based on Census & spatial indicators`

> **Spoken Narration (93 words | ~42s):**  
> *"Now the centerpiece: Module 7, the Policy Simulator.  
> You configure four levers: land ceiling, conversion tax, survey budget, and court window.  
> Applying the Model Land Leasing preset, our hybrid engine projects an eight-year counterfactual trajectory.  
> Notice the decision-support range: plus or minus three point nine-nine percent.  
> Because district court registries aren't open data, this models a composite proxy vulnerability index, and the range reflects empirical disagreement across all one hundred and twenty decision trees.  
> Where it clips at zero, it transparently shows the ensemble cannot rule out a null effect."*

---

### [2:00 – 2:20] SCENE 5: Step 4 — Workspaces & Real Backend RBAC
**Visual:**  
1. 2-second cut to [`/workspaces`](file:///c:/Nirmal/Projects/Land-Governance-Platform/apps/frontend/src/pages/workspaces-page.tsx) showing collaborative Kanban board.  
2. Quick cut to terminal or Network tab: Run an unauthorized call with a Public token hitting `/api/v1/admin/users`:  
   ```bash
   # Terminal command:
   curl -s -H "Authorization: Bearer <public_token>" http://127.0.0.1:8000/api/v1/admin/users
   ```  
   Show response: `HTTP 403 Forbidden` (`{"detail": "Forbidden: Requires super_admin role"}`).  
**Lower-Third:** `Modules 1, 4 & 10: Shared Kanban Workspaces | Real Backend 403 RBAC Enforcement`

> **Spoken Narration (48 words | ~22s):**  
> *"Teams coordinate in shared workspaces with Kanban task boards.  
> Role-based access is enforced on the backend: roles are suggested by email domain with formal verification as the next step.  
> An unprivileged user token hitting an administrative endpoint receives an immediate HTTP four-oh-three Forbidden, logged in the platform audit trail."*

---

### [2:20 – 2:45] SCENE 6: Step 5 — Data Pipeline & Offline SDK Resilience
**Visual:** Switch to split-screen terminal in `apps/python-sdk`.  
Paste and run the verified command:
```bash
python -c "from land_governance_sdk import create_client; c = create_client(offline=True); s = c.simulation.run('digital_cadastre', 90.0, 150.0); print(f'Offline Approx Delta: {s.summary.dispute_reduction_pct}% | Range: {s.summary.confidence_range} | Source: {s.source}')"
```
Terminal stdout matches precisely:  
`Offline Approx Delta: 24.9% | Range: [21.7, 28.1] | Source: offline`  
Run `.venv\Scripts\pytest tests -v` (showing 22 passed with live backend).  
**Lower-Third:** `Module 9: Python SDK | 100% Offline Sample Engine | 22/22 Passing Tests (Route Coverage Guardrail)`

> **Spoken Narration (48 words | ~22s):**  
> *"Your data analytics team then pulls this data directly via our Python SDK.  
> If network connectivity drops in a remote revenue office, the SDK runs on local sample data with zero network calls, producing an illustrative twenty-four point nine percent reduction output.  
> Automated route coverage tests guard against API drift."*

---

### [2:45 – 2:55] SCENE 7: Realistic Conclusion
**Visual:** Cut back to Landing Page hero banner with GitHub URL: `ayushjagtap2022/Land-Governance-Platform`.  
**Lower-Third:** `🏛️ SIH 26019: A Working Prototype Designed for Deployment on NIC MeghRaj`

> **Spoken Narration (21 words | ~9s):**  
> *"The National Digital Platform for Land Governance is an honest, working prototype designed to be deployable on NIC MeghRaj cloud infrastructure. Thank you."*

---

## 📊 Word Count & Timing Verification

| Section | Words | Target Speaking Time | Cumulative Time |
|---|---|---|---|
| 1. Problem & Persona Mandate | 34 | 15s | 0:15 |
| 2. Statutory Search & GST Refusal | 59 | 27s | 0:42 |
| 3. GIS Map (640 Districts) | 47 | 21s | 1:03 |
| 4. Policy Simulator & 120 Trees | 93 | 42s | 1:45 |
| 5. Workspaces & Backend 403 RBAC | 48 | 22s | 2:07 |
| 6. Python SDK Offline Terminal | 48 | 22s | 2:29 |
| 7. Conclusion & MeghRaj Design | 21 | 9s | **2:38 – 2:45** |
| **Total** | **350 words** | **~158s** | **Comfortably under 3:00 min** |

---

## 🎯 Verified Numbers & Facts Cheatsheet for Judges

| Item | Script Claim | Ground Truth / System Evidence |
|---|---|---|
| **Opening Stat** | 66% civil disputes | Cited explicitly to *Daksh Access to Justice Survey (2016)* (unverified 28-month stat dropped) |
| **District Count** | 640 districts | Stated as *"as per Census 2011 boundaries"* |
| **Citation Format** | `[DoLR-2024-DOC-108, Page 14]` | Live output of `/api/v1/ai/assistant/chat`, excerpt displayed |
| **AI Refusal** | Refuses on "GST rate on gold" | Verified live: returns `grounded=False, citations=[]` |
| **Simulation Levers** | 4 inputs (Ceiling, Tax, Budget, Window) | Live on `/simulate` and `simulation_service.py` |
| **Decision Range** | `± 3.99% (RF 120-Tree Spread)` | Variance across 120 estimator trees in `MOD-DISPUTE-RF-01` |
| **Dispute Risk Metric** | Composite proxy index (0–100) | Census 2011 + VIIRS nightlights + IMD rainfall panel |
| **RBAC Enforcement** | Real backend 403 on admin routes | Verified live: `GET /api/v1/admin/users` with citizen token returns `403 Forbidden` |
| **Offline SDK Output** | `24.9% | Range: [21.7, 28.1] | Source: offline` | Verified live output, stated as *"illustrative sample output on local demo data"* |
| **SDK Test Suite** | 22 passed (with live backend) | Verified via `.venv/Scripts/pytest tests -v` (route coverage tests) |
| **Cloud Deployment** | Designed to be deployable on NIC MeghRaj | Honest framing reflecting current prototype status |
