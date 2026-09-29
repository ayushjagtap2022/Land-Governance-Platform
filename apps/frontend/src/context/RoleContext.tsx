import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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
  setActiveRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // When a real user is logged in, derive the role from their backend role.
  // Otherwise, default to 'Researcher' for the demo persona switcher.
  const [activeRole, setActiveRole] = useState<Role>('Researcher');

  useEffect(() => {
    if (isAuthenticated && user) {
      setActiveRole(ROLE_MAP[user.role] || 'Public');
    }
  }, [isAuthenticated, user]);

  const value = useMemo(() => ({ activeRole, setActiveRole }), [activeRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
}