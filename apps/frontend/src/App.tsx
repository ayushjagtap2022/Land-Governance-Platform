import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChevronRight, CircleHelp } from 'lucide-react';
import { Route, Switch, useLocation, Link } from 'wouter';
import { Toaster as SonnerToaster } from 'sonner';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleProvider, useRole, type Role } from '@/context/RoleContext';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/use-notifications';
import GroundedAssistantPage from '@/pages/assistant-page';
import GeospatialMapPage from '@/pages/map-page';
import CentralRepositoryPage from '@/pages/repository-page';
import NotFound from '@/pages/not-found';
import SynthesisPage from '@/pages/synthesis-page';
import AnalyticsPage from '@/pages/analytics-page';
import SimulatePage from '@/pages/simulate-page';
import WorkspacesPage from '@/pages/workspaces-page';
import InnovationPage from '@/pages/innovation-page';
import AdminPage from '@/pages/admin-page';
import DevelopersPage from '@/pages/developers-page';
import LoginPage from '@/pages/login-page';
import RegisterPage from '@/pages/register-page';
import LandingPage from '@/pages/landing-page';

const queryClient = new QueryClient();

import { LanguageProvider, useLanguage } from '@/context/LanguageContext';

function Breadcrumb({ current }: { current: string }) {
  const { t } = useLanguage();
  return (
    <div className="mb-4 flex items-center gap-2 text-xs text-slate-500" data-testid="text-breadcrumb">
      <span>{t('app_name')}</span><ChevronRight className="h-3 w-3" /><span className="font-semibold text-[#244562]">{t(current)}</span>
    </div>
  );
}

function PageFrame({ title, kicker, description, children, actions }: { title: string; kicker: string; description: string; children: ReactNode; actions?: ReactNode }) {
  const { t } = useLanguage();
  return (
    <section className="w-full px-4 py-5 md:px-8 md:py-7">
      <Breadcrumb current={title} />
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end">
        <div>
          <p className="section-kicker mb-2">{t(kicker)}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#132f4c] md:text-4xl" data-testid={`text-page-title-${title.toLowerCase().replaceAll(' ', '-')}`}>{t(title)}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t(description)}</p>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function AccessDenied({ requested, reason }: { requested: string; reason?: 'unauthenticated' | 'unauthorized_role' }) {
  const { activeRole, canSwitchRole, setActiveRole } = useRole();
  const { t } = useLanguage();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [location] = useLocation();

  const isUnauthenticated = reason === 'unauthenticated' || !isAuthenticated;

  return (
    <PageFrame
      kicker="Access Control & Security"
      title={isUnauthenticated ? "Authentication Required" : "Security Clearance Insufficient"}
      description={`Access to the ${requested} module is protected under Government of India RBAC standards.`}
    >
      <div className="border border-slate-300 bg-white p-6 md:p-10 shadow-xs">
        <div className="flex max-w-xl items-start gap-4">
          <div className="border border-[#b91c1c] bg-[#fef2f2] p-3 rounded-xs shrink-0">
            <CircleHelp className="h-6 w-6 text-[#b91c1c]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#132f4c]">
              {isUnauthenticated ? t('Sign In Required') : t('Access Restricted')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isUnauthenticated
                ? `The "${requested}" module requires verified user credentials. Please sign in with an authorized institutional or government account.`
                : `Your verified account role (${activeRole}) does not have clearance to access the "${requested}" module under standard Government of India access control rules.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {isUnauthenticated ? (
                <Link
                  href={`/login?redirect=${encodeURIComponent(location)}`}
                  className="bg-[#132f4c] text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs rounded-xs"
                >
                  {t('Sign In to Continue')}
                </Link>
              ) : (
                <>
                  <Link
                    href="/"
                    className="border border-slate-300 bg-white text-slate-700 px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs rounded-xs"
                  >
                    Return to Overview
                  </Link>
                  {canSwitchRole && (
                    <button
                      onClick={() => setActiveRole('Super Admin')}
                      className="bg-[#132f4c] text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs rounded-xs cursor-pointer"
                      type="button"
                    >
                      👑 Restore Super Admin Clearance
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function Guard({ allowed, name, children }: { allowed: Role[]; name: string; children: ReactNode }) {
  const { activeRole } = useRole();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  // Super Admin has ALL ACCESS to every workspace and role
  const isSuperAdmin = Boolean(isAuthenticated && (user?.role === 'super_admin' || activeRole === 'Super Admin'));
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  const isPublicAllowed = allowed.includes('Public');

  // 1. If route is restricted (not public), user MUST be authenticated
  if (!isPublicAllowed && !isAuthenticated) {
    return <AccessDenied requested={name} reason="unauthenticated" />;
  }

  // 2. If authenticated (or public), check if activeRole has permission
  if (allowed.includes(activeRole)) {
    return <>{children}</>;
  }

  // 3. Authenticated, but role does not have clearance
  return <AccessDenied requested={name} reason="unauthorized_role" />;
}

const allRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const researchRoles: Role[] = ['Researcher', 'Super Admin'];
const governanceRoles: Role[] = ['Official', 'Institution Admin', 'Super Admin'];
const adminRoles: Role[] = ['Institution Admin', 'Super Admin'];

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [location] = useLocation();
  const isLandingPage = location === '/';

  const isAuthPage = location === '/login' || location === '/register';
  const showSidebar = !isLandingPage && !isAuthPage;

  // Connect global notifications when logged in
  useNotifications();

  return (
    <div className="min-h-[100dvh] bg-[#f4f6f8] overflow-x-hidden flex flex-col">
      <Header />
      <div className="flex w-full flex-1 flex-col md:flex-row">
        {showSidebar && <Sidebar />}
        <main id="main-content" className={`min-w-0 flex-1 ${showSidebar ? '' : 'w-full'}`}>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              <Route path="/repository"><Guard allowed={allRoles} name="Repository"><CentralRepositoryPage /></Guard></Route>
              <Route path="/map"><Guard allowed={allRoles} name="GIS Map"><GeospatialMapPage /></Guard></Route>
              <Route path="/innovation"><Guard allowed={allRoles} name="Innovation Portal"><InnovationPage /></Guard></Route>
              <Route path="/assistant"><Guard allowed={researchRoles} name="AI Assistant"><GroundedAssistantPage /></Guard></Route>
              <Route path="/synthesis"><Guard allowed={researchRoles} name="Research Synthesis"><SynthesisPage /></Guard></Route>
              <Route path="/workspaces"><Guard allowed={researchRoles} name="Workspaces"><WorkspacesPage /></Guard></Route>
              <Route path="/analytics"><Guard allowed={governanceRoles} name="Analytics Hub"><AnalyticsPage /></Guard></Route>
              <Route path="/simulate"><Guard allowed={governanceRoles} name="Policy Simulator"><SimulatePage /></Guard></Route>
              <Route path="/admin"><Guard allowed={adminRoles} name="Admin Console"><AdminPage /></Guard></Route>
              <Route path="/developers"><Guard allowed={governanceRoles} name="Developer API"><DevelopersPage /></Guard></Route>
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </main>
      </div>
    </div>
  );
}

function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <RoleProvider>
            <Switch>
              {/* Auth pages render WITHOUT Sidebar/Header */}
              <Route path="/login" component={LoginPage} />
              <Route path="/register" component={RegisterPage} />
              {/* Everything else renders inside the Shell */}
              <Route><Shell /></Route>
            </Switch>
          </RoleProvider>
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;