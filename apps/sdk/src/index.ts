/**
 * Land Governance Platform SDK (SIH PS 26019).
 * Official TypeScript / JavaScript client for the National Land Governance Platform.
 */

import { ClientConfig } from './config';
import { LandGovernanceClient } from './client';

export * from './client';
export * from './config';
export * from './errors';
export * from './http';
export * from './websocket';
export * from './types';

/**
 * Convenience factory function to create a new LandGovernanceClient instance.
 *
 * @example
 * ```ts
 * import { createClient } from 'land-governance-platform';
 *
 * const client = createClient({
 *   baseUrl: 'http://127.0.0.1:8000/api/v1',
 *   token: 'your_jwt_token',
 * });
 * ```
 */
export function createClient(config?: ClientConfig): LandGovernanceClient {
  return new LandGovernanceClient(config);
}

export default LandGovernanceClient;
