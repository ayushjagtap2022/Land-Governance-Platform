/**
 * ML Module (Scikit-Learn Predictive Models Engine).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  ClimatePredictionRequest,
  ClimatePredictionResponse,
  DisputeRiskRequest,
  DisputeRiskResponse,
  MlModelCatalogResponse,
  PolicySimulationRequest,
  PolicySimulationResponse,
  UrbanConversionRequest,
  UrbanConversionResponse,
} from '../types/ml';

export class MlModule {
  constructor(private http: HttpClient) {}

  /**
   * Get catalog of trained Scikit-Learn models, accuracy (R^2, MAE, RMSE), and feature importances.
   */
  public async getModelsCatalog(options?: RequestOptions): Promise<MlModelCatalogResponse> {
    return this.http.get<MlModelCatalogResponse>('/ml/models', undefined, options);
  }

  /**
   * Memorable alias for getModelsCatalog().
   */
  public async getModels(options?: RequestOptions): Promise<MlModelCatalogResponse> {
    return this.getModelsCatalog(options);
  }

  /**
   * Run RandomForestRegressor inference for district land dispute risk with counterfactual levers.
   */
  public async predictDisputeRisk(
    payload: DisputeRiskRequest = {},
    options?: RequestOptions
  ): Promise<DisputeRiskResponse> {
    return this.http.post<DisputeRiskResponse>('/ml/predict-dispute', payload, options);
  }

  /**
   * Memorable alias for predictDisputeRisk().
   */
  public async predictDispute(
    payload: DisputeRiskRequest = {},
    options?: RequestOptions
  ): Promise<DisputeRiskResponse> {
    return this.predictDisputeRisk(payload, options);
  }

  /**
   * Run HistGradientBoostingRegressor inference for urban land conversion velocity.
   */
  public async predictUrbanConversion(
    payload: UrbanConversionRequest = {},
    options?: RequestOptions
  ): Promise<UrbanConversionResponse> {
    return this.http.post<UrbanConversionResponse>('/ml/predict-urban-conversion', payload, options);
  }

  /**
   * Memorable alias for predictUrbanConversion().
   */
  public async predictUrbanGrowth(
    payload: UrbanConversionRequest = {},
    options?: RequestOptions
  ): Promise<UrbanConversionResponse> {
    return this.predictUrbanConversion(payload, options);
  }

  /**
   * Run RandomForestRegressor inference for climate & moisture distress vulnerability.
   */
  public async predictClimateVulnerability(
    payload: ClimatePredictionRequest = {},
    options?: RequestOptions
  ): Promise<ClimatePredictionResponse> {
    return this.http.post<ClimatePredictionResponse>('/ml/predict-climate', payload, options);
  }

  /**
   * Execute Module 7 Scenario Modeling with multi-target baseline vs projected deltas.
   */
  public async simulateScenario(
    payload: PolicySimulationRequest,
    options?: RequestOptions
  ): Promise<PolicySimulationResponse> {
    return this.http.post<PolicySimulationResponse>('/ml/simulate', payload, options);
  }
}
