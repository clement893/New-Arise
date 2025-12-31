'use client';

import { useState } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

// Mock plans data
const mockPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$49/month',
    features: ['All 4 assessments', 'Personal profile', 'Basic insights']
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99/month',
    features: ['All 4 assessments', 'Advanced analytics', 'Priority support', 'Custom reports']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom pricing',
    features: ['Unlimited assessments', 'Team management', 'Dedicated support', 'API access']
  }
];

export function Step2_PlanSelection() {
  const { setPlanId, setStep } = useRegistrationStore();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedPlan) {
      setPlanId(selectedPlan);
      setStep(3);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-2 text-center">
          Choose your plan
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Select the plan that best fits your needs
        </p>
        
        <div className="space-y-4 mb-8">
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-arise-gold bg-arise-light-beige'
                  : 'border-gray-200 hover:border-arise-deep-teal'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-arise-deep-teal">
                      {plan.name}
                    </h3>
                    <span className="text-lg font-semibold text-arise-gold">
                      {plan.price}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <Check className="w-4 h-4 text-arise-gold" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
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
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedPlan}
          className="w-full bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
