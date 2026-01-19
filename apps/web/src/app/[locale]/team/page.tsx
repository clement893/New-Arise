'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Users, Award, ExternalLink, Handshake } from 'lucide-react';
import Image from 'next/image';

export default function TeamPage() {
  const t = useTranslations('team');
  const locale = useLocale();

  const partners = [
    {
      id: 1,
      name: 'Nukleo',
      url: 'https://nukleo.com/',
      description: t('partners.nukleo.description'),
    },
    {
      id: 2,
      name: 'Unlock Communications',
      url: 'https://www.unlockcommunications.com/',
      description: t('partners.unlock.description'),
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

          <MotionDiv variant="slideUp">
            <Card className="p-8 max-w-3xl mx-auto text-center">
              <div className="mb-6">
                <Users className="text-arise-deep-teal mx-auto" size={64} />
              </div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {t('leadership.description')}
              </p>
              <a
                href={`https://arisehumancapital.com/${locale}/#team`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-arise-deep-teal text-white px-6 py-3 rounded-lg hover:bg-arise-deep-teal/90 transition-colors font-semibold"
              >
                {t('leadership.learnMore')}
                <ExternalLink size={20} />
              </a>
            </Card>
          </MotionDiv>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {partners.map((partner, index) => (
              <MotionDiv key={partner.id} variant="slideUp" delay={index * 100}>
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{partner.name}</h3>
                  <p className="text-gray-700 mb-4">{partner.description}</p>
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-arise-deep-teal hover:text-arise-deep-teal/80 transition-colors font-semibold"
                  >
                    {t('partners.visitWebsite')}
                    <ExternalLink size={16} />
                  </a>
                </Card>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Advisory Board */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Award className="text-arise-gold" size={32} />
                <h2 className="text-3xl font-bold text-gray-900">{t('advisory.title')}</h2>
              </div>
              <p className="text-gray-600">
                {t('advisory.subtitle')}
              </p>
            </div>
          </MotionDiv>

          <MotionDiv variant="slideUp">
            <Card className="p-8 max-w-3xl mx-auto text-center bg-gradient-to-br from-arise-gold/5 to-arise-deep-teal/5">
              <div className="mb-4">
                <Award className="text-arise-gold mx-auto" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t('advisory.joinCTA.title')}
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {t('advisory.joinCTA.description')}
              </p>
              <a
                href="mailto:info@arisehumancapital.com"
                className="inline-flex items-center gap-2 bg-arise-gold text-white px-6 py-3 rounded-lg hover:bg-arise-gold/90 transition-colors font-semibold"
              >
                {t('advisory.joinCTA.contactUs')}
              </a>
            </Card>
          </MotionDiv>
        </div>

      </main>
      <Footer />
    </div>
  );
}
