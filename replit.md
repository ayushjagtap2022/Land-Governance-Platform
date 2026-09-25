# National Land Governance Platform

A government-grade digital platform for the Department of Land Resources to browse land policy documents, explore GIS data, and access role-based research and administrative tools.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/land-governance run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/land-governance/src/App.tsx` — shared shell, routes, route access states, and page content
- `artifacts/land-governance/src/components/layout/` — bilingual header and role-aware sidebar
- `artifacts/land-governance/src/context/RoleContext.tsx` — active demo persona state
- `artifacts/land-governance/src/data/mockData.ts` — typed repository, category, state, and activity data
- `artifacts/land-governance/src/index.css` — NIC-style theme tokens and global layout styles

## Architecture decisions

- The first build is frontend-only and uses typed local mock data so judges can exercise all roles and routes without a backend dependency.
- The active persona defaults to Researcher and controls both sidebar visibility and route access states.
- The visual language intentionally follows a strict Indian government / NIC portal aesthetic: navy, saffron-white-green accent, square utility controls, and dense bordered data surfaces.

## Product

Users can browse and filter a land-governance repository, open document details, inspect GIS layers, try a policy assistant, manage research workspaces, review analytics, simulate policy changes, submit innovation ideas, inspect admin actions, and view developer API examples. The demo persona switcher makes role-specific navigation and access behavior visible.

## User preferences

- Keep the product in the strict Indian government / NIC aesthetic described in the build brief; do not introduce consumer SaaS styling or dark mode.

## Gotchas

- Artifact workflows provide `PORT` and `BASE_PATH`; use the managed web workflow for previews.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
