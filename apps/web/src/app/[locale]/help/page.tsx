/**
 * Help Center Page
 * 
 * Main hub for help and support resources.
 */

'use client';

import { useTranslations } from 'next-intl';
import { HelpCenter } from '@/components/help';
import { PageHeader, PageContainer } from '@/components/layout';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function HelpPage() {
  const t = useTranslations('help');

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-white">
        <PageContainer>
          <PageHeader
            title={t('title')}
            description={t('description')}
            titleClassName="text-gray-900"
            descriptionClassName="text-gray-600"
          />

          <div className="mt-8">
            <HelpCenter />
          </div>
        </PageContainer>
      </div>
      <Footer />
    </>
  );
}


