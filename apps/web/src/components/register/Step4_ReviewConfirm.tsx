'use client';

import { useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Edit2, ArrowLeft } from 'lucide-react';

export function Step4_ReviewConfirm() {
  const { role, selectedPlan, userInfo, setStep } = useRegistrationStore();

  const formatPrice = () => {
    if (!selectedPlan) return 'Free';
    // Handle both number and string (Decimal from backend)
    const amountInCents = typeof selectedPlan.amount === 'string' ? parseFloat(selectedPlan.amount) : (selectedPlan.amount || 0);
    if (!selectedPlan.amount || amountInCents === 0) return 'Free';
    const price = (amountInCents / 100).toFixed(2);
    return `$${price}`;
  };
  
  // Automatically advance to payment step after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep(5);
    }, 2000); // 2 seconds to review

    return () => clearTimeout(timer);
  }, [setStep]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-2 text-center">
          Review & confirm
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Please review your information before proceeding
        </p>

        <div className="space-y-6">
          {/* Role Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-arise-deep-teal">Role</h3>
              <button
                onClick={() => setStep(1)}
                className="text-arise-gold hover:text-arise-gold/80 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <p className="text-gray-700 capitalize">{role}</p>
          </div>

          {/* Plan Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-arise-deep-teal">Plan</h3>
              <button
                onClick={() => setStep(1.5)}
                className="text-arise-gold hover:text-arise-gold/80 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            {selectedPlan ? (
              <div>
                <p className="text-gray-900 font-semibold text-lg">{selectedPlan.name}</p>
                <p className="text-arise-gold font-bold text-xl mt-1">
                  {formatPrice()}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No plan selected</p>
            )}
          </div>

          {/* Account Information Section */}
          <div className="border-2 border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-arise-deep-teal">Account Information</h3>
              <button
                onClick={() => setStep(3)}
                className="text-arise-gold hover:text-arise-gold/80 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Name:</span> {userInfo.firstName} {userInfo.lastName}</p>
              <p><span className="font-medium">Email:</span> {userInfo.email}</p>
              <p><span className="font-medium">Phone:</span> {userInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setStep(3)}
            className="text-white text-sm flex items-center gap-2 hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
