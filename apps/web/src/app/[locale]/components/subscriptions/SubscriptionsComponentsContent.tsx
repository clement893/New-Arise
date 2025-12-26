/**
 * Subscriptions Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import { PricingCard, PricingSection, SubscriptionCard } from '@/components/subscriptions';
import type { Plan } from '@/components/subscriptions';

export default function SubscriptionsComponentsContent() {
  const samplePlan: Plan = {
    id: 1,
    name: 'Pro Plan',
    description: 'Perfect for professionals',
    amount: 2999,
    currency: 'USD',
    interval: 'MONTH',
    interval_count: 1,
    is_popular: true,
    features: JSON.stringify({
      'Feature 1': true,
      'Feature 2': true,
      'Feature 3': false,
    }),
  };

  const sampleSubscription = {
    id: '1',
    plan_id: '1',
    plan_name: 'Pro Plan',
    status: 'active' as const,
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    amount: 2999,
    currency: 'USD',
    billing_period: 'month' as const,
  };

  return (
    <PageContainer>
      <PageHeader
        title="Composants Abonnements"
        description="Composants pour la gestion des abonnements et tarification"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Abonnements' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Pricing Card">
          <div className="max-w-sm">
            <PricingCard
              plan={samplePlan}
              onSelect={(planId) => {
                console.log('Plan selected:', planId);
              }}
            />
          </div>
        </Section>

        <Section title="Pricing Section">
          <div className="max-w-6xl">
            <PricingSection />
          </div>
        </Section>

        <Section title="Subscription Card">
          <div className="max-w-2xl">
            <SubscriptionCard
              subscription={sampleSubscription}
              onCancel={() => {
                console.log('Cancel subscription');
              }}
              onResume={() => {
                console.log('Resume subscription');
              }}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

