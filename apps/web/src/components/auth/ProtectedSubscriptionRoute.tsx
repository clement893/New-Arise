'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useMySubscription } from '@/lib/query/queries';
import { isSubscriptionActive } from '@/utils/subscriptions';
import { logger } from '@/lib/logger';
import ProtectedRoute from './ProtectedRoute';

/**
 * Protected Subscription Route Component
 * 
 * Prevents access to routes requiring an active subscription.
 * Automatically redirects to profile page with subscription tab if user has no active plan.
 * 
 * @example
 * ```tsx
 * <ProtectedSubscriptionRoute>
 *   <Dashboard />
 * </ProtectedSubscriptionRoute>
 * ```
 */
interface ProtectedSubscriptionRouteProps {
  /** Child components to protect */
  children: ReactNode;
}

export default function ProtectedSubscriptionRoute({ children }: ProtectedSubscriptionRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError } = useMySubscription();
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const checkingRef = useRef(false);

  useEffect(() => {
    // Wait for user to be available
    if (!user) {
      return;
    }

    // Skip subscription check for profile page - users should always be able to access profile
    // Profile page is where they can manage their subscription
    if (pathname.includes('/profile')) {
      setHasCheckedSubscription(true);
      checkingRef.current = false;
      return;
    }

    // Wait for subscription data to load
    if (subscriptionLoading) {
      return;
    }

    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      return;
    }

    checkingRef.current = true;

    // Get subscription data from React Query response
    // React Query wraps axios response in { data: AxiosResponse }
    // So subscriptionData.data is the AxiosResponse, and subscriptionData.data.data is the actual data
    const actualSubscriptionData = subscriptionData?.data?.data || subscriptionData?.data;
    
    // Check if user has an active subscription
    // If no subscription data (404 - no subscription) or subscription exists but not active, redirect
    const hasActivePlan = actualSubscriptionData?.plan && 
      actualSubscriptionData?.status && 
      isSubscriptionActive(actualSubscriptionData.status);

    logger.debug('[ProtectedSubscriptionRoute] Checking subscription', {
      pathname,
      hasSubscriptionData: !!actualSubscriptionData,
      hasPlan: !!actualSubscriptionData?.plan,
      subscriptionStatus: actualSubscriptionData?.status,
      hasActivePlan,
      hasError: !!subscriptionError,
    });

    // If no active plan (including 404 - no subscription), redirect to profile with subscription tab
    if (!hasActivePlan) {
      logger.info('[ProtectedSubscriptionRoute] No active plan, redirecting to profile', {
        pathname,
        subscriptionStatus: actualSubscriptionData?.status,
        hasSubscription: !!actualSubscriptionData,
      });
      
      // Get locale from pathname (e.g., /fr/dashboard -> fr, /en/dashboard -> en)
      const locale = pathname.split('/')[1] || 'en';
      router.replace(`/${locale}/profile?tab=subscription`);
      return;
    }

    // User has active plan, allow access
    setHasCheckedSubscription(true);
    checkingRef.current = false;
  }, [user, subscriptionData, subscriptionLoading, pathname, router]);

  // Show loading state while checking subscription
  if (!user || subscriptionLoading || !hasCheckedSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Wrap children in ProtectedRoute to ensure authentication is also checked
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
