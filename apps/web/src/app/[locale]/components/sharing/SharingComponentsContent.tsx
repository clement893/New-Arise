/**
 * Sharing Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import { ShareDialog, ShareList } from '@/components/sharing';
import { useState } from 'react';
import { Button } from '@/components/ui';

export default function SharingComponentsContent() {
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <PageContainer>
      <PageHeader
        title="Composants Partage"
        description="Composants pour partager du contenu avec utilisateurs et équipes"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Partage' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Share Dialog">
          <div className="max-w-2xl">
            <Button onClick={() => setShowShareDialog(true)}>
              Open Share Dialog
            </Button>
            {showShareDialog && (
              <ShareDialog
                entityType="document"
                entityId={1}
                onClose={() => setShowShareDialog(false)}
                onShare={() => {
                  console.log('Shared');
                  setShowShareDialog(false);
                }}
              />
            )}
          </div>
        </Section>

        <Section title="Share List">
          <div className="max-w-4xl">
            <ShareList
              entityType="document"
              entityId={1}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

