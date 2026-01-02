'use client';

import Button from '@/components/ui/Button';
import Link from 'next/link';
import { User, Users, Building2 } from 'lucide-react';

export function ChooseYourPathSection() {
  const paths = [
    {
      icon: User,
      title: 'INDIVIDUAL',
      description: 'Perfect for leaders looking to develop their personal leadership skills and gain deep self-awareness.',
      features: [
        'Complete all 4 assessments',
        'Personal leadership profile',
        'Actionable insights',
        'Progress tracking'
      ]
    },
    {
      icon: Users,
      title: 'COACH',
      description: 'Designed for professional coaches who guide leaders through their development journey.',
      features: [
        'Manage multiple clients',
        'Access client reports',
        'Track client progress',
        'Coaching tools & resources'
      ]
    },
    {
      icon: Building2,
      title: 'BUSINESS',
      description: 'Comprehensive solution for organizations committed to developing their leadership talent.',
      features: [
        'Team assessments',
        'Organization-wide insights',
        'Custom reporting',
        'Dedicated support'
      ]
    }
  ];

  return (
    <section className="py-20 bg-arise-light-beige">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-arise-deep-teal mb-4">
              Choose your path
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Whether you're an individual leader, a coach, or an organization, we have the right solution for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {paths.map((path) => (
              <div 
                key={path.title}
                className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="mb-6">
                  <div className="w-16 h-16 bg-arise-deep-teal rounded-lg flex items-center justify-center mb-4">
                    <path.icon className="w-8 h-8 text-arise-gold" />
                  </div>
                  <h3 className="text-2xl font-bold text-arise-deep-teal mb-3">
                    {path.title}
                  </h3>
                  <p className="text-gray-600">
                    {path.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {path.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg 
                        className="w-5 h-5 text-arise-gold mr-2 mt-0.5 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  asChild 
                  className="w-full bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold"
                >
                  <Link href="/register">Explore</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
