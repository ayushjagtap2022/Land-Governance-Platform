# National Digital Platform for Land Governance (SIH 26019)
## Comprehensive System Context, Architecture & Graph Topology

**Target Problem**: Smart India Hackathon (SIH) 26019 — National Digital Platform for Land Governance  
**Stakeholder**: Department of Land Resources (DoLR), Ministry of Rural Development, Government of India  
**Lead Contributor & Scope**: Nirmal (Modules 2, 3, and 7)  
**Active Project Path**: `C:\Nirmal\Projects\Land-Governance-Platform`  
**Active Git Branch**: `main`  
**Generated At**: 2026-10-04 IST  

---

## 1. System Topology & Architecture Graph

```mermaid
graph TD
    subgraph Client_Layer ["Client Layer (React 18 + Vite + Tailwind)"]
        UI_Sim["/simulate<br/>Policy Simulation Dashboard<br/>(Recharts, Sliders, 95% CI)"]
        UI_RAG["/assistant<br/>Conversational RAG Assistant<br/>(Strict Statutory Citations)"]
        UI_Syn["/synthesis<br/>Policy Synthesis Matrix<br/>(Multi-Doc Reconciliation)"]
        UI_Repo["/repository<br/>Knowledge Repository<br/>(Multimodal OCR Ingestion)"]
    end

    subgraph API_Gateway ["FastAPI Application Gateway (Port 8000)"]
        R_Sim["/api/v1/simulate/forecast<br/>Multivariate Linear & Spline Regression"]
        R_RAG["/api/v1/assistant/chat<br/>Grounded Policy Q&A Engine"]
        R_Syn["/api/v1/synthesis/compare<br/>Cross-Act Conflict Detector"]
        R_Repo["/api/v1/repository/documents<br/>Vector Indexing & Document Retrieval"]
        R_OCR["/api/v1/repository/upload<br/>Multimodal Vision Ingestion"]
    end

    subgraph Service_Core ["Core Service Logic Layer"]
        S_Sim["SimulationService<br/>- 8-Year Forecast (2020-2027)<br/>- Elasticity & Sensitivity Engine<br/>- 95% Confidence Bounds"]
        S_RAG["RAGService<br/>- Cosine Similarity Matching<br/>- Strict Zero-Hallucination Prompt<br/>- Page & Circular Citations"]
        S_Syn["SynthesisService<br/>- Objective Reconciliation<br/>- Statutory Conflict Detection<br/>- DoLR Recommendations"]
        S_OCR["OCRService<br/>- Gemini 3 Flash Vision<br/>- 1024-dim Vector Normalization<br/>- Metadata Extraction"]
    end

    subgraph Data_AI_Infrastructure ["Data Persistence & AI Services"]
        NeonDB[("Neon Serverless PostgreSQL<br/>- pgvector (1024 dimensions)<br/>- PostGIS Geometry(4326)<br/>- Document & Chunk Store")]
        UpstashRedis[("Upstash Redis Cache<br/>- Rate Limiting<br/>- Session Token Management")]
        GeminiAPI["Google Gemini AI API<br/>Model: gemini-3-flash-preview<br/>- Multimodal Vision OCR<br/>- Grounded Policy Generation"]
    end

    UI_Sim -->|"HTTP POST /forecast"| R_Sim
    UI_RAG -->|"HTTP POST /chat"| R_RAG
    UI_Syn -->|"HTTP POST /compare"| R_Syn
    UI_Repo -->|"HTTP GET /documents"| R_Repo
    UI_Repo -->|"HTTP POST /upload"| R_OCR

    R_Sim --> S_Sim
    R_RAG --> S_RAG
    R_Syn --> S_Syn
    R_Repo --> S_OCR
    R_OCR --> S_OCR

    S_RAG -->|"Async Stream Prompt"| GeminiAPI
    S_OCR -->|"Vision Bytes"| GeminiAPI
    S_OCR -->|"Persist SQLModel"| NeonDB
    S_RAG -->|"Vector Search"| NeonDB
    R_Sim -.->|"Session Check"| UpstashRedis
```

