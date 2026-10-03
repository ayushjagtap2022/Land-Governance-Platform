/**
 * Authentication and User Types (Module 1).
 */

export type UserRole =
  | 'public'
  | 'researcher'
  | 'official'
  | 'institution'
  | 'super_admin';

export interface UserRead {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution?: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface UserRegister {
  email: string;
  password: string;
  full_name: string;
  institution?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  institution?: string;
}

export interface UserStatusUpdate {
  is_active: boolean;
}

export interface UserRoleUpdate {
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserRead;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
