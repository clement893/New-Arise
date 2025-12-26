/**
 * SEO Management Page
 * 
 * Page for managing SEO settings.
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { SEOManager } from '@/components/cms';
import type { SEOSettings } from '@/components/cms';
import { PageHeader, PageContainer } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';

export default function SEOPage() {
  const t = useTranslations('seo');
  const [settings, setSettings] = useState<SEOSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual SEO API endpoint when available
      // const response = await apiClient.get('/v1/seo/settings');
      // setSettings(response.data);
      
      setSettings({});
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load SEO settings', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load SEO settings. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedSettings: SEOSettings) => {
    try {
      // TODO: Replace with actual SEO API endpoint when available
      // await apiClient.put('/v1/seo/settings', updatedSettings);
      logger.info('Saving SEO settings', { settings: updatedSettings });
      setSettings(updatedSettings);
    } catch (error) {
      logger.error('Failed to save SEO settings', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loading />
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader
          title={t('title') || 'SEO Management'}
          description={t('description') || 'Manage SEO meta tags and settings'}
          breadcrumbs={[
            { label: t('breadcrumbs.home') || 'Home', href: '/' },
            { label: t('breadcrumbs.seo') || 'SEO' },
          ]}
        />

        {error && (
          <div className="mt-6">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        <div className="mt-8">
          <SEOManager initialSettings={settings} onSave={handleSave} />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

