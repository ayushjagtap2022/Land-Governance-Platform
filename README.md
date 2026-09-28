# 🏛️ National Digital Platform for Land Governance

**SIH Problem Statement 26019** | Ministry of Rural Development | Department of Land Resources (DoLR)

A national research-and-policy ecosystem — repository + AI search + GIS + analytics + policy simulation + collaboration + innovation portal, unified under role-based access, for researchers, government officials, academic institutions, and the public.

---

## 📦 Monorepo Structure

```
Land-Governance-Platform/
├── packages/
│   ├── frontend/                  # React + Vite + TailwindCSS frontend
│   ├── api-server/                # Express 5 backend API
│   └── shared/
│       ├── db/                    # PostgreSQL + Drizzle ORM schemas
│       ├── api-zod/               # Shared Zod validation schemas
│       ├── api-client-react/      # React Query API client hooks
│       └── api-spec/              # OpenAPI spec + Orval codegen
├── attached_assets/               # Shared static assets
├── tsconfig.base.json             # Shared TypeScript config
└── package.json                   # npm workspaces root
```

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Run the frontend dev server (port 3000)
npm run dev:frontend

# Run the API server
npm run dev:api

# Typecheck all packages
npm run typecheck:all

# Build all packages
npm run build
```

## 🧩 Module Mapping — SIH 26019

| # | Module | SIH Points | Status |
|---|--------|------------|--------|
| 1 | **Auth & RBAC** — Multi-role accounts, JWT, OTP, audit trail | 17 | 🔲 Planned |
| 2 | **Knowledge Repository** — Document CRUD, OCR, versioning, taxonomy | 7, 13 | ✅ Frontend scaffold |
| 3 | **AI Search & Recommendations** — Semantic search, RAG, summarization | 8, 14 | ✅ Frontend scaffold |
| 4 | **Collaborative Workspaces** — Shared projects, discussions, tasks | 9, 15 | 🔲 Planned |
| 5 | **GIS & Geospatial** — Interactive map, layers, time-slider, heatmaps | 10, 13 | ✅ Frontend scaffold |
| 6 | **Analytics Dashboards** — 7 dashboard views, exports, anomaly flagging | 11, 16 | 🔲 Planned |
| 7 | **Policy Simulation** ⭐ — What-if engine, scenarios, sensitivity analysis | 12 | 🔲 Planned |
| 8 | **Innovation Portal** — Challenges, submissions, leaderboard, grants | 15 | 🔲 Planned |
| 9 | **API & Integration Layer** — REST APIs, webhooks, OpenAPI docs | 13, 18 | ✅ Express scaffold |
| 10 | **Admin & Platform Mgmt** — User verification, moderation, audit logs | 17 | 🔲 Planned |
| 11 | **Notifications & Reporting** — In-app/email alerts, digests | — | 🔲 Planned |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, TailwindCSS 4, Radix UI, Leaflet |
| Backend | Node.js 24, Express 5, TypeScript 5.9 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod 3 |
| API Codegen | Orval (OpenAPI → React Query hooks + Zod schemas) |
| Build | esbuild (server), Vite (client) |

## 👥 Target Personas

| Persona | Core Need | Primary Modules |
|---------|-----------|-----------------|
| Policy Researcher / Academic | Find, synthesize, and build on existing research fast | Repository, AI Search, Collaboration |
| Government Official / Policymaker | Test a policy idea before committing; see live indicators | Simulation, Analytics, GIS |
| Institution / State Government Admin | Upload data, manage org contributions, collaborate | Repository, Collaboration, Admin |
| Public / Innovation Participant | Explore land data visually, participate in hackathons | GIS, Innovation Portal |
| Platform Super Admin (DoLR) | Govern access, moderate content, monitor health | Admin & Platform Management |

## 📁 Key File Paths

| File | Purpose |
|------|---------|
| `packages/frontend/src/App.tsx` | Main app shell, routes, and page content |
| `packages/frontend/src/components/layout/` | Header and role-aware sidebar |
| `packages/frontend/src/context/RoleContext.tsx` | Demo persona state |
| `packages/frontend/src/data/mockData.ts` | Typed mock data for all views |
| `packages/frontend/src/index.css` | Theme tokens and global styles |
| `packages/api-server/src/` | Express server entry, routes, middleware |
| `packages/shared/db/src/schema/` | Drizzle ORM database schema |
| `packages/shared/api-zod/src/` | Shared Zod validation schemas |

## 🏗️ Architecture Decisions

- **Frontend-first build**: Uses typed local mock data so all roles and routes work without a backend dependency.
- **Demo persona switcher**: Defaults to Researcher, controls sidebar visibility and route access.
- **NIC/Government aesthetic**: Strict Indian government portal styling — navy, saffron-white-green accent, bordered data surfaces.
- **npm workspaces**: All packages managed through npm workspaces for simple dependency resolution.

## 📜 License

MIT
