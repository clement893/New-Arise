'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { getErrorMessage, getErrorDetail } from '@/lib/errors';
import { logger } from '@/lib/logger';
import { 
  useMySubscription, 
  useSubscriptionPayments, 
  useCancelSubscription,
  useCreatePortalSession,
  useSubscriptionPlans,
  useCreateCheckoutSession
} from '@/lib/query/queries';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
import { PricingCard, type Plan } from '@/components/subscriptions/PricingCard';
import { PaymentHistory, type Payment } from '@/components/billing';
import { Settings, ExternalLink } from 'lucide-react';

interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  amount: number;
  currency: string;
  billing_period: 'month' | 'year';
}

export default function SubscriptionManagement() {
  const t = useTranslations('profile.subscription');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  // React Query hooks
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError, refetch: refetchSubscription } = useMySubscription();
  const { data: paymentsData, isLoading: paymentsLoading } = useSubscriptionPayments();
  const { data: plansData, isLoading: plansLoading } = useSubscriptionPlans(true);
  const cancelSubscriptionMutation = useCancelSubscription();
  const createPortalSessionMutation = useCreatePortalSession();
  const createCheckoutMutation = useCreateCheckoutSession();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Transform subscription data from React Query
  useEffect(() => {
    logger.debug('SubscriptionManagement: subscriptionData changed', {
      hasData: !!subscriptionData,
      subscriptionData,
      isLoading: subscriptionLoading,
      error: subscriptionError,
      hasDataProperty: !!(subscriptionData?.data),
      dataStructure: subscriptionData ? Object.keys(subscriptionData) : null
    });
    
    // Handle subscriptionData - React Query wraps axios response in { data: AxiosResponse }
    // So subscriptionData.data is the AxiosResponse, and subscriptionData.data.data is the actual data
    const actualData = subscriptionData?.data?.data || subscriptionData?.data;
    
    if (actualData) {
      const sub = actualData;
      
      logger.debug('SubscriptionManagement: Processing subscription', {
        id: sub.id,
        status: sub.status,
        planId: sub.plan_id,
        planName: sub.plan?.name,
        hasPlan: !!sub.plan
      });
      
      // Map backend status to frontend status
      const statusMap: Record<string, 'active' | 'cancelled' | 'expired' | 'trial'> = {
        'ACTIVE': 'active',
        'CANCELLED': 'cancelled',
        'CANCELED': 'cancelled', // Handle both spellings
        'EXPIRED': 'expired',
        'TRIALING': 'trial',
        'INCOMPLETE': 'expired',
        'INCOMPLETE_EXPIRED': 'expired',
      };
      
      const statusUpper = sub.status?.toUpperCase() || '';
      const mappedStatus = statusMap[statusUpper] || 'active';
      
      logger.debug('SubscriptionManagement: Mapped status', {
        originalStatus: sub.status,
        statusUpper,
        mappedStatus
      });
      
      setSubscription({
        id: String(sub.id),
        plan_id: String(sub.plan_id),
        plan_name: sub.plan?.name || 'Unknown Plan',
        status: mappedStatus,
        current_period_start: sub.current_period_start || new Date().toISOString(),
        current_period_end: sub.current_period_end || new Date().toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end || false,
        amount: sub.plan?.amount ? Number(sub.plan.amount) / 100 : 0, // Convert from cents
        currency: sub.plan?.currency?.toUpperCase() || 'EUR',
        billing_period: (sub.plan?.interval?.toLowerCase() === 'year' ? 'year' : 'month') as 'month' | 'year',
      });
      
      // Cache subscription data for use in other pages (like assessments)
      if (typeof window !== 'undefined' && sub.plan) {
        try {
          localStorage.setItem('subscription_cache', JSON.stringify({
            data: actualData,
            timestamp: Date.now()
          }));
          logger.debug('SubscriptionManagement: Cached subscription data');
        } catch (e) {
          // Ignore cache errors
        }
      }
    } else if (!subscriptionLoading) {
      logger.debug('SubscriptionManagement: No subscription data found', {
        hasSubscriptionData: !!subscriptionData,
        hasData: !!subscriptionData?.data,
        hasNestedData: !!subscriptionData?.data?.data,
        error: subscriptionError
      });
      setSubscription(null);
    }
  }, [subscriptionData, subscriptionLoading, subscriptionError]);

  // Transform payments data from React Query
  useEffect(() => {
    // React Query wraps the queryFn result in { data: ... }
    // So paymentsData is the React Query result object, and paymentsData.data is the array
    const invoices = paymentsData?.data || (Array.isArray(paymentsData) ? paymentsData : []);
    
    if (Array.isArray(invoices) && invoices.length > 0) {
      setPayments(invoices.map((payment: {
        id: string | number;
        amount_due: number; // Invoice uses amount_due
        amount_paid: number; // Invoice uses amount_paid
        currency: string;
        status: string;
        created_at: string;
        hosted_invoice_url?: string; // Invoice uses hosted_invoice_url
        invoice_pdf_url?: string;
        invoice_number?: string;
      }): Payment => ({
        id: String(payment.id),
        // Use amount_paid if paid, otherwise amount_due - already in cents from database
        amount: (payment.amount_paid > 0 ? payment.amount_paid : payment.amount_due) / 100,
        currency: payment.currency.toUpperCase(),
        status: (payment.status.toLowerCase() === 'paid' ? 'completed' : payment.status.toLowerCase()) as 'completed' | 'pending' | 'failed' | 'refunded',
        date: payment.created_at,
        description: payment.invoice_number ? `Invoice ${payment.invoice_number}` : 'Subscription payment',
        paymentMethod: 'Card',
        transactionId: payment.hosted_invoice_url || payment.invoice_pdf_url,
      })));
    } else if (!paymentsLoading) {
      setPayments([]);
    }
  }, [paymentsData, paymentsLoading]);

  // Transform plans data from React Query
  useEffect(() => {
    // React Query wraps axios response in { data: AxiosResponse }
    // So plansData.data is AxiosResponse, and plansData.data.data is PlanListResponse
    if (plansData?.data?.data?.plans) {
      setPlans(plansData.data.data.plans);
    } else if (!plansLoading && plansData) {
      setPlans([]);
    }
  }, [plansData, plansLoading]);

  // Update loading state
  useEffect(() => {
    setLoading(subscriptionLoading || paymentsLoading);
  }, [subscriptionLoading, paymentsLoading]);

  // Handle errors from React Query
  useEffect(() => {
    if (subscriptionError) {
      const errorDetail = getErrorDetail(subscriptionError);
      const errorMessage = getErrorMessage(subscriptionError, 'Error loading subscription');
      
      // Check if it's a 404 or authentication error
      const is404 = subscriptionError && typeof subscriptionError === 'object' && 'response' in subscriptionError 
        && (subscriptionError as any).response?.status === 404;
      const is401 = subscriptionError && typeof subscriptionError === 'object' && 'response' in subscriptionError 
        && (subscriptionError as any).response?.status === 401;
      
      logger.debug('SubscriptionManagement: Subscription error', {
        is404,
        is401,
        errorDetail,
        errorMessage,
        error: subscriptionError
      });
      
      // Only show error if it's not a 404 (no subscription is normal) or 401 (auth will retry)
      if (!is404 && !is401 && errorDetail) {
        setError(errorDetail || errorMessage);
      } else if (is401) {
        // 401 errors are usually transient during auth initialization
        logger.debug('SubscriptionManagement: 401 error (auth may not be ready yet)');
      } else if (is404) {
        // 404 is normal - user just doesn't have a subscription yet
        logger.debug('SubscriptionManagement: 404 error (no subscription found - this is normal)');
      }
    } else {
      // Clear error when there's no error
      setError('');
    }
  }, [subscriptionError]);

  // Handle return from Stripe Portal
  useEffect(() => {
    const portalReturn = searchParams?.get('portal_return');
    if (portalReturn === 'true') {
      setSuccess(t('updateSuccess'));
      // Refetch subscription data
      refetchSubscription();
      // Clear the success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      // Remove the query parameter but keep tab=subscription
      const params = new URLSearchParams(window.location.search);
      params.delete('portal_return');
      if (!params.has('tab')) {
        params.set('tab', 'subscription');
      }
      const queryString = params.toString();
      const newUrl = queryString 
        ? `${window.location.pathname}?${queryString}` 
        : `${window.location.pathname}?tab=subscription`;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, refetchSubscription]);

  const handleManageSubscription = useCallback(async () => {
    try {
      setError('');
      setSuccess('');

      const returnUrl = `${window.location.origin}${window.location.pathname}?tab=subscription&portal_return=true`;
      const response = await createPortalSessionMutation.mutateAsync(returnUrl);

      if (response.data?.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = response.data.url;
      } else {
        setError(t('errors.createPortalFailed'));
      }
    } catch (err: unknown) {
      const errorDetail = getErrorDetail(err);
      const errorMessage = getErrorMessage(err, t('errors.openManagementFailed'));
      
      // Handle specific error: no Stripe customer
      if (errorDetail?.includes('customer') || errorDetail?.includes('Stripe')) {
        setError(t('errors.manageFailed'));
      } else {
        setError(errorDetail || errorMessage);
      }
    }
  }, [createPortalSessionMutation]);

  const handleCancelSubscription = useCallback(async () => {
    if (!confirm(t('cancelConfirm'))) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await cancelSubscriptionMutation.mutateAsync();
      setSuccess(t('cancelSuccess'));
      // React Query will automatically refetch subscription data
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, t('errors.cancelFailed')));
    }
  }, [cancelSubscriptionMutation, t]);

  const handleResumeSubscription = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      // Note: Resume subscription may require creating a new checkout session
      // or calling a specific resume endpoint if available
      // For now, redirect to pricing to resubscribe
      router.push('/pricing');
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, t('errors.resumeFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = useCallback(async (planId: number) => {
    try {
      setError('');
      setSuccess('');
      
      // Always use checkout session for plan changes (same as register page)
      // This ensures proper payment processing and webhook handling
      const returnUrl = `${window.location.origin}${window.location.pathname}?tab=subscription`;
      const response = await createCheckoutMutation.mutateAsync({
        plan_id: planId,
        success_url: `${window.location.origin}/subscriptions/success?plan=${planId}`,
        cancel_url: returnUrl,
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        router.push(`/subscriptions/success?plan=${planId}`);
      }
    } catch (err: unknown) {
      const errorDetail = getErrorDetail(err);
      const errorMessage = getErrorMessage(err, t('errors.subscribeFailed'));
      setError(errorDetail || errorMessage);
    }
  }, [createCheckoutMutation, router, t]);

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Card>
          <div className="py-12 text-center">
            <Loading />
            <p className="text-gray-600 dark:text-gray-400 mt-4">{t('loadingInfo')}</p>
          </div>
        </Card>
      ) : subscription ? (
        <>
          {/* Subscription Card with Manage Button */}
          <Card>
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:gap-0 gap-4 items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('title')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('description')}
                </p>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={createPortalSessionMutation.isPending}
                className="flex items-center gap-2"
                variant="arise-primary"
              >
                <Settings className="w-4 h-4" />
                {createPortalSessionMutation.isPending ? t('loading') : t('manageButton')}
                <ExternalLink className="w-4 h-4" />
              </Button>
              </div>
            </div>
          </Card>

          {/* Subscription Details */}
          <SubscriptionCard
            subscription={subscription}
            onCancel={handleCancelSubscription}
            onResume={handleResumeSubscription}
          />

          {/* Payment History */}
          {payments.length > 0 && (
            <PaymentHistory payments={payments} />
          )}
        </>
      ) : (
        <>
          <Card className="p-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('noSubscription.title')}
              </h3>
              <p className="text-gray-900 dark:text-gray-100 mb-6">
                {t('noSubscription.description')}
              </p>
            </div>
          </Card>
          {plansLoading ? (
            <Card className="p-6">
              <div className="py-12 text-center">
                <Loading />
                <p className="text-gray-600 dark:text-gray-400 mt-4">{t('loadingPlans')}</p>
              </div>
            </Card>
          ) : plans.length > 0 ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('availablePlans.title')}</h2>
                <p className="text-gray-600 dark:text-gray-400">{t('availablePlans.description')}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    onSelect={handleSelectPlan}
                    isLoading={createCheckoutMutation.isPending}
                    currentPlanId={undefined}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-6">{t('noPlans')}</p>
                <Link href={locale === 'en' ? '/pricing' : `/${locale}/pricing`}>
                  <Button variant="arise-primary">
                    {t('viewPlans')}
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
