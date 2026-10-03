import { createClient } from '../src';

async function runSimulation() {
  const client = createClient({
    baseUrl: 'http://127.0.0.1:8000/api/v1',
  });

  console.log('--- 1. Evaluating Policy Levers ---');
  const result = await client.simulate.evaluate({
    state: 'Maharashtra',
    ceiling: 50.0,
    tax: 6.5,
    budget: 250.0,
    window: 90.0,
  });

  console.log(`Simulation complete for: ${result.state}`);
  console.log('Projected Metrics:');
  for (const [key, metric] of Object.entries(result.metrics)) {
    console.log(`  ${key}: ${metric.current} -> ${metric.projected} (${metric.delta > 0 ? '+' : ''}${metric.delta}) [CI: ${metric.confidence_interval}]`);
  }

  console.log('\n--- 2. Infrastructure Delay & RFCTLARR Estimation ---');
  const infraResult = await client.simulate.estimateInfrastructureDelay({
    project_name: 'Delhi-Mumbai Industrial Expressway Corridor',
    project_type: 'Highway / Expressway',
    state: 'Maharashtra',
    land_area_hectares: 450,
    private_land_pct: 85,
    irrigated_multi_crop_pct: 30,
  });

  console.log(`Project: ${infraResult.project_name}`);
  console.log(`Risk Level: ${infraResult.risk_level} (Score: ${infraResult.risk_score}/100)`);
  console.log(`Total Projected Clearance: ${infraResult.total_projected_clearance_months} months`);
  console.log(`Estimated Total Land Cost: ₹${infraResult.total_estimated_land_cost_cr} Cr`);
  console.log('Bottlenecks:', infraResult.bottlenecks);
}

runSimulation();
