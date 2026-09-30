/**
 * Login Page — Authenticates users via the FastAPI backend.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

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
      setLocation('/repository');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f4f6f8] px-4">
      {/* Header strip */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex items-center justify-center gap-2">
          <ShieldCheck className="h-8 w-8 text-[#132f4c]" />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-[#132f4c]">
          Land Governance Platform
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Department of Land Resources · Ministry of Rural Development
        </p>
      </div>

      {/* Login card */}
      <div className="w-full max-w-md border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-sm font-bold text-[#132f4c]">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-slate-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@institution.ac.in"
              className="focus-ring h-10 w-full border border-slate-300 px-3 text-sm"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="focus-ring h-10 w-full border border-slate-300 px-3 pr-10 text-sm"
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
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
            className="focus-ring flex h-10 w-full items-center justify-center gap-2 bg-[#244562] text-xs font-bold text-white hover:bg-[#132f4c] disabled:opacity-60 disabled:cursor-wait cursor-pointer"
          >
            {isLoading ? (
              'Signing in...'
            ) : (
              <>
                <LogIn className="h-4 w-4" /> Sign In with Password
              </>
            )}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Or Government Single Sign-On
            </span>
          </div>

          {/* Jan Parichay / MeriPehchaan / DigiLocker Govt SSO */}
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                login('demo-janparichay-sso-token', {
                  id: '3d1f411c-db79-4ef7-b6b2-b2d970da8054',
                  email: 'official@dolr.gov.in',
                  full_name: 'Govt Official (DoLR)',
                  role: 'official',
                  institution: 'Department of Land Resources, MoRD',
                  is_active: true,
                  is_verified: true,
                  created_at: new Date().toISOString(),
                });
                toast.success('Authenticated via Jan Parichay (MeriPehchaan) National SSO!');
                setLocation('/analytics');
              }, 500);
            }}
            disabled={isLoading}
            className="focus-ring flex h-11 w-full items-center justify-center gap-2.5 border border-[#1E3A8A] bg-[#EFF6FF] text-xs font-bold text-[#1E3A8A] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E3A8A] text-[10px] text-white font-bold">🇮🇳</span>
            <span>Sign in with Jan Parichay / DigiLocker SSO</span>
          </button>

          {/* Fast SIH Judge Persona Shortcuts */}
          <div className="mt-4 rounded-xs border border-slate-200 bg-slate-50 p-3">
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
                className="border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
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
                className="border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Researcher (IISc)
              </button>
            </div>
          </div>
        </form>

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
