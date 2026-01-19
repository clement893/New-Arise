'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Users, Linkedin, Mail, Award, GraduationCap, Briefcase, ExternalLink, Handshake } from 'lucide-react';
import Image from 'next/image';

export default function TeamPage() {
  const t = useTranslations('team');

  // Team members data - translated
  const teamMembers = [
    {
      id: 1,
      name: 'Gabriela Loureiro',
      role: t('members.gabriela.role'),
      bio: t('members.gabriela.bio'),
      expertise: t('members.gabriela.expertise'),
      education: t('members.gabriela.education'),
      wellbeing: t('members.gabriela.wellbeing'),
      image: '/images/team/placeholder.jpg',
      linkedin: t('members.gabriela.linkedin'),
      email: 'info@arisehumancapital.com',
    },
    {
      id: 2,
      name: 'Tamara Lovi, MBA',
      role: t('members.tamara.role'),
      bio: t('members.tamara.bio'),
      expertise: t('members.tamara.expertise'),
      education: t('members.tamara.education'),
      wellbeing: t('members.tamara.wellbeing'),
      image: '/images/team/placeholder.jpg',
      linkedin: t('members.tamara.linkedin'),
      email: 'info@arisehumancapital.com',
    },
  ];

  const partners = [
    {
      id: 1,
      name: t('partners.keyPartners.nukleo.name'),
      description: t('partners.keyPartners.nukleo.description'),
      url: t('partners.keyPartners.nukleo.url'),
    },
    {
      id: 2,
      name: t('partners.keyPartners.unlock.name'),
      description: t('partners.keyPartners.unlock.description'),
      url: t('partners.keyPartners.unlock.url'),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="text-arise-deep-teal" size={40} />
              <h1 className="text-5xl font-bold text-gray-900">
                {t('title')}
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Leadership Team */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('leadership.title')}</h2>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <MotionDiv key={member.id} variant="slideUp" delay={index * 100}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center overflow-hidden">
                        {member.image ? (
                          <Image
                            src={member.image}
                            alt={member.name}
                            width={128}
                            height={128}
                            className="object-cover"
                          />
                        ) : (
                          <Users className="text-arise-deep-teal/40" size={64} />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-lg text-arise-deep-teal font-semibold mb-3">{member.role}</p>
                      <p className="text-gray-700 mb-4">{member.bio}</p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-start gap-2">
                          <Briefcase className="text-arise-deep-teal flex-shrink-0 mt-1" size={16} />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Expertise</p>
                            <p className="text-sm text-gray-600">{member.expertise}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <GraduationCap className="text-arise-deep-teal flex-shrink-0 mt-1" size={16} />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Education</p>
                            <p className="text-sm text-gray-600">{member.education}</p>
                          </div>
                        </div>
                        {member.wellbeing && (
                          <div className="bg-arise-deep-teal/5 p-3 rounded-lg mt-3">
                            <p className="text-xs font-semibold text-arise-deep-teal uppercase mb-2">My Wellbeing</p>
                            <p className="text-sm text-gray-700 italic">{member.wellbeing}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin size={20} />
                          </a>
                        )}
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors"
                            aria-label={`Email ${member.name}`}
                          >
                            <Mail size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Partners */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Handshake className="text-arise-deep-teal" size={32} />
                <h2 className="text-3xl font-bold text-gray-900">{t('partners.title')}</h2>
              </div>
              <p className="text-gray-600">
                {t('partners.subtitle')}
              </p>
            </div>
          </MotionDiv>

          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">{t('partners.keyPartners.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {partners.map((partner, index) => (
                <MotionDiv key={partner.id} variant="slideUp" delay={index * 100}>
                  <Card className="p-6 hover:shadow-lg transition-shadow h-full">
                    <h4 className="text-lg font-bold text-arise-deep-teal mb-2">{partner.name}</h4>
                    <p className="text-gray-700 mb-4">{partner.description}</p>
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors font-medium"
                    >
                      Visit website
                      <ExternalLink size={16} />
                    </a>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <Card className="p-8 md:p-12 bg-gradient-to-br from-arise-gold/10 to-arise-deep-teal/10 border-arise-gold/20">
              <div className="text-center max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Award className="text-arise-gold" size={40} />
                  <h2 className="text-3xl font-bold text-gray-900">{t('advisory.title')}</h2>
                </div>
                <p className="text-lg text-gray-700 mb-6">
                  {t('advisory.subtitle')}
                </p>
                <a
                  href="mailto:info@arisehumancapital.com"
                  className="inline-flex items-center gap-2 bg-arise-deep-teal text-white px-6 py-3 rounded-lg hover:bg-arise-deep-teal/90 transition-colors font-semibold"
                >
                  <Mail size={20} />
                  {t('advisory.contact')}
                </a>
              </div>
            </Card>
          </MotionDiv>
        </div>

      </main>
      <Footer />
    </div>
  );
}
