import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useAuthStore, type BackendRole } from '@/stores/authStore';

export type Role = 'Researcher' | 'Official' | 'Institution Admin' | 'Public' | 'Super Admin';

/** Maps backend role strings to frontend display names */
const ROLE_MAP: Record<BackendRole, Role> = {
  researcher: 'Researcher',
  official: 'Official',
  institution: 'Institution Admin',
  public: 'Public',
  super_admin: 'Super Admin',
};

type RoleContextValue = {
  activeRole: Role;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // In production, the active role is strictly derived from the authenticated user's profile.
  // Unauthenticated visitors default to 'Public'.
  const activeRole: Role = useMemo(() => {
    if (isAuthenticated && user?.role) {
      return ROLE_MAP[user.role] || 'Public';
    }
    return 'Public';
  }, [isAuthenticated, user]);

  const value = useMemo(() => ({ activeRole }), [activeRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
}
