'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { transformApiUserToStoreUser } from '@/lib/auth/userTransform';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { AxiosError } from 'axios';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface ApiErrorResponse {
  detail?: string;
  message?: string;
}

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: loginToStore, setError: setStoreError, error: storeError } = useAuthStore();
  const errorProcessedRef = useRef<string | null>(null);

  // Create schema with translated messages
  const loginSchema = z.object({
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(1, t('validation.passwordRequired')),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  // Read error from URL query parameter or store
  useEffect(() => {
    const errorParam = searchParams.get('error');
    
    if (errorParam) {
      // Prevent processing the same error multiple times
      if (errorProcessedRef.current === errorParam) {
        return;
      }
      
      errorProcessedRef.current = errorParam;
      
      let errorMessage = decodeURIComponent(errorParam);
      
      // Translate common error codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        'unauthorized': t('errors.unauthorized'),
        'session_expired': t('errors.sessionExpired'),
        'unauthorized_superadmin': t('errors.unauthorizedSuperadmin'),
        'forbidden': t('errors.forbidden'),
      };
      
      if (errorMessages[errorParam]) {
        errorMessage = errorMessages[errorParam];
      }
      
      setError(errorMessage);
      setStoreError(errorMessage);
    } else if (storeError) {
      // Show store error if no URL error param
      setError(storeError);
    } else {
      // Clear error if no error param in URL and no store error
      if (errorProcessedRef.current !== null) {
        errorProcessedRef.current = null;
        setError(null);
        setStoreError(null);
      }
    }
  }, [searchParams, storeError, setStoreError]);
  
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
      // Call the backend API to login (uses withCredentials: true for cookies)
      const response = await authAPI.login(data.email, data.password);
      const { access_token, refresh_token, user } = response.data;

      // Transform user data to store format
      const userForStore = transformApiUserToStoreUser(user);

      // SECURITY: Backend FastAPI sets tokens in httpOnly cookies during login.
      // We also store tokens in sessionStorage as fallback for Authorization header
      // to support cross-origin requests where cookies may not be shared.
      await TokenStorage.setToken(access_token, refresh_token);
      await loginToStore(userForStore, access_token, refresh_token);
      
      // Set a flag to indicate we just logged in (for ProtectedRoute to detect)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just_logged_in', 'true');
        // Clear flag after 5 seconds (enough time for ProtectedRoute to detect it and complete auth check)
        setTimeout(() => {
          sessionStorage.removeItem('just_logged_in');
        }, 5000);
      }
      
      // Wait a bit longer to ensure store is hydrated, tokens are stored, and ProtectedRoute can detect auth
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get redirect URL from query params or default to dashboard
      // Remove locale prefix if present (next-intl will add it automatically)
      let redirectUrl = searchParams.get('redirect') || '/dashboard';
      // Remove locale prefix if present (e.g., /fr/dashboard -> /dashboard)
      redirectUrl = redirectUrl.replace(/^\/(en|fr|ar|he)\//, '/');
      router.push(redirectUrl); // Will automatically use current locale
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      const message = axiosError.response?.data?.detail || t('errors.loginFailed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-arise-deep-teal relative overflow-hidden">
      <Header />
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      {/* Vertical lines texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
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
              {t('welcomeBack')}
            </h2>
            <p className="text-gray-600">
              {t('subtitle')}
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
                {t('emailLabel')} *
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t('emailPlaceholder')}
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('passwordLabel')} *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('passwordPlaceholder')}
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
                <span className="ml-2 text-sm text-gray-600">{t('rememberMe')}</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-arise-deep-teal hover:text-arise-gold transition-colors"
              >
                {t('forgotPassword')}
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
              {isLoading ? t('signingIn') : t('signInButton')}
            </Button>
          </form>


          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link 
                href="/register" 
                className="text-arise-deep-teal hover:text-arise-gold font-semibold transition-colors"
              >
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
