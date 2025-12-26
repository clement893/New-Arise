/**
 * Scheduled Content Page
 * 
 * Page for managing scheduled content (posts, pages, etc.).
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { ScheduledContentManager } from '@/components/content';
import type { ScheduledContent } from '@/components/content';
import { PageHeader, PageContainer } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/api';

export default function ScheduledContentPage() {
  const router = useRouter();
  const t = useTranslations('content.schedule');
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    loadScheduledContent();
  }, [isAuthenticated, router]);

  const loadScheduledContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/v1/scheduled-tasks');
      const backendTasks = response.data;
      
      interface BackendScheduledTask {
        id: number | string;
        name: string;
        description?: string;
        task_type: string;
        scheduled_at: string;
        recurrence?: string;
        status: string;
        started_at?: string;
        completed_at?: string;
        error_message?: string;
      }
      
      const mappedContent: ScheduledContent[] = (backendTasks as BackendScheduledTask[]).map((task) => ({
        id: task.id,
        name: task.name,
        description: task.description,
        task_type: task.task_type,
        scheduled_at: task.scheduled_at,
        status: task.status,
        recurrence: task.recurrence,
        content_id: task.task_data?.content_id,
        content_type: task.task_data?.content_type,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));
      
      setScheduledContent(mappedContent);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load scheduled content', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load scheduled content. Please try again.');
      setIsLoading(false);
    }
  };

  const handleScheduleCreate = async (scheduleData: Omit<ScheduledContent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await apiClient.post('/v1/scheduled-tasks', {
        name: scheduleData.name,
        description: scheduleData.description,
        task_type: scheduleData.task_type,
        scheduled_at: scheduleData.scheduled_at,
        recurrence: scheduleData.recurrence,
        task_data: scheduleData.content_id ? {
          content_id: scheduleData.content_id,
          content_type: scheduleData.content_type,
        } : undefined,
      });
      await loadScheduledContent();
    } catch (error) {
      logger.error('Failed to create schedule', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const handleScheduleUpdate = async (id: number, scheduleData: Partial<ScheduledContent>) => {
    try {
      await apiClient.put(`/v1/scheduled-tasks/${id}`, scheduleData);
      await loadScheduledContent();
    } catch (error) {
      logger.error('Failed to update schedule', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const handleScheduleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/v1/scheduled-tasks/${id}`);
      await loadScheduledContent();
    } catch (error) {
      logger.error('Failed to delete schedule', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  const handleScheduleToggle = async (_id: number) => {
    try {
      // TODO: Implement toggle endpoint if available
      await loadScheduledContent();
    } catch (error) {
      logger.error('Failed to toggle schedule', error instanceof Error ? error : new Error(String(error)));
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
          title={t('title') || 'Scheduled Content'}
          description={t('description') || 'Manage scheduled posts, pages, and other content'}
          breadcrumbs={[
            { label: t('breadcrumbs.dashboard') || 'Dashboard', href: '/dashboard' },
            { label: t('breadcrumbs.content') || 'Content', href: '/content' },
            { label: t('breadcrumbs.schedule') || 'Schedule' },
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
          <ScheduledContentManager
            scheduledContent={scheduledContent}
            onScheduleCreate={handleScheduleCreate}
            onScheduleUpdate={handleScheduleUpdate}
            onScheduleDelete={handleScheduleDelete}
            onScheduleToggle={handleScheduleToggle}
          />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

