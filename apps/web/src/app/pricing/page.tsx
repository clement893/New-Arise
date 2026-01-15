'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Container from '@/components/ui/Container';
import PricingCardSimple from '@/components/ui/PricingCardSimple';
import BillingPeriodToggle from '@/components/ui/BillingPeriodToggle';
import FAQItem from '@/components/ui/FAQItem';

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
  const t = useTranslations('pricing.legacy');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const plans: Plan[] = [
    {
      id: 'starter',
      name: t('plans.starter.name'),
      price: 29,
      period: billingPeriod,
      description: t('plans.starter.description'),
      features: [
        t('plans.starter.features.0'),
        t('plans.starter.features.1'),
        t('plans.starter.features.2'),
        t('plans.starter.features.3'),
        t('plans.starter.features.4'),
      ],
      buttonText: t('plans.starter.buttonText'),
    },
    {
      id: 'professional',
      name: t('plans.professional.name'),
      price: 79,
      period: billingPeriod,
      description: t('plans.professional.description'),
      features: [
        t('plans.professional.features.0'),
        t('plans.professional.features.1'),
        t('plans.professional.features.2'),
        t('plans.professional.features.3'),
        t('plans.professional.features.4'),
        t('plans.professional.features.5'),
        t('plans.professional.features.6'),
      ],
      popular: true,
      buttonText: t('plans.professional.buttonText'),
    },
    {
      id: 'enterprise',
      name: t('plans.enterprise.name'),
      price: 199,
      period: billingPeriod,
      description: t('plans.enterprise.description'),
      features: [
        t('plans.enterprise.features.0'),
        t('plans.enterprise.features.1'),
        t('plans.enterprise.features.2'),
        t('plans.enterprise.features.3'),
        t('plans.enterprise.features.4'),
        t('plans.enterprise.features.5'),
        t('plans.enterprise.features.6'),
        t('plans.enterprise.features.7'),
        t('plans.enterprise.features.8'),
      ],
      buttonText: t('plans.enterprise.buttonText'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Container className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t('subtitle')}
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
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
            {t('faq.title')}
          </h2>
          <div className="space-y-4">
            <FAQItem
              question={t('faq.questions.0.question')}
              answer={t('faq.questions.0.answer')}
            />
            <FAQItem
              question={t('faq.questions.1.question')}
              answer={t('faq.questions.1.answer')}
            />
            <FAQItem
              question={t('faq.questions.2.question')}
              answer={t('faq.questions.2.answer')}
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
