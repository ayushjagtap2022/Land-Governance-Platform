import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuthStore, type BackendRole } from '@/stores/authStore';
import { toast } from 'sonner';

export type Role = 'Researcher' | 'Official' | 'Institution Admin' | 'Public' | 'Super Admin';

/** Maps backend role strings to frontend display names */
export const ROLE_MAP: Record<BackendRole, Role> = {
  researcher: 'Researcher',
  official: 'Official',
  institution: 'Institution Admin',
  public: 'Public',
  super_admin: 'Super Admin',
};

type RoleContextValue = {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  canSwitchRole: boolean;
  userRole: Role;
  evaluatorMode: boolean;
  toggleEvaluatorMode: () => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Derive verified role strictly from the authenticated session
  const userRole: Role = useMemo(() => {
    if (!isAuthenticated || !user) return 'Public';
    return ROLE_MAP[user.role] || 'Public';
  }, [isAuthenticated, user]);

  const [activeRole, setActiveRoleState] = useState<Role>(userRole);

  // Keep activeRole strictly in sync with authenticated user
  useEffect(() => {
    setActiveRoleState(userRole);
  }, [userRole]);

  // Only verified Super Administrators are allowed to test other personas
  const canSwitchRole = Boolean(isAuthenticated && user?.role === 'super_admin');

  const setActiveRole = (newRole: Role) => {
    if (!canSwitchRole && newRole !== userRole) {
      toast.error(`Access Denied: Your account role is verified as "${userRole}". Role escalation is restricted under Government RBAC policy.`);
      return;
    }
    setActiveRoleState(newRole);
    if (newRole !== userRole) {
      toast.info(`Auditor Mode: Previewing platform experience as "${newRole}"`);
    } else {
      toast.success(`Active persona set to verified account role: ${newRole}`);
    }
  };

  // Evaluator mode is disabled by default to enforce authentic RBAC
  const [evaluatorMode, setEvaluatorMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('evaluator_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleEvaluatorMode = () => {
    if (!canSwitchRole) {
      toast.error('Access Denied: Open Evaluator Pass can only be toggled by Super Administrators.');
      return;
    }
    setEvaluatorMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('evaluator_mode', String(next));
      } catch {}
      toast.info(`Evaluator Mode: ${next ? 'Enabled' : 'Disabled'}`);
      return next;
    });
  };

  const value = useMemo(
    () => ({
      activeRole,
      setActiveRole,
      canSwitchRole,
      userRole,
      evaluatorMode,
      toggleEvaluatorMode,
    }),
    [activeRole, canSwitchRole, userRole, evaluatorMode]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
}