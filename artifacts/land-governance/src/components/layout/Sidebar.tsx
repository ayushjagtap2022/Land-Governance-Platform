import { BarChart3, BookOpen, Code2, FileText, Globe2, Home, Lightbulb, Map, MessageSquareText, Settings2, SlidersHorizontal, Sparkles, UsersRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useRole, type Role } from '@/context/RoleContext';

type NavItem = { label: string; href: string; icon: typeof Home; roles: Role[] };
const baseRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const navItems: NavItem[] = [
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
  const visible = navItems.filter((item) => item.roles.includes(activeRole));
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-slate-300 bg-[#1b3a57] text-slate-100 md:min-h-[calc(100dvh-124px)] md:w-60 md:border-b-0 md:border-r md:border-[#34516a]">
      <div className="flex items-center justify-between border-b border-[#34516a] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f2b134]">Platform workspace</p>
          <p className="mt-0.5 text-sm font-semibold">{activeRole} view</p>
        </div>
        <Globe2 className="h-4 w-4 text-slate-400" />
      </div>
      <nav aria-label="Primary navigation" className="flex gap-1 overflow-x-auto p-2 md:block md:space-y-0.5">
        {visible.map(({ label, href, icon: Icon }) => {
           const isActive = location === href || (href === '/workspaces' && location.startsWith('/workspaces')) || (href === '/synthesis' && location.startsWith('/synthesis'));
          return (
            <Link
              className={`focus-ring group flex min-w-max items-center gap-3 border-l-2 px-3 py-2.5 text-xs font-semibold transition-colors md:min-w-0 ${isActive ? 'border-[#f2b134] bg-[#294b68] text-white' : 'border-transparent text-slate-300 hover:bg-[#234562] hover:text-white'}`}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
              href={href}
              key={`${label}-${href}`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-[#f2b134]' : 'text-slate-400 group-hover:text-slate-200'}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto hidden border-t border-[#34516a] p-4 md:block">
        <div className="flex items-start gap-2 text-[11px] leading-4 text-slate-400">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <p>SIH PS 26019<br /><span className="text-slate-500">National Digital Platform for Land Governance</span></p>
        </div>
      </div>
    </aside>
  );
}