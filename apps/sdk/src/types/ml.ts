/**
 * Machine Learning and Predictive Inference Types.
 */

export interface DisputeRiskRequest {
  state_name?: string;
  district_name?: string;
  policy_adjustments?: Record<string, number>;
}

export interface DisputeRiskResponse {
  state_name: string;
  district_name?: string | null;
  predicted_dispute_risk: number;
  risk_tier: 'Low' | 'Moderate' | 'High' | 'Severe' | string;
  feature_contributions?: Record<string, number>;
  counterfactual_impact?: {
    baseline_risk: number;
    projected_risk: number;
    delta: number;
  };
  [key: string]: any;
}

export interface UrbanConversionRequest {
  state_name?: string;
  district_name?: string;
}

export interface UrbanConversionResponse {
  state_name: string;
  district_name?: string | null;
  predicted_conversion_rate_pct: number;
  projected_non_agri_hectares: number;
  velocity_tier: 'Low' | 'Moderate' | 'Rapid' | 'Hyper' | string;
  [key: string]: any;
}

export interface ClimatePredictionRequest {
  state_name?: string;
  district_name?: string;
}

export interface ClimatePredictionResponse {
  state_name: string;
  district_name?: string | null;
  predicted_vulnerability_score: number;
  vulnerability_tier: 'Low' | 'Moderate' | 'High' | 'Extreme' | string;
  top_risk_factors?: string[];
  [key: string]: any;
}

export interface PolicySimulationRequest {
  policy_lever: string;
  state_name?: string;
  delta_pct?: number;
}

export interface PolicySimulationResponse {
  policy_lever: string;
  state_name: string;
  delta_pct: number;
  projected_outcomes: Record<string, {
    baseline: number;
    projected: number;
    change_pct: number;
  }>;
  [key: string]: any;
}

export interface MlModelInfo {
  name: string;
  algorithm: string;
  r2_score?: number;
  rmse?: number;
  mae?: number;
  features: string[];
  target: string;
  trained_on_samples?: number;
  [key: string]: any;
}

export interface MlModelCatalogResponse {
  models: Record<string, MlModelInfo>;
  system_status: string;
  last_trained?: string;
  [key: string]: any;
}
