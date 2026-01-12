'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/lib/store';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginToStore } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the backend API to login
      const authResponse = await login({
        email: data.email,
        password: data.password,
      });

      // Save auth data to Zustand store
      await loginToStore(
        {
          id: authResponse.user.id.toString(),
          email: authResponse.user.email,
          name: authResponse.user.full_name,
          is_active: authResponse.user.is_active,
          is_verified: true,
          is_admin: authResponse.user.is_superuser,
        },
        authResponse.access_token
      );

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-arise-deep-teal relative overflow-hidden">
      <Header />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      {/* Vertical lines texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.08) 3px,
            rgba(255, 255, 255, 0.08) 4px
          )`
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto pt-24 pb-12 px-4 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-arise-deep-teal mb-2">
              ARISE
            </h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Welcome back
            </h2>
            <p className="text-gray-600">
              Sign in to continue your leadership journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  {...register('password')}
                  error={errors.password?.message}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-arise-deep-teal focus:ring-arise-deep-teal"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-arise-deep-teal hover:text-arise-gold transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              className="bg-arise-gold hover:bg-arise-gold/90 text-white"
            >
              {isLoading ? 'Signing in...' : 'Sign in →'}
            </Button>
          </form>


          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-arise-deep-teal hover:text-arise-gold font-semibold transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
