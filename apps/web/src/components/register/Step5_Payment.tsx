'use client';

import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useRegistrationStore } from '@/stores/registrationStore';
import Button from '@/components/ui/Button';
import { CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react';
import { subscriptionsAPI } from '@/lib/api';
import { Alert } from '@/components/ui';
import { StripeCardElement } from './StripeCardElement';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface Plan {
  id: number;
  name: string;
  description?: string;
  price?: number;
  amount?: number;
  currency: string;
  interval: string;
  interval_count?: number;
  is_active: boolean;
}

function PaymentFormContent() {
  const { planId, setStep } = useRegistrationStore();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const isMountedRef = useRef(true);
  const isProcessingRef = useRef(false);

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true;
    isProcessingRef.current = false;
    
    // Add global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (error && typeof error === 'object') {
        const errorMessage = String(error.message || '');
        const isStripeUnmountError = errorMessage.includes('Element') && 
                                    (errorMessage.includes('mounted') || 
                                     errorMessage.includes('retrieve data'));
        
        if (isStripeUnmountError && !isMountedRef.current) {
          // Silently ignore if component is unmounted
          event.preventDefault();
          return;
        }
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Load plan details
  useEffect(() => {
    const loadPlan = async () => {
      if (!planId) {
        setError('No plan selected. Please go back and select a plan.');
        setLoadingPlan(false);
        return;
      }

      try {
        setLoadingPlan(true);
        const planIdNum = parseInt(planId, 10);
        
        if (isNaN(planIdNum)) {
          const plansResponse = await subscriptionsAPI.getPlans(true);
          const plans = plansResponse.data?.plans || [];
          const plan = plans.find((p: Plan) => p.name.toLowerCase() === planId.toLowerCase());
          
          if (plan) {
            setSelectedPlan(plan);
          } else {
            setError('Plan not found. Please select a valid plan.');
          }
        } else {
          const planResponse = await subscriptionsAPI.getPlan(planIdNum);
          if (planResponse.data) {
            setSelectedPlan(planResponse.data);
          } else {
            setError('Plan not found. Please select a valid plan.');
          }
        }
      } catch (err) {
        console.error('Error loading plan:', err);
        setError('Failed to load plan details. Please try again.');
      } finally {
        setLoadingPlan(false);
      }
    };

    loadPlan();
  }, [planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isProcessing) {
      return;
    }

    if (!stripe || !elements || !selectedPlan || !planId) {
      setError('Please wait for Stripe to load and select a plan.');
      return;
    }

    setIsProcessing(true);
    isProcessingRef.current = true;
    setError(null);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found. Please refresh the page.');
      setIsProcessing(false);
      return;
    }

    try {
      // Check if component is still mounted before proceeding
      if (!isMountedRef.current) {
        return;
      }

      // Verify element is still available before using it
      const currentElement = elements.getElement(CardElement);
      if (!currentElement) {
        if (isMountedRef.current) {
          setError('Card element is no longer available. Please refresh the page.');
          setIsProcessing(false);
          isProcessingRef.current = false;
        }
        return;
      }

      // Create payment method - this is the critical operation that needs the element
      // Wrap in try-catch to handle potential unmount errors
      let pmError: any = null;
      let paymentMethod: any = null;
      
      try {
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: currentElement,
        });
        pmError = result.error;
        paymentMethod = result.paymentMethod;
      } catch (stripeError: any) {
        // Handle Stripe errors, especially unmount errors
        const errorMessage = stripeError?.message || '';
        const isUnmountError = errorMessage.includes('Element') && 
                              (errorMessage.includes('mounted') || 
                               errorMessage.includes('retrieve data'));
        
        if (isUnmountError) {
          // Element was unmounted during operation
          if (!isMountedRef.current) {
            // Component was unmounted, silently return
            return;
          }
          // Component still mounted but element was unmounted - show error
          if (isMountedRef.current) {
            setError('Payment form was reset. Please try again.');
            setIsProcessing(false);
            isProcessingRef.current = false;
          }
          return;
        }
        // Re-throw other errors
        throw stripeError;
      }

      // Check if component is still mounted after async operation
      if (!isMountedRef.current) {
        return;
      }

      if (pmError) {
        if (isMountedRef.current) {
          setCardError(pmError.message || 'An error occurred while processing your card.');
          setIsProcessing(false);
          isProcessingRef.current = false;
        }
        return;
      }

      if (!paymentMethod) {
        if (isMountedRef.current) {
          setError('Failed to create payment method. Please try again.');
          setIsProcessing(false);
          isProcessingRef.current = false;
        }
        return;
      }

      // Create subscription with payment method
      const planIdNum = typeof planId === 'string' ? parseInt(planId, 10) : planId;
      const finalPlanId = isNaN(planIdNum) ? selectedPlan.id : planIdNum;

      const response = await subscriptionsAPI.createSubscriptionWithPaymentMethod({
        plan_id: finalPlanId,
        payment_method_id: paymentMethod.id,
      });

      // Check if component is still mounted after API call
      if (!isMountedRef.current) {
        return;
      }

      if (response.data) {
        // Payment successful - wait for all Stripe operations to complete
        // Stripe may have async callbacks that need to finish
        // Wait longer to ensure all operations are complete (1 second should be enough)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Final check before changing step - only proceed if still mounted
        if (!isMountedRef.current) {
          return;
        }
        
        // Reset processing state before changing step
        setIsProcessing(false);
        isProcessingRef.current = false;
        
        // Use multiple requestAnimationFrame calls to ensure all DOM updates are processed
        // before unmounting the component. The parent component will keep Step5 mounted
        // during transition to prevent Stripe element unmount errors.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (isMountedRef.current && !isProcessingRef.current) {
                setStep(6);
              }
            }, 100);
          });
        });
      } else {
        if (isMountedRef.current) {
          setError('Failed to create subscription. Please try again.');
          setIsProcessing(false);
          isProcessingRef.current = false;
        }
      }
    } catch (err: unknown) {
      // Check if this is a Stripe unmount error
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        const errorMessage = String(errorObj.message || '');
        
        // Check if it's a Stripe unmount error
        const isUnmountError = errorMessage.includes('Element') && 
                              (errorMessage.includes('mounted') || 
                               errorMessage.includes('retrieve data'));
        
        if (isUnmountError) {
          // Element was unmounted - silently return if component is unmounted
          if (!isMountedRef.current) {
            return;
          }
          // Component still mounted - show user-friendly error
          if (isMountedRef.current) {
            setError('Payment form was reset. Please try again.');
            setIsProcessing(false);
            isProcessingRef.current = false;
          }
          return;
        }
      }
      
      // Handle other errors
      let errorMessage = 'Failed to process payment. Please try again.';
      if (err && typeof err === 'object') {
        const errorObj = err as Record<string, unknown>;
        if (errorObj.response && typeof errorObj.response === 'object') {
          const response = errorObj.response as Record<string, unknown>;
          if (response.data && typeof response.data === 'object') {
            const data = response.data as Record<string, unknown>;
            if (typeof data.detail === 'string') {
              errorMessage = data.detail;
            } else if (typeof data.message === 'string') {
              errorMessage = data.message;
            }
          }
        } else if (typeof errorObj.message === 'string') {
          errorMessage = errorObj.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating subscription:', err);
      }
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(errorMessage);
        setIsProcessing(false);
        isProcessingRef.current = false;
      }
    }
  };

  const formatPrice = (plan: Plan | null) => {
    if (!plan) return '$0.00';
    const price = plan.price || plan.amount || 0;
    const amount = (price / 100).toFixed(2);
    return `$${amount}`;
  };

  const getIntervalLabel = (plan: Plan | null) => {
    if (!plan) return 'month';
    if (plan.interval === 'month' && plan.interval_count === 1) return 'month';
    if (plan.interval === 'month' && plan.interval_count === 3) return 'quarter';
    if (plan.interval === 'month' && plan.interval_count === 12) return 'year';
    if (plan.interval === 'year') return 'year';
    return plan.interval;
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
            Complete your purchase securely with Stripe
          </p>

          {error && (
            <Alert variant="error" className="mb-6">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </Alert>
          )}

          <div className="space-y-6">
            <div className="bg-arise-light-beige border-2 border-arise-gold rounded-lg p-4 flex items-center gap-3">
              <Lock className="w-5 h-5 text-arise-gold" />
              <p className="text-sm text-gray-700">
                Your payment information is secure and encrypted. We use Stripe to process your payment securely.
              </p>
            </div>

            {loadingPlan ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading plan details...</p>
              </div>
            ) : selectedPlan ? (
              <>
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center gap-4 mb-4">
                    <CreditCard className="w-8 h-8 text-arise-gold" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedPlan.name} Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        Secure checkout powered by Stripe
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Plan:</strong> {selectedPlan.name}
                    </p>
                    {selectedPlan.description && (
                      <p>
                        <strong>Description:</strong> {selectedPlan.description}
                      </p>
                    )}
                    <p>
                      <strong>Amount:</strong> {formatPrice(selectedPlan)} / {getIntervalLabel(selectedPlan)}
                    </p>
                  </div>
                </div>

                {!isProcessing && (
                  <>
                    <StripeCardElement
                      onError={setCardError}
                      cardError={cardError}
                    />
                    <Button
                      onClick={handleSubmit}
                      disabled={!stripe || !selectedPlan}
                      className="w-full bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Complete Payment
                    </Button>
                  </>
                )}

                {isProcessing && (
                  <div className="border-2 border-gray-200 rounded-lg p-8 text-center">
                    <Loader2 className="w-12 h-12 text-arise-gold mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Processing your payment...</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center">
                  Your payment information is processed securely by Stripe and never stored on our servers.
                </p>
              </>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No plan selected</p>
                <p className="text-sm text-gray-500">
                  Please go back and select a plan to continue.
                </p>
              </div>
            )}
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
              <span className="font-semibold text-arise-deep-teal capitalize">
                {selectedPlan?.name || planId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Billing</span>
              <span className="text-gray-700 capitalize">
                {selectedPlan ? getIntervalLabel(selectedPlan) : 'Monthly'}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-arise-gold text-xl">
                {selectedPlan ? `${formatPrice(selectedPlan)}/${getIntervalLabel(selectedPlan)}` : '$0.00'}
              </span>
            </div>
          </div>

          <div className="bg-arise-light-beige rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">✓ 30-day money-back guarantee</p>
            <p className="mb-2">✓ Cancel anytime</p>
            <p className="mb-2">✓ Secure payment processing by Stripe</p>
            <p>✓ Industry-standard encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step5_Payment() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent />
    </Elements>
  );
}
