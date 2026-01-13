'use client';

import { useForm } from 'react-hook-form';
import { useRegistrationStore } from '@/stores/registrationStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProfileFormData {
  companyName?: string;
  jobTitle?: string;
  industry?: string;
}

export function Step6_CompleteProfile() {
  const { setProfileInfo, setStep } = useRegistrationStore();
  
  const {
    register,
    handleSubmit,
  } = useForm<ProfileFormData>();

  const onSubmit = (data: ProfileFormData) => {
    setProfileInfo(data);
    setStep(7);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-2 text-center">
          Complete your profile
        </h2>
        <p className="text-gray-600 mb-8 text-center">
          Help us personalize your experience (optional)
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <Input
              {...register('companyName')}
              placeholder="Acme Corporation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Title
            </label>
            <Input
              {...register('jobTitle')}
              placeholder="Senior Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <Input
              {...register('industry')}
              placeholder="Technology"
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
