'use client';

import { CardElement } from '@stripe/react-stripe-js';
import { AlertCircle } from 'lucide-react';
import { Alert } from '@/components/ui';

interface StripeCardElementProps {
  onError?: (error: string) => void;
  cardError?: string | null;
}

export function StripeCardElement({ onError, cardError }: StripeCardElementProps) {
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        <CardElement 
          options={cardElementOptions}
          onChange={(e) => {
            if (e.error && onError) {
              onError(e.error.message);
            }
          }}
        />
      </div>
      
      {cardError && (
        <Alert variant="error" className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {cardError}
        </Alert>
      )}
    </div>
  );
}
