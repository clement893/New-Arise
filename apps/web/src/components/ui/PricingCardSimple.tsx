'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Card } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

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

interface PricingCardSimpleProps {
  plan: Plan;
  billingPeriod: 'month' | 'year';
  onSelect: (planId: string, period: 'month' | 'year') => void;
}

export default function   PricingCardSimple({
  plan,
  billingPeriod,
  onSelect: _onSelect,
}: PricingCardSimpleProps) {
  const t = useTranslations('pricing.card');
  const calculatePrice = () => {
    if (plan.price === -1) {
      return null; // Custom pricing
    }
    if (billingPeriod === 'year') {
      return Math.round((plan.price * 12 * 0.8) / 12);
    }
    return plan.price;
  };

  const isCustomPricing = plan.price === -1;

  const displayPrice = calculatePrice();
  const priceString = displayPrice ? displayPrice.toLocaleString('en-US') : null;

  return (
    <Card
      className="relative rounded-xl border-0 shadow-none"
      style={{ backgroundColor: '#F3F4F6' }}
    >
      <div className="p-lg h-full">
        {/* Price */}
        <div className="mb-16">
          {isCustomPricing ? (
            <div>
              <span className="text-4xl md:text-5xl font-bold" style={{ color: '#0F4C56' }}>
                {t('customPricing')}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold" style={{ color: '#0F4C56' }}>
                {priceString}€
              </span>
              <span className="text-lg md:text-xl" style={{ color: '#6B7280' }}>
                {t('perMonth')}
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          {plan.name}
        </h2>

        {/* Description */}
        <p className="text-base mb-6" style={{ color: '#1F2937' }}>
          {plan.description || t('defaultDescription')}
        </p>

        {/* Button */}
        <Link href={`/subscriptions?plan=${plan.id}&period=${billingPeriod}`}>
          <Button
            className="w-full rounded-lg flex items-center justify-center gap-2 font-semibold"
            style={{ 
              backgroundColor: '#D8B868', 
              color: '#1F2937',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#C9A85A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#D8B868';
            }}
          >
            {plan.buttonText}
            <ArrowRight size={18} />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

