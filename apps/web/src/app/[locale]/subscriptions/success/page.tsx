'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { queryKeys, useSubscriptionPlan, useMySubscription, useSyncSubscription } from '@/lib/query/queries';
import { logger } from '@/lib/logger';

// Note: Client Components are already dynamic by nature.
// Route segment config (export const dynamic) only works in Server Components.
// Since this page uses useSearchParams (which requires dynamic rendering),
// and it's a Client Component, it will be rendered dynamically automatically.

function SubscriptionSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  // Use the subscriptionSuccess namespace at root level
  const t = useTranslations('subscriptionSuccess');
  const [planName, setPlanName] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Get plan ID from URL
  const planIdParam = searchParams.get('plan');
  const planId = planIdParam ? parseInt(planIdParam, 10) : null;
  
  // Fetch plan details from API if planId is a number
  // Disable query if no planId to avoid unnecessary requests
  const { data: planData, isLoading: planLoading } = useSubscriptionPlan(planId || 0);
  
  // Also try to get plan name from current subscription
  // This might fail with 401 initially after Stripe redirect, that's OK
  const { data: subscriptionData, error: subscriptionError } = useMySubscription();
  const syncSubscriptionMutation = useSyncSubscription();
  
  // Log subscription errors for debugging (but don't block UI)
  useEffect(() => {
    if (subscriptionError) {
      logger.debug('Subscription fetch error (may be expected after Stripe redirect)', {
        error: subscriptionError,
        planId
      });
    }
  }, [subscriptionError, planId]);

  // Helper function to normalize plan name (remove price and extra spaces)
  const normalizePlanName = useCallback((planName: string): string => {
    if (!planName) return '';
    // Remove price information (e.g., "REVELATION $299" -> "REVELATION")
    let normalized = planName.trim();
    // Remove price patterns like "$99", "$249", "$299", etc.
    normalized = normalized.replace(/\s*\$\d+.*$/i, '').trim();
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ').trim();
    return normalized;
  }, []);

  const initializeData = useCallback(() => {
    const period = searchParams.get('period') as 'month' | 'year' | null;
    setBillingPeriod(period || 'month');
    
    // Try to get plan name from API first
    if (planData?.data?.name) {
      const rawName = planData.data.name;
      const normalized = normalizePlanName(rawName);
      setPlanName(normalized || rawName);
      setIsLoadingPlan(false);
      logger.debug('Plan name loaded from API', { planId, rawName, normalized });
      return;
    }
    
    // Fallback to subscription plan name (might not be available immediately after Stripe redirect)
    if (subscriptionData?.data?.plan?.name) {
      const rawName = subscriptionData.data.plan.name;
      const normalized = normalizePlanName(rawName);
      setPlanName(normalized || rawName);
      setIsLoadingPlan(false);
      logger.debug('Plan name loaded from subscription', { rawName, normalized });
      return;
    }
    
    // If we have a numeric plan ID, try to use it
    if (planIdParam && !isNaN(Number(planIdParam))) {
      // If still loading, keep loading state
      if (planLoading) {
        setIsLoadingPlan(true);
        return;
      }
      
      // If loading is done but no data, use the ID as fallback
      // This can happen if the API call fails (e.g., 401)
      setPlanName(`Plan ${planIdParam}`);
      setIsLoadingPlan(false);
      logger.debug('Using plan ID as fallback', { planId: planIdParam });
      return;
    }
    
    // Fallback for non-numeric plan IDs
    const planNames: Record<string, string> = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
      revelation: 'REVELATION',
      'self-exploration': 'SELF EXPLORATION',
      wellness: 'WELLNESS',
    };
    const fallbackName = planNames[planIdParam?.toLowerCase() || ''] || planIdParam || 'Plan';
    setPlanName(fallbackName);
    setIsLoadingPlan(false);
    logger.debug('Using fallback plan name', { planIdParam, fallbackName });
  }, [searchParams, planData, subscriptionData, planIdParam, planId, planLoading, normalizePlanName]);

  useEffect(() => {
    if (!isAuthenticated()) {
      // Wait a bit for auth to initialize after returning from Stripe
      const authCheckTimeout = setTimeout(() => {
        if (!isAuthenticated()) {
          router.push('/auth/login');
        }
      }, 2000);
      return () => clearTimeout(authCheckTimeout);
    }

    // Wait a bit before initializing to let auth settle after Stripe redirect
    const initTimeout = setTimeout(() => {
      initializeData();
      
      // Clear localStorage cache immediately
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('subscription_cache');
          logger.debug('Cleared subscription cache from localStorage');
        } catch (e) {
          // Ignore localStorage errors
        }
      }
      
      // Wait 3 seconds before starting to poll (give webhook time to process)
      const pollStartTimeout = setTimeout(() => {
        // Try to sync subscription from Stripe first (force update)
        syncSubscriptionMutation.mutate(undefined, {
          onError: (err) => {
            logger.debug('Sync subscription failed (may be expected)', err);
          }
        });
        
        // Poll for subscription update (webhook might take a few seconds)
        const pollInterval = setInterval(async () => {
          try {
            // Try to sync subscription from Stripe
            await syncSubscriptionMutation.mutateAsync(undefined);
            // Invalidate and refetch subscription data
            await queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
            await queryClient.refetchQueries({ queryKey: queryKeys.subscriptions.me });
          } catch (err) {
            // Ignore errors during polling (might be 401 if auth not ready)
            logger.debug('Polling error (expected during auth initialization)', err);
          }
        }, 3000); // Poll every 3 seconds
        
        // Stop polling after 30 seconds
        const pollStopTimeout = setTimeout(() => {
          clearInterval(pollInterval);
        }, 30000);
        
        // Store interval and timeout for cleanup
        (window as any).__subscriptionPollInterval = pollInterval;
        (window as any).__subscriptionPollStopTimeout = pollStopTimeout;
      }, 3000);
      
      // Initial invalidation (but don't wait for it)
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.payments }).catch(() => {});
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.plans() }).catch(() => {});
      
      // Store timeout for cleanup
      (window as any).__subscriptionInitTimeout = initTimeout;
      (window as any).__subscriptionPollStartTimeout = pollStartTimeout;
    }, 1000);
    
    return () => {
      clearTimeout(initTimeout);
      if ((window as any).__subscriptionPollStartTimeout) {
        clearTimeout((window as any).__subscriptionPollStartTimeout);
      }
      if ((window as any).__subscriptionPollInterval) {
        clearInterval((window as any).__subscriptionPollInterval);
      }
      if ((window as any).__subscriptionPollStopTimeout) {
        clearTimeout((window as any).__subscriptionPollStopTimeout);
      }
    };
  }, [isAuthenticated, router, initializeData, queryClient]);

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <div className="p-8 text-center">
            <Loading />
            <p className="mt-4 text-muted-foreground">{t('loadingDetails')}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {planName 
              ? `${t('messagePrefix')} ${planName} ${t('messageSuffix')}`
              : t('messageFallback')
            }
          </p>

          {/* Subscription Details */}
          <div className="bg-muted rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t('detailsTitle')}</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('plan')}</span>
                <span className="font-medium text-foreground">{planName || 'Loading...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('period')}</span>
                <span className="font-medium text-foreground">
                  {billingPeriod === 'month' ? t('periodMonth') : t('periodYear')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('status')}</span>
                <span className="font-medium text-green-600 dark:text-green-400">{t('statusActive')}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('nextStepsTitle')}</h3>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t('step1')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t('step2')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>{t('step3')}</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard?refresh=true"
              onClick={() => {
                // Force refresh of subscription data when navigating to dashboard
                queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
                // Clear localStorage cache
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem('subscription_cache');
                  } catch (e) {
                    // Ignore localStorage errors
                  }
                }
              }}
            >
              <Button>
                {t('goToDashboard')}
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button variant="outline">
                {t('manageSubscription')}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  const t = useTranslations('subscriptionSuccess');
  
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
          <Card className="w-full max-w-2xl">
            <div className="p-8 text-center">
              <Loading />
              <p className="mt-4 text-muted-foreground">{t('loading')}</p>
            </div>
          </Card>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
