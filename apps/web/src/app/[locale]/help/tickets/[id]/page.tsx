/**
 * Ticket Details Page
 * 
 * Page for viewing a specific support ticket.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { TicketDetails } from '@/components/help';
import type { SupportTicket, TicketMessage } from '@/components/help';
import { PageHeader, PageContainer } from '@/components/layout';
import { Loading, Alert } from '@/components/ui';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { logger } from '@/lib/logger';

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations('help.tickets');
  const { isAuthenticated } = useAuthStore();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    loadTicket();
  }, [ticketId, isAuthenticated, router]);

  const loadTicket = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Replace with actual support ticket API endpoint when available
      // const response = await apiClient.get(`/v1/support/tickets/${ticketId}`);
      // setTicket(response.data.ticket);
      // setMessages(response.data.messages);
      
      // Mock data for now
      setTicket({
        id: parseInt(ticketId),
        subject: 'Sample Ticket',
        category: 'technical',
        status: 'open',
        priority: 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setMessages([]);
      setIsLoading(false);
    } catch (error) {
      logger.error('Failed to load ticket', error instanceof Error ? error : new Error(String(error)));
      setError(t('errors.loadFailed') || 'Failed to load ticket. Please try again.');
      setIsLoading(false);
    }
  }, [ticketId, t]);

  const handleReply = useCallback(async (message: string) => {
    try {
      // TODO: Replace with actual API endpoint when available
      // await apiClient.post(`/v1/support/tickets/${ticketId}/messages`, { message });
      logger.info('Sending reply', { ticketId, message });
      // Reload messages
      await loadTicket();
    } catch (error) {
      logger.error('Failed to send reply', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }, [ticketId, loadTicket]);

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

  if (!ticket) {
    return (
      <ProtectedRoute>
        <PageContainer>
          <Alert variant="error">
            {t('errors.notFound') || 'Ticket not found'}
          </Alert>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <PageHeader
          title={ticket.subject}
          breadcrumbs={[
            { label: t('breadcrumbs.home') || 'Home', href: '/' },
            { label: t('breadcrumbs.help') || 'Help', href: '/help' },
            { label: t('breadcrumbs.tickets') || 'Tickets', href: '/help/tickets' },
            { label: `#${ticket.id}` },
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
          <TicketDetails
            ticket={ticket}
            messages={messages}
            onReply={handleReply}
          />
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

