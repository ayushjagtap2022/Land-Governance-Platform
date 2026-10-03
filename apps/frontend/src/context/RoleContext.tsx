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
  evaluatorMode: boolean;
  toggleEvaluatorMode: () => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [activeRole, setActiveRole] = useState<Role>('Researcher');
  const [evaluatorMode, setEvaluatorMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('evaluator_mode');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleEvaluatorMode = () => {
    setEvaluatorMode((prev) => {
      const next = !prev;
      localStorage.setItem('evaluator_mode', String(next));
      return next;
    });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      setActiveRole(ROLE_MAP[user.role] || 'Public');
    }
  }, [isAuthenticated, user]);

  const value = useMemo(
    () => ({ activeRole, setActiveRole, evaluatorMode, toggleEvaluatorMode }),
    [activeRole, evaluatorMode]
  );
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
}