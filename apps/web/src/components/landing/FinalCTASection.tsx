'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export function FinalCTASection() {
  const t = useTranslations('landing.finalCTA');

  return (
    <section className="py-20 bg-white relative">
      <div className="absolute inset-0 bg-[#D8B868] opacity-20"></div>
      <div className="container mx-auto px-[11px] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-[#D8B868] -z-10 transform translate-x-2 translate-y-2"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-arise-deep-teal mb-6 relative z-10">
              {t('title')}
            </h2>
          </div>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border border-[#0A3A40] text-arise-deep-teal hover:bg-arise-deep-teal hover:text-white font-semibold px-8 py-3"
            >
              <Link href="/about">{t('discoverMore')}</Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              className="border border-[#0A3A40] bg-transparent hover:bg-arise-deep-teal/90 text-arise-deep-teal hover:text-white font-semibold px-8 py-3"
            >
              <Link href="/register">{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
