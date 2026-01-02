'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import { CheckCircle, Calendar, User } from 'lucide-react';
import type { CoachingSession } from '@/lib/api/coaching';

export default function CoachingSessionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get('session_id');
  
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract session_id from Stripe checkout session ID
    // The session_id in the URL is the Stripe checkout session ID
    // We need to find the coaching session by stripe_checkout_session_id
    // For now, we'll just show a success message
    // In a real implementation, you'd query the backend with the checkout session ID
    
    setLoading(false);
  }, [sessionIdParam]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Réservation confirmée !
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Votre session de coaching a été réservée avec succès.
            </p>
          </div>

          {session && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6 text-left">
              <h2 className="font-semibold mb-4">Détails de la session</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>
                    {new Date(session.scheduled_at).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <span>Session ID: {session.id}</span>
                </div>
              </div>
            </div>
          )}

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
