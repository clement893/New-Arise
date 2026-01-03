'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export function FinalCTASection() {
  const t = useTranslations('landing.finalCTA');

  return (
    <section className="py-20 bg-arise-beige">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-arise-deep-teal mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              variant="outline"
              size="lg"
              className="border-2 border-arise-deep-teal text-arise-deep-teal hover:bg-arise-deep-teal hover:text-white font-semibold px-8"
            >
              <Link href="/about">{t('discoverMore')}</Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              className="bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white font-semibold px-8"
            >
              <Link href="/register">{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
