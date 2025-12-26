/**
 * Ticket Details Component
 * 
 * Displays details and conversation for a support ticket.
 * 
 * @component
 */

'use client';

import { useState } from 'react';
import { Card, Button, Textarea, Badge, Avatar } from '@/components/ui';
import type { SupportTicket } from './SupportTickets';
import { Send, Clock } from 'lucide-react';

export interface TicketMessage {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  message: string;
  created_at: string;
  is_staff?: boolean;
}

export interface TicketDetailsProps {
  ticket: SupportTicket;
  messages?: TicketMessage[];
  onReply?: (message: string) => Promise<void>;
  className?: string;
}

/**
 * Ticket Details Component
 * 
 * Displays ticket details and conversation thread.
 */
export default function TicketDetails({
  ticket,
  messages = [],
  onReply,
  className,
}: TicketDetailsProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyMessage.trim() || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(replyMessage);
      setReplyMessage('');
    } catch (error) {
      console.error('Failed to send reply', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<SupportTicket['status'], 'default' | 'success' | 'warning' | 'error'> = {
    open: 'default',
    in_progress: 'warning',
    resolved: 'success',
    closed: 'default',
  };

  const priorityColors: Record<SupportTicket['priority'], 'default' | 'warning' | 'error'> = {
    low: 'default',
    medium: 'default',
    high: 'warning',
    urgent: 'error',
  };

  return (
    <div className={className}>
      {/* Ticket Header */}
      <Card className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {ticket.subject}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={statusColors[ticket.status]}>
                {ticket.status.replace('_', ' ')}
              </Badge>
              <Badge variant={priorityColors[ticket.priority]}>
                {ticket.priority}
              </Badge>
              <Badge variant="default">{ticket.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Created {new Date(ticket.created_at).toLocaleString()}</span>
              </div>
              {ticket.updated_at && (
                <div className="flex items-center gap-1">
                  <span>Updated {new Date(ticket.updated_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Messages Thread */}
      <Card title="Conversation" className="mb-6">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 p-4 rounded-lg ${
                  message.is_staff
                    ? 'bg-primary-50 dark:bg-primary-900/20'
                    : 'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <Avatar
                  name={message.user_name}
                  size="md"
                  className="flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {message.user_name}
                    </span>
                    {message.is_staff && (
                      <Badge variant="default">Staff</Badge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Reply Form */}
      {ticket.status !== 'closed' && (
        <Card title="Reply">
          <div className="space-y-4">
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={6}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                variant="primary"
                disabled={!replyMessage.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

