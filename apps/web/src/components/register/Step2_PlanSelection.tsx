'use client';

import { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import Button from '@/components/ui/Button';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { subscriptionsAPI } from '@/lib/api';
import { Alert } from '@/components/ui';

interface Plan {
  id: number;
  name: string;
  description?: string;
  amount?: number;
  currency: string;
  interval: string;
  interval_count?: number;
  is_popular?: boolean;
  features?: string | null;
}

export function Step2_PlanSelection() {
  const { setPlanId, setStep } = useRegistrationStore();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('[PlanSelection] Starting to load plans...');
        
        // First try to fetch active plans
        const response = await subscriptionsAPI.getPlans(true);
        console.log('[PlanSelection] Active plans response:', {
          status: response.status,
          data: response.data,
          plansCount: response.data?.plans?.length || 0,
        });
        
        let fetchedPlans = response.data?.plans || [];
        
        // If no active plans found, try fetching all plans (including inactive)
        if (fetchedPlans.length === 0) {
          console.log('[PlanSelection] No active plans found, fetching all plans...');
          const allPlansResponse = await subscriptionsAPI.getPlans(false);
          console.log('[PlanSelection] All plans response:', {
            status: allPlansResponse.status,
            data: allPlansResponse.data,
            plansCount: allPlansResponse.data?.plans?.length || 0,
          });
          fetchedPlans = allPlansResponse.data?.plans || [];
          console.log(`[PlanSelection] Found ${fetchedPlans.length} total plans`);
        } else {
          console.log(`[PlanSelection] Found ${fetchedPlans.length} active plans`);
        }
        
        if (fetchedPlans.length === 0) {
          console.warn('[PlanSelection] No plans found in database. Please create plans in the admin panel.');
        }
        
        setPlans(fetchedPlans);
      } catch (err: any) {
        console.error('[PlanSelection] Error loading plans:', {
          error: err,
          message: err?.message,
          response: err?.response,
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          baseURL: err?.config?.baseURL,
        });
        
        const errorMessage = err?.response?.data?.detail 
          || err?.response?.data?.message
          || err?.message 
          || `Failed to load plans (${err?.response?.status || 'unknown error'}). Please try again.`;
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleContinue = () => {
    if (selectedPlan) {
      setPlanId(selectedPlan.toString());
      setStep(3);
    }
  };

  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId);
    setPlanId(planId.toString());
    // Automatically advance to next step
    setStep(3);
  };

  const handleBack = () => {
    setStep(1.5);
  };

  const formatPrice = (plan: Plan) => {
    if (!plan.amount || plan.amount === 0) return 'Free';
    const price = (plan.amount / 100).toFixed(2);
    return `$${price}`;
  };

  const formatInterval = (plan: Plan) => {
    if (plan.interval === 'MONTH' && plan.interval_count === 1) return '/month';
    if (plan.interval === 'YEAR' && plan.interval_count === 1) return '/year';
    return `/${plan.interval_count || 1} ${plan.interval.toLowerCase()}s`;
  };

  const parseFeatures = (features: string | null | undefined): string[] => {
    if (!features) return [];
    try {
      const parsed = JSON.parse(features);
      return Object.entries(parsed)
        .filter(([_, value]) => typeof value !== 'boolean' || value === true)
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          }
          return `${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`;
        });
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-arise-deep-teal" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-2 text-center">
          Choose your plan
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Select the plan that best fits your needs
        </p>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}
        
        {plans.length === 0 && !isLoading && (
          <Alert variant="warning" className="mb-6">
            No plans available. Please contact support.
          </Alert>
        )}
        
        <div className="space-y-4 mb-8">
          {plans.map((plan) => {
            const features = parseFeatures(plan.features);
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan.id)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'border-arise-gold bg-arise-light-beige'
                    : 'border-gray-200 hover:border-arise-deep-teal'
                } ${plan.is_popular ? 'ring-2 ring-arise-gold' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-arise-deep-teal">
                        {plan.name}
                        {plan.is_popular && (
                          <span className="ml-2 text-sm bg-arise-gold text-arise-deep-teal px-2 py-1 rounded">
                            Popular
                          </span>
                        )}
                      </h3>
                      <span className="text-lg font-semibold text-arise-gold">
                        {formatPrice(plan)}
                        {plan.amount && plan.amount > 0 && formatInterval(plan)}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-gray-600 mb-3">{plan.description}</p>
                    )}
                    {features.length > 0 && (
                      <ul className="space-y-2">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700">
                            <Check className="w-4 h-4 text-arise-gold" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 self-center ${
                    selectedPlan === plan.id
                      ? 'border-arise-gold bg-arise-gold'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleBack}
            className="text-white text-sm flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
