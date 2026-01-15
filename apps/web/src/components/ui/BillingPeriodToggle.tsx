'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui';

interface BillingPeriodToggleProps {
  value: 'month' | 'year';
  onChange: (value: 'month' | 'year') => void;
}

export default function BillingPeriodToggle({
  value,
  onChange,
}: BillingPeriodToggleProps) {
  const t = useTranslations('pricing.billingPeriod');
  return (
    <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
      <Button
        onClick={() => onChange('month')}
        variant="ghost"
        size="md"
        className="px-6 rounded-lg font-medium"
        style={{
          backgroundColor: value === 'month' ? '#0F4C56' : '#E5E7EB',
          color: value === 'month' ? '#FFFFFF' : '#374151',
        }}
      >
        {t('monthly')}
      </Button>
      <Button
        onClick={() => onChange('year')}
        variant="ghost"
        size="md"
        className="px-6 rounded-lg font-medium"
        style={{
          backgroundColor: value === 'year' ? '#0F4C56' : '#E5E7EB',
          color: value === 'year' ? '#FFFFFF' : '#374151',
        }}
      >
        {t('yearly')}
      </Button>
    </div>
  );
}

