'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { subscriptionsAPI } from '@/lib/api';
import { Alert } from '@/components/ui';

interface PlanTab {
  id: string;
  name: string;
  price: number;
  included: string[];
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

interface Plan {
  id: number;
  name: string;
  description?: string;
  amount?: number | string;
  currency: string;
  interval: string;
  interval_count?: number;
  is_popular?: boolean;
  features?: string | null;
}

export function Step1_5_DiscoverPlans() {
  const { setStep, setSelectedPlan } = useRegistrationStore();
  const [selectedPlanTab, setSelectedPlanTab] = useState<string>('revelation');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planTabs: PlanTab[] = [
    { 
      id: 'revelation', 
      name: 'REVELATION', 
      price: 299,
      included: [
        'Professional Assessment (MBTI + ARISE Conflict Management)',
        '360° Peer Evaluation',
        'Wellness Pulse',
        'Executive Summary'
      ]
    },
    { 
      id: 'self-exploration', 
      name: 'SELF EXPLORATION', 
      price: 250,
      included: [
        'Professional Assessment',
        'Wellness Pulse',
        'Executive Summary'
      ]
    },
    { 
      id: 'wellness', 
      name: 'LIFESTYLE & WELLNESS', 
      price: 99,
      included: [
        'Wellness Pulse',
        'Basic Assessment Summary'
      ]
    },
  ];

  const allFeatures: Feature[] = [
    {
      id: 'professional-assessment',
      title: 'Professional Assessment',
      description: 'Combined MBTI (Myers Briggs Type Indicator) assessment with ARISE Conflict Management style. You will gain insight into your natural leadership preferences, how you handle conflict and learn to navigate difficult situations with confidence and effectiveness.',
    },
    {
      id: '360-peer-evaluation',
      title: '360° Peer Evaluation',
      description: 'Comprehensive multi-rater feedback from colleagues, direct reports, and managers',
    },
    {
      id: 'wellness-pulse',
      title: 'Wellness Pulse',
      description: 'Quick wellness check-in as part of your complete professional profile',
    },
    {
      id: 'executive-summary',
      title: 'Executive summary',
      description: 'Arise holistic leadership assessment',
    },
    {
      id: 'basic-assessment-summary',
      title: 'Basic Assessment Summary',
      description: 'Essential overview of your assessment results',
    },
  ];

  // Map features to plans
  const planFeatureMap: Record<string, string[]> = {
    'revelation': ['professional-assessment', '360-peer-evaluation', 'wellness-pulse', 'executive-summary'],
    'self-exploration': ['professional-assessment', 'wellness-pulse', 'executive-summary'],
    'wellness': ['wellness-pulse', 'basic-assessment-summary'],
  };

  // Map tab IDs to expected plan names and prices (in cents)
  // Note: Database stores plan names with price included (e.g., "REVELATION $299")
  const planConfigMap: Record<string, { namePatterns: string[], price: number }> = {
    'revelation': {
      namePatterns: ['REVELATION'], // Matches "REVELATION $299" or "REVELATION"
      price: 29900 // $299
    },
    'self-exploration': {
      namePatterns: ['SELF EXPLORATION'], // Matches "SELF EXPLORATION $249" or "SELF EXPLORATION $250"
      price: 24900 // $249 (database has $249, but we also accept $250)
    },
    'wellness': {
      namePatterns: ['LIFESTYLE & WELLNESS', 'LIFESTYLE AND WELLNESS', 'WELLNESS'], // Matches "LIFESTYLE & WELLNESS $99"
      price: 9900 // $99
    },
  };

  // Filter features based on selected plan
  const features = allFeatures.filter(feature => 
    planFeatureMap[selectedPlanTab]?.includes(feature.id)
  );

  const handlePlanValidation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch plans from backend
      console.log('[Step1_5] Fetching plans...');
      const response = await subscriptionsAPI.getPlans(true);
      console.log('[Step1_5] Plans response:', response);
      let fetchedPlans = response.data?.plans || [];

      // If no active plans found, try fetching all plans
      if (fetchedPlans.length === 0) {
        console.log('[Step1_5] No active plans, fetching all plans...');
        const allPlansResponse = await subscriptionsAPI.getPlans(false);
        console.log('[Step1_5] All plans response:', allPlansResponse);
        fetchedPlans = allPlansResponse.data?.plans || [];
      }

      console.log('[Step1_5] Fetched plans:', fetchedPlans.map((p: Plan) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        status: 'active'
      })));

      if (fetchedPlans.length === 0) {
        throw new Error('No plans available. Please contact support.');
      }

      // Get the plan configuration for the selected tab
      const planConfig = planConfigMap[selectedPlanTab];
      
      if (!planConfig) {
        throw new Error(`Invalid plan selection. Please try again.`);
      }

      // Helper function to get plan price in cents
      const getPlanPrice = (plan: Plan): number => {
        if (typeof plan.amount === 'string') {
          return Math.round(parseFloat(plan.amount));
        }
        return plan.amount || 0;
      };

      // Helper function to normalize plan name (remove price, extra spaces, etc.)
      const normalizePlanName = (name: string): string => {
        return name
          .toUpperCase()
          .replace(/\$\d+/g, '') // Remove price like "$299", "$249", "$99"
          .replace(/\s+/g, ' ') // Normalize spaces
          .trim();
      };

      // Find the plan by matching name pattern (handles names with or without price) OR price
      let selectedPlanData = fetchedPlans.find((plan: Plan) => {
        const planPrice = getPlanPrice(plan);
        const planNameUpper = plan.name.toUpperCase().trim();
        const normalizedPlanName = normalizePlanName(plan.name);
        
        // Match by name pattern (handles names with price included like "REVELATION $299")
        const nameMatch = planConfig.namePatterns.some(pattern => {
          const normalizedPattern = normalizePlanName(pattern);
          // Check if plan name contains the pattern or vice versa
          return normalizedPlanName === normalizedPattern ||
                 normalizedPlanName.includes(normalizedPattern) ||
                 normalizedPattern.includes(normalizedPlanName) ||
                 planNameUpper.includes(pattern.toUpperCase()) ||
                 pattern.toUpperCase().includes(planNameUpper.split('$')[0].trim());
        });
        
        // Match by price (exact match or within 100 cents tolerance)
        // For self-exploration, accept both $249 and $250
        const priceTolerance = selectedPlanTab === 'self-exploration' ? 100 : 100;
        const priceMatch = Math.abs(planPrice - planConfig.price) <= priceTolerance;
        
        return nameMatch || priceMatch;
      });

      // If still not found, try matching by price only (as fallback)
      if (!selectedPlanData) {
        const priceTolerance = selectedPlanTab === 'self-exploration' ? 100 : 100;
        selectedPlanData = fetchedPlans.find((plan: Plan) => {
          const planPrice = getPlanPrice(plan);
          return Math.abs(planPrice - planConfig.price) <= priceTolerance;
        });
      }

      if (!selectedPlanData) {
        // Debug: log available plans
        const availablePlans = fetchedPlans.map((p: Plan) => ({
          id: p.id,
          name: p.name,
          price: getPlanPrice(p),
          priceDollars: (getPlanPrice(p) / 100).toFixed(2)
        }));
        console.error('[Step1_5] Available plans:', availablePlans);
        console.error('[Step1_5] Looking for tab:', selectedPlanTab);
        console.error('[Step1_5] Plan config:', planConfig);
        
        const availablePlansList = fetchedPlans.map((p: Plan) => 
          `${p.name} ($${(getPlanPrice(p) / 100).toFixed(2)})`
        ).join(', ');
        
        throw new Error(
          `Plan "${planConfig.namePatterns[0]}" not found. Available plans: ${availablePlansList}. Please contact support.`
        );
      }

      console.log('[Step1_5] Selected plan found:', {
        id: selectedPlanData.id,
        name: selectedPlanData.name,
        amount: selectedPlanData.amount
      });

      // Set the selected plan in the store
      setSelectedPlan({
        id: selectedPlanData.id,
        name: selectedPlanData.name,
        amount: selectedPlanData.amount,
        currency: selectedPlanData.currency,
        interval: selectedPlanData.interval,
        interval_count: selectedPlanData.interval_count,
      });

      // Advance directly to Step 3 (Create Account)
      setStep(3);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail 
        || err?.response?.data?.message
        || err?.message 
        || 'Failed to load plan. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      const wasSelected = newSet.has(featureId);
      if (wasSelected) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
    
    // When a feature is clicked, validate the selected plan and proceed to Step 3
    if (!selectedFeatures.has(featureId)) {
      handlePlanValidation();
    }
  };

  const handlePlanTabSelect = (planId: string) => {
    setSelectedPlanTab(planId);
    // Reset selected features when changing tabs
    setSelectedFeatures(new Set());
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Main container with dark teal background */}
      <div className="relative rounded-2xl bg-[#0F4C56] overflow-hidden">
        {/* Background image on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 opacity-20">
          <div className="relative w-full h-full">
            <Image
              src="/images/register-discover-plans-bg.jpg"
              alt="Background"
              fill
              className="object-cover blur-sm"
              priority
            />
            {/* Fallback gradient if image doesn't load */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0F4C56] to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12">
          {/* Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Discover our plans
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Select the plan that best meets your development needs.
          </p>

          {/* Plan Tabs */}
          <div className="flex flex-wrap gap-3 mb-8 relative">
            {planTabs.map((plan) => (
              <div key={plan.id} className="relative">
                <button
                  onClick={() => handlePlanTabSelect(plan.id)}
                  onMouseEnter={() => setHoveredPlan(plan.id)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selectedPlanTab === plan.id
                      ? 'bg-gray-300 text-gray-900'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {plan.name} ${plan.price}
                </button>
                
                {/* Hover Tooltip */}
                {hoveredPlan === plan.id && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl p-4 z-50 border-2 border-[#D8B868]">
                    <h4 className="font-bold text-gray-900 mb-2 text-sm">What's included:</h4>
                    <ul className="space-y-1">
                      {plan.included.map((item, index) => (
                        <li key={index} className="text-xs text-gray-700 flex items-start gap-2">
                          <span className="text-[#D8B868] mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Features Cards */}
          <div className="space-y-3 mb-8">
            {features.map((feature) => {
              const isSelected = selectedFeatures.has(feature.id);
              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`group relative bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center justify-between overflow-hidden ${
                    isSelected ? 'ring-2 ring-[#D8B868] shadow-md' : 'hover:shadow-md'
                  } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                  
                  <div className="relative z-20 flex-grow">
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-white transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  {isLoading && (
                    <div className="relative z-30 ml-4">
                      <Loader2 className="w-5 h-5 animate-spin text-[#D8B868]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center pt-6 border-t border-white/20">
            <button
              onClick={handleBack}
              className="text-white text-base font-semibold flex items-center gap-2 hover:text-white/90 transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
