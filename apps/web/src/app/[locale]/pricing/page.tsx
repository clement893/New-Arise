'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import PricingCardSimple from '@/components/ui/PricingCardSimple';
import FAQItem from '@/components/ui/FAQItem';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import MotionDiv from '@/components/motion/MotionDiv';
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
  status?: string; // PlanStatus: ACTIVE, INACTIVE, ARCHIVED
}

export default function PricingPage() {
  const t = useTranslations('pricing');
  const [billingPeriod] = useState<'month' | 'year'>('month'); // Fixed to 'month', no toggle
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
    
    // Adjust price based on interval and billing period
    let displayPrice = priceInEuros;
    
    if (apiPlan.interval === 'YEAR') {
      // If plan is yearly, show monthly equivalent if billingPeriod is month
      displayPrice = billingPeriod === 'month' 
        ? Math.round((priceInEuros / 12) * 100) / 100 // Round to 2 decimals
        : priceInEuros;
    } else if (apiPlan.interval === 'MONTH') {
      // If plan is monthly but user selected yearly, show yearly price
      displayPrice = billingPeriod === 'year'
        ? Math.round(priceInEuros * 12 * 100) / 100
        : priceInEuros;
    }

    // If description is empty or contains the default test text, use empty string
    // so PricingCardSimple can use the translated defaultDescription
    const description = apiPlan.description && 
      !apiPlan.description.toLowerCase().includes('test pour la plateforme') &&
      !apiPlan.description.toLowerCase().includes('test for the platform')
      ? apiPlan.description 
      : '';

    return {
      id: String(apiPlan.id),
      name: apiPlan.name,
      price: displayPrice,
      period: billingPeriod,
      description: description,
      features: parseFeatures(apiPlan.features),
      popular: apiPlan.is_popular,
      buttonText: priceInEuros === -1 ? t('card.contactUs') : t('card.getStarted'),
    };
  }, [billingPeriod]);

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use subscriptionsAPI.getPlans() exactly like admin/plans/page.tsx does (line 60-61)
      // This ensures consistent behavior with the admin page that works
      // subscriptionsAPI.getPlans() uses apiClient.get() which is axios instance from api.ts
      // axios.get() returns AxiosResponse, so response is the full axios response
      // response.data is the FastAPI response: { plans: [...], total: ... }
      const response = await subscriptionsAPI.getPlans(true); // Only active plans
      
      // Match the structure used in admin/plans/page.tsx line 61: response.data?.plans
      const fetchedPlans: ApiPlan[] = response.data?.plans || [];
      
      logger.debug('Loaded plans from API', { 
        response,
        hasResponse: !!response,
        hasData: !!response?.data,
        responseDataType: typeof response?.data,
        responseDataKeys: response?.data ? Object.keys(response.data) : [],
        plansCount: fetchedPlans.length,
        total: response?.data?.total,
        plans: fetchedPlans.map(p => ({ 
          id: p.id, 
          name: p.name, 
          interval: p.interval, 
          interval_count: p.interval_count,
          amount: p.amount,
          amount_dollars: p.amount / 100,
          status: p.status,
          is_popular: p.is_popular
        }))
      });
      
      // Log plan mapping for debugging
      logger.info('Plans loaded and mapped', {
        plans: fetchedPlans.map(p => ({
          db_id: p.id,
          name: p.name,
          amount_cents: p.amount,
          amount_dollars: p.amount / 100,
          display_id: String(p.id) // This is what will be used in the URL
        }))
      });
      
      if (fetchedPlans.length === 0) {
        // Try fetching all plans (including inactive) to check if plans exist but are not ACTIVE
        logger.warn('No active plans found, checking if any plans exist at all', { 
          activePlansCount: fetchedPlans.length
        });
        
        try {
          const allPlansResponse = await subscriptionsAPI.getPlans(false); // Get all plans
          const allPlans = allPlansResponse.data?.plans || [];
          
          if (allPlans.length > 0) {
            logger.error('Plans exist but are not ACTIVE. Status details:', { 
              allPlans: allPlans.map((p: ApiPlan) => ({ 
                id: p.id, 
                name: p.name, 
                status: p.status || 'UNKNOWN',
                interval: p.interval 
              }))
            });
            setError(t('errors.plansNotActive'));
          } else {
            logger.error('No plans found at all in database', { 
              response,
              responseData: response?.data,
              responsePlans: response?.data?.plans,
              responseTotal: response?.data?.total,
              responseStructure: {
                hasData: !!response?.data,
                dataType: typeof response?.data,
                dataKeys: response?.data ? Object.keys(response.data) : [],
                plansType: typeof response?.data?.plans,
                plansIsArray: Array.isArray(response?.data?.plans),
                plansLength: Array.isArray(response?.data?.plans) ? response.data.plans.length : 'not array'
              }
            });
            setError(t('errors.noPlansFound'));
          }
        } catch (fallbackErr) {
          logger.error('Error fetching all plans as fallback', { error: fallbackErr });
          setError(t('errors.noActivePlans'));
        }
        
        setApiPlans([]);
        return;
      }
      
      // Set all fetched plans (they should already be filtered by active_only=true)
      logger.debug('Plans loaded successfully, setting to state', { 
        plansCount: fetchedPlans.length,
        planDetails: fetchedPlans.map(p => ({ 
          id: p.id, 
          name: p.name, 
          status: p.status, 
          interval: p.interval,
          interval_count: p.interval_count,
          amount: p.amount,
          is_popular: p.is_popular
        }))
      });
      
      setApiPlans(fetchedPlans);
    } catch (err) {
      const appError = handleApiError(err);
      setError(t('errors.loadFailed', { message: appError.message || t('errors.tryAgainLater') }));
      logger.error('Failed to load subscription plans', appError, { 
        error: err, 
        fullError: appError,
        errorMessage: appError.message,
        errorDetails: appError.details
      });
      setApiPlans([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Remap plans when apiPlans change (billingPeriod is fixed to 'month')
  useEffect(() => {
    if (apiPlans.length > 0) {
      const mappedPlans = apiPlans.map(mapApiPlanToDisplayPlan);
      // Sort plans: popular first, then by price ascending
      const sortedPlans = mappedPlans.sort((a, b) => {
        // Popular plans first
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        // Then sort by price ascending
        return a.price - b.price;
      });
      setPlans(sortedPlans);
    }
  }, [apiPlans, mapApiPlanToDisplayPlan]);

  // Load plans on mount and when component mounts
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // Also try to reload plans if still empty after initial load
  useEffect(() => {
    if (!isLoading && plans.length === 0 && apiPlans.length === 0 && !error) {
      logger.debug('No plans loaded, attempting reload after 2 seconds');
      const timer = setTimeout(() => {
        loadPlans();
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading, plans.length, apiPlans.length, error, loadPlans]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-muted dark:to-muted">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-16 relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#0F4C56' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center w-full">
              {/* Left Section - Text on Dark Teal Background */}
              <div className="relative z-10 pt-8 pb-8 pl-8 md:pt-12 md:pb-12 md:pl-12 lg:pt-16 lg:pb-16 lg:pl-16 flex flex-col justify-center" style={{ backgroundColor: '#0F4C56' }}>
                <div className="text-left">
                  <h1 className="mb-6">
                    <span className="block text-5xl md:text-6xl font-light mb-2" style={{ color: '#D8B868' }}>
                      {t('hero.titlePart1')}
                    </span>
                    <span className="block text-5xl md:text-6xl font-medium" style={{ color: '#D8B868' }}>
                      {t('hero.titlePart2')}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                    {t('hero.subtitle')}
                  </p>
                </div>
              </div>
              
              {/* Right Section - Photo */}
              <div className="relative p-8 md:p-12 flex items-center justify-center">
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '500px' }}>
                  <Image 
                    src="/images/pricing-hero.jpg" 
                    alt={t('hero.title')}
                    fill
                    className="object-cover"
                    priority
                    onError={() => {
                      // Fallback handled by CSS
                    }}
                  />
                  {/* Subtle border around photo */}
                  <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </MotionDiv>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="h-full">
                <PricingCardSimple
                  plan={plan}
                  billingPeriod={billingPeriod}
                  onSelect={(_planId, _period) => {
                    // Navigation is handled by the PricingCardSimple component
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-900 dark:text-gray-100">No plans available at the moment.</p>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-8" style={{ color: '#D8B868' }}>
            {t('faq.title')}
          </h2>
          <div className="space-y-4">
            <FAQItem
              question={t('faq.questions.0.question')}
              answer={t('faq.questions.0.answer')}
            />
            <FAQItem
              question={t('faq.questions.1.question')}
              answer={t('faq.questions.1.answer')}
            />
            <FAQItem
              question={t('faq.questions.2.question')}
              answer={t('faq.questions.2.answer')}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
