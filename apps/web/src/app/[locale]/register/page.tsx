'use client';

import { useState, useEffect } from 'react';
import { useRegistrationStore } from '@/stores/registrationStore';
import { Step1_RoleSelection } from '@/components/register/Step1_RoleSelection';
import { Step1_5_DiscoverPlans } from '@/components/register/Step1_5_DiscoverPlans';
import { Step2_PlanSelection } from '@/components/register/Step2_PlanSelection';
import { Step3_CreateAccount } from '@/components/register/Step3_CreateAccount';
import { Step4_ReviewConfirm } from '@/components/register/Step4_ReviewConfirm';
import { Step5_Payment } from '@/components/register/Step5_Payment';
import { Step6_CompleteProfile } from '@/components/register/Step6_CompleteProfile';
import { Step7_Welcome } from '@/components/register/Step7_Welcome';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function RegisterPage() {
  const step = useRegistrationStore((state) => state.step);
  const [prevStep, setPrevStep] = useState(step);
  const [keepStep5Mounted, setKeepStep5Mounted] = useState(false);

  // Track step changes to handle Stripe component unmounting
  useEffect(() => {
    setPrevStep(step);
    
    // When transitioning from step 5 to 6, keep Step5 mounted for a bit
    let timer: NodeJS.Timeout | undefined;
    if (prevStep === 5 && step === 6) {
      setKeepStep5Mounted(true);
      // Clean up after 2 seconds to allow all Stripe operations to complete
      timer = setTimeout(() => {
        setKeepStep5Mounted(false);
      }, 2000);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [step, prevStep]);

  const renderStep = () => {
    // Keep Step5 mounted during transition from step 5 to 6 to prevent Stripe unmount errors
    // This ensures the Stripe element stays mounted until all operations complete
    if (keepStep5Mounted && step === 6) {
      return (
        <>
          <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: 0, height: 0, overflow: 'hidden' }}>
            <Step5_Payment />
          </div>
          <Step6_CompleteProfile />
        </>
      );
    }

    switch (step) {
      case 1:
        return <Step1_RoleSelection />;
      case 1.5:
        return <Step1_5_DiscoverPlans />;
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
      <Header />
      
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

      {/* Progress Bar */}
      {step < 7 && (
        <div className="relative z-10 container mx-auto px-4 pt-20 sm:pt-[120px] md:pt-[165px] mb-8">
          <div className="flex justify-center items-center gap-2 mb-2">
            {Array.from({ length: 8 }, (_, index) => {
              const stepNumber = index + 1;
              // Map step 1.5 to visual step 2
              const visualStep = step === 1.5 ? 2 : step;
              const isActive = stepNumber <= visualStep;
              return (
                <div
                  key={stepNumber}
                  className={`rounded-full transition-all duration-500 ${
                    isActive ? 'bg-[#EF977D]' : 'bg-white/30'
                  }`}
                  style={{
                    width: '8px',
                    height: '8px',
                  }}
                />
              );
            })}
          </div>
          <div className="text-white text-sm font-medium text-center">
            Step {step === 1.5 ? 2 : step} of 8
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {renderStep()}
      </div>
      <div className="h-96"></div>
      <Footer />
    </div>
  );
}
