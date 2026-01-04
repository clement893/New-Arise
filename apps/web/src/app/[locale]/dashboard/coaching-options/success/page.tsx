'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function CoachingSessionSuccessPage() {
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
              Réservation confirmée !
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Votre session de coaching a été réservée avec succès.
            </p>
          </div>


          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard/coaching-options')}
            >
              Voir mes sessions
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Retour au dashboard
            </Button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Un email de confirmation vous a été envoyé avec tous les détails de votre session.
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
