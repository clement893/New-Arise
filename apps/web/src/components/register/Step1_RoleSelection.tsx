'use client';

import { useRegistrationStore } from '@/stores/registrationStore';
import { User, Users, Building2 } from 'lucide-react';

export function Step1_RoleSelection() {
  const { setRole, setStep } = useRegistrationStore();

  const roles = [
    {
      id: 'individual' as const,
      icon: User,
      title: 'Individual',
      description: 'I want to develop my personal leadership skills'
    },
    {
      id: 'coach' as const,
      icon: Users,
      title: 'Coach',
      description: 'I guide leaders through their development journey'
    },
    {
      id: 'business' as const,
      icon: Building2,
      title: 'Business',
      description: 'I want to develop leadership talent in my organization'
    }
  ];

  const handleRoleSelect = (roleId: 'individual' | 'coach' | 'business') => {
    setRole(roleId);
    setStep(1.5);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-arise-deep-teal mb-8 text-center">
          Who are you?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-arise-gold hover:bg-arise-light-beige transition-all duration-300 text-left"
            >
              <div className="w-16 h-16 bg-arise-deep-teal group-hover:bg-arise-gold rounded-lg flex items-center justify-center mb-4 transition-colors">
                <role.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arise-deep-teal mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600">
                {role.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
