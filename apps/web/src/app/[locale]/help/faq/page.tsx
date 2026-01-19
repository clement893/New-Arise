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
            title="Frequently Asked Questions"
            description="Find answers to the most frequently asked questions about the ARISE Holistic Leadership platform."
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


