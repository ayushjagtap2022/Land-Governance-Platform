import {
  Home,
  BookOpen,
  Map,
  Lightbulb,
  Briefcase,
  MessageSquareText,
  Layers,
  SlidersHorizontal,
  BarChart3,
  Settings2,
  Code2,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/context/RoleContext';

export interface NavItemConfig {
  id: string;
  href: string;
  label: string;
  hiLabel: string;
  icon: LucideIcon;
  roles: Role[];
}

const baseRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const researchRoles: Role[] = ['Researcher', 'Super Admin'];
const governanceRoles: Role[] = ['Official', 'Institution Admin', 'Super Admin'];

export const PLATFORM_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'overview',
    href: '/',
    label: 'Overview',
    hiLabel: 'अवलोकन',
    icon: Home,
    roles: baseRoles,
  },
  {
    id: 'repository',
    href: '/repository',
    label: 'Repository',
    hiLabel: 'दस्तावेज़ भंडार',
    icon: BookOpen,
    roles: baseRoles,
  },
  {
    id: 'map',
    href: '/map',
    label: 'GIS Map',
    hiLabel: 'भू-मानचित्र',
    icon: Map,
    roles: baseRoles,
  },
  {
    id: 'innovation',
    href: '/innovation',
    label: 'Innovation Portal',
    hiLabel: 'नवाचार मंच',
    icon: Lightbulb,
    roles: baseRoles,
  },
  {
    id: 'workspaces',
    href: '/workspaces',
    label: 'Workspaces',
    hiLabel: 'कार्यक्षेत्र',
    icon: Briefcase,
    roles: researchRoles,
  },
  {
    id: 'assistant',
    href: '/assistant',
    label: 'AI Assistant',
    hiLabel: 'एआई सहायक',
    icon: MessageSquareText,
    roles: researchRoles,
  },
  {
    id: 'synthesis',
    href: '/synthesis',
    label: 'Synthesis',
    hiLabel: 'नीति संश्लेषण',
    icon: Layers,
    roles: researchRoles,
  },
  {
    id: 'simulate',
    href: '/simulate',
    label: 'Policy Simulator',
    hiLabel: 'नीति सिम्युलेटर',
    icon: SlidersHorizontal,
    roles: governanceRoles,
  },
  {
    id: 'analytics',
    href: '/analytics',
    label: 'Analytics Hub',
    hiLabel: 'विश्लेषण केंद्र',
    icon: BarChart3,
    roles: governanceRoles,
  },
  {
    id: 'admin',
    href: '/admin',
    label: 'Admin Console',
    hiLabel: 'व्यवस्थापक कंसोल',
    icon: Settings2,
    roles: governanceRoles,
  },
  {
    id: 'developers',
    href: '/developers',
    label: 'Developer API',
    hiLabel: 'डेवलपर एपीआई',
    icon: Code2,
    roles: governanceRoles,
  },
];

/**
 * Checks whether the given route href is currently active.
 * Handles root ('/') strictly so it doesn't match every subroute.
 */
export function isRouteActive(href: string, currentPath: string): boolean {
  if (href === '/') {
    return currentPath === '/' || currentPath === '';
  }
  return currentPath === href || currentPath.startsWith(href + '/');
}
