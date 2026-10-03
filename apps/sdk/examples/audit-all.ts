import { createClient, LandGovernanceApiError } from '../src';

const client = createClient({
  baseUrl: 'http://127.0.0.1:8000/api/v1',
});

async function testAllModules() {
  console.log('====================================================');
  console.log('  COMPREHENSIVE SDK AUDIT & VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health
  await check('Health Module: check()', async () => {
    const res = await client.health.check();
    if (res.status !== 'ok') throw new Error('Health check status not ok');
  });

  // 2. Analytics
  await check('Analytics: getStates()', async () => {
    const states = await client.analytics.getStates();
    if (!Array.isArray(states) || states.length === 0) throw new Error('States list empty');
  });

  await check('Analytics: compareStates()', async () => {
    const comp = await client.analytics.compareStates('Maharashtra', 'Madhya Pradesh');
    const isValid = Array.isArray(comp) ? comp.length > 0 : Boolean(comp.state_a && comp.state_b);
    if (!isValid) throw new Error('State comparison failed');
  });

  await check('Analytics: getClimateRadar()', async () => {
    const radar = await client.analytics.getClimateRadar('Maharashtra', 'Madhya Pradesh');
    const isValid = Array.isArray(radar) ? radar.length > 0 : Boolean(radar.radar && Array.isArray(radar.radar));
    if (!isValid) throw new Error('Climate radar failed');
  });

  await check('Analytics: getTrends()', async () => {
    const trends = await client.analytics.getTrends('Maharashtra');
    if (Array.isArray(trends)) {
      if (trends.length === 0) throw new Error('Historical trends empty');
    } else if (!trends.years || trends.years.length === 0) {
      throw new Error('Historical trends failed');
    }
  });

  // 3. AI Assistant
  await check('AI Assistant: getTrends()', async () => {
    const trends = await client.ai.getTrends();
    if (!Array.isArray(trends) || trends.length === 0) throw new Error('Assistant trends failed');
  });

  await check('AI Assistant: ask()', async () => {
    const ans = await client.ai.ask('What is DILRMP?');
    if (!ans.bullets || ans.bullets.length === 0) throw new Error('Assistant ask failed');
  });

  // 4. Policy Simulation
  await check('Simulation: getPresets()', async () => {
    const presets = await client.simulation.getPresets();
    if (!Array.isArray(presets) || presets.length === 0) throw new Error('Presets empty');
  });

  await check('Simulation: run()', async () => {
    const sim = await client.simulation.run({ state: 'Maharashtra', budget: 150 });
    if (!sim.metrics || !sim.metrics.disputeRate) throw new Error('Simulation run failed');
  });

  await check('Simulation: estimateInfraDelay()', async () => {
    const infra = await client.simulation.estimateInfraDelay({
      project_name: 'Corridor A',
      land_area_hectares: 200,
    });
    if (!infra.risk_level) throw new Error('Infra delay estimation failed');
  });

  // 5. GIS & Geodata
  await check('GIS: getLayers()', async () => {
    const layers = await client.gis.getLayers();
    const isValid = layers && (Array.isArray((layers as any).layers) ? (layers as any).layers.length > 0 : Object.keys(layers).length > 0);
    if (!isValid) throw new Error('GIS layers failed');
  });

  await check('GIS: getDistricts()', async () => {
    const districts = await client.gis.getDistricts({ limit: 3 });
    if (!Array.isArray(districts) || districts.length === 0) throw new Error('GIS districts failed');
    if (!districts[0].district && !districts[0].district_name) throw new Error('District name missing');
  });

  await check('GIS: getTemporalStats()', async () => {
    const stats = await client.gis.getTemporalStats(2024);
    if (!stats.year) throw new Error('Temporal stats failed');
  });

  // 6. Central Repository
  await check('Repository: search()', async () => {
    const docs = await client.documents.search('cadastral');
    if (!Array.isArray(docs)) throw new Error('Search failed');
  });

  await check('Repository: getRecommendations()', async () => {
    const recs = await client.documents.getRecommendations('Researcher', 2);
    if (!Array.isArray(recs)) throw new Error('Recommendations failed');
  });

  // 7. ML Engine
  await check('ML: getModels()', async () => {
    const models = await client.ml.getModels();
    if (!models.models) throw new Error('ML models catalog failed');
  });

  await check('ML: predictDispute()', async () => {
    const pred = await client.ml.predictDispute({ state_name: 'MAHARASHTRA' });
    if (pred.predicted_dispute_risk === undefined) throw new Error('Dispute prediction failed');
  });

  // 8. Innovation Portal
  await check('Innovation: getStats()', async () => {
    const stats = await client.innovation.getStats();
    if (stats.total_challenges === undefined) throw new Error('Innovation stats failed');
  });

  await check('Innovation: listChallenges()', async () => {
    const challenges = await client.innovation.listChallenges();
    if (!Array.isArray(challenges)) throw new Error('List challenges failed');
  });

  // 9. Admin Portal
  await check('Admin: getHealthMetrics()', async () => {
    const metrics = await client.admin.getHealthMetrics();
    if (!metrics.database) throw new Error('Admin health metrics failed');
  });

  // 10. Error Handling
  await check('Typed Error Handling (404 Not Found)', async () => {
    try {
      await client.documents.getById('non-existent-uuid-12345');
      throw new Error('Should have thrown 404');
    } catch (err: any) {
      if (!(err instanceof LandGovernanceApiError)) {
        throw new Error('Expected LandGovernanceApiError instance');
      }
      if (!err.isNotFound) {
        throw new Error('Expected isNotFound to be true');
      }
    }
  });

  // 11. Token-Based Authentication State Management
  await check('Token Authentication Helpers', async () => {
    client.clearToken();
    if (client.isAuthenticated()) throw new Error('Should not be authenticated');
    client.setToken('test-bearer-token');
    if (!client.isAuthenticated()) throw new Error('Should be authenticated');
    if (client.getToken() !== 'test-bearer-token') throw new Error('Token mismatch');
    client.logout();
    if (client.isAuthenticated()) throw new Error('Should not be authenticated after logout');
  });

  console.log('\n====================================================');
  console.log(`  AUDIT COMPLETE: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
}

testAllModules();
