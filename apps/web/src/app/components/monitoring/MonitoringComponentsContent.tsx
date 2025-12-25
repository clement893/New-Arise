/**
 * Monitoring Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import AlertsPanel from '@/components/monitoring/AlertsPanel';
import ErrorTrackingDashboard from '@/components/monitoring/ErrorTrackingDashboard';
import HealthStatus from '@/components/monitoring/HealthStatus';
import LogsViewer from '@/components/monitoring/LogsViewer';
import MetricsChart from '@/components/monitoring/MetricsChart';
import PerformanceDashboard from '@/components/monitoring/PerformanceDashboard';
import PerformanceProfiler from '@/components/monitoring/PerformanceProfiler';
import SystemMetrics from '@/components/monitoring/SystemMetrics';

export default function MonitoringComponentsContent() {

  return (
    <PageContainer>
      <PageHeader
        title="Composants de Monitoring"
        description="Composants pour le monitoring système, la surveillance des erreurs et les métriques de performance"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Monitoring' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Performance Dashboard">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            PerformanceDashboard displays Web Vitals metrics and performance data. It automatically refreshes and loads metrics.
          </p>
          <PerformanceDashboard />
        </Section>

        <Section title="System Metrics">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            SystemMetrics displays CPU, memory, disk, and network metrics. It automatically collects and updates metrics every 5 seconds.
          </p>
          <SystemMetrics />
        </Section>

        <Section title="Health Status">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            HealthStatus displays the health status of application services. It automatically checks health when visible.
          </p>
          <HealthStatus />
        </Section>

        <Section title="Alerts Panel">
          <AlertsPanel />
        </Section>

        <Section title="Error Tracking Dashboard">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            ErrorTrackingDashboard displays error statistics and recent errors. It automatically fetches error data from Sentry/localStorage.
          </p>
          <ErrorTrackingDashboard />
        </Section>

        <Section title="Metrics Chart">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            MetricsChart displays performance metrics as a chart. Specify the metric name to display.
          </p>
          <MetricsChart
            metricName="api-requests"
            title="API Requests per Minute"
            height={200}
          />
        </Section>

        <Section title="Logs Viewer">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            LogsViewer displays centralized logs with filtering capabilities. It automatically updates every 2 seconds.
          </p>
          <LogsViewer />
        </Section>

        <Section title="Performance Profiler">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            PerformanceProfiler allows you to profile custom operations and view performance metrics.
          </p>
          <PerformanceProfiler />
        </Section>
      </div>
    </PageContainer>
  );
}

