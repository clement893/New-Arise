'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui';
import MotionDiv from '@/components/motion/MotionDiv';
import { Target, Eye, Award, Users, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function AboutPage() {
  const t = useTranslations('about');
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <MotionDiv variant="fade" duration="normal">
          <div className="mb-16 relative flex items-center overflow-hidden rounded-2xl" style={{ backgroundColor: '#0F4C56', minHeight: '500px' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch w-full">
              {/* Left Section - Text on Dark Teal Background */}
              <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col justify-center" style={{ backgroundColor: '#0F4C56' }}>
                <div className="text-left">
                  <h1 className="mb-6">
                    <span className="block text-5xl md:text-6xl font-light mb-2" style={{ color: '#D8B868' }}>
                      Notre
                    </span>
                    <span className="block text-5xl md:text-6xl font-medium" style={{ color: '#D8B868' }}>
                      histoire
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
                    {t('subtitle')}
                  </p>
                </div>
              </div>
              
              {/* Right Section - Photo */}
              <div className="relative h-64 md:h-auto rounded-r-2xl overflow-hidden" style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div className="absolute inset-0">
                  <Image 
                    src="/images/about-hero.jpg" 
                    alt="Notre histoire"
                    fill
                    className="object-cover"
                    priority
                    onError={() => {
                      // Fallback handled by CSS
                    }}
                  />
                  {/* Fallback gradient if image fails to load */}
                  <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Users className="text-white/30" size={120} />
                  </div>
                </div>
                {/* Subtle border around photo */}
                <div className="absolute inset-0 border-2 border-black/10 rounded-r-2xl pointer-events-none"></div>
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* Mission Section */}
        <div className="mb-16">
          <Card 
            className="p-0 border border-[#D8B868] rounded-2xl overflow-hidden bg-white"
            style={{ borderColor: '#D8B868' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
              {/* Image Left */}
              <div className="relative h-64 md:h-auto rounded-l-2xl overflow-hidden">
                <Image 
                  src="/images/about-mission.jpg" 
                  alt="Notre mission"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Fallback gradient if image fails to load */}
                <div className="absolute inset-0 bg-gradient-to-br from-arise-deep-teal/20 to-arise-gold/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Target className="text-arise-deep-teal/30" size={120} />
                </div>
                {/* Rounded right edge where image meets text */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white rounded-r-full"></div>
              </div>
              
              {/* Content Right */}
              <div className="p-6 md:p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(216, 184, 104, 0.2)' }}>
                    <Eye className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                  </div>
                  <h2 className="text-3xl md:text-4xl">
                    <span className="font-light" style={{ color: '#D8B868' }}>Notre </span>
                    <span className="font-medium" style={{ color: '#D8B868' }}>mission</span>
                  </h2>
                </div>
                <p className="text-base md:text-lg text-gray-900 mb-4 leading-relaxed">
                  {t('mission.text1')}
                </p>
                <p className="text-base md:text-lg text-gray-900 leading-relaxed">
                  {t('mission.text2')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Vision Section */}
        <div className="mb-16">
          <Card 
            className="p-0 border border-[#D8B868] rounded-2xl overflow-hidden bg-white"
            style={{ borderColor: '#D8B868' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch">
              {/* Image Left */}
              <div className="relative h-64 md:h-auto rounded-l-2xl overflow-hidden">
                <Image 
                  src="/images/about-vision.jpg" 
                  alt="Notre vision"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Fallback gradient if image fails to load */}
                <div className="absolute inset-0 bg-gradient-to-br from-arise-gold/20 to-arise-deep-teal/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Eye className="text-arise-gold/30" size={120} />
                </div>
                {/* Rounded right edge where image meets text */}
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white rounded-r-full"></div>
              </div>
              
              {/* Content Right */}
              <div className="p-6 md:p-8 lg:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(216, 184, 104, 0.2)' }}>
                    <Eye className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                  </div>
                  <h2 className="text-3xl md:text-4xl">
                    <span className="font-light" style={{ color: '#D8B868' }}>Notre </span>
                    <span className="font-medium" style={{ color: '#D8B868' }}>vision</span>
                  </h2>
                </div>
                <p className="text-base md:text-lg text-gray-900 mb-4 leading-relaxed">
                  {t('vision.text1')}
                </p>
                <p className="text-base md:text-lg text-gray-900 leading-relaxed">
                  {t('vision.text2')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16 relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#0F4C56' }}>
          <div className="relative z-10 py-16 md:py-20 px-4 md:px-8">
            <MotionDiv variant="fade" duration="normal">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-medium text-white mb-4">
                  {t('values.title')}
                </h2>
                <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto" style={{ lineHeight: 'normal' }}>
                  {t('values.subtitle')}
                </p>
              </div>
            </MotionDiv>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Authenticité */}
              <Card className="p-6 text-left rounded-xl" style={{ backgroundColor: '#10454D' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(216, 184, 104, 0.15)', border: '1px solid #D8B868' }}>
                  <CheckCircle className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">{t('values.authenticity.title')}</h3>
                <p className="text-base md:text-lg text-white/80" style={{ lineHeight: 'normal' }}>
                  {t('values.authenticity.text')}
                </p>
              </Card>

              {/* Croissance */}
              <Card className="p-6 text-left rounded-xl" style={{ backgroundColor: '#10454D' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(216, 184, 104, 0.15)', border: '1px solid #D8B868' }}>
                  <TrendingUp className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">{t('values.growth.title')}</h3>
                <p className="text-base md:text-lg text-white/80" style={{ lineHeight: 'normal' }}>
                  {t('values.growth.text')}
                </p>
              </Card>

              {/* Innovation */}
              <Card className="p-6 text-left rounded-xl" style={{ backgroundColor: '#10454D' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(216, 184, 104, 0.15)', border: '1px solid #D8B868' }}>
                  <Lightbulb className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">{t('values.innovation.title')}</h3>
                <p className="text-base md:text-lg text-white/80" style={{ lineHeight: 'normal' }}>
                  {t('values.innovation.text')}
                </p>
              </Card>

              {/* Excellence */}
              <Card className="p-6 text-left rounded-xl" style={{ backgroundColor: '#10454D' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(216, 184, 104, 0.15)', border: '1px solid #D8B868' }}>
                  <Award className="text-arise-gold" size={24} style={{ color: '#D8B868' }} />
                </div>
                <h3 className="text-xl md:text-2xl font-medium text-white mb-3">{t('values.excellence.title')}</h3>
                <p className="text-base md:text-lg text-white/80" style={{ lineHeight: 'normal' }}>
                  {t('values.excellence.text')}
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <div>
            <MotionDiv variant="fade" duration="normal">
              <h2 className="text-3xl md:text-4xl font-medium text-center mb-12" style={{ color: '#D8B868' }}>
                {t('journey.title')}
              </h2>
            </MotionDiv>

            <div className="relative max-w-6xl mx-auto">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}></div>

              <div className="space-y-8">
                {/* 2020 */}
                <div className="flex gap-6 relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#0F4C56' }}>
                      01
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('journey.2020.title')}</h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {t('journey.2020.text')}
                    </p>
                  </div>
                </div>

                {/* 2021 */}
                <div className="flex gap-6 relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#0F4C56' }}>
                      02
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('journey.2021.title')}</h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {t('journey.2021.text')}
                    </p>
                  </div>
                </div>

                {/* 2022 */}
                <div className="flex gap-6 relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#0F4C56' }}>
                      03
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('journey.2022.title')}</h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {t('journey.2022.text')}
                    </p>
                  </div>
                </div>

                {/* 2023 */}
                <div className="flex gap-6 relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#0F4C56' }}>
                      04
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('journey.2023.title')}</h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {t('journey.2023.text')}
                    </p>
                  </div>
                </div>

                {/* 2024 */}
                <div className="flex gap-6 relative">
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: '#0F4C56' }}>
                      05
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">{t('journey.2024.title')}</h3>
                    <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                      {t('journey.2024.text')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <MotionDiv variant="fade" duration="normal">
          <Card className="p-8 md:p-12 text-center rounded-2xl" style={{ backgroundColor: '#D8B868' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              {t('cta.title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-900 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('cta.subtitle')}
            </p>
            <Link 
              href="/register"
              className="font-semibold px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: '#2E2E2E', color: '#FFFFFF' }}
            >
              {t('cta.getStarted')}
            </Link>
          </Card>
        </MotionDiv>
      </main>
      <Footer />
    </div>
  );
}
