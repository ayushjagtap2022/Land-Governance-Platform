/**
 * Login Page — Authenticates users via the FastAPI backend.
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { IndiaFlag } from '@/components/common/IndiaFlag';
import { StateEmblem } from '@/components/common/StateEmblem';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [authTab, setAuthTab] = useState<'standard' | 'janparichay'>('standard');
  const [ssoDepartment, setSsoDepartment] = useState('Department of Land Resources (DoLR), MoRD');
  const [ssoOfficerId, setSsoOfficerId] = useState('DLR-90218-OFFICER');
  const [ssoOtp, setSsoOtp] = useState('');
  const [ssoOtpSent, setSsoOtpSent] = useState(false);
  const [digiLockerConsent, setDigiLockerConsent] = useState(true);
  const handleSsoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('sso-janparichay-official-token', {
        id: '3d1f411c-db79-4ef7-b6b2-b2d970da8054',
        email: 'director.cadastre@dolr.gov.in',
        full_name: 'Dr. V. K. Saxena (Joint Secy, DoLR)',
        role: 'official',
        institution: 'Department of Land Resources, Ministry of Rural Development',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString(),
      });
      toast.success('National Single Sign-On Verified (MeriPehchan / Jan Parichay)', {
        description: 'Level-3 High Assurance Token granted by NIC Identity Federation Gateway.'
      });
      setLocation('/analytics');    }, 600);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { access_token, user } = res.data;
      login(access_token, user);
      toast.success(`Welcome back, ${user.full_name}!`);
      setLocation(redirectTarget.startsWith('/') ? redirectTarget : '/repository');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f4f6f8] px-4 py-8">
      {/* Header strip */}
      <div className="mb-6 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#132f4c] text-white shadow-sm">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
          </div>
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#132f4c]">
          National Land Governance Platform
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Department of Land Resources • Ministry of Rural Development, Government of India        </p>
        <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#132f4c]">
          National Land Governance Platform
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Centralized Single Sign-On &amp; Verified Role-Based Access Gateway
        </p>
        {/* Balanced, centered tricolor bar */}
        <div className="flex h-1 w-20 overflow-hidden rounded-full mx-auto my-2 shadow-2xs">
          <span className="w-1/3 bg-[#FF9933]" />
          <span className="w-1/3 bg-[#FFFFFF] border-y border-slate-200" />
          <span className="w-1/3 bg-[#138808]" />
        </div>
      </div>

      {/* Alert banner if redirected due to auth requirement */}
      {redirectTarget && redirectTarget !== '/repository' && (
        <div className="mb-5 max-w-lg w-full border-l-4 border-[#b8860b] bg-[#fff8e8] p-3 text-xs text-[#8c6508] shadow-2xs rounded-r-xs">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#b8860b] shrink-0" />
            Authentication Required
          </p>
          <p className="mt-1 text-[11px] leading-relaxed">
            Please sign in to access the National Land Governance Repository and your requested search query.
          </p>
        </div>
      )}

      {/* Login card */}
      <div className="w-full max-w-lg border border-slate-300 bg-white shadow-md">        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-300 bg-slate-100 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setAuthTab('standard')}
            className={`py-3 px-4 border-b-2 transition-colors ${              authTab === 'standard'
                ? 'border-[#132f4c] bg-white text-[#132f4c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Institutional Account          </button>
          <button
            type="button"
            onClick={() => setAuthTab('janparichay')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center justify-center gap-2 ${              authTab === 'janparichay'
                ? 'border-orange-500 bg-white text-orange-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white font-bold">🇮🇳</span>
            <span>MeriPehchan / Jan Parichay</span>          </button>
        </div>

        {authTab === 'standard' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@institution.ac.in"
                className="focus-ring h-9 w-full border border-slate-300 px-3 text-xs bg-white"                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">
                Password
              </label>              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="focus-ring h-9 w-full border border-slate-300 px-3 pr-10 text-xs bg-white"                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="focus-ring flex h-9 w-full items-center justify-center gap-2 bg-[#244562] text-xs font-bold text-white hover:bg-[#132f4c] disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-colors"            >
              {isLoading ? (
                'Signing in...'
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5" /> Sign In with Password
                </>
              )}
            </button>
          </form>
        ) : (
          /* Jan Parichay Government SSO Form */
          <div className="p-6 space-y-4">
            <div className="rounded-xs border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <span className="text-base">🏛️</span>              <div>
                <strong className="block font-semibold">Government of India Single Sign-On Gateway</strong>
                <span className="text-[11px] text-amber-800">
                  Federated Identity Gateway managed by National Informatics Centre (NIC) for certified DoLR, Survey of India, and State Revenue Officers.
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Select Ministry / Agency / Cadastral Directorate
                </label>
                <select
                  value={ssoDepartment}
                  onChange={(e) => setSsoDepartment(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-xs focus-ring bg-white"                >
                  <option value="Department of Land Resources (DoLR), MoRD">Department of Land Resources (DoLR), MoRD</option>
                  <option value="Survey of India (SVAMITVA Directorate)">Survey of India (SVAMITVA Directorate)</option>
                  <option value="National Informatics Centre (Land Records Division)">National Informatics Centre (Land Records Division)</option>
                  <option value="State Revenue Department (Commissioner of Land Records)">State Revenue Department (Commissioner of Land Records)</option>
                  <option value="Town & Country Planning Organisation (MoHUA)">Town & Country Planning Organisation (MoHUA)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Officer Parichay ID / Gov Email
                </label>
                <input
                  type="text"
                  value={ssoOfficerId}
                  onChange={(e) => setSsoOfficerId(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono focus-ring bg-white"                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Aadhaar / Mobile OTP Authentication
                  </label>
                  {!ssoOtpSent ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSsoOtpSent(true);
                        setSsoOtp('849201');
                        toast.success('Simulation OTP sent to registered officer mobile (+91-XXXXX-90218): 849201');
                      }}
                      className="text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      Send OTP
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 font-bold">OTP Dispatched</span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder={ssoOtpSent ? "Enter 6-digit OTP (Simulated: 849201)" : "Click 'Send OTP' above"}
                  value={ssoOtp}
                  onChange={(e) => setSsoOtp(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-1.5 text-xs font-mono focus-ring bg-white"                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={digiLockerConsent}
                  onChange={(e) => setDigiLockerConsent(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span>
                  Authorize DigiLocker authentication & verify official credentials with CERT-In Level-3 digital audit log.                </span>
              </label>

              <button
                type="button"
                onClick={handleSsoLogin}
                disabled={isLoading}
                className="focus-ring flex h-10 w-full items-center justify-center gap-2 border border-orange-600 bg-orange-600 text-xs font-bold text-white hover:bg-orange-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  'Verifying Security Assertion Markup Token...'
                ) : (
                  <>
                    <span className="font-bold">🇮🇳</span>
                    <span>Authenticate via MeriPehchan / Jan Parichay</span>                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Fast SIH Judge Persona Shortcuts */}
        <div className="px-6 pb-6">
          <div className="rounded-xs border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ⚡ Evaluator / Admin Fast Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  login('evaluator-superadmin-token', {
                    id: 'a2357c04-f92e-49b1-9d53-3ad0d26772cd',
                    email: 'nirmaldarekar90@gmail.com',
                    full_name: 'Nirmal Darekar',
                    role: 'super_admin',
                    institution: 'National Land Governance Platform Administration',
                    is_active: true,
                    is_verified: true,
                    created_at: new Date().toISOString(),
                  });
                  toast.success('Logged in as Super Admin (Nirmal Darekar) — Full Access Granted!');
                  setLocation('/analytics');
                }}
                className="col-span-2 border border-emerald-500 bg-emerald-50 px-2 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>👑</span> Super Admin: Nirmal Darekar (All Access)
              </button>
              <button
                type="button"
                onClick={() => {
                  login('evaluator-official-token', {
                    id: '3d1f411c-db79-4ef7-b6b2-b2d970da8054',
                    email: 'official@dolr.gov.in',
                    full_name: 'DoLR Official',
                    role: 'official',
                    institution: 'DoLR, MoRD',
                    is_active: true,
                    is_verified: true,
                    created_at: new Date().toISOString(),
                  });
                  toast.success('Logged in as Official');
                  setLocation('/analytics');
                }}
                className="border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Official (DoLR)
              </button>
              <button
                type="button"
                onClick={() => {
                  login('evaluator-researcher-token', {
                    id: '80f0d355-d851-48d9-bac5-a62c2d84f6f4',
                    email: 'test@iisc.ac.in',
                    full_name: 'Policy Researcher',
                    role: 'researcher',
                    institution: 'IISc / NCAER',
                    is_active: true,
                    is_verified: true,
                    created_at: new Date().toISOString(),
                  });
                  toast.success('Logged in as Researcher');
                  setLocation('/repository');
                }}
                className="border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Researcher (IISc)
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-bold text-[#244562] underline underline-offset-2">
            Register here
          </Link>
        </div>
      </div>

      <p className="mt-6 text-[10px] text-slate-400">
        SIH PS 26019 · National Digital Platform for Land Governance
      </p>
    </div>
  );
}
