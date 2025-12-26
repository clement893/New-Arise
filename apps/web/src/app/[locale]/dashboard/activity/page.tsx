/**
 * Dashboard Activity Feed Page
 * 
 * Dashboard activity feed showing recent activities across the platform.
 * Uses existing ActivityTimeline component.
 * Accessible via dashboard navigation.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { ActivityTimeline } from '@/components/activity';
import { PageHeader, PageContainer, Section } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';
import { apiClient } from '@/lib/api';

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export default function DashboardActivityPage() {
  const router = useRouter();
  const t = useTranslations('dashboard.activity');
  const { isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    loadActivities();
  }, [isAuthenticated, router]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load dashboard activities (all activities, not just user's)
      const response = await apiClient.get<ActivityItem[]>('/v1/activities/timeline', {
        params: {
          limit: 100,
        },
      });
      
      if (response.data) {
        // Transform API response to match ActivityItem format
        const transformedActivities: ActivityItem[] = response.data.map((activity: any) => ({
          id: String(activity.id),
          action: activity.action || activity.event_type || 'unknown',
          entity_type: activity.entity_type || 'system',
          entity_id: String(activity.entity_id || activity.id),
          user_id: String(activity.user_id || ''),
          user_name: activity.user_name,
          user_email: activity.user_email,
          timestamp: activity.timestamp,
          metadata: activity.event_metadata || activity.metadata,
        }));
        
        setActivities(transformedActivities);
      }
    } catch (error: any) {
      logger.error('Failed to load dashboard activities', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load activity feed. Please try again.');
    } finally {
      setIsLoading(false);
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
          title={t('title') || 'Activity Feed'}
          description={t('description') || 'View recent activities across the platform'}
          breadcrumbs={[
            { label: t('breadcrumbs.dashboard') || 'Dashboard', href: '/dashboard' },
            { label: t('breadcrumbs.activity') || 'Activity' },
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
          <Section title={t('section.title') || 'Recent Activity'} className="mt-6">
            {activities.length > 0 ? (
              <ActivityTimeline
                activities={activities}
                showUserInfo={true}
                groupByDate={true}
              />
            ) : (
              <div className="text-center py-12 text-gray-600 dark:text-gray-400">
                <p>{t('empty') || 'No activity found'}</p>
              </div>
            )}
          </Section>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

