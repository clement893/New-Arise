'use client';

import { Button } from '@/components/ui';

interface BillingPeriodToggleProps {
  value: 'month' | 'year';
  onChange: (value: 'month' | 'year') => void;
}

export default function BillingPeriodToggle({
  value,
  onChange,
}: BillingPeriodToggleProps) {
  return (
    <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md">
      <Button
        onClick={() => onChange('month')}
        variant="ghost"
        size="md"
        className="px-6 rounded-lg"
        style={{
          backgroundColor: value === 'month' ? '#0F4C56' : 'transparent',
          color: value === 'month' ? '#FFFFFF' : '#6B7280',
        }}
      >
        Mensuel
      </Button>
      <Button
        onClick={() => onChange('year')}
        variant="ghost"
        size="md"
        className="px-6 rounded-lg"
        style={{
          backgroundColor: value === 'year' ? '#0F4C56' : 'transparent',
          color: value === 'year' ? '#FFFFFF' : '#6B7280',
        }}
      >
        Annuel
      </Button>
    </div>
  );
}

