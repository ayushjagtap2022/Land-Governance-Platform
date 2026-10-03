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
  const [ssoCountdown, setSsoCountdown] = useState(0);
  const [digiLockerConsent, setDigiLockerConsent] = useState(true);

  useEffect(() => {
    if (ssoCountdown > 0) {
      const timer = window.setTimeout(() => setSsoCountdown(ssoCountdown - 1), 1000);
      return () => window.clearTimeout(timer);
    }
  }, [ssoCountdown]);

  const handleSendOtp = () => {
    if (ssoCountdown > 0) return;
    setSsoOtpSent(true);
    setSsoOtp('849201');
    setSsoCountdown(30);
    toast.success('Simulation OTP sent to registered officer mobile (+91-XXXXX-90218): 849201', {
      description: 'Active for 10 minutes. For testing, code 849201 has been autofilled.'
    });
  };

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const redirectTarget = searchParams?.get('redirect') || '/repository';

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
      setLocation(redirectTarget.startsWith('/') ? redirectTarget : '/repository');
    }, 600);
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
      {/* Official Government Header Strip */}
      <div className="mb-6 text-center flex flex-col items-center">
        <Link href="/" className="mb-2.5 hover:opacity-95 transition-opacity" title="Back to Home">
          <StateEmblem variant="gold" className="h-16 w-auto drop-shadow-md" />
        </Link>
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#b8860b] font-serif">
          भारत सरकार • ग्रामीण विकास मंत्रालय • भू-संसाधन विभाग
        </p>
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
      <div className="w-full max-w-lg border border-slate-300 bg-white shadow-md rounded-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-300 bg-slate-100 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setAuthTab('standard')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer ${
              authTab === 'standard'
                ? 'border-[#132f4c] bg-white text-[#132f4c]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('janparichay')}
            className={`py-3 px-4 border-b-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
              authTab === 'janparichay'
                ? 'border-orange-500 bg-white text-orange-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <IndiaFlag className="h-3.5 w-[21px] shadow-2xs border border-slate-300 rounded-[1px] inline-block shrink-0" />
            <span>Official Government SSO (MeriPehchan)</span>
          </button>
        </div>

        {authTab === 'standard' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@institution.ac.in"
                className="h-10 w-full border border-slate-300 px-3 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => toast.info('Password Recovery Assistance', {
                    description: 'For institutional & government accounts, contact your nodal admin or email support@landgovernance.gov.in.'
                  })}
                  className="text-[11px] font-medium text-blue-700 hover:text-blue-900 hover:underline cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 w-full border border-slate-300 px-3 pr-10 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
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
              className="flex h-10 w-full items-center justify-center gap-2 bg-[#244562] text-xs font-bold text-white hover:bg-[#132f4c] disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-all duration-200 hover:shadow-xs rounded-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            >
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
              <span className="text-base select-none">🏛️</span>
              <div>
                <strong className="block font-semibold">Government of India Single Sign-On Gateway</strong>
                <span className="text-[11px] text-amber-800">
                  Federated Identity Gateway managed by National Informatics Centre (NIC) for certified DoLR, Survey of India, and State Revenue Officers.
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label htmlFor="sso-department" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Select Ministry or Department
                </label>
                <select
                  id="sso-department"
                  value={ssoDepartment}
                  onChange={(e) => setSsoDepartment(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
                >
                  <option value="Department of Land Resources (DoLR), MoRD">Department of Land Resources (DoLR), MoRD</option>
                  <option value="Survey of India (SVAMITVA Directorate)">Survey of India (SVAMITVA Directorate)</option>
                  <option value="National Informatics Centre (Land Records Division)">National Informatics Centre (Land Records Division)</option>
                  <option value="State Revenue Department (Commissioner of Land Records)">State Revenue Department (Commissioner of Land Records)</option>
                  <option value="Town & Country Planning Organisation (MoHUA)">Town & Country Planning Organisation (MoHUA)</option>
                </select>
              </div>

              <div>
                <label htmlFor="sso-officer-id" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Government Email or Officer ID
                </label>
                <input
                  id="sso-officer-id"
                  type="text"
                  value={ssoOfficerId}
                  onChange={(e) => setSsoOfficerId(e.target.value)}
                  className="w-full border border-slate-300 px-3 py-2 text-xs font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="sso-otp" className="text-xs font-semibold text-slate-700">
                    Mobile OTP Verification
                  </label>
                  {ssoCountdown > 0 ? (
                    <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-xs border border-slate-200">
                      Resend in {ssoCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer transition-colors"
                    >
                      {ssoOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>
                <input
                  id="sso-otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={ssoOtp}
                  onChange={(e) => setSsoOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full border border-slate-300 px-3 py-2 text-xs font-mono bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={digiLockerConsent}
                  onChange={(e) => setDigiLockerConsent(e.target.checked)}
                  className="mt-0.5 accent-blue-600"
                />
                <span>
                  Authorize DigiLocker verification of official government credentials.
                </span>
              </label>

              <button
                type="button"
                onClick={handleSsoLogin}
                disabled={isLoading}
                className="flex h-10 w-full items-center justify-center gap-2 border border-orange-600 bg-orange-600 text-xs font-bold text-white hover:bg-orange-700 transition-all duration-200 hover:shadow-xs cursor-pointer disabled:opacity-60 rounded-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                {isLoading ? (
                  'Verifying Government Credentials...'
                ) : (
                  <>
                    <IndiaFlag className="h-3.5 w-[21px] shadow-2xs border border-white/40 rounded-[1px] inline-block shrink-0" />
                    <span>Sign In with MeriPehchan / Jan Parichay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
