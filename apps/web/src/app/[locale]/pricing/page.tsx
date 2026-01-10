'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect, useCallback } from 'react';
import Container from '@/components/ui/Container';
import PricingCardSimple from '@/components/ui/PricingCardSimple';
import BillingPeriodToggle from '@/components/ui/BillingPeriodToggle';
import FAQItem from '@/components/ui/FAQItem';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { subscriptionsAPI } from '@/lib/api';
import { handleApiError } from '@/lib/errors/api';
import { logger } from '@/lib/logger';

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

interface ApiPlan {
  id: number;
  name: string;
  description: string | null;
  amount: number; // in cents
  currency: string;
  interval: 'MONTH' | 'YEAR' | 'WEEK' | 'DAY';
  interval_count: number;
  features: string | null; // JSON string
  is_popular: boolean;
}

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [apiPlans, setApiPlans] = useState<ApiPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseFeatures = (featuresJson: string | null): string[] => {
    if (!featuresJson) return [];
    try {
      const parsed = JSON.parse(featuresJson);
      const featureList: string[] = [];
      for (const [key, value] of Object.entries(parsed)) {
        if (value === true || (typeof value === 'string' && value.length > 0)) {
          // Convert key to readable feature name
          const featureName = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());
          featureList.push(featureName);
        }
      }
      return featureList;
    } catch (err) {
      logger.error('Failed to parse features', { error: err, featuresJson });
      return [];
    }
  };

  const mapApiPlanToDisplayPlan = useCallback((apiPlan: ApiPlan): Plan => {
    // Convert amount from cents to euros
    const priceInEuros = apiPlan.amount === 0 ? -1 : apiPlan.amount / 100;
    
    // Only show monthly plans for now (filter by interval if needed)
    // If the plan is yearly, adjust price accordingly
    const displayPrice = apiPlan.interval === 'YEAR' 
      ? Math.round(priceInEuros / 12) 
      : priceInEuros;

    return {
      id: String(apiPlan.id),
      name: apiPlan.name,
      price: displayPrice,
      period: billingPeriod,
      description: apiPlan.description || '',
      features: parseFeatures(apiPlan.features),
      popular: apiPlan.is_popular,
      buttonText: priceInEuros === -1 ? 'Nous contacter' : 'Commencer',
    };
  }, [billingPeriod]);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await subscriptionsAPI.getPlans(true); // Only active plans
      
      // apiClient.get returns response.data directly from axios, which is the FastAPI response
      // FastAPI returns PlanListResponse: { plans: [...], total: ... }
      // So response is already { plans: [...], total: ... }
      const fetchedPlans: ApiPlan[] = (response as any).plans || (response as any).data?.plans || [];
      
      logger.debug('Loaded plans from API', { 
        responseStructure: response,
        plansCount: fetchedPlans.length,
        plans: fetchedPlans.map(p => ({ id: p.id, name: p.name, interval: p.interval, amount: p.amount }))
      });
      
      if (fetchedPlans.length === 0) {
        logger.warn('No plans found in API response', { response });
        setError('No subscription plans available. Please contact support.');
        setApiPlans([]);
        return;
      }
      
      // Filter to only show monthly plans (or convert yearly plans)
      const monthlyPlans = fetchedPlans.filter(
        (plan) => plan.interval === 'MONTH' && plan.interval_count === 1
      );
      
      logger.debug('Filtered monthly plans', { 
        monthlyPlansCount: monthlyPlans.length,
        allPlans: fetchedPlans.length
      });
      
      setApiPlans(monthlyPlans);
    } catch (err) {
      const appError = handleApiError(err);
      setError(`Failed to load plans: ${appError.message || 'Please try again later.'}`);
      logger.error('Failed to load subscription plans', appError, { error: err, fullError: appError });
      setApiPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remap plans when billingPeriod changes (no need to reload from API)
  useEffect(() => {
    if (apiPlans.length > 0) {
      const mappedPlans = apiPlans.map(mapApiPlanToDisplayPlan);
      setPlans(mappedPlans);
    }
  }, [apiPlans, mapApiPlanToDisplayPlan]);

  // Load plans on mount
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-muted dark:to-muted">
      <Header />
      <Container className="py-24">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">Choose your plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Select the plan that best fits your needs
          </p>

          <BillingPeriodToggle value={billingPeriod} onChange={setBillingPeriod} />
        </div>

        {error && (
          <Alert variant="error" className="mb-6 max-w-3xl mx-auto">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        ) : plans.length > 0 ? (
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No plans available at the moment.</p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Puis-je changer de plan à tout moment ?"
              answer="Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prendront effet immédiatement."
            />
            <FAQItem
              question="Y a-t-il un essai gratuit ?"
              answer="Oui, tous les plans incluent un essai gratuit de 14 jours. Aucune carte de crédit requise."
            />
            <FAQItem
              question="Quels modes de paiement acceptez-vous ?"
              answer="Nous acceptons les cartes de crédit (Visa, Mastercard, American Express) et les virements bancaires pour les plans Enterprise."
            />
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
