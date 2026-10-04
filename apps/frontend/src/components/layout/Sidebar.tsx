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
import { useLanguage } from '@/context/LanguageContext';
import { useAuthStore } from '@/stores/authStore';

type NavItem = { label: string; hiLabel: string; href: string; icon: typeof Home; roles: Role[] };
const baseRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const navItems: NavItem[] = [
  { label: 'Overview', hiLabel: 'अवलोकन', href: '/', icon: Home, roles: baseRoles },
  { label: 'Repository', hiLabel: 'दस्तावेज़ भंडार', href: '/repository', icon: BookOpen, roles: baseRoles },
  { label: 'GIS Map', hiLabel: 'भू-मानचित्र', href: '/map', icon: Map, roles: baseRoles },
  { label: 'Innovation Portal', hiLabel: 'नवाचार मंच', href: '/innovation', icon: Lightbulb, roles: baseRoles },
  { label: 'Workspaces', hiLabel: 'कार्यक्षेत्र', href: '/workspaces', icon: Home, roles: ['Researcher', 'Super Admin'] },
  { label: 'AI Assistant', hiLabel: 'एआई सहायक', href: '/assistant', icon: MessageSquareText, roles: ['Researcher', 'Super Admin'] },
  { label: 'Synthesis', hiLabel: 'संश्लेषण', href: '/synthesis', icon: Sparkles, roles: ['Researcher', 'Super Admin'] },
  { label: 'Policy Simulator', hiLabel: 'नीति सिमुलेटर', href: '/simulate', icon: SlidersHorizontal, roles: ['Official', 'Institution Admin', 'Super Admin'] },
  { label: 'Analytics Hub', hiLabel: 'विश्लेषण केंद्र', href: '/analytics', icon: BarChart3, roles: ['Official', 'Institution Admin', 'Super Admin'] },
  { label: 'Admin Console', hiLabel: 'प्रशासन कंसोल', href: '/admin', icon: Settings2, roles: ['Institution Admin', 'Super Admin'] },
  { label: 'Developer API', hiLabel: 'डेवलपर एपीआई', href: '/developers', icon: Code2, roles: ['Official', 'Institution Admin', 'Super Admin'] },
];

export function Sidebar() {
  const { activeRole } = useRole();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isHindi, t } = useLanguage();
  const [location] = useLocation();

  const isRouteActive = (href: string, currentLoc: string) =>
    currentLoc === href || (href !== '/' && currentLoc.startsWith(href));
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

  const visible = navItems.filter((item) => {
    if (activeRole === 'Super Admin') return true;
    if (!isAuthenticated && !item.roles.includes('Public')) return false;
    return item.roles.includes(activeRole);
  });
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
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2b134]">{t('platform_workspace')}</p>
            <p className="truncate mt-0.5 text-xs font-semibold text-slate-200">
              {activeRole === 'Public' ? t('public_access') : `${t(activeRole)} ${t('portal')}`}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-xs border border-white/20 bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition-colors"
          title={collapsed ? t('expand_sidebar') : t('collapse_sidebar')}
          aria-label={collapsed ? t('expand_sidebar') : t('collapse_sidebar')}
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto p-2 md:block md:space-y-0.5">
        {visible.map(({ label, hiLabel, href, icon: Icon }) => {
          const isActive = isRouteActive(href, location);
          const displayLabel = t(label, isHindi ? hiLabel : label);

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
              title={collapsed ? displayLabel : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-[#f2b134]' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && <span className="truncate">{displayLabel}</span>}
              {collapsed && (
                <span className="sr-only">{displayLabel}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="mt-auto hidden border-t border-[#34516a] p-3 md:block">
        {!collapsed ? (
          <div className="flex items-start gap-2.5 text-[11px] leading-4 text-slate-400">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#f2b134]" />
            <div>
              <span className="inline-flex items-center rounded-[3px] border border-[#f2b134]/40 bg-[#f2b134]/15 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#f2b134] tracking-wider">
                SIH PS 26019
              </span>
              <p className="mt-1 text-[10px] text-slate-400">National Land Governance Platform</p>
            </div>
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