---

## 2. Policy Simulation Engine Graph (Module 7 ⭐)

The Policy Simulation Engine models the non-linear relationship between administrative investments and land governance health metrics.

```mermaid
flowchart LR
    subgraph Inputs ["Policy Levers (User Configurable)"]
        L1["Dispute Resolution Budget (₹ Cr)<br/>Baseline: ₹50 Cr"]
        L2["Cadastral Digitization Rate (%)<br/>Baseline: 65%"]
        L3["Drone Survey Coverage (%)<br/>Baseline: 40%"]
        L4["Grievance Redressal Speed (Days)<br/>Baseline: 45 Days"]
    end

    subgraph Engine ["Simulation Core (simulation_service.py)"]
        M1["Multivariate Regression Matrix<br/>β_budget = -0.42, β_digitize = -0.31<br/>β_drone = -0.28, β_grievance = +0.19"]
        M2["Dynamic Sensitivity Engine<br/>Elasticity e = (%Δ Output) / (%Δ Input)"]
        M3["Ensemble Spread Generator<br/>RF 120-Tree Empirical Dispersion"]
    end

    subgraph Outputs ["8-Year Trajectory (2020 - 2027)"]
        O1["Pending Revenue Litigation (Cases)<br/>Projected reduction: -38%"]
        O2["Mutation Turnaround Time (Days)<br/>Projected reduction: 45d ➔ 6d"]
        O3["Composite Title Clarity Index (%)<br/>Projected improvement: 58% ➔ 92%"]
        O4["Top Driver Attribution<br/>'Cadastral Digitization (+42% Impact)'"]
    end

    L1 --> Engine
    L2 --> Engine
    L3 --> Engine
    L4 --> Engine

    M1 --> M2 --> M3
    M3 --> O1
    M3 --> O2
    M3 --> O3
    M3 --> O4
```

---

## 3. Grounded RAG & Synthesis Pipeline Graph (Module 3)

