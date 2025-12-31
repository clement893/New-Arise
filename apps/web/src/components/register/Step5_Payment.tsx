'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { CreditCard, Lock } from 'lucide-react';

export function Step5_Payment() {
  const { planId, setStep } = useRegistrationStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setStep(6);
    }, 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-arise-deep-teal mb-2">
            Payment
          </h2>
          <p className="text-gray-600 mb-8">
            Complete your purchase securely
          </p>

          <div className="space-y-6">
            <div className="bg-arise-light-beige border-2 border-arise-gold rounded-lg p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-arise-gold" />
              <p className="text-sm text-gray-700">
                Your payment information is secure and encrypted
              </p>
            </div>

            {/* Placeholder for Stripe Elements */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Stripe Payment Form</p>
              <p className="text-sm text-gray-500">
                This will be replaced with Stripe Elements integration
              </p>
            </div>

            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-arise-deep-teal mb-6">
            Order Summary
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-700">Plan</span>
              <span className="font-semibold text-arise-deep-teal capitalize">{planId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Billing</span>
              <span className="text-gray-700">Monthly</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-arise-gold text-xl">$99.00</span>
            </div>
          </div>

          <div className="bg-arise-light-beige rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">✓ 30-day money-back guarantee</p>
            <p className="mb-2">✓ Cancel anytime</p>
            <p>✓ Secure payment processing</p>
          </div>
        </div>
      </div>
    </div>
  );
}
