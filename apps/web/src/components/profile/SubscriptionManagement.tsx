'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { getErrorMessage, getErrorDetail } from '@/lib/errors';
import { 
  useMySubscription, 
  useSubscriptionPayments, 
  useCancelSubscription,
  useCreatePortalSession
} from '@/lib/query/queries';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import SubscriptionCard from '@/components/subscriptions/SubscriptionCard';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  
  // React Query hooks
  const { data: subscriptionData, isLoading: subscriptionLoading, error: subscriptionError, refetch: refetchSubscription } = useMySubscription();
  const { data: paymentsData, isLoading: paymentsLoading } = useSubscriptionPayments();
  const cancelSubscriptionMutation = useCancelSubscription();
  const createPortalSessionMutation = useCreatePortalSession();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Transform subscription data from React Query
  useEffect(() => {
    if (subscriptionData?.data) {
      const sub = subscriptionData.data;
      
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
      
      const mappedStatus = statusMap[sub.status?.toUpperCase()] || 'active';
      
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
    } else if (!subscriptionLoading && !subscriptionData) {
      setSubscription(null);
    }
  }, [subscriptionData, subscriptionLoading]);

  // Transform payments data from React Query
  useEffect(() => {
    if (paymentsData?.data) {
      setPayments((paymentsData.data as Array<{
        id: string | number;
        amount: number;
        currency: string;
        status: string;
        created_at: string;
        invoice_url?: string;
        description?: string;
        payment_method?: string;
      }>).map((payment): Payment => ({
        id: String(payment.id),
        amount: payment.amount / 100, // Convert from cents
        currency: payment.currency.toUpperCase(),
        status: (payment.status.toLowerCase() === 'paid' ? 'completed' : payment.status.toLowerCase()) as 'completed' | 'pending' | 'failed' | 'refunded',
        date: payment.created_at,
        description: payment.description || 'Subscription payment',
        paymentMethod: payment.payment_method || 'Card',
        transactionId: payment.invoice_url,
      })));
    } else if (!paymentsLoading && !paymentsData) {
      setPayments([]);
    }
  }, [paymentsData, paymentsLoading]);

  // Update loading state
  useEffect(() => {
    setLoading(subscriptionLoading || paymentsLoading);
  }, [subscriptionLoading, paymentsLoading]);

  // Handle errors from React Query
  useEffect(() => {
    if (subscriptionError) {
      const errorDetail = getErrorDetail(subscriptionError);
      const errorMessage = getErrorMessage(subscriptionError, 'Error loading subscription');
      // Only show error if it's not a 404 (no subscription)
      if (errorDetail && !errorDetail.includes('404')) {
        setError(errorDetail || errorMessage);
      }
    }
  }, [subscriptionError]);

  // Handle return from Stripe Portal
  useEffect(() => {
    const portalReturn = searchParams?.get('portal_return');
    if (portalReturn === 'true') {
      setSuccess('Your subscription has been updated successfully.');
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
        setError('Failed to create portal session. Please try again.');
      }
    } catch (err: unknown) {
      const errorDetail = getErrorDetail(err);
      const errorMessage = getErrorMessage(err, 'Error opening subscription management');
      
      // Handle specific error: no Stripe customer
      if (errorDetail?.includes('customer') || errorDetail?.includes('Stripe')) {
        setError('Unable to manage subscription. Please contact support or subscribe to a plan first.');
      } else {
        setError(errorDetail || errorMessage);
      }
    }
  }, [createPortalSessionMutation]);

  const handleCancelSubscription = useCallback(async () => {
    if (!confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current period.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await cancelSubscriptionMutation.mutateAsync();
      setSuccess('Your subscription has been cancelled. It will remain active until the end of the current billing period.');
      // React Query will automatically refetch subscription data
    } catch (err: unknown) {
      setError(getErrorDetail(err) || getErrorMessage(err, 'Error canceling subscription'));
    }
  }, [cancelSubscriptionMutation]);

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
      setError(getErrorDetail(err) || getErrorMessage(err, 'Error resuming subscription'));
    } finally {
      setLoading(false);
    }
  };

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
        <Card className="p-6">
          <div className="py-12 text-center">
            <Loading />
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading subscription information...</p>
          </div>
        </Card>
      ) : subscription ? (
        <>
          {/* Subscription Card with Manage Button */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Manage My Subscription
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Update payment methods, view invoices, and manage your subscription settings
                </p>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={createPortalSessionMutation.isPending}
                className="flex items-center gap-2"
                variant="arise-primary"
              >
                <Settings className="w-4 h-4" />
                {createPortalSessionMutation.isPending ? 'Loading...' : 'Manage Subscription'}
                <ExternalLink className="w-4 h-4" />
              </Button>
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
        <Card className="p-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Active Subscription
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have an active subscription. Subscribe to a plan to get started.
            </p>
            <Link href={locale === 'en' ? '/pricing' : `/${locale}/pricing`}>
              <Button variant="arise-primary">
                View Plans
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
