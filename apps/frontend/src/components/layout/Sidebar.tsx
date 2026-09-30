import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  Globe2,
  Home,
  Lightbulb,
  Map,
  MessageSquareText,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useRole, type Role } from '@/context/RoleContext';

type NavItem = { label: string; href: string; icon: typeof Home; roles: Role[] };
const baseRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: Home, roles: baseRoles },
  { label: 'Repository', href: '/repository', icon: BookOpen, roles: baseRoles },
  { label: 'GIS Map', href: '/map', icon: Map, roles: baseRoles },
  { label: 'Innovation Portal', href: '/innovation', icon: Lightbulb, roles: baseRoles },
  { label: 'Workspaces', href: '/workspaces', icon: Home, roles: ['Researcher'] },
  { label: 'AI Assistant', href: '/assistant', icon: MessageSquareText, roles: ['Researcher'] },
  { label: 'Synthesis', href: '/synthesis', icon: Sparkles, roles: ['Researcher'] },
  { label: 'Policy Simulator', href: '/simulate', icon: SlidersHorizontal, roles: ['Official', 'Institution Admin', 'Super Admin'] },
  { label: 'Analytics Hub', href: '/analytics', icon: BarChart3, roles: ['Official', 'Institution Admin', 'Super Admin'] },
  { label: 'Admin Console', href: '/admin', icon: Settings2, roles: ['Official', 'Institution Admin', 'Super Admin'] },
  { label: 'Developer API', href: '/developers', icon: Code2, roles: ['Official', 'Institution Admin', 'Super Admin'] },
];

export function Sidebar() {
  const { activeRole } = useRole();
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('nlgp_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nlgp_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const visible = navItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside
      className={`flex shrink-0 flex-col border-b border-slate-300 bg-[#1b3a57] text-slate-100 transition-all duration-300 ease-in-out md:min-h-[calc(100dvh-124px)] md:border-b-0 md:border-r md:border-[#34516a] ${
        collapsed ? 'w-full md:w-16' : 'w-full md:w-60'
      }`}
    >
      {/* Sidebar Header with Retract / Expand Toggle Button */}
      <div className={`flex items-center border-b border-[#34516a] py-3 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!collapsed && (
          <div className="min-w-0 pr-2 overflow-hidden">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2b134]">Platform workspace</p>
            <p className="truncate mt-0.5 text-xs font-semibold text-slate-200">{activeRole} view</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-xs border border-white/20 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto p-2 md:block md:space-y-0.5">
        {visible.map(({ label, href, icon: Icon }) => {
          const isActive =
            (href === '/' && location === '/') ||
            (href !== '/' && location.startsWith(href));

          return (
            <Link
              className={`focus-ring group relative flex items-center border-l-2 transition-colors ${
                collapsed
                  ? 'justify-center px-2 py-3 md:min-w-0'
                  : 'gap-3 px-3 py-2.5 text-xs font-semibold md:min-w-0'
              } ${
                isActive
                  ? 'border-[#f2b134] bg-[#294b68] text-white'
                  : 'border-transparent text-slate-300 hover:bg-[#234562] hover:text-white'
              }`}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              href={href}
              key={`${label}-${href}`}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-[#f2b134]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="truncate">{label}</span>}
              {collapsed && (
                <span className="sr-only">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto hidden border-t border-[#34516a] p-3 md:block">
        {!collapsed ? (
          <div className="flex items-start gap-2 text-[11px] leading-4 text-slate-400">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#f2b134]" />
            <p>
              SIH PS 26019<br />
              <span className="text-slate-500">National Digital Platform for Land Governance</span>
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="SIH PS 26019 - National Land Governance Platform">
            <FileText className="h-4 w-4 text-[#f2b134]" />
          </div>
        )}
      </div>
    </aside>
  );
}