'use client';

import { useRouter } from 'next/navigation';
import { useRegistrationStore } from '@/stores/registrationStore';
import Button from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export function Step7_Welcome() {
  const router = useRouter();
  const { userInfo, reset } = useRegistrationStore();

  const handleGoToDashboard = () => {
    reset();
    router.push('/dashboard');
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-arise-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-4xl font-bold text-arise-deep-teal mb-4">
          Welcome to ARISE!
        </h2>
        
        <p className="text-xl text-gray-700 mb-2">
          Hi {userInfo.firstName},
        </p>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Your account has been successfully created. You're ready to begin your leadership development journey.
        </p>

        <div className="bg-arise-light-beige rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-arise-deep-teal mb-4">
            What's next?
          </h3>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-arise-gold font-bold">1.</span>
              <span>Complete your first assessment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arise-gold font-bold">2.</span>
              <span>Explore your personalized dashboard</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-arise-gold font-bold">3.</span>
              <span>Discover insights about your leadership style</span>
            </li>
          </ul>
        </div>

        <Button
          onClick={handleGoToDashboard}
          size="lg"
          className="bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold px-12"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
