import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Role = 'Researcher' | 'Official' | 'Institution Admin' | 'Public' | 'Super Admin';

type RoleContextValue = {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<Role>('Researcher');
  const value = useMemo(() => ({ activeRole, setActiveRole }), [activeRole]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
}