/**
 * Client Dashboard Component
 * 
 * Main dashboard for client portal showing statistics and overview.
 * 
 * @module ClientDashboard
 */

'use client';

import { ClientDashboardStats } from '@/lib/api/client-portal';
import { Card, StatsCard } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

/**
 * Client Dashboard Component
 * 
 * Displays client portal dashboard with:
 * - Order statistics
 * - Invoice statistics
 * - Project statistics
 * - Support ticket statistics
 * - Financial overview
 * 
 * @example
 * ```tsx
 * <ClientDashboard />
 * ```
 */
export function ClientDashboard() {
  const { data: stats, isLoading, error } = useApi<ClientDashboardStats>({
    url: '/v1/client/dashboard/stats',
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card title="Error">
        <p className="text-red-600 dark:text-red-400">
          Failed to load dashboard statistics. Please try again later.
        </p>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={stats.total_orders.toString()}
          className="bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800"
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pending_orders.toString()}
          className="bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800"
        />
        <StatsCard
          title="Completed Orders"
          value={stats.completed_orders.toString()}
          className="bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800"
        />
        <StatsCard
          title="Open Tickets"
          value={stats.open_tickets.toString()}
          className="bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Financial Overview">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${parseFloat(stats.total_spent).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                ${parseFloat(stats.pending_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card title="Projects & Invoices">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.active_projects} / {stats.total_projects}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Paid Invoices</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.paid_invoices} / {stats.total_invoices}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

