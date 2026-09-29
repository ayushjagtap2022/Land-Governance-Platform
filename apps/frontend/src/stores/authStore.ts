/**
 * Auth Store — Global authentication state using Zustand.
 *
 * Manages the current user, JWT token, and authentication status.
 * Persists to localStorage so the user stays logged in across page refreshes.
 */
import { create } from 'zustand';

export type BackendRole = 'public' | 'researcher' | 'official' | 'institution' | 'super_admin';

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: BackendRole;
  institution?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  hydrate: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
  },
}));
