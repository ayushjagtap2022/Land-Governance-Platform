/**
 * LandGovernanceClient — The main entry point for the Land Governance Platform SDK.
 */

import { ClientConfig } from './config';
import { HttpClient } from './http';
import { AdminModule } from './modules/admin';
import { AnalyticsModule } from './modules/analytics';
import { AssistantModule } from './modules/assistant';
import { AuthModule } from './modules/auth';
import { GeodataModule } from './modules/geodata';
import { HealthModule } from './modules/health';
import { InnovationModule } from './modules/innovation';
import { MlModule } from './modules/ml';
import { NotificationsModule } from './modules/notifications';
import { RepositoryModule } from './modules/repository';
import { SimulateModule } from './modules/simulate';
import { WorkspacesModule } from './modules/workspaces';

export class LandGovernanceClient {
  public readonly http: HttpClient;

  /**
   * Module 1: Authentication & Role-Based Access Control
   */
  public readonly auth: AuthModule;

  /**
   * Module 2: Central Knowledge Repository (Documents, Ingestion, Provenance)
   */
  public readonly repository: RepositoryModule;

  /**
   * Memorable alias for repository (e.g. client.documents.search('cadastral'))
   */
  public readonly documents: RepositoryModule;

  /**
   * Module 3: Conversational RAG & Policy Synthesis Engine
   */
  public readonly assistant: AssistantModule;

  /**
   * Memorable alias for assistant (e.g. client.ai.ask('What is DILRMP?'))
   */
  public readonly ai: AssistantModule;

  /**
   * Module 4: Collaborative Workspaces & Threaded Real-Time Chat
   */
  public readonly workspaces: WorkspacesModule;

  /**
   * Module 5: GIS & Geospatial Visualization Engine
   */
  public readonly geodata: GeodataModule;

  /**
   * Memorable alias for geodata (e.g. client.gis.getDistricts({ state: 'Maharashtra' }))
   */
  public readonly gis: GeodataModule;

  /**
   * Module 6: Analytics & Decision-Support Dashboards (7 Empirical Categories)
   */
  public readonly analytics: AnalyticsModule;

  /**
   * Module 7: Policy Simulation & Scenario Modeling Engine
   */
  public readonly simulate: SimulateModule;

  /**
   * Memorable alias for simulate (e.g. client.simulation.run({ budget: 200 }))
   */
  public readonly simulation: SimulateModule;

  /**
   * Scikit-Learn Predictive Inference Engine (Dispute, Urban, Climate)
   */
  public readonly ml: MlModule;

  /**
   * Module 8: Innovation Portal (Challenges, Proposals, Public Voting)
   */
  public readonly innovation: InnovationModule;

  /**
   * Module 10: Admin Portal & System Telemetry
   */
  public readonly admin: AdminModule;

  /**
   * Module 11: Real-Time Alerts & WebSocket Push Notifications
   */
  public readonly notifications: NotificationsModule;

  /**
   * Server Health & Connectivity Checks
   */
  public readonly health: HealthModule;

  constructor(config: ClientConfig = {}) {
    this.http = new HttpClient(config);

    this.auth = new AuthModule(this.http);
    this.repository = new RepositoryModule(this.http);
    this.documents = this.repository;

    this.assistant = new AssistantModule(this.http);
    this.ai = this.assistant;

    this.workspaces = new WorkspacesModule(this.http);

    this.geodata = new GeodataModule(this.http);
    this.gis = this.geodata;

    this.analytics = new AnalyticsModule(this.http);

    this.simulate = new SimulateModule(this.http);
    this.simulation = this.simulate;

    this.ml = new MlModule(this.http);
    this.innovation = new InnovationModule(this.http);
    this.admin = new AdminModule(this.http);
    this.notifications = new NotificationsModule(this.http);
    this.health = new HealthModule(this.http);
  }

  /**
   * Set or update the JWT Bearer token on the client for all authenticated requests.
   *
   * @example
   * ```ts
   * client.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * ```
   */
  public setToken(token: string | undefined): void {
    this.http.setToken(token);
  }

  /**
   * Retrieve the current JWT Bearer token configured on this client.
   */
  public getToken(): string | undefined {
    return this.http.getToken();
  }

  /**
   * Check whether a token is actively configured on this client.
   */
  public isAuthenticated(): boolean {
    return Boolean(this.http.getToken());
  }

  /**
   * Clear the active JWT authentication token (logs out the client session).
   */
  public clearToken(): void {
    this.http.setToken(undefined);
  }

  /**
   * Memorable alias for clearToken() — logs out the current client session.
   */
  public logout(): void {
    this.clearToken();
  }

  /**
   * Convenient shortcut to client.auth.login().
   * Automatically sets the token on the client for all subsequent requests.
   *
   * @example
   * ```ts
   * const auth = await client.login({ email, password });
   * console.log('Logged in as:', auth.user.full_name);
   * ```
   */
  public async login(
    credentials: import('./types/auth').UserLogin,
    options?: import('./types/common').RequestOptions
  ): Promise<import('./types/auth').TokenResponse> {
    return this.auth.login(credentials, options);
  }

  /**
   * Convenient shortcut to client.auth.register().
   * Automatically sets the token on the client for all subsequent requests.
   */
  public async register(
    payload: import('./types/auth').UserRegister,
    options?: import('./types/common').RequestOptions
  ): Promise<import('./types/auth').TokenResponse> {
    return this.auth.register(payload, options);
  }

  /**
   * Convenient shortcut to client.auth.getMe() — returns the authenticated user profile.
   */
  public async getProfile(
    options?: import('./types/common').RequestOptions
  ): Promise<import('./types/auth').UserRead> {
    return this.auth.getMe(options);
  }

  /**
   * Set the API key used for X-API-Key header authentication.
   */
  public setApiKey(apiKey: string | undefined): void {
    this.http.setApiKey(apiKey);
  }

  /**
   * Get the active API base URL.
   */
  public getBaseUrl(): string {
    return this.http.getBaseUrl();
  }
}

/**
 * Convenience factory function to create a new LandGovernanceClient instance.
 */
export function createClient(config?: ClientConfig): LandGovernanceClient {
  return new LandGovernanceClient(config);
}

