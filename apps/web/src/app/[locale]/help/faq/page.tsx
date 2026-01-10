/**
 * FAQ Page
 * 
 * Page displaying frequently asked questions.
 */

'use client';

import { FAQ } from '@/components/help';
import { PageHeader, PageContainer } from '@/components/layout';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function FAQPage() {

  return (
    <>
      <Header />
      <div className="pt-16 min-h-screen bg-white">
        <PageContainer>
          <PageHeader
            title="Questions Fréquemment Posées"
            description="Trouvez des réponses aux questions les plus courantes sur la plateforme ARISE"
            titleClassName="text-gray-900"
            descriptionClassName="text-gray-600"
          />

          <div className="mt-8">
            <FAQ />
          </div>
        </PageContainer>
      </div>
      <Footer />
    </>
  );
}


