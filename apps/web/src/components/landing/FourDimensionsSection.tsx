'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export function FourDimensionsSection() {
  const t = useTranslations('landing.fourDimensions');

  const dimensions = [
    {
      number: '01',
      title: t('dimensions.mbti.title'),
      subtitle: t('dimensions.mbti.subtitle'),
      description: t('dimensions.mbti.description')
    },
    {
      number: '02',
      title: t('dimensions.tki.title'),
      subtitle: t('dimensions.tki.subtitle'),
      description: t('dimensions.tki.description')
    },
    {
      number: '03',
      title: t('dimensions.360.title'),
      subtitle: t('dimensions.360.subtitle'),
      description: t('dimensions.360.description')
    },
    {
      number: '04',
      title: t('dimensions.wellness.title'),
      subtitle: t('dimensions.wellness.subtitle'),
      description: t('dimensions.wellness.description')
    }
  ];

  return (
    <section className="py-20 bg-arise-deep-teal relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0F0F] via-[#0F4C56] to-transparent opacity-50" style={{ background: 'linear-gradient(to top right, #0F0F0F 0%, #0F4C56 50%, transparent 100%)' }}></div>
      <div className="container mx-auto px-[11px] relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-arise-gold text-sm uppercase tracking-widest mb-4">
            {t('methodology')}
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('title')}
          </h2>
          <h3 className="text-3xl md:text-4xl font-light text-white/90">
            {t('subtitle')}
          </h3>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {dimensions.map((dimension) => (
            <div 
              key={dimension.number}
              className="flex items-start p-6 border-2 border-arise-gold rounded-lg bg-arise-deep-teal/50 backdrop-blur-sm hover:bg-arise-deep-teal/70 transition-all duration-300"
            >
              <div className="flex-shrink-0 mr-6">
                <span className="text-5xl font-bold text-arise-gold">
                  {dimension.number}
                </span>
              </div>
              <div className="flex-grow text-left">
                <h4 className="text-2xl font-bold text-white mb-1">
                  {dimension.title}
                </h4>
                <p className="text-arise-gold text-sm font-medium mb-2">
                  {dimension.subtitle}
                </p>
                <p className="text-white/80 text-base">
                  {dimension.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-xl text-white/90">
            {t('integration')} <span className="text-arise-gold font-semibold">{t('integrationHighlight')}</span> {t('integrationText')}{' '}
            <span className="text-arise-gold font-semibold">{t('profileHighlight')}</span>.
          </p>
          <p className="text-lg text-white/70 mt-4">
            {t('insights')}
          </p>
          
          <div className="mt-8">
            <Button 
              asChild 
              size="lg"
              className="bg-white hover:bg-white/90 text-arise-deep-teal font-semibold px-8 py-6 text-lg inline-flex items-center gap-2"
            >
              <Link href="/register">
                {t('startNow')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
