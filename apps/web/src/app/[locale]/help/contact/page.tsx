/**
 * Contact Support Page
 * 
 * Page for contacting support team.
 */

'use client';

import { useTranslations } from 'next-intl';
import { ContactSupport } from '@/components/help';
import { PageHeader, PageContainer } from '@/components/layout';
import { logger } from '@/lib/logger';

export default function ContactSupportPage() {
  const t = useTranslations('help.contact');

  const handleSubmit = async (data: { subject: string; message: string; category: string; priority: string }) => {
    // TODO: Replace with actual support API endpoint when available
    logger.info('Submitting support request', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('title') || 'Contact Support'}
        description={t('description') || 'Get in touch with our support team'}
        breadcrumbs={[
          { label: t('breadcrumbs.home') || 'Home', href: '/' },
          { label: t('breadcrumbs.help') || 'Help', href: '/help' },
          { label: t('breadcrumbs.contact') || 'Contact' },
        ]}
      />

      <div className="mt-8">
        <ContactSupport onSubmit={handleSubmit} />
      </div>
    </PageContainer>
  );
}

