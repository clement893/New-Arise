'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import MotionDiv from '@/components/motion/MotionDiv';
import { Target, Eye, Heart, Award, ArrowRight, Users, Lightbulb, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AboutPage() {
  const t = useTranslations('about');
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-12 pb-6 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </MotionDiv>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="text-arise-deep-teal" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">{t('mission.title')}</h2>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  {t('mission.text1')}
                </p>
                <p className="text-gray-700">
                  {t('mission.text2')}
                </p>
              </div>
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="text-arise-deep-teal/30" size={120} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vision Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-arise-deep-teal/5 to-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="order-2 md:order-1 relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-arise-gold/20 to-arise-deep-teal/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Eye className="text-arise-gold/30" size={120} />
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="text-arise-gold" size={32} />
                  <h2 className="text-3xl font-bold text-gray-900">{t('vision.title')}</h2>
                </div>
                <p className="text-lg text-gray-700 mb-4">
                  {t('vision.text1')}
                </p>
                <p className="text-gray-700">
                  {t('vision.text2')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <MotionDiv variant="fade" duration="normal">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="text-arise-deep-teal" size={32} />
                <h2 className="text-3xl font-bold text-gray-900">{t('values.title')}</h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('values.subtitle')}
              </p>
            </div>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-arise-deep-teal" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('values.authenticity.title')}</h3>
              <p className="text-gray-600">
                {t('values.authenticity.text')}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-arise-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('values.growth.title')}</h3>
              <p className="text-gray-600">
                {t('values.growth.text')}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-deep-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-arise-deep-teal" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('values.innovation.title')}</h3>
              <p className="text-gray-600">
                {t('values.innovation.text')}
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-arise-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-arise-gold" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('values.excellence.title')}</h3>
              <p className="text-gray-600">
                {t('values.excellence.text')}
              </p>
            </Card>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <Card className="p-8 md:p-12">
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('journey.title')}</h2>
            </MotionDiv>

            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('journey.2020.title')}</h3>
                  <p className="text-gray-700">
                    {t('journey.2020.text')}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-gold rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('journey.2021.title')}</h3>
                  <p className="text-gray-700">
                    {t('journey.2021.text')}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('journey.2022.title')}</h3>
                  <p className="text-gray-700">
                    {t('journey.2022.text')}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-gold rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('journey.2023.title')}</h3>
                  <p className="text-gray-700">
                    {t('journey.2023.text')}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center text-white font-bold">
                    5
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('journey.2024.title')}</h3>
                  <p className="text-gray-700">
                    {t('journey.2024.text')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="p-8 md:p-12 bg-gradient-to-r from-arise-deep-teal to-arise-deep-teal/90 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button
              asChild
              className="!bg-arise-gold hover:!bg-arise-gold/90 !text-arise-deep-teal font-semibold px-8 py-3 text-lg inline-flex items-center gap-2"
            >
              <Link href="/register">
                {t('cta.getStarted')}
                <ArrowRight size={20} />
              </Link>
            </Button>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
