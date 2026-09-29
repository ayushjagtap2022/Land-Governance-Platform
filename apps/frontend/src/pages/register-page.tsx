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
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

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

      {/* Register card */}
      <div className="w-full max-w-md border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h2 className="text-sm font-bold text-[#132f4c]">Create a new account</h2>
          <p className="mt-1 text-[11px] text-slate-500">
            Your role is auto-detected from your email domain (.gov.in → Official, .ac.in → Researcher).
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div>
            <label htmlFor="full_name" className="mb-1 block text-xs font-semibold text-slate-700">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Dr. Jane Doe"
              className="focus-ring h-10 w-full border border-slate-300 px-3 text-sm"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="mt-1 text-xs text-red-600">{errors.full_name.message}</p>
            )}
          </div>

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
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
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

          <div>
            <label htmlFor="institution" className="mb-1 block text-xs font-semibold text-slate-700">
              Institution / Organization <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="institution"
              type="text"
              placeholder="e.g. IIT Bombay, NIC Kerala"
              className="focus-ring h-10 w-full border border-slate-300 px-3 text-sm"
              {...register('institution')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="focus-ring flex h-10 w-full items-center justify-center gap-2 bg-[#244562] text-xs font-bold text-white hover:bg-[#132f4c] disabled:opacity-60 disabled:cursor-wait"
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
