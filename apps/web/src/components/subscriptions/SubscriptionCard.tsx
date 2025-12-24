import { Badge, Button, Card, Alert } from '@/components/ui';
import Link from 'next/link';

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

interface SubscriptionCardProps {
  subscription: Subscription;
  onCancel?: () => void;
  onResume?: () => void;
}

export default function SubscriptionCard({
  subscription,
  onCancel,
  onResume,
}: SubscriptionCardProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'error' | 'default'> = {
      active: 'success',
      cancelled: 'error',
      expired: 'error',
      trial: 'default',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Active',
      cancelled: 'Cancelled',
      expired: 'Expired',
      trial: 'Trial',
    };
    return labels[status] || status;
  };

  return (
    <Card className="mb-8">
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {subscription.plan_name}
            </h2>
            <Badge variant={getStatusBadge(subscription.status)}>
              {getStatusLabel(subscription.status)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {subscription.amount}€
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              /{subscription.billing_period === 'month' ? 'month' : 'year'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Period</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Next Payment</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <Alert variant="warning" className="mb-6">
            Your subscription will be canceled on{' '}
            {new Date(subscription.current_period_end).toLocaleDateString()}.
          </Alert>
        )}

        <div className="flex gap-3">
          {subscription.status === 'active' && !subscription.cancel_at_period_end && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              Cancel Subscription
            </Button>
          )}
          {subscription.cancel_at_period_end && onResume && (
            <Button onClick={onResume}>Resume Subscription</Button>
          )}
          <Link href="/pricing">
            <Button variant="outline">Change Plan</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

