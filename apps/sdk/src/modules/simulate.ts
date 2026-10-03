/**
 * Simulate Module (Module 7: Policy Simulation & Scenario Modeling Engine).
 */

import { HttpClient } from '../http';
import { RequestOptions } from '../types/common';
import {
  InfrastructureDelayInput,
  InfrastructureDelayOutput,
  PolicyPreset,
  SimulationInput,
  SimulationOutput,
} from '../types/simulate';

export class SimulateModule {
  constructor(private http: HttpClient) {}

  /**
   * Evaluates policy variable manipulations (ceiling, conversion tax, survey budget, fast-track window)
   * and returns projected outcome metrics with 95% confidence intervals, 8-year trajectories,
   * sensitivity analysis, and explainability drivers.
   */
  public async evaluate(
    payload: SimulationInput = {},
    options?: RequestOptions
  ): Promise<SimulationOutput> {
    return this.http.post<SimulationOutput>('/simulate/evaluate', payload, options);
  }

  /**
   * Memorable alias for evaluate() — runs policy lever simulation.
   *
   * @example
   * ```ts
   * const result = await client.simulation.run({ state: 'Maharashtra', budget: 250 });
   * ```
   */
  public async run(
    payload: SimulationInput = {},
    options?: RequestOptions
  ): Promise<SimulationOutput> {
    return this.evaluate(payload, options);
  }

  /**
   * Get historical baseline indicators for all supported states.
   */
  public async getBaselines(options?: RequestOptions): Promise<Record<string, any>> {
    return this.http.get<Record<string, any>>('/simulate/baselines', undefined, options);
  }

  /**
   * Get verified real policy presets (Model Land Leasing Act, SVAMITVA, Land Pooling).
   */
  public async getPresets(options?: RequestOptions): Promise<PolicyPreset[]> {
    return this.http.get<PolicyPreset[]>('/simulate/presets', undefined, options);
  }

  /**
   * Predicts project clearance delay, litigation probability, and financial cost escalation
   * under RFCTLARR Act 2013 across Highways, Railways, SEZs, and Metros (PS 25017 & PS 26016).
   */
  public async estimateInfrastructureDelay(
    payload: InfrastructureDelayInput,
    options?: RequestOptions
  ): Promise<InfrastructureDelayOutput> {
    return this.http.post<InfrastructureDelayOutput>(
      '/simulate/infrastructure-delay',
      payload,
      options
    );
  }

  /**
   * Memorable alias for estimateInfrastructureDelay().
   */
  public async estimateInfraDelay(
    payload: InfrastructureDelayInput,
    options?: RequestOptions
  ): Promise<InfrastructureDelayOutput> {
    return this.estimateInfrastructureDelay(payload, options);
  }
}
