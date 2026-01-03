'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-arise-deep-teal overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      {/* Vertical lines texture */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.08) 3px,
            rgba(255, 255, 255, 0.08) 4px
          )`
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-arise-gold text-sm uppercase tracking-widest mb-4">
            {t('platform')}
          </p>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
          {t('title')} <span className="text-arise-gold">{t('titleHighlight')}</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        
        <Button 
          asChild 
          size="lg"
          className="bg-arise-gold hover:bg-arise-gold/90 text-arise-deep-teal font-semibold px-8 py-6 text-lg"
        >
          <Link href="/register">{t('getStarted')}</Link>
        </Button>
      </div>
    </section>
  );
}
