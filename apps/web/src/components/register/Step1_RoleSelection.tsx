'use client';

import { useTranslations } from 'next-intl';
import { useRegistrationStore } from '@/stores/registrationStore';
import { User, Users, Building2, ArrowLeft } from 'lucide-react';

export function Step1_RoleSelection() {
  const t = useTranslations('register.step1');
  const { setRole, setStep } = useRegistrationStore();

  const roles = [
    {
      id: 'individual' as const,
      icon: User,
      title: t('roles.individual.title'),
      description: t('roles.individual.description')
    },
    {
      id: 'coach' as const,
      icon: Users,
      title: t('roles.coach.title'),
      description: t('roles.coach.description')
    },
    {
      id: 'business' as const,
      icon: Building2,
      title: t('roles.business.title'),
      description: t('roles.business.description')
    }
  ];

  const handleRoleSelect = (roleId: 'individual' | 'coach' | 'business') => {
    setRole(roleId);
    setStep(1.5);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        {t('title')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="group relative bg-white rounded-lg shadow-xl p-4 border-2 border-gray-200 hover:border-arise-gold transition-all duration-300 text-left flex flex-col overflow-hidden"
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-arise-deep-teal/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 rounded-lg" />
            
            {/* Content with relative z-index */}
            <div className="relative z-20 flex flex-col">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center mb-8 transition-colors"
                style={{ backgroundColor: 'rgba(15, 76, 86, 0.05)' }}
              >
                <role.icon className="w-8 h-8" style={{ color: '#0F4C56' }} />
              </div>
              <h3 className="text-xl font-bold text-arise-deep-teal mb-2 group-hover:text-black/40 transition-colors duration-300">
                {role.title}
              </h3>
              <p className="text-gray-600 group-hover:text-black/40 transition-colors duration-300">
                {role.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Back button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => {/* Can't go back from step 1 */}}
          className="text-white text-sm flex items-center gap-2 opacity-50 cursor-not-allowed"
          disabled
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </button>
      </div>
    </div>
  );
}
