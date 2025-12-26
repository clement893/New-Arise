/**
 * Feature Flags Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import { FeatureFlagManager } from '@/components/feature-flags';

export default function FeatureFlagsComponentsContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Feature Flags"
        description="Manage feature flags for gradual rollouts and A/B testing"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Components', href: '/components' },
          { label: 'Feature Flags' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Feature Flag Manager">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage feature flags with rollout percentages, targeting, and A/B testing support.
          </p>
          <FeatureFlagManager />
        </Section>
      </div>
    </PageContainer>
  );
}

