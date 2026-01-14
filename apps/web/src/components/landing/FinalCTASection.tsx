'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui';

export function FinalCTASection() {
  const t = useTranslations('landing.finalCTA');

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-[11px] relative z-10">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 text-center rounded-2xl" style={{ backgroundColor: '#D8B868' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              {t('title')}
            </h2>
            <p className="text-lg md:text-xl text-gray-900 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            <Link 
              href="/register"
              className="font-semibold px-8 py-4 text-lg rounded-xl inline-flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: '#2E2E2E', color: '#FFFFFF' }}
            >
              {t('getStarted')}
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