Ensures zero-hallucination statutory verification for Department of Land Resources officers.

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Land Revenue Officer / Judge
    participant Frontend as Assistant UI (/assistant)
    participant Gateway as FastAPI (/assistant/chat)
    participant RAG as RAGService
    participant Neon as Neon DB (pgvector)
    participant LLM as Gemini 3 Flash Preview

    Officer->>Frontend: Enters query: "SVAMITVA property card evidentiary validity in civil court"
    Frontend->>Gateway: POST /api/v1/assistant/chat {query}
    Gateway->>RAG: answer_query(query)
    RAG->>Neon: Vector Search (Cosine Similarity top_k=3)
    Neon-->>RAG: Matched Chunks (DILRMP, SVAMITVA Guidelines v1.3, MLRC)
    
    RAG->>LLM: aio.models.generate_content(Context + Strict Grounding Prompt)
    Note over LLM: Prompt Rule: Only cite provided context.<br/>Append [Doc ID, Page #] to every bullet point.
    LLM-->>RAG: Grounded Response with statutory citations
    RAG-->>Gateway: AssistantResponse {bullets, citations, source_ids, grounded: True}
    Gateway-->>Frontend: JSON Payload
    Frontend-->>Officer: Displays 3 Grounded Findings + Clickable Citation Badges
```

---

## 4. Entity-Relationship & Vector Schema Graph

```mermaid
erDiagram
    DOCUMENT {
        string id PK "e.g. DOC-26019-001"
        string title "Official Scheme / Act Title"
        string department "e.g. Dept of Land Resources"
        string statutory_category "Central Act, State Code, Scheme"
        string file_url "S3 / Cloudflare B2 Document URI"
        text content_text "Extracted OCR Raw Text"
        vector_1024 embedding "1024-dim Normalized Semantic Vector"
        geometry_4326 boundary_geom "PostGIS Polygon / Spatial Extent"
        jsonb metadata "Jurisdiction, Year, Gazette No, ULPIN"
        timestamp_tz created_at "UTC ISO-8601 Timestamp"
    }

    SIMULATION_SCENARIO {
        string id PK "e.g. SCENARIO-UP-2027"
        string state_code "e.g. UP, MP, MH"
        float budget_crores "Dispute Resolution Budget"
        float digitization_pct "Cadastral Map Digitization"
        float drone_coverage_pct "SVAMITVA Drone Coverage"
        float grievance_days "Grievance Redressal Target"
        jsonb trajectory_data "Historical 2020-24 + Forecast 2025-27"
        jsonb confidence_intervals "Upper and Lower 95% Bounds"
        timestamp_tz simulated_at "UTC ISO-8601 Timestamp"
    }

    SYNTHESIS_REPORT {
        string id PK "e.g. SYNTH-001"
        string document_ids "Comma-separated source document IDs"
        text core_objective "Harmonized statutory intent"
        jsonb consensus_points "Points of national convergence"
        jsonb statutory_conflicts "Discrepancies across State vs Central laws"
        jsonb dolr_recommendations "Actionable guidance for DoLR"
        timestamp_tz generated_at "UTC ISO-8601 Timestamp"
    }

    DOCUMENT ||--o{ SYNTHESIS_REPORT : "informs"
    DOCUMENT ||--o{ SIMULATION_SCENARIO : "calibrates baselines"
```

---

## 5. Module Implementation Matrix

| Module | Core File Path | Key Functions / Responsibilities | Status |
| :--- | :--- | :--- | :--- |
| **Module 7: Simulation Engine** | `apps/api/app/services/simulation_service.py`<br/>`apps/api/app/api/routes/simulate.py`<br/>`apps/frontend/src/pages/simulate-page.tsx` | • Hybrid Econometric & 120-Tree Random Forest Engine (`v1.2_hybrid_rf_linear`)<br/>• 8-Year Trajectory (2020–2027)<br/>• RF 120-Tree Empirical Ensemble Spread<br/>• Recharts SVG Visualization with live slider state | ✅ **Verified Live** |
| **Module 3: RAG Assistant & Synthesis** | `apps/api/app/services/rag_service.py`<br/>`apps/api/app/services/synthesis_service.py`<br/>`apps/api/app/api/routes/assistant.py`<br/>`apps/frontend/src/pages/assistant-page.tsx`<br/>`apps/frontend/src/pages/synthesis-page.tsx` | • Grounded RAG with exact statutory page citations<br/>• `gemini-3-flash-preview` async streaming<br/>• Cross-act statutory conflict detection matrix<br/>• Emerging research trend detection | ✅ **Verified Live** |
| **Module 2: Knowledge Repository** | `apps/api/app/services/ocr_service.py`<br/>`apps/api/app/models/document.py`<br/>`apps/api/app/api/routes/repository.py`<br/>`apps/frontend/src/pages/repository-page.tsx` | • Gemini 3 Flash Multimodal Vision OCR<br/>• Neon PostgreSQL `pgvector(1024)` + PostGIS<br/>• Alembic database migration management<br/>• Dynamic document catalog fetching & seeding | ✅ **Verified Live** |

---

## 6. Live Environment & Credentials Safeguards
* **Backend**: Running on `http://localhost:8000` via Uvicorn (`python -m uvicorn app.main:app --reload`).
* **Frontend**: Running on `http://localhost:3000` via Vite (`npm run dev`).
* **Database**: Neon Serverless PostgreSQL with active extensions `vector` and `postgis`.
* **Security & Git Hygiene**:
  * `.gitignore` updated with strict exclusion rules for `.env`, `apps/api/.env`, `apps/frontend/.env`, datasets (`*.csv`, `*.parquet`), and compiled artifacts.
  * Git index purged of cached `.env` files via `git rm --cached`.
  * Committed and pushed cleanly to remote branch `main`.
