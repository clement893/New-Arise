/**
 * Help Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import {
  HelpCenter,
  FAQ,
  ContactSupport,
  SupportTickets,
  UserGuides,
  VideoTutorials,
} from '@/components/help';

export default function HelpComponentsContent() {
  const sampleFAQItems = [
    {
      id: '1',
      question: 'How do I get started?',
      answer: 'You can get started by creating an account and following our onboarding guide.',
    },
    {
      id: '2',
      question: 'How do I contact support?',
      answer: 'You can contact support through the contact form or by opening a support ticket.',
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Centre d'Aide"
        description="Composants pour le centre d'aide et le support client"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Aide' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Help Center">
          <HelpCenter />
        </Section>

        <Section title="FAQ">
          <div className="max-w-4xl">
            <FAQ faqs={sampleFAQItems} />
          </div>
        </Section>

        <Section title="Contact Support">
          <div className="max-w-2xl">
            <ContactSupport
              onSubmit={async (data) => {
                console.log('Support request:', data);
              }}
            />
          </div>
        </Section>

        <Section title="Support Tickets">
          <div className="max-w-4xl">
            <SupportTickets
              onCreateTicket={() => {
                console.log('Create ticket clicked');
              }}
            />
          </div>
        </Section>

        <Section title="User Guides">
          <div className="max-w-4xl">
            <UserGuides />
          </div>
        </Section>

        <Section title="Video Tutorials">
          <div className="max-w-4xl">
            <VideoTutorials />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

