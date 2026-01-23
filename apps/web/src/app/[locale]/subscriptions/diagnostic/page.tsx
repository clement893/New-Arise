'use client';

import { useSubscriptionDiagnostic } from '@/lib/query/queries';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SubscriptionDiagnosticPage() {
  const router = useRouter();
  const t = useTranslations('subscriptions');
  const { data, isLoading, error, refetch } = useSubscriptionDiagnostic();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
        <Card className="w-full max-w-4xl">
          <div className="p-8 text-center">
            <Loading />
            <p className="mt-4 text-muted-foreground">Chargement du diagnostic...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-muted dark:to-muted flex items-center justify-center px-4">
        <Card className="w-full max-w-4xl">
          <div className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Erreur inconnue'}
            </p>
            <Button onClick={() => refetch()}>Réessayer</Button>
            <Button variant="outline" onClick={() => router.back()} className="ml-2">
              Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const diagnostic = data?.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-muted dark:to-muted py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Diagnostic de Souscription</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        </div>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">👤 Utilisateur</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {diagnostic?.user?.id}</p>
              <p><strong>Email:</strong> {diagnostic?.user?.email}</p>
              <p><strong>Nom:</strong> {diagnostic?.user?.name}</p>
            </div>
          </div>
        </Card>

        {diagnostic?.active_subscription && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-green-600">✅ Souscription Active</h2>
              <div className="space-y-2">
                <p><strong>ID:</strong> {diagnostic.active_subscription.id}</p>
                <p><strong>Statut:</strong> {diagnostic.active_subscription.status}</p>
                <p><strong>Plan ID:</strong> {diagnostic.active_subscription.plan_id}</p>
                <p><strong>Plan Nom:</strong> {diagnostic.active_subscription.plan_name}</p>
                <p><strong>Plan Prix:</strong> ${diagnostic.active_subscription.plan_amount?.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Toutes les Souscriptions</h2>
            {diagnostic?.subscriptions && diagnostic.subscriptions.length > 0 ? (
              <div className="space-y-4">
                {diagnostic.subscriptions.map((sub: any, index: number) => (
                  <div key={sub.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Souscription #{index + 1}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><strong>ID:</strong> {sub.id}</p>
                      <p><strong>Statut:</strong> {sub.status}</p>
                      <p><strong>Plan ID:</strong> {sub.plan_id}</p>
                      <p><strong>Plan Nom:</strong> {sub.plan_name}</p>
                      <p><strong>Plan Prix:</strong> ${sub.plan_amount?.toFixed(2)}</p>
                      {sub.stripe_subscription_id && (
                        <p><strong>Stripe ID:</strong> {sub.stripe_subscription_id}</p>
                      )}
                    </div>
                    
                    {diagnostic.stripe_comparison && diagnostic.stripe_comparison[sub.id] && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <h4 className="font-semibold mb-2">🔍 Comparaison Stripe</h4>
                        <div className="text-sm space-y-1">
                          <p><strong>Stripe Price ID:</strong> {diagnostic.stripe_comparison[sub.id].stripe_price_id}</p>
                          <p><strong>Plan dans Stripe:</strong> {diagnostic.stripe_comparison[sub.id].stripe_plan_name} (ID: {diagnostic.stripe_comparison[sub.id].stripe_plan_id})</p>
                          <p><strong>Plan dans DB:</strong> {diagnostic.stripe_comparison[sub.id].db_plan_name} (ID: {diagnostic.stripe_comparison[sub.id].db_plan_id})</p>
                          {diagnostic.stripe_comparison[sub.id].inconsistency && (
                            <p className="text-red-600 font-semibold">
                              ⚠️ INCOHÉRENCE DÉTECTÉE: Le plan dans Stripe ne correspond pas au plan dans la DB!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucune souscription trouvée</p>
            )}
          </div>
        </Card>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">📦 Plans Disponibles</h2>
            {diagnostic?.plans && diagnostic.plans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Nom</th>
                      <th className="text-left p-2">Prix</th>
                      <th className="text-left p-2">Stripe Price ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostic.plans.map((plan: any) => (
                      <tr key={plan.id} className="border-b">
                        <td className="p-2">{plan.id}</td>
                        <td className="p-2 font-medium">{plan.name}</td>
                        <td className="p-2">${plan.amount.toFixed(2)}</td>
                        <td className="p-2 font-mono text-xs">{plan.stripe_price_id || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun plan trouvé</p>
            )}
          </div>
        </Card>

        {diagnostic?.errors && diagnostic.errors.length > 0 && (
          <Card className="mb-6 border-red-300">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">❌ Erreurs</h2>
              <ul className="list-disc list-inside space-y-1">
                {diagnostic.errors.map((error: string, index: number) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        <div className="mt-6 flex gap-4">
          <Button onClick={() => refetch()}>🔄 Actualiser</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Aller au Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
