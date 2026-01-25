'use client';

import { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { subscriptionsAPI } from '@/lib/api';
import { Alert } from '@/components/ui';

interface Plan {
  id: number;
  name: string;
  description?: string;
  amount?: number | string; // Can be number or string (Decimal from backend)
  currency: string;
  interval: string;
  interval_count?: number;
  is_popular?: boolean;
  features?: string | null;
}

export function Step2_PlanSelection() {
  const { setSelectedPlan: setStorePlan, setStep } = useRegistrationStore();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [hoveredPlanId, setHoveredPlanId] = useState<number | null>(null);
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
        
        // Sort plans by price descending (highest to lowest) - Revelation first, Lifestyle & Wellness last
        const sortedPlans = fetchedPlans.sort((a: Plan, b: Plan) => {
          const priceA = typeof a.amount === 'string' ? parseFloat(a.amount) : (a.amount || 0);
          const priceB = typeof b.amount === 'string' ? parseFloat(b.amount) : (b.amount || 0);
          return priceB - priceA; // Descending order (highest first)
        });
        
        setPlans(sortedPlans);
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

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setStorePlan({
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      interval: plan.interval,
      interval_count: plan.interval_count,
    });
    // Automatically advance to next step
    setStep(3);
  };

  const handleBack = () => {
    setStep(1.5);
  };

  const formatPrice = (plan: Plan) => {
    // Handle both number and string (Decimal from backend)
    const amountInCents = typeof plan.amount === 'string' ? parseFloat(plan.amount) : (plan.amount || 0);
    if (!plan.amount || amountInCents === 0) return 'Free';
    const price = (amountInCents / 100).toFixed(2);
    return `$${price}`;
  };

  const formatInterval = (plan: Plan) => {
    const interval = plan.interval?.toUpperCase();
    const count = plan.interval_count || 1;
    
    if (interval === 'MONTH' && count === 1) return '/month';
    if (interval === 'YEAR' && count === 1) return '/year';
    if (interval === 'MONTH') return `/${count} months`;
    if (interval === 'YEAR') return `/${count} years`;
    
    return `/${count} ${plan.interval?.toLowerCase()}${count > 1 ? 's' : ''}`;
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

  // Extract feature keys from a plan's features JSON
  const getFeatureKeys = (features: string | null | undefined): Set<string> => {
    if (!features) return new Set();
    try {
      const parsed = JSON.parse(features);
      return new Set(
        Object.entries(parsed)
          .filter(([_, value]) => typeof value !== 'boolean' || value === true)
          .map(([key]) => key)
      );
    } catch {
      return new Set();
    }
  };

  // Get the price of a plan in cents
  const getPlanPrice = (plan: Plan): number => {
    const amountInCents = typeof plan.amount === 'string' ? parseFloat(plan.amount) : (plan.amount || 0);
    return amountInCents;
  };

  // Find the next plan (more expensive) for a given plan
  const getNextPlan = (currentPlan: Plan): Plan | null => {
    const currentPrice = getPlanPrice(currentPlan);
    const sortedPlans = [...plans].sort((a, b) => getPlanPrice(a) - getPlanPrice(b));
    const nextPlan = sortedPlans.find(plan => getPlanPrice(plan) > currentPrice);
    return nextPlan || null;
  };

  // Check if a plan should be visible based on the selected/hovered plan
  const shouldShowPlan = (plan: Plan, referencePlanId: number | null): boolean => {
    // If no plan is hovered/selected, show all plans
    if (!referencePlanId) return true;

    const referencePlan = plans.find(p => p.id === referencePlanId);
    if (!referencePlan) return true;

    // Get the next plan (more expensive) for the reference plan
    const nextPlan = getNextPlan(referencePlan);
    
    // If there's no next plan (reference is the most expensive), show all plans
    if (!nextPlan) return true;

    // Get features of the current plan and the next plan
    const currentPlanFeatures = getFeatureKeys(plan.features);
    const nextPlanFeatures = getFeatureKeys(nextPlan.features);

    // Show the plan only if all its features are included in the next plan
    // OR if it's the reference plan or the next plan itself
    if (plan.id === referencePlanId || plan.id === nextPlan.id) {
      return true;
    }

    // Check if all features of the current plan are in the next plan
    for (const feature of currentPlanFeatures) {
      if (!nextPlanFeatures.has(feature)) {
        return false; // This plan has a feature not in the next plan, hide it
      }
    }

    return true; // All features are included, show it
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
            const isVisible = shouldShowPlan(plan, hoveredPlanId || selectedPlanId);
            return (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                onMouseEnter={() => setHoveredPlanId(plan.id)}
                onMouseLeave={() => setHoveredPlanId(null)}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                  selectedPlanId === plan.id
                    ? 'border-arise-gold bg-arise-light-beige'
                    : 'border-gray-200 hover:border-arise-deep-teal hover:rounded-lg'
                } ${plan.is_popular ? 'ring-2 ring-arise-gold' : ''} ${
                  !isVisible ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100 max-h-[1000px]'
                }`}
              >
                <div className="flex-grow">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
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
                      {plan.amount && Number(plan.amount) > 0 && formatInterval(plan)}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-gray-600 mb-3 break-words">{plan.description}</p>
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
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleBack}
            className="text-arise-deep-teal text-base font-semibold flex items-center gap-2 hover:text-arise-deep-teal/80 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
