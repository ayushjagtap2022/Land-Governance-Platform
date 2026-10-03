/**
 * Register Page — Creates a new user account via the FastAPI backend.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'wouter';
import { UserPlus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { StateEmblem } from '@/components/common/StateEmblem';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  institution: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const emailValue = watch('email') || '';
  const detectedRole = emailValue.endsWith('.gov.in') || emailValue.endsWith('.nic.in')
    ? { role: 'Official (Government Clearance)', badge: 'bg-emerald-50 text-emerald-800 border-emerald-300' }
    : emailValue.endsWith('.ac.in') || emailValue.endsWith('.edu.in') || emailValue.endsWith('.edu')
      ? { role: 'Researcher (Academic / Institution)', badge: 'bg-blue-50 text-blue-800 border-blue-300' }
      : emailValue.includes('@') && emailValue.includes('.')
        ? { role: 'Citizen (Public Access)', badge: 'bg-slate-100 text-slate-700 border-slate-300' }
        : null;

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { access_token, user } = res.data;
      login(access_token, user);
      toast.success('Registration successful! Welcome aboard.');
      setLocation('/repository');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f4f6f8] px-4 py-8">
      {/* Official Government Header strip */}
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
          Official Institutional &amp; Citizen Registration Portal
        </p>
        {/* Balanced, centered tricolor bar */}
        <div className="flex h-1 w-20 overflow-hidden rounded-full mx-auto my-2 shadow-2xs">
          <span className="w-1/3 bg-[#FF9933]" />
          <span className="w-1/3 bg-[#FFFFFF] border-y border-slate-200" />
          <span className="w-1/3 bg-[#138808]" />
        </div>
      </div>

      {/* Register card */}
      <div className="w-full max-w-md border border-slate-300 bg-white shadow-md rounded-xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-sm font-bold text-[#132f4c]">Create a new account</h2>
          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
            Your role is auto-detected from your email domain (.gov.in → Official, .ac.in → Researcher, public domains → Citizen).
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Dr. Jane Doe"
              className="h-10 w-full border border-slate-300 px-3 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

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
            {detectedRole && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-600">Auto-detected clearance:</span>
                <span className={`inline-block rounded-xs border px-1.5 py-0.2 font-semibold text-[10px] ${detectedRole.badge}`}>
                  {detectedRole.role}
                </span>
              </div>
            )}
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
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

          <div>
            <label htmlFor="institution" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Institution / Organization <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="institution"
              type="text"
              placeholder="e.g. IIT Bombay, NIC Kerala"
              className="h-10 w-full border border-slate-300 px-3 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all rounded-xs"
              {...register('institution')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 w-full items-center justify-center gap-2 bg-[#244562] text-xs font-bold text-white hover:bg-[#132f4c] disabled:opacity-60 disabled:cursor-wait cursor-pointer transition-all duration-200 hover:shadow-xs rounded-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            {isLoading ? (
              'Creating account...'
            ) : (
              <>
                <UserPlus className="h-4 w-4" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#244562] underline underline-offset-2">
            Sign in
          </Link>
        </div>
      </div>

      <p className="mt-6 text-[10px] text-slate-400">
        SIH PS 26019 · National Digital Platform for Land Governance
      </p>
    </div>
  );
}
