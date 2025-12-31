'use client';

import { useRegistrationStore } from '@/stores/registrationStore';
import { Button } from '@/components/ui/Button';
import { Edit2 } from 'lucide-react';

export function Step4_ReviewConfirm() {
  const { role, planId, userInfo, setStep } = useRegistrationStore();

  const handleContinue = () => {
    setStep(5);
  };

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
                onClick={() => setStep(2)}
                className="text-arise-gold hover:text-arise-gold/80 flex items-center gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            </div>
            <p className="text-gray-700 capitalize">{planId}</p>
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

        <Button
          onClick={handleContinue}
          className="w-full mt-8 bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
