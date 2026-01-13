'use client';

import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';

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

export default function PricingCardSimple({
  plan,
  billingPeriod,
  onSelect: _onSelect,
}: PricingCardSimpleProps) {
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
  const priceString = displayPrice ? displayPrice.toLocaleString('fr-FR') : null;

  return (
    <Card
      className={clsx(
        'relative rounded-xl',
        plan.popular && 'border-2 border-blue-500 shadow-xl scale-105'
      )}
      style={{ backgroundColor: '#F3F4F6' }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="success" className="px-4 py-1">
            Le plus populaire
          </Badge>
        </div>
      )}
      <div className="p-8">
        {/* Price */}
        <div className="mb-6">
          {isCustomPricing ? (
            <div>
              <span className="text-4xl font-bold" style={{ color: '#0F4C56' }}>
                Sur devis
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-bold" style={{ color: '#0F4C56' }}>
                {priceString}€
              </span>
              <span className="text-lg md:text-xl" style={{ color: '#6B7280' }}>
                /mois
              </span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#374151' }}>
          {plan.name}
        </h2>

        {/* Description */}
        <p className="text-base mb-6" style={{ color: '#374151' }}>
          {plan.description || 'test pour la plateforme'}
        </p>

        {/* Button */}
        <Link href={`/subscriptions?plan=${plan.id}&period=${billingPeriod}`}>
          <Button
            className="w-full rounded-lg flex items-center justify-center gap-2"
            style={{ 
              backgroundColor: '#D8B868', 
              color: '#374151',
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

