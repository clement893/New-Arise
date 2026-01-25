/**
 * Email API Client
 * 
 * Client for sending transactional emails via SendGrid backend API.
 * Provides methods for all email types including welcome, invoices, subscriptions, etc.
 * 
 * All methods return promises and handle errors appropriately.
 * 
 * @example
 * ```typescript
 * import { emailAPI } from '@/lib/email/client';
 * 
 * // Send welcome email
 * await emailAPI.sendWelcome('user@example.com');
 * 
 * // Send invoice
 * await emailAPI.sendInvoice({
 *   to_email: 'user@example.com',
 *   name: 'John Doe',
 *   invoice_number: 'INV-001',
 *   invoice_date: '2025-01-27',
 *   amount: 99.99,
 *   currency: 'USD'
 * });
 * ```
 */

import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@modele/types';

export interface SendEmailRequest {
  to_email: string;
  subject: string;
  html_content: string;
  text_content?: string;
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  locale?: string;
}

export interface EmailResponse {
  status: string;
  status_code?: number;
  message_id?: string;
  to: string;
  task_id?: string;
}

export interface EmailHealthResponse {
  configured: boolean;
  from_email?: string;
  from_name?: string;
  status: string;
}

export interface InvoiceEmailRequest {
  to_email: string;
  name: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  currency?: string;
  invoice_url?: string;
  items?: Array<{ description: string; amount: number }>;
  locale?: string;
}

export interface SubscriptionEmailRequest {
  to_email: string;
  name: string;
  plan_name: string;
  amount: number;
  currency?: string;
  locale?: string;
}

export interface SubscriptionCancelledEmailRequest {
  to_email: string;
  name: string;
  plan_name: string;
  end_date: string;
  locale?: string;
}

export interface TrialEndingEmailRequest {
  to_email: string;
  name: string;
  days_remaining: number;
  upgrade_url?: string;
  locale?: string;
}

/**
 * Get locale from HTML lang attribute
 */
function getLocaleFromHTML(): string {
  if (typeof document !== 'undefined') {
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang === 'en' || htmlLang === 'fr') {
      return htmlLang;
    }
  }
  return 'fr'; // Default to French
}

export const emailAPI = {
  /**
   * Send a custom email
   */
  send: async (data: SendEmailRequest): Promise<ApiResponse<EmailResponse>> => {
    const payload = { ...data, locale: data.locale || getLocaleFromHTML() };
    return apiClient.post<EmailResponse>('/email/send', payload);
  },

  /**
   * Send a test email
   */
  sendTest: async (toEmail: string): Promise<ApiResponse<EmailResponse>> => {
    return apiClient.post<EmailResponse>('/email/test', { 
      to_email: toEmail,
      locale: getLocaleFromHTML()
    });
  },

  /**
   * Send welcome email
   */
  sendWelcome: async (toEmail: string, name?: string): Promise<ApiResponse<EmailResponse>> => {
    const payload: { to_email: string; name?: string; locale: string } = { 
      to_email: toEmail,
      locale: getLocaleFromHTML()
    };
    if (name) {
      payload.name = name;
    }
    return apiClient.post<EmailResponse>('/email/welcome', payload);
  },

  /**
   * Send invoice email
   */
  sendInvoice: async (data: InvoiceEmailRequest): Promise<ApiResponse<EmailResponse>> => {
    const payload = { ...data, locale: data.locale || getLocaleFromHTML() };
    return apiClient.post<EmailResponse>('/email/invoice', payload);
  },

  /**
   * Send subscription created email
   */
  sendSubscriptionCreated: async (data: SubscriptionEmailRequest): Promise<ApiResponse<EmailResponse>> => {
    const payload = { ...data, locale: data.locale || getLocaleFromHTML() };
    return apiClient.post<EmailResponse>('/email/subscription/created', payload);
  },

  /**
   * Send subscription cancelled email
   */
  sendSubscriptionCancelled: async (data: SubscriptionCancelledEmailRequest): Promise<ApiResponse<EmailResponse>> => {
    const payload = { ...data, locale: data.locale || getLocaleFromHTML() };
    return apiClient.post<EmailResponse>('/email/subscription/cancelled', payload);
  },

  /**
   * Send trial ending email
   */
  sendTrialEnding: async (data: TrialEndingEmailRequest): Promise<ApiResponse<EmailResponse>> => {
    const payload = { ...data, locale: data.locale || getLocaleFromHTML() };
    return apiClient.post<EmailResponse>('/email/trial/ending', payload);
  },

  /**
   * Check email service health
   */
  health: async (): Promise<ApiResponse<EmailHealthResponse>> => {
    return apiClient.get<EmailHealthResponse>('/email/health');
  },

  /**
   * Get email API info
   */
  info: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    return apiClient.get<Record<string, unknown>>('/email/info');
  },
};

