'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import { queryKeys, useSubscriptionPlan, useMySubscription } from '@/lib/query/queries';
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
  const [planName, setPlanName] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Get plan ID from URL
  const planIdParam = searchParams.get('plan');
  const planId = planIdParam ? parseInt(planIdParam, 10) : null;
  
  // Fetch plan details from API if planId is a number
  const { data: planData, isLoading: planLoading } = useSubscriptionPlan(planId || 0);
  
  // Also try to get plan name from current subscription
  const { data: subscriptionData } = useMySubscription();

  const initializeData = useCallback(() => {
    const period = searchParams.get('period') as 'month' | 'year' | null;
    setBillingPeriod(period || 'month');
    
    // Try to get plan name from API first
    if (planData?.data?.name) {
      setPlanName(planData.data.name);
      setIsLoadingPlan(false);
      logger.debug('Plan name loaded from API', { planId, planName: planData.data.name });
    } else if (subscriptionData?.data?.plan?.name) {
      // Fallback to subscription plan name
      setPlanName(subscriptionData.data.plan.name);
      setIsLoadingPlan(false);
      logger.debug('Plan name loaded from subscription', { planName: subscriptionData.data.plan.name });
    } else if (planIdParam && !isNaN(Number(planIdParam))) {
      // If we have a numeric plan ID but no data yet, show loading
      setIsLoadingPlan(planLoading);
      if (!planLoading) {
        // If loading is done but no data, use the ID as fallback
        setPlanName(`Plan ${planIdParam}`);
        setIsLoadingPlan(false);
      }
    } else {
      // Fallback for non-numeric plan IDs
      const planNames: Record<string, string> = {
        starter: 'Starter',
        professional: 'Professional',
        enterprise: 'Enterprise',
      };
      setPlanName(planNames[planIdParam || ''] || planIdParam || 'Plan');
      setIsLoadingPlan(false);
    }
  }, [searchParams, planData, subscriptionData, planIdParam, planId, planLoading]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    initializeData();
    
    // Invalidate subscription queries to refresh data after payment
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.me });
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.payments });
  }, [isAuthenticated, router, initializeData, queryClient, planData, subscriptionData]);

  if (!isAuthenticated()) {
    return null;
  }

  if (isLoadingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <div className="p-8 text-center">
            <Loading />
            <p className="mt-4 text-muted-foreground">Chargement des détails de l'abonnement...</p>
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
            Abonnement confirmé !
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Merci pour votre confiance. Votre abonnement <strong>{planName || 'sélectionné'}</strong> est maintenant actif.
          </p>

          {/* Subscription Details */}
          <div className="bg-muted rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-foreground mb-4">Détails de votre abonnement</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-medium text-foreground">{planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Période:</span>
                <span className="font-medium text-foreground">
                  {billingPeriod === 'month' ? 'Mensuel' : 'Annuel'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Actif</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">Prochaines étapes</h3>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Vous pouvez maintenant accéder à toutes les fonctionnalités de votre plan</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Un email de confirmation a été envoyé à votre adresse</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Vous pouvez gérer votre abonnement depuis la page Mes Abonnements</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button>
                Aller au tableau de bord
              </Button>
            </Link>
            <Link href="/subscriptions">
              <Button variant="outline">
                Gérer mon abonnement
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
          <Card className="w-full max-w-2xl">
            <div className="p-8 text-center">
              <Loading />
              <p className="mt-4 text-muted-foreground">Chargement...</p>
            </div>
          </Card>
        </div>
      }
    >
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
