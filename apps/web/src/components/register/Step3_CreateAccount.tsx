'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegistrationStore } from '@/stores/registrationStore';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { register as registerUser } from '@/lib/api/auth';
import { authAPI } from '@/lib/api';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { transformApiUserToStoreUser } from '@/lib/auth/userTransform';
import { ArrowLeft } from 'lucide-react';

const createAccountSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateAccountFormData = z.infer<typeof createAccountSchema>;

export function Step3_CreateAccount() {
  const { setUserInfo, setStep, selectedPlan } = useRegistrationStore();
  const { login: loginToStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const formatPrice = (plan: typeof selectedPlan) => {
    if (!plan) return '';
    if (!plan.amount || plan.amount === 0) return 'Free';
    const price = (plan.amount / 100).toFixed(2);
    return `$${price}`;
  };

  const formatInterval = (plan: typeof selectedPlan) => {
    if (!plan) return '';
    const interval = plan.interval?.toUpperCase();
    const count = plan.interval_count || 1;
    
    if (interval === 'MONTH' && count === 1) return '/month';
    if (interval === 'YEAR' && count === 1) return '/year';
    if (interval === 'WEEK' && count === 1) return '/week';
    if (interval === 'DAY' && count === 1) return '/day';
    
    // For counts > 1, handle pluralization
    const intervalName = interval?.toLowerCase() || 'month';
    return `/${count} ${intervalName}${count > 1 ? 's' : ''}`;
  };

  const onSubmit = async (data: CreateAccountFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Call the backend API to register the user
      const registeredUser = await registerUser({
        email: data.email,
        password: data.password,
        full_name: `${data.firstName} ${data.lastName}`,
      });

      // Step 2: Automatically login the user to get the access token
      const authResponse = await authAPI.login(data.email, data.password);
      const { access_token, refresh_token, user } = authResponse.data;

      // Step 3: Store user info in the registration store
      setUserInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        userId: registeredUser.id,
      });

      // Step 4: Transform user data to store format
      const userForStore = transformApiUserToStoreUser(user);

      // Step 5: SECURITY: Backend FastAPI sets tokens in httpOnly cookies during login.
      // We also store tokens in sessionStorage as fallback for Authorization header
      // to support cross-origin requests where cookies aren't shared.
      await TokenStorage.setToken(access_token, refresh_token);

      // Step 6: Connect user to authentication store
      await loginToStore(userForStore, access_token, refresh_token);

      // Step 5: Move to review & confirm step (step 4), then payment (step 5)
      setStep(4);
    } catch (err) {
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Handle object errors
        const errorObj = err as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        } else if (errorObj.detail && typeof errorObj.detail === 'string') {
          errorMessage = errorObj.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-1 text-center">
          Create your account
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Enter your information to get started
        </p>

        {selectedPlan && (
          <div className="mb-6 p-4 bg-arise-light-beige border-2 border-arise-gold rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selected Plan</p>
                <h3 className="text-xl font-bold text-arise-deep-teal">{selectedPlan.name}</h3>
                {selectedPlan.description && (
                  <p className="text-sm text-gray-600 mt-1">{selectedPlan.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-arise-gold">
                  {formatPrice(selectedPlan)}
                  {selectedPlan.amount && selectedPlan.amount > 0 && (
                    <span className="text-sm text-gray-600 ml-1">{formatInterval(selectedPlan)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <Input
                id="firstName"
                type="text"
                {...register('firstName')}
                error={errors.firstName?.message}
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <Input
                id="lastName"
                type="text"
                {...register('lastName')}
                error={errors.lastName?.message}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => {
                // Warn user that going back after account creation may cause issues
                if (window.confirm('Your account has been created and you are logged in. Going back may cause navigation issues. Do you want to continue?')) {
                  setStep(2);
                }
              }}
              disabled={isLoading}
              className="text-arise-deep-teal text-base font-semibold flex items-center gap-2 hover:text-arise-deep-teal/80 transition-colors disabled:opacity-50 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
