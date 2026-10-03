/**
 * Auth Module (Module 1: Authentication & Role-Based Access).
 */

import { HttpClient } from '../http';
import {
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserLogin,
  UserRead,
  UserRegister,
  UserUpdate,
} from '../types/auth';
import { RequestOptions } from '../types/common';

export class AuthModule {
  constructor(private http: HttpClient) {}

  /**
   * Register a new user account.
   * Auto-detects role based on email domain:
   * - `.gov.in` / `.nic.in` -> Official
   * - `.ac.in` / `.edu.in` -> Researcher
   * - other -> Public
   * Automatically sets the token on the SDK client upon successful registration.
   */
  public async register(
    payload: UserRegister,
    options?: RequestOptions
  ): Promise<TokenResponse> {
    const res = await this.http.post<TokenResponse>('/auth/register', payload, options);
    if (res?.access_token) {
      this.http.setToken(res.access_token);
    }
    return res;
  }

  /**
   * Authenticate with email and password.
   * Returns a JWT access token and automatically configures the SDK client with the token.
   */
  public async login(
    payload: UserLogin,
    options?: RequestOptions
  ): Promise<TokenResponse> {
    const res = await this.http.post<TokenResponse>('/auth/login', payload, options);
    if (res?.access_token) {
      this.http.setToken(res.access_token);
    }
    return res;
  }

  /**
   * Get the current logged-in user's profile.
   */
  public async getMe(options?: RequestOptions): Promise<UserRead> {
    return this.http.get<UserRead>('/auth/me', undefined, options);
  }

  /**
   * Memorable alias for getMe() — returns the authenticated user's profile.
   */
  public async getProfile(options?: RequestOptions): Promise<UserRead> {
    return this.getMe(options);
  }

  /**
   * Update the current user's profile (`full_name`, `institution`).
   */
  public async updateMe(
    payload: UserUpdate,
    options?: RequestOptions
  ): Promise<UserRead> {
    return this.http.patch<UserRead>('/auth/me', payload, options);
  }

  /**
   * Memorable alias for updateMe() — updates the authenticated user's profile.
   */
  public async updateProfile(
    payload: UserUpdate,
    options?: RequestOptions
  ): Promise<UserRead> {
    return this.updateMe(payload, options);
  }

  /**
   * Request a password reset link for the provided email.
   */
  public async forgotPassword(
    payload: ForgotPasswordRequest,
    options?: RequestOptions
  ): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/forgot-password', payload, options);
  }

  /**
   * Reset password using a reset token.
   */
  public async resetPassword(
    payload: ResetPasswordRequest,
    options?: RequestOptions
  ): Promise<{ message: string }> {
    return this.http.post<{ message: string }>('/auth/reset-password', payload, options);
  }

  /**
   * Set or update the active JWT authentication token.
   */
  public setToken(token: string | undefined): void {
    this.http.setToken(token);
  }

  /**
   * Retrieve the currently configured JWT authentication token.
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
   * Log out by clearing the active authentication token.
   */
  public logout(): void {
    this.http.setToken(undefined);
  }

  /**
   * Clear the active authentication token.
   */
  public clearToken(): void {
    this.logout();
  }
}

