import { Badge, Button, Card, Alert } from '@/components/ui';
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations('profile.subscription');
  const locale = useLocale();
  const pricingUrl = locale === 'en' ? '/pricing' : `/${locale}/pricing`;
  
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
    return t(`status.${status}`) || status;
  };

  return (
    <Card className="mb-8" padding={false}>
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
              /{t(`period.${subscription.billing_period}`)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('currentPeriod')}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(subscription.current_period_start).toLocaleDateString(locale)} -{' '}
              {new Date(subscription.current_period_end).toLocaleDateString(locale)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('nextPayment')}</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {new Date(subscription.current_period_end).toLocaleDateString(locale)}
            </div>
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <Alert variant="warning" className="mb-6">
            {t('cancelWarning', { date: new Date(subscription.current_period_end).toLocaleDateString(locale) })}
          </Alert>
        )}

        <div className="flex gap-3">
          {subscription.status === 'active' && !subscription.cancel_at_period_end && onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              {t('cancelButton')}
            </Button>
          )}
          {subscription.cancel_at_period_end && onResume && (
            <Button onClick={onResume}>{t('resumeButton')}</Button>
          )}
          <Link href={pricingUrl}>
            <Button variant="outline">{t('changePlanButton')}</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

