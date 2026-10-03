/**
 * Policy Simulation and Scenario Modeling Types (Module 7).
 */

export interface SimulationInput {
  state?: string;
  ceiling?: number;
  tax?: number;
  budget?: number;
  window?: number;
}

export interface MetricProjection {
  current: number;
  projected: number;
  delta: number;
  confidence_interval: string;
  direction: 'increase' | 'decrease' | 'neutral' | string;
}

export interface TrajectoryPoint {
  year: string;
  baseline: number;
  projected?: number | null;
}

export interface SensitivityMetric {
  parameter: string;
  label: string;
  impact_level: 'High' | 'Moderate' | 'Low' | string;
  impact_score: number;
}

export interface SimulationOutput {
  state: string;
  baseline_params: Record<string, number>;
  input_params: Record<string, any>;
  metrics: Record<string, MetricProjection>;
  trajectory: TrajectoryPoint[];
  sensitivity: SensitivityMetric[];
  explainability: string[];
  methodology: string;
  ml_model_insights?: Record<string, any> | null;
}

export interface PolicyPreset {
  id: string;
  title: string;
  authority: string;
  badge: string;
  description: string;
  params: {
    ceiling: number;
    tax: number;
    budget: number;
    window: number;
    [key: string]: number;
  };
  target_outcomes: Record<string, string>;
}

export interface InfrastructureDelayInput {
  project_name?: string;
  project_type?: string;
  state?: string;
  land_area_hectares: number;
  private_land_pct?: number;
  irrigated_multi_crop_pct?: number;
}

export interface InfrastructureDelayOutput {
  project_name: string;
  project_type: string;
  state: string;
  land_area_hectares: number;
  baseline_clearance_months: number;
  litigation_delay_months: number;
  total_projected_clearance_months: number;
  risk_score: number;
  risk_level: string;
  estimated_base_compensation_cr: number;
  delay_cost_escalation_cr: number;
  total_estimated_land_cost_cr: number;
  bottlenecks: string[];
  mitigations: string[];
}
