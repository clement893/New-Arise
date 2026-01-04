'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
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

const coachingPackages: CoachingPackage[] = [
  {
    id: 'starter',
    name: 'Découverte',
    description: 'Parfait pour découvrir le coaching et obtenir des conseils ciblés',
    price: 150,
    duration: '1 session',
    sessions: 1,
    features: [
      'Session de 90 minutes',
      'Analyse de vos résultats d\'assessments',
      'Plan d\'action personnalisé',
      'Ressources et outils',
      'Email de suivi post-session'
    ],
    color: 'bg-primary-500'
  },
  {
    id: 'growth',
    name: 'Croissance',
    description: 'Pour une transformation significative sur plusieurs mois',
    price: 1200,
    duration: '3 mois',
    sessions: 6,
    features: [
      '6 sessions de 60 minutes',
      'Suivi continu de vos progrès',
      'Plan de développement personnalisé',
      'Accès à la bibliothèque de ressources',
      'Support par email entre les sessions',
      'Rapports de progression mensuels'
    ],
    popular: true,
    color: 'bg-arise-gold'
  },
  {
    id: 'transformation',
    name: 'Transformation',
    description: 'Accompagnement complet pour une transformation en profondeur',
    price: 2400,
    duration: '6 mois',
    sessions: 12,
    features: [
      '12 sessions de 60 minutes',
      'Accompagnement intensif et personnalisé',
      'Plan de développement stratégique',
      'Accès prioritaire aux ressources premium',
      'Support illimité par email',
      'Rapports détaillés trimestriels',
      'Session de bilan et célébration',
      'Accès à la communauté exclusive'
    ],
    color: 'bg-purple-600'
  }
];

const coaches: Coach[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Leadership & Executive Coach',
    bio: 'Avec plus de 15 ans d\'expérience en développement du leadership, Sarah accompagne les dirigeants dans leur transformation personnelle et professionnelle.',
    specialties: ['Leadership transformation', 'Communication stratégique', 'Gestion du changement'],
    rating: 4.9,
    reviews: 127,
    experience: '15+ ans',
    linkedin: 'https://linkedin.com/in/sarahchen',
    email: 'sarah.chen@arise.com'
  },
  {
    id: '2',
    name: 'Michael Dubois',
    title: 'Performance & Wellness Coach',
    bio: 'Spécialiste en performance organisationnelle et bien-être au travail, Michael aide les leaders à équilibrer excellence professionnelle et épanouissement personnel.',
    specialties: ['Performance individuelle', 'Wellness & équilibre', 'Gestion du stress'],
    rating: 4.8,
    reviews: 89,
    experience: '12+ ans',
    linkedin: 'https://linkedin.com/in/michaeldubois',
    email: 'michael.dubois@arise.com'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    title: 'Career & Transition Coach',
    bio: 'Experte en transitions de carrière et développement de potentiel, Emma guide les professionnels dans leurs moments clés de changement et de croissance.',
    specialties: ['Transition de carrière', 'Développement de potentiel', 'Planification stratégique'],
    rating: 4.9,
    reviews: 156,
    experience: '10+ ans',
    linkedin: 'https://linkedin.com/in/emmarodriguez',
    email: 'emma.rodriguez@arise.com'
  },
  {
    id: '4',
    name: 'David Kim',
    title: 'Team & Culture Coach',
    bio: 'Passionné par la construction d\'équipes performantes, David travaille avec les leaders pour créer des environnements de travail collaboratifs et innovants.',
    specialties: ['Leadership d\'équipe', 'Culture organisationnelle', 'Collaboration'],
    rating: 4.7,
    reviews: 94,
    experience: '14+ ans',
    linkedin: 'https://linkedin.com/in/davidkim',
    email: 'david.kim@arise.com'
  }
];

export default function CoachingOptionsPage() {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

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
    alert(`Réservation d'une session avec le coach et le forfait sélectionnés. Cette fonctionnalité sera bientôt disponible !`);
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Options de Coaching
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez nos forfaits et rencontrez nos coachs certifiés pour accélérer votre développement en leadership
          </p>
        </div>
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="mb-12 overflow-hidden border-0 text-white" 
            style={{ background: 'linear-gradient(135deg, rgba(10, 58, 64, 0.95) 0%, rgba(15, 90, 100, 0.95) 100%)' }}>
            <div className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="h-8 w-8 text-arise-gold" />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Transformez votre leadership avec l'accompagnement personnalisé
                </h2>
              </div>
              <p className="text-lg text-white/90 max-w-3xl mb-6">
                Nos coachs certifiés ARISE vous accompagnent dans votre parcours de développement. 
                Choisissez le forfait qui correspond à vos objectifs et sélectionnez le coach qui vous inspire.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-arise-gold" />
                  <span>Coachs certifiés ICF</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-arise-gold" />
                  <span>500+ clients accompagnés</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-arise-gold" />
                  <span>4.8/5 satisfaction moyenne</span>
                </div>
              </div>
            </div>
          </Card>
        </MotionDiv>

        {/* Packages Section */}
        <MotionDiv variant="slideUp" delay={100}>
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Nos Forfaits de Coaching
              </h2>
              <p className="text-gray-600 text-lg">
                Choisissez le forfait qui correspond à vos besoins et à votre rythme
              </p>
            </div>

            <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
              {coachingPackages.map((pkg, index) => (
                <MotionDiv key={pkg.id} variant="slideUp" delay={100 + index * 50}>
                  <Card className={`relative h-full flex flex-col ${pkg.popular ? 'ring-2 ring-arise-gold shadow-lg' : ''}`}>
                    {pkg.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-arise-gold text-arise-deep-teal px-4 py-1 rounded-full text-sm font-semibold">
                          Le plus populaire
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
                          <span>{pkg.sessions} session{pkg.sessions > 1 ? 's' : ''}</span>
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
                        Choisir ce forfait
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </Grid>
          </div>
        </MotionDiv>

        {/* Coaches Section */}
        <MotionDiv variant="slideUp" delay={200}>
          <div id="coaches-section" className="mb-12 scroll-mt-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Rencontrez nos Coachs
              </h2>
              <p className="text-gray-600 text-lg">
                Sélectionnez le coach qui correspond le mieux à vos besoins
              </p>
              {selectedPackage && (
                <div className="mt-4 inline-block">
                  <Card className="bg-primary-50 border-primary-200 p-4">
                    <p className="text-primary-800">
                      <strong>Forfait sélectionné:</strong> {coachingPackages.find(p => p.id === selectedPackage)?.name}
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
                                ({coach.reviews} avis)
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
                          Spécialités:
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
                          Réserver une session
                        </Button>
                      </div>
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </Grid>
          </div>
        </MotionDiv>

        {/* CTA Section */}
        <MotionDiv variant="fade" delay={300}>
          <Card className="text-center p-8 md:p-12 bg-gradient-to-r from-arise-teal to-arise-deep-teal text-white border-0">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à commencer votre transformation ?
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Contactez-nous pour discuter de vos besoins et trouver le forfait et le coach qui vous conviennent le mieux.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="primary"
                className="bg-arise-gold text-arise-deep-teal hover:bg-arise-gold/90"
                onClick={() => router.push('/dashboard')}
              >
                Retour au dashboard
              </Button>
              <Button
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10"
                onClick={() => window.location.href = 'mailto:coaching@arise.com'}
              >
                Nous contacter
              </Button>
            </div>
          </Card>
        </MotionDiv>
      </div>
    </DashboardLayout>
  );
}
