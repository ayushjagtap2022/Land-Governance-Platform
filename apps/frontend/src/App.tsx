import { useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChevronRight, CircleHelp } from 'lucide-react';
import { Route, Switch, useLocation } from 'wouter';import { Toaster as SonnerToaster } from 'sonner';
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

function AccessDenied({ requested }: { requested: string }) {
  const { activeRole, setActiveRole, evaluatorMode, toggleEvaluatorMode } = useRole();
  const { t } = useLanguage();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [location] = useLocation();

  return (
    <PageFrame kicker="Access control" title="Access Restricted" description={`The ${requested} workspace requires verified credentials or open evaluator access.`}>
      <div className="border border-slate-300 bg-white p-6 md:p-10">
        <div className="flex max-w-xl items-start gap-4">
          <div className="border border-[#f2b134] bg-[#fff8e8] p-3"><CircleHelp className="h-6 w-6 text-[#9b6300]" /></div>
          <div>
            <h2 className="text-lg font-bold text-[#132f4c]">
              {isAuthenticated ? t('Evaluation Access & Persona Switcher') : t('Sign In Required')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isAuthenticated
                ? `${t('Your account')} (${t(activeRole)}) ${t('does not have clearance to access the')} ${t(requested)} ${t('module under standard RBAC. Switch role or enable Open Evaluator Pass below:')}`
                : t('The requested module is restricted. Sign in or enable open evaluator pass below for judging.')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveRole('Official')}
                className="bg-[#132f4c] text-white px-3.5 py-2 text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                type="button"
              >
                Switch to Official Role
              </button>
              <button
                onClick={() => toggleEvaluatorMode()}
                className="border border-[#f2b134] bg-[#fff8e8] text-[#9b6300] px-3.5 py-2 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                type="button"
              >
                ⚡ Enable Open Evaluator Pass
              </button>
              {!isAuthenticated && (
                <Link
                  href={`/login?redirect=${encodeURIComponent(location)}`}
                  className="bg-[#132f4c] text-white px-4 py-2 text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {t('Sign In to Continue')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function Guard({ allowed, name, children }: { allowed: Role[]; name: string; children: ReactNode }) {
  const { activeRole, evaluatorMode } = useRole();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (evaluatorMode || allowed.includes(activeRole) || activeRole === 'Super Admin') {
    return <>{children}</>;
  }
  return <AccessDenied requested={name} />;
}

const allRoles: Role[] = ['Public', 'Researcher', 'Official', 'Institution Admin', 'Super Admin'];
const researchRoles: Role[] = ['Researcher', 'Super Admin'];
const governanceRoles: Role[] = ['Official', 'Institution Admin', 'Super Admin'];

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [location] = useLocation();
  const isLandingPage = location === '/';

  // Connect global notifications when logged in
  useNotifications();

  return (
    <div className="min-h-[100dvh] bg-[#f4f6f8]">
      <Header />
      <div className="flex w-full flex-col md:flex-row">
        {!isLandingPage && <Sidebar />}
        <main id="main-content" className={`min-w-0 flex-1 ${isLandingPage ? 'w-full' : ''}`}>
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
              <Route path="/admin"><Guard allowed={governanceRoles} name="Admin Console"><AdminPage /></Guard></Route>
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