'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import Button from '@/components/ui/Button';
import { ArrowRight, Plus } from 'lucide-react';
import Image from 'next/image';

interface PlanTab {
  id: string;
  name: string;
  price: number;
}

interface Feature {
  id: string;
  title: string;
  description: string;
}

export function Step1_5_DiscoverPlans() {
  const { setStep } = useRegistrationStore();
  const [selectedPlanTab, setSelectedPlanTab] = useState<string>('revelation');
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  const planTabs: PlanTab[] = [
    { id: 'revelation', name: 'REVELATION', price: 299 },
    { id: 'self-exploration', name: 'SELF EXPLORATION', price: 250 },
    { id: 'wellness', name: 'WELLNESS', price: 99 },
  ];

  const features: Feature[] = [
    {
      id: 'professional-assessment',
      title: 'Professional Assessment',
      description: 'Combined MBTI assessment with TKI conflict management style assessment',
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
  ];

  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(featureId)) {
        newSet.delete(featureId);
      } else {
        newSet.add(featureId);
      }
      return newSet;
    });
  };

  const handleContinue = () => {
    setStep(2);
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
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Discover our plans
          </h2>

          {/* Plan Tabs */}
          <div className="flex flex-wrap gap-3 mb-8">
            {planTabs.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlanTab(plan.id)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  selectedPlanTab === plan.id
                    ? 'bg-gray-300 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {plan.name} ${plan.price}
              </button>
            ))}
          </div>

          {/* Features Cards */}
          <div className="space-y-3 mb-8">
            {features.map((feature) => {
              const isSelected = selectedFeatures.has(feature.id);
              return (
                <div
                  key={feature.id}
                  onClick={() => toggleFeature(feature.id)}
                  className={`bg-white rounded-lg p-5 cursor-pointer transition-all duration-200 flex items-center justify-between ${
                    isSelected ? 'ring-2 ring-[#D8B868] shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex-grow pr-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div
                    className={`ml-2 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#D8B868] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <Plus
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isSelected ? 'rotate-45' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/20">
            <button
              onClick={handleBack}
              className="text-white hover:text-[#D8B868] transition-colors font-medium"
            >
              Back
            </button>
            <Button
              onClick={handleContinue}
              className="bg-[#D8B868] hover:bg-[#D8B868]/90 text-gray-900 font-semibold rounded-lg px-8 py-3 flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
