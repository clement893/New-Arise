'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import Container from '@/components/ui/Container';
import PricingCardSimple from '@/components/ui/PricingCardSimple';
import BillingPeriodToggle from '@/components/ui/BillingPeriodToggle';
import FAQItem from '@/components/ui/FAQItem';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      period: billingPeriod,
      description: 'Parfait pour démarrer',
      features: [
        'Les 4 évaluations',
        'Profil personnel',
        'Insights de base',
      ],
      buttonText: 'Commencer',
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 99,
      period: billingPeriod,
      description: 'Pour les professionnels',
      features: [
        'Les 4 évaluations',
        'Analyses avancées',
        'Support prioritaire',
        'Rapports personnalisés',
      ],
      popular: true,
      buttonText: 'Essayer gratuitement',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: -1, // -1 indicates custom pricing
      period: billingPeriod,
      description: 'Pour les entreprises',
      features: [
        'Évaluations illimitées',
        'Gestion d\'équipe',
        'Support dédié',
        'Accès API',
      ],
      buttonText: 'Nous contacter',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-muted dark:to-muted">
      <Header />
      <Container className="py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Choose your plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Select the plan that best fits your needs
          </p>

          <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <PricingCardSimple
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
              onSelect={(_planId, _period) => {
                // Navigation is handled by the PricingCardSimple component
              }}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Puis-je changer de plan à tout moment ?"
              answer="Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prendront effet immédiatement."
            />
            <FAQItem
              question="Y a-t-il un essai gratuit ?"
              answer="Oui, tous les plans incluent un essai gratuit de 14 jours. Aucune carte de crédit requise."
            />
            <FAQItem
              question="Quels modes de paiement acceptez-vous ?"
              answer="Nous acceptons les cartes de crédit (Visa, Mastercard, American Express) et les virements bancaires pour les plans Enterprise."
            />
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
