'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function CoachingSessionSuccessPage() {
  const t = useTranslations('dashboard.coachingOptions.success');
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');

  useEffect(() => {
    // Extract session_id from Stripe checkout session ID
    // The session_id in the URL is the Stripe checkout session ID
    // We need to find the coaching session by stripe_checkout_session_id
    // For now, we'll just show a success message
    // In a real implementation, you'd query the backend with the checkout session ID
  }, [sessionIdParam]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('description')}
            </p>
          </div>


          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/coaching-options')}
            >
              {t('viewSessions')}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              {t('backToDashboard')}
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            {t('emailConfirmation')}
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
