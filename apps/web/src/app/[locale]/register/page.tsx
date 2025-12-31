'use client';

import { useRegistrationStore } from '@/stores/registrationStore';
import { Step1_RoleSelection } from '@/components/register/Step1_RoleSelection';
import { Step2_PlanSelection } from '@/components/register/Step2_PlanSelection';
import { Step3_CreateAccount } from '@/components/register/Step3_CreateAccount';
import { Step4_ReviewConfirm } from '@/components/register/Step4_ReviewConfirm';
import { Step5_Payment } from '@/components/register/Step5_Payment';
import { Step6_CompleteProfile } from '@/components/register/Step6_CompleteProfile';
import { Step7_Welcome } from '@/components/register/Step7_Welcome';
import Link from 'next/link';

export default function RegisterPage() {
  const step = useRegistrationStore((state) => state.step);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1_RoleSelection />;
      case 2:
        return <Step2_PlanSelection />;
      case 3:
        return <Step3_CreateAccount />;
      case 4:
        return <Step4_ReviewConfirm />;
      case 5:
        return <Step5_Payment />;
      case 6:
        return <Step6_CompleteProfile />;
      case 7:
        return <Step7_Welcome />;
      default:
        return <Step1_RoleSelection />;
    }
  };

  return (
    <div className="min-h-screen bg-arise-deep-teal relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(255, 255, 255, 0.1) 50px,
            rgba(255, 255, 255, 0.1) 51px
          )`
        }}
      />

      {/* Header */}
      <div className="relative z-10 container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            ARISE
          </Link>
          {step < 7 && (
            <div className="text-white text-sm">
              Step {step} of 7
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {step < 7 && (
        <div className="relative z-10 container mx-auto px-4 mb-8">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-arise-gold h-full transition-all duration-500"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {renderStep()}
      </div>
    </div>
  );
}
