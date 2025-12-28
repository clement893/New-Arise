/**
 * Notification Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import {
  NotificationCenter,
  NotificationBell,
  NotificationSettings,
} from '@/components/notifications';
import { logger } from '@/lib/logger';
import { useState } from 'react';
import type { NotificationUI } from '@/types/notification';

export default function NotificationComponentsContent() {
  const now = new Date().toISOString();
  const [notifications, setNotifications] = useState<NotificationUI[]>([
    {
      id: 1,
      user_id: 1,
      title: 'New Project Created',
      message: 'John Doe created a new project "Website Redesign"',
      notification_type: 'success',
      created_at: now,
      updated_at: now,
      read: false,
      action_url: '/projects/123',
      action_label: 'View Project',
      sender: {
        name: 'John Doe',
      },
    },
    {
      id: 2,
      user_id: 1,
      title: 'Payment Received',
      message: 'Payment of $99.00 has been received',
      notification_type: 'success',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/billing',
      action_label: 'View Invoice',
    },
    {
      id: 3,
      user_id: 1,
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM',
      notification_type: 'warning',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
    },
    {
      id: 4,
      user_id: 1,
      title: 'Failed Login Attempt',
      message: 'Multiple failed login attempts detected from IP 192.168.1.100',
      notification_type: 'error',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      action_url: '/security',
      action_label: 'Review Security',
    },
    {
      id: 5,
      user_id: 1,
      title: 'Team Invitation',
      message: 'You have been invited to join the "Design Team"',
      notification_type: 'info',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      action_url: '/teams',
      action_label: 'View Invitation',
    },
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Composants de Notifications"
        description="Composants pour la gestion et l'affichage des notifications"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Notifications' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Notification Bell">
          <div className="flex justify-center">
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={async (id) => {
                logger.info('Mark as read:', { id });
                setNotifications((prev) =>
                  prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
                await new Promise((resolve) => setTimeout(resolve, 500));
              }}
              onMarkAllAsRead={async () => {
                logger.info('Mark all as read');
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                await new Promise((resolve) => setTimeout(resolve, 500));
              }}
              onDelete={async (id) => {
                logger.info('Delete notification:', { id });
                setNotifications((prev) => prev.filter((n) => n.id !== id));
                await new Promise((resolve) => setTimeout(resolve, 500));
              }}
              onActionClick={(notification) => {
                logger.info('Action clicked:', { notificationId: notification.id });
              }}
              onViewAll={() => {
                logger.info('View all notifications');
              }}
            />
          </div>
        </Section>

        <Section title="Notification Center">
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={async (id) => {
              logger.info('Mark as read:', { id });
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
              );
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
            onMarkAllAsRead={async () => {
              logger.info('Mark all as read');
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
            onDelete={async (id) => {
              logger.info('Delete notification:', { id });
              setNotifications((prev) => prev.filter((n) => n.id !== id));
              await new Promise((resolve) => setTimeout(resolve, 500));
            }}
            onActionClick={(notification) => {
              logger.info('Action clicked:', { notificationId: notification.id });
            }}
          />
        </Section>

        <Section title="Notification Settings">
          <div className="max-w-4xl">
            <NotificationSettings
              settings={{
                email: {
                  enabled: true,
                  frequency: 'instant',
                  types: {
                    marketing: false,
                    product: true,
                    security: true,
                    billing: true,
                    system: true,
                  },
                },
                push: {
                  enabled: false,
                  types: {
                    marketing: false,
                    product: true,
                    security: true,
                    billing: false,
                    system: false,
                  },
                },
                inApp: {
                  enabled: true,
                  types: {
                    marketing: false,
                    product: true,
                    security: true,
                    billing: true,
                    system: true,
                  },
                },
              }}
              onSave={async (data) => {
                logger.info('Notification settings saved:', { data });
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

