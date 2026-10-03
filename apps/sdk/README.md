# land-governance-platform

> Official TypeScript & JavaScript SDK for the **National Land Governance Platform** (Smart India Hackathon / SIH PS 26019).

[![npm version](https://img.shields.io/npm/v/land-governance-platform.svg?color=cb3837)](https://www.npmjs.com/package/land-governance-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6.svg)](https://www.typescriptlang.org/)
[![Node.js 18+](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

A robust, enterprise-grade, fully typed client library designed for developers, researchers, and government departments interacting with the Land Governance Platform API. It works universally in **Node.js (18+)**, **Next.js**, **Vite / React**, **Remix**, **Deno**, **Bun**, and modern browsers.

---

## Features

- 🔒 **Complete Authentication**: Email & password, JWT token lifecycle, role auto-detection (`.gov.in` → Official, `.ac.in` → Researcher, public).
- 📚 **Central Knowledge Repository**: Document discovery, semantic vector search (Neon pgvector), upload, OCR extraction, document staging with provenance, and administrative approval workflows.
- 🤖 **AI Assistant & Synthesis**: Conversational RAG grounded strictly in verified policy circulars, comparative synthesis across multiple acts, auto-summarization, and emerging trend detection.
- 💼 **Collaborative Workspaces**: Workspace management, role-based member assignment, task tracking, and real-time threaded chat over WebSockets.
- 🗺️ **GIS & Geospatial Engine**: 640 districts catalog with coordinates and dispute risk scores, toggleable GIS layers (WMS/GeoJSON), multi-temporal land use progression (1950–2025), and custom GeoJSON upload.
- 📊 **Empirical Analytics & Dashboards**: State-to-state comparative statistics, 5-axis climate resilience radar, 25-year historical trends, National Land Governance Index (NLGI) leaderboard, and 7 SIH PS 26019 dashboards.
- 🧪 **Policy Simulation & RFCTLARR Engine**: Macroeconomic lever simulations (Land Ceiling, Conversion Tax, Survey Budget, Fast-Track Courts) with 8-year trajectories, policy presets (Model Leasing, SVAMITVA), and RFCTLARR 2013 infrastructure delay & cost overrun estimations.
- 🧠 **Predictive ML Models**: Scikit-Learn RandomForest and HistGradientBoosting inference for land dispute risk, urban conversion velocity, and climate moisture distress.
- 💡 **Innovation Portal**: Open challenges (hackathons, grant calls), proposal submissions with PDF attachments, public voting, and grant disbursement tracker.
- ⚡ **Real-Time Push Notifications**: Instant WebSocket push alerts for status changes, approvals, and system events with auto-reconnection.
- 🛡️ **Zero External Runtime Dependencies**: Built entirely on standard web APIs (`fetch`, `AbortController`, `WebSocket`).

---

## Installation

```bash
# npm
npm install land-governance-platform

# pnpm
pnpm add land-governance-platform

# yarn
yarn add land-governance-platform

# bun
bun add land-governance-platform
```

---

## Quick Start

```typescript
import { createClient } from 'land-governance-platform';

// 1. Initialize client (can optionally pass existing token)
const client = createClient({
  baseUrl: 'https://land-governance-platform-production.up.railway.app/api/v1', // or local 'http://127.0.0.1:8000/api/v1'
  // token: 'existing_jwt_token', // Optional: set token directly
});

async function main() {
  // 2. Token-Based Authentication (sets token automatically on client)
  const session = await client.login({
    email: 'officer@dolr.gov.in',
    password: 'YourPassword123!',
  });
  console.log('Logged in as:', session.user.full_name);
  console.log('Active JWT Token:', client.getToken());
  console.log('Is Authenticated?', client.isAuthenticated()); // true

  // 3. Quick & Memorable Document Search
  const docs = await client.documents.search('cadastral drone survey precision');
  console.log(`Found ${docs.length} documents.`);

  // 4. Ask Conversational AI Policy Assistant
  const answer = await client.ai.ask('What is the mandatory accuracy for SVAMITVA drone surveys?');
  console.log('AI Answer:', answer.bullets.join('\n'));

  // 5. Run Policy Simulation
  const simulation = await client.simulation.run({
    state: 'Maharashtra',
    budget: 250.0,
    window: 90.0,
  });
  console.log('Simulation Results:', simulation.metrics);

  // 6. Fetch GIS Districts
  const districts = await client.gis.getDistricts({ state: 'Maharashtra', limit: 5 });
  console.log('Districts:', districts.map(d => d.district));

  // 7. Logout / Clear Token
  client.logout();
  console.log('Logged out. Authenticated?', client.isAuthenticated()); // false
}

main().catch(console.error);
```

---

## Token-Based Authentication

The SDK provides first-class, seamless token-based authentication:

### 1. Initialize with an existing Bearer token
```typescript
const client = createClient({
  baseUrl: 'https://api.landgovernance.gov.in/api/v1',
  token: 'YOUR_SAVED_JWT_TOKEN',
});
```

### 2. Login to automatically store the token
When you call `client.login()` (or `client.auth.login()`), the returned JWT `access_token` is automatically saved in the client's memory. All subsequent requests automatically attach `Authorization: Bearer <token>`.

```typescript
const session = await client.login({
  email: 'officer@dolr.gov.in',
  password: 'Password123!',
});
```

### 3. Token Lifecycle & Management
```typescript
// Check if client has an active token
if (client.isAuthenticated()) {
  console.log('Current token:', client.getToken());
}

// Manually update or switch tokens
client.setToken('new_bearer_token');

// Log out and clear token
client.logout(); // or client.clearToken()

// Handle token expiration automatically
const client = createClient({
  onTokenExpired: () => {
    console.log('Session expired. Redirecting to login...');
  },
});
```

---

## Memorable & Intuitive Function Names

All modules feature intuitive, memorable method names with backward-compatible aliases:

| Task | Memorable Shortcut | Standard Method |
| :--- | :--- | :--- |
| **Login** | `client.login({ email, password })` | `client.auth.login(...)` |
| **Get Profile** | `client.getProfile()` | `client.auth.getMe()` |
| **Check Auth** | `client.isAuthenticated()` | `client.auth.isAuthenticated()` |
| **Search Documents** | `client.documents.search('keyword')` | `client.repository.list(...)` |
| **Get Document by ID** | `client.documents.getById('DOC-01')` | `client.repository.get(...)` |
| **Ask AI Assistant** | `client.ai.ask('question')` | `client.assistant.chat(...)` |
| **Compare Policies** | `client.ai.compare(['DOC-1', 'DOC-2'])` | `client.assistant.synthesize(...)` |
| **Run Simulation** | `client.simulation.run({ state, budget })` | `client.simulate.evaluate(...)` |
| **Get Presets** | `client.simulation.getPresets()` | `client.simulate.getPresets()` |
| **Get Districts** | `client.gis.getDistricts({ state })` | `client.geodata.listDistricts(...)` |
| **Get Dashboard** | `client.analytics.getDashboard('climate_resilience')` | `client.analytics.getDashboardCategory(...)` |
| **Get States** | `client.analytics.getStates()` | `client.analytics.getAvailableStates()` |
| **NLGI Leaderboard** | `client.analytics.getLeaderboard()` | `client.analytics.getNlgiLeaderboard()` |
| **Predict Dispute** | `client.ml.predictDispute({ state_name })` | `client.ml.predictDisputeRisk(...)` |
| **Predict Urban Velocity** | `client.ml.predictUrbanGrowth({ state_name })` | `client.ml.predictUrbanConversion(...)` |

---

## Modules Reference

### 1. Authentication (`client.auth`)

```typescript
// Register (auto-detects role: .gov.in -> official, .ac.in -> researcher)
const session = await client.register({
  email: 'researcher@iitb.ac.in',
  password: 'Password123!',
  full_name: 'Dr. Ramesh Sharma',
  institution: 'IIT Bombay',
});

// Login (attaches token automatically)
const auth = await client.login({
  email: 'researcher@iitb.ac.in',
  password: 'Password123!',
});

// Profile Management
const profile = await client.getProfile();
await client.auth.updateProfile({ full_name: 'Dr. R. Sharma' });

// Token handling
client.setToken(auth.access_token);
const token = client.getToken();
client.logout();
```
```

---

### 2. Central Knowledge Repository (`client.repository`)

```typescript
// Discover documents with multi-faceted filters
const documents = await client.repository.list({
  query: 'DILRMP RoR integration',
  state: 'Maharashtra',
  theme: 'Cadastral Mapping',
  year_from: 2020,
  year_to: 2026,
  search_mode: 'semantic',
});

// Get document details & related policies
const doc = await client.repository.get('DOC-26019-001');
const related = await client.repository.getRelated(doc.id, 3);

// AI-powered personalized recommendations by role
const recommended = await client.repository.getRecommendations('Researcher', 4);

// Stage an evidence document with provenance for admin review
const staging = await client.repository.ingest(fileBlob, {
  title: 'Maharashtra Land Revenue Code Amendment 2024',
  authority: 'Revenue & Forest Department, Maharashtra',
  source_url: 'https://revenue.maharashtra.gov.in/acts',
  source_license: 'Government Open Data Licence - India (GODL)',
  theme: 'Land Dispute Resolution',
  publication_year: 2024,
});

// Admin review of staged document
await client.repository.review(staging.document.id, {
  decision: 'approved',
  review_note: 'Verified with official gazette publication.',
});
```

---

### 3. AI Assistant & Policy Synthesis (`client.assistant`)

```typescript
// Natural Language RAG Q&A
const res = await client.assistant.chat('Explain the compensation calculation under RFCTLARR Act 2013.');

// Comparative Policy Synthesis across multiple documents
const synthesis = await client.assistant.synthesize(['DOC-26019-001', 'DOC-26019-002']);
console.log('Core Objective:', synthesis.core_objective);
console.log('Consensus Points:', synthesis.consensus_points);
console.log('Conflicting Guidelines:', synthesis.conflicting_guidelines);
console.log('DoLR Recommendations:', synthesis.recommendations_for_dolr);

// One-Click Document Summarization
const summary = await client.assistant.summarize({
  title: 'Model Agricultural Land Leasing Act 2016',
  department: 'NITI Aayog',
});

// Emerging Policy Research Trends
const trends = await client.assistant.getTrends();
```

---

### 4. Collaborative Workspaces & Real-Time Chat (`client.workspaces`)

```typescript
// Create a workspace
const ws = await client.workspaces.create({
  name: 'Western Ghats Forest Rights Taskforce',
  description: 'Joint research team on FRA 2006 community forest rights.',
});

// Manage members & tasks
await client.workspaces.addMember(ws.id, {
  user_id: 'user-uuid',
  role: 'member',
});

const task = await client.workspaces.createTask(ws.id, {
  title: 'Audit GPS boundary coordinates for Raigad district',
  description: 'Compare Survey of India boundary files with cadastral maps.',
});

// Real-Time Threaded WebSocket Chat
const chat = client.workspaces.connectChat(ws.id, {
  onOpen: () => {
    chat.send({ content: 'Cadastral shapefiles uploaded to workspace.' });
  },
  onMessage: (msg) => {
    if (msg.type === 'message') {
      console.log('New message:', msg.data?.content);
    }
  },
});

// Disconnect chat when leaving room
chat.close();
```

---

### 5. GIS & Geospatial Visualization (`client.geodata`)

```typescript
// Catalog of toggleable GIS layers (Cadastral, LULC, ISRO Bhuvan, Climate Risk)
const catalog = await client.geodata.getLayers();

// Spatial catalog of 640 Indian districts
const districts = await client.geodata.listDistricts({
  state: 'Maharashtra',
  year: 2024,
});

// Multi-temporal national land governance indicators (1950–2025)
const stats = await client.geodata.getTemporalStats(2024);

// Fetch GeoJSON FeatureCollection
const geojson = await client.geodata.getGeoJson('cadastral', 2024);

// Upload custom GeoJSON layer
await client.geodata.uploadGeoJson(geojsonBlob, 'cadastral', 'pune_cadastre.geojson');
```

---

### 6. Analytics & Decision Support (`client.analytics`)

```typescript
// Compare 2 Indian states on real empirical indicators
const comparison = await client.analytics.compareStates('Maharashtra', 'Madhya Pradesh');

// 5-Axis Climate Resilience Radar
const radar = await client.analytics.getClimateRadar('Maharashtra', 'Madhya Pradesh');

// 25-Year Land Governance Trends (2000–2024)
const trends = await client.analytics.getTrends('Maharashtra');

// Fetch empirical data for any of the 7 SIH PS 26019 dashboards
const dashData = await client.analytics.getDashboardCategory('climate_resilience', 'Maharashtra');

// National Land Governance Index (NLGI) Leaderboard
const leaderboard = await client.analytics.getNlgiLeaderboard();
```

---

### 7. Policy Simulation & RFCTLARR Engine (`client.simulate`)

```typescript
// Run Policy Simulation with Levers
const simulation = await client.simulate.evaluate({
  state: 'Maharashtra',
  ceiling: 50.0,   // Land ceiling limit (acres)
  tax: 6.5,        // Agri to Non-Agri conversion tax (%)
  budget: 250.0,   // Modernization survey budget (₹ Cr)
  window: 90.0,    // Fast-track court window (days)
});

console.log('Projected Trajectory:', simulation.trajectory);
console.log('Key Metrics:', simulation.metrics);

// Real Policy Presets (Model Leasing, SVAMITVA)
const presets = await client.simulate.getPresets();

// RFCTLARR Act 2013 Infrastructure Delay & Cost Escalation
const delayCalc = await client.simulate.estimateInfrastructureDelay({
  project_name: 'Western Dedicated Freight Corridor',
  project_type: 'Railway Corridor',
  state: 'Maharashtra',
  land_area_hectares: 500,
  private_land_pct: 75,
  irrigated_multi_crop_pct: 35,
});

console.log(`Risk Level: ${delayCalc.risk_level}`);
console.log(`Projected Delay: ${delayCalc.total_projected_clearance_months} months`);
console.log(`Total Land Cost: ₹${delayCalc.total_estimated_land_cost_cr} Cr`);
```

---

### 8. Scikit-Learn Predictive ML (`client.ml`)

```typescript
// Model catalog and performance metrics
const models = await client.ml.getModelsCatalog();

// Predict district land dispute risk with counterfactuals
const disputePred = await client.ml.predictDisputeRisk({
  state_name: 'MAHARASHTRA',
  district_name: 'PUNE',
  policy_adjustments: {
    titling_coverage_pct: 85.0,
    digital_mutation_speed_pct: 90.0,
  },
});

// Predict urban land conversion velocity
const urbanPred = await client.ml.predictUrbanConversion({
  state_name: 'MAHARASHTRA',
  district_name: 'PUNE',
});
```

---

### 9. Innovation Portal (`client.innovation`)

```typescript
// Create a Challenge (Hackathon, Grant Call)
const challenge = await client.innovation.createChallenge({
  title: 'AI for Sub-5cm Cadastral Boundary Extraction',
  description: 'Develop open-source deep learning models for high-resolution drone imagery.',
  challenge_type: 'hackathon',
  organization: 'Department of Land Resources (DoLR)',
  start_date: '2026-01-01T00:00:00Z',
  deadline: '2026-06-30T23:59:59Z',
});

// Submit Proposal
const proposal = await client.innovation.submitProposal(challenge.id, {
  title: 'Edge-AI Boundary Detection on Drone Orthomosaics',
  abstract: 'Transformer-based boundary segmentation achieving sub-3cm delineation accuracy.',
  requested_funding: 2500000,
});

// Vote for Proposal
await client.innovation.voteForProposal(proposal.id);

// Check Challenge Leaderboard
const ranked = await client.innovation.getLeaderboard(challenge.id);
```

---

### 10. Real-Time Push Notifications (`client.notifications`)

```typescript
// List past notifications
const notifications = await client.notifications.list({ unread_only: true });

// Mark as read
await client.notifications.markAsRead(notifications[0].id);

// Subscribe to Live WebSocket Alerts
const subscription = client.notifications.subscribe({
  onNotification: (notif) => {
    console.log(`[ALERT] ${notif.title}: ${notif.content}`);
  },
  onError: (err) => console.error('Notification error:', err),
});

// Unsubscribe
subscription.close();
```

---

## Error Handling

The SDK provides strongly typed errors with intuitive helper getters:

```typescript
import { LandGovernanceApiError, LandGovernanceTimeoutError } from 'land-governance-platform';

try {
  await client.repository.get('non-existent-id');
} catch (error) {
  if (error instanceof LandGovernanceApiError) {
    console.error('HTTP Status:', error.status); // e.g. 404
    console.error('Message:', error.message);

    if (error.isUnauthorized) {
      // Redirect to login or refresh token
    } else if (error.isNotFound) {
      // Show not found UI
    } else if (error.isValidationError) {
      // Display FastAPI field validation errors
      console.error('Validation errors:', error.data);
    }
  } else if (error instanceof LandGovernanceTimeoutError) {
    console.error('Request timed out after', error.timeoutMs, 'ms');
  }
}
```

---

## Configuration Options

```typescript
const client = createClient({
  baseUrl: 'https://api.landgovernance.gov.in/api/v1',
  wsUrl: 'wss://api.landgovernance.gov.in/api/v1',
  token: 'initial_jwt_token',
  apiKey: 'optional_service_api_key',
  timeoutMs: 45000, // 45 seconds
  retries: 2,       // Automatic retry on network glitch / 5xx
  headers: {
    'X-Custom-Client': 'ResearchPortal/2.0',
  },
  onTokenExpired: async () => {
    console.log('Session expired. Redirecting to login...');
  },
});
```

---

## Building and Publishing to npm

### 1. Build the library
```bash
npm run build
```
This runs `tsup` to generate dual ESM (`dist/index.mjs`) and CommonJS (`dist/index.cjs`) bundles, alongside complete TypeScript declarations (`dist/index.d.ts`).

### 2. Run Tests
```bash
npm run test
```

### 3. Publish to npm
```bash
# Verify contents first
npm pack --dry-run

# Publish public package
npm publish --access public
```

---

## License

MIT © 2026 Land Governance Platform Team. All rights reserved.
Developed for the National Land Governance Platform under SIH PS 26019.
