/**
 * Media Library Page
 * 
 * Page for managing media files with upload and organization.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { MediaLibrary } from '@/components/content';
import type { MediaItem } from '@/components/content';
import { PageHeader, PageContainer } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';

export default function MediaLibraryPage() {
  const router = useRouter();
  const t = useTranslations('content.media');
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    loadMedia();
  }, [isAuthenticated, router]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: Load media from API when backend endpoints are ready
      // For now, use empty array
      setMedia([]);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load media', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load media. Please try again.');
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      // TODO: Upload files via API
      logger.info('Uploading files', { count: files.length });
      await loadMedia();
    } catch (error) {
      logger.error('Failed to upload files', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // TODO: Delete media via API
      logger.info('Deleting media', { id });
      await loadMedia();
    } catch (error) {
      logger.error('Failed to delete media', error instanceof Error ? error : new Error(String(error)));
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
          title={t('title') || 'Media Library'}
          description={t('description') || 'Upload and manage your media files'}
          breadcrumbs={[
            { label: t('breadcrumbs.dashboard') || 'Dashboard', href: '/dashboard' },
            { label: t('breadcrumbs.content') || 'Content', href: '/content' },
            { label: t('breadcrumbs.media') || 'Media' },
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
          <MediaLibrary
            media={media}
            onUpload={handleUpload}
            onDelete={handleDelete}
          />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}


