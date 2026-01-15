'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Card, Grid } from '@/components/ui';
import Button from '@/components/ui/Button';
import MotionDiv from '@/components/motion/MotionDiv';
import { 
  Check, 
  Star, 
  ArrowRight, 
  Award,
  Users,
  Clock,
  Mail,
  Linkedin,
  BookOpen,
  Sparkles
} from 'lucide-react';
import Image from 'next/image';

interface CoachingPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  sessions: number;
  features: string[];
  popular?: boolean;
  color: string;
}

interface Coach {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviews: number;
  experience: string;
  image?: string;
  linkedin?: string;
  email?: string;
}

export default function CoachingOptionsPage() {
  const t = useTranslations('dashboard.coachingOptions');
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const coachingPackages: CoachingPackage[] = [
    {
      id: 'starter',
      name: t('packages.starter.name'),
      description: t('packages.starter.description'),
      price: 150,
      duration: t('packages.starter.duration'),
      sessions: 1,
      features: [
        t('packages.starter.features.0'),
        t('packages.starter.features.1'),
        t('packages.starter.features.2'),
        t('packages.starter.features.3'),
        t('packages.starter.features.4')
      ],
      color: 'bg-primary-500'
    },
    {
      id: 'growth',
      name: t('packages.growth.name'),
      description: t('packages.growth.description'),
      price: 1200,
      duration: t('packages.growth.duration'),
      sessions: 6,
      features: [
        t('packages.growth.features.0'),
        t('packages.growth.features.1'),
        t('packages.growth.features.2'),
        t('packages.growth.features.3'),
        t('packages.growth.features.4'),
        t('packages.growth.features.5')
      ],
      popular: true,
      color: 'bg-arise-gold'
    },
    {
      id: 'transformation',
      name: t('packages.transformation.name'),
      description: t('packages.transformation.description'),
      price: 2400,
      duration: t('packages.transformation.duration'),
      sessions: 12,
      features: [
        t('packages.transformation.features.0'),
        t('packages.transformation.features.1'),
        t('packages.transformation.features.2'),
        t('packages.transformation.features.3'),
        t('packages.transformation.features.4'),
        t('packages.transformation.features.5'),
        t('packages.transformation.features.6'),
        t('packages.transformation.features.7')
      ],
      color: 'bg-purple-600'
    }
  ];

  const coaches: Coach[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: t('coaches.sarah.title'),
      bio: t('coaches.sarah.bio'),
      specialties: [
        t('coaches.sarah.specialties.0'),
        t('coaches.sarah.specialties.1'),
        t('coaches.sarah.specialties.2')
      ],
      rating: 4.9,
      reviews: 127,
      experience: t('coaches.sarah.experience'),
      linkedin: 'https://linkedin.com/in/sarahchen',
      email: 'sarah.chen@arise.com'
    },
    {
      id: '2',
      name: 'Michael Dubois',
      title: t('coaches.michael.title'),
      bio: t('coaches.michael.bio'),
      specialties: [
        t('coaches.michael.specialties.0'),
        t('coaches.michael.specialties.1'),
        t('coaches.michael.specialties.2')
      ],
      rating: 4.8,
      reviews: 89,
      experience: t('coaches.michael.experience'),
      linkedin: 'https://linkedin.com/in/michaeldubois',
      email: 'michael.dubois@arise.com'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      title: t('coaches.emma.title'),
      bio: t('coaches.emma.bio'),
      specialties: [
        t('coaches.emma.specialties.0'),
        t('coaches.emma.specialties.1'),
        t('coaches.emma.specialties.2')
      ],
      rating: 4.9,
      reviews: 156,
      experience: t('coaches.emma.experience'),
      linkedin: 'https://linkedin.com/in/emmarodriguez',
      email: 'emma.rodriguez@arise.com'
    },
    {
      id: '4',
      name: 'David Kim',
      title: t('coaches.david.title'),
      bio: t('coaches.david.bio'),
      specialties: [
        t('coaches.david.specialties.0'),
        t('coaches.david.specialties.1'),
        t('coaches.david.specialties.2')
      ],
      rating: 4.7,
      reviews: 94,
      experience: t('coaches.david.experience'),
      linkedin: 'https://linkedin.com/in/davidkim',
      email: 'david.kim@arise.com'
    }
  ];

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    // Scroll to coaches section
    setTimeout(() => {
      document.getElementById('coaches-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleBookSession = (coachId: string, packageId?: string) => {
    // In a real app, this would navigate to a booking page or open a modal
    console.log('Booking session with coach:', coachId, 'Package:', packageId || selectedPackage);
    // router.push(`/dashboard/coaching/book?coach=${coachId}&package=${packageId || selectedPackage}`);
    alert(t('booking.alert'));
  };

  return (
    <div className="p-6 md:p-8">
      <MotionDiv variant="fade" duration="normal">
        <div className="mb-8 pb-6">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">{t('title.prefix')} </span>
            <span style={{ color: '#D5B667' }}>{t('title.suffix')}</span>
          </h1>
          <p className="text-white text-lg">
            {t('subtitle')}
          </p>
        </div>
      </MotionDiv>
      {/* Hero Section */}
      <MotionDiv variant="fade" duration="normal">
        <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
          <div 
            className="absolute"
            style={{ 
              backgroundColor: '#D5DEE0',
              top: '-20px',
              bottom: 0,
              left: '-15%',
              right: '-15%',
              width: 'calc(100% + 30%)',
              zIndex: 0,
              borderRadius: '16px',
            }}
          />
          <div className="relative z-10">
            <Card className="overflow-hidden border-0 text-white" 
              style={{ background: 'linear-gradient(135deg, rgba(10, 58, 64, 0.95) 0%, rgba(15, 90, 100, 0.95) 100%)' }}>
              <div className="p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-8 w-8 text-arise-gold" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {t('hero.title')}
                  </h2>
                </div>
                <p className="text-lg text-white/90 max-w-3xl mb-6">
                  {t('hero.description')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-arise-gold" />
                    <span>{t('hero.badges.icf')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-arise-gold" />
                    <span>{t('hero.badges.clients')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-arise-gold" />
                    <span>{t('hero.badges.satisfaction')}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </MotionDiv>

      {/* Packages Section */}
      <MotionDiv variant="slideUp" delay={100}>
        <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
          <div 
            className="absolute"
            style={{ 
              backgroundColor: '#D5DEE0',
              top: '-20px',
              bottom: 0,
              left: '-15%',
              right: '-15%',
              width: 'calc(100% + 30%)',
              zIndex: 0,
              borderRadius: '16px',
            }}
          />
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t('packagesSection.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('packagesSection.subtitle')}
              </p>
            </div>

            <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
              {coachingPackages.map((pkg, index) => (
                <MotionDiv key={pkg.id} variant="slideUp" delay={100 + index * 50}>
                  <Card className={`relative h-full flex flex-col ${pkg.popular ? 'ring-2 ring-arise-gold shadow-lg' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-arise-gold text-arise-deep-teal px-4 py-1 rounded-full text-sm font-semibold">
                          {t('packages.popular')}
                        </span>
                      </div>
                    )}
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className={`w-12 h-12 ${pkg.color} rounded-lg flex items-center justify-center mb-4`}>
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {pkg.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 flex-1">
                        {pkg.description}
                      </p>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900">
                            {pkg.price}€
                          </span>
                          {pkg.sessions > 1 && (
                            <span className="text-gray-500">
                              /{pkg.duration}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{t('packages.sessions', { count: pkg.sessions, plural: pkg.sessions > 1 ? 's' : '' })}</span>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={pkg.popular ? 'primary' : 'outline'}
                        className={`w-full ${pkg.popular ? 'bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90' : ''}`}
                        onClick={() => handleSelectPackage(pkg.id)}
                      >
                        {t('packages.selectButton')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </Grid>
          </div>
        </div>
      </MotionDiv>

      {/* Coaches Section */}
      <MotionDiv variant="slideUp" delay={200}>
        <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
          <div 
            className="absolute"
            style={{ 
              backgroundColor: '#D5DEE0',
              top: '-20px',
              bottom: 0,
              left: '-15%',
              right: '-15%',
              width: 'calc(100% + 30%)',
              zIndex: 0,
              borderRadius: '16px',
            }}
          />
          <div id="coaches-section" className="relative z-10 scroll-mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t('coachesSection.title')}
              </h2>
              <p className="text-gray-600 text-lg">
                {t('coachesSection.subtitle')}
              </p>
              {selectedPackage && (
                <div className="mt-4 inline-block">
                  <Card className="bg-primary-50 border-primary-200 p-4">
                    <p className="text-primary-800">
                      <strong>{t('coachesSection.selectedPackage')}:</strong> {coachingPackages.find(p => p.id === selectedPackage)?.name}
                    </p>
                  </Card>
                </div>
              )}
            </div>

            <Grid columns={{ mobile: 1, tablet: 2, desktop: 2 }} gap="normal">
              {coaches.map((coach, index) => (
                <MotionDiv key={coach.id} variant="slideUp" delay={200 + index * 50}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-arise-teal to-arise-deep-teal flex items-center justify-center flex-shrink-0">
                          {coach.image ? (
                            <Image
                              src={coach.image}
                              alt={coach.name}
                              fill
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white">
                              {coach.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {coach.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {coach.title}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {coach.rating}
                              </span>
                              <span className="text-sm text-gray-500">
                                {t('coaches.reviews', { count: coach.reviews })}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {coach.experience}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {coach.bio}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          {t('coaches.specialties')}:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-arise-teal/10 text-arise-deep-teal rounded-full text-sm"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex gap-3">
                          {coach.linkedin && (
                            <a
                              href={coach.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              title="LinkedIn"
                            >
                              <Linkedin className="h-5 w-5" />
                            </a>
                          )}
                          {coach.email && (
                            <a
                              href={`mailto:${coach.email}`}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="Email"
                            >
                              <Mail className="h-5 w-5" />
                            </a>
                          )}
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => handleBookSession(coach.id, selectedPackage || undefined)}
                          className="bg-arise-deep-teal hover:bg-arise-deep-teal/90"
                        >
                          {t('coaches.bookButton')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </Grid>
          </div>
        </div>
      </MotionDiv>

      {/* CTA Section */}
      <MotionDiv variant="fade" delay={300}>
        <div className="relative mb-8" style={{ paddingBottom: '32px' }}>
          <div 
            className="absolute"
            style={{ 
              backgroundColor: '#D5DEE0',
              top: '-20px',
              bottom: 0,
              left: '-15%',
              right: '-15%',
              width: 'calc(100% + 30%)',
              zIndex: 0,
              borderRadius: '16px',
            }}
          />
          <div className="relative z-10">
            <Card className="text-center p-8 md:p-12 bg-gradient-to-r from-arise-teal to-arise-deep-teal text-white border-0">
              <h2 className="text-3xl font-bold mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
                {t('cta.description')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="primary"
                  className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90"
                  onClick={() => router.push('/dashboard')}
                >
                  {t('cta.backToDashboard')}
                </Button>
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10"
                  onClick={() => router.push('/contact')}
                >
                  {t('cta.contactUs')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}
