/**
 * Analytics Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import dynamic from 'next/dynamic';
import { logger } from '@/lib/logger';
import { useState } from 'react';

// Dynamically import heavy analytics components for code splitting
const AnalyticsDashboard = dynamic(
  () => import('@/components/analytics/AnalyticsDashboard'),
  {
    loading: () => <div className="h-64 flex items-center justify-center">Loading dashboard...</div>,
    ssr: false, // Analytics dashboard doesn't need SSR
  }
);

const ReportBuilder = dynamic(
  () => import('@/components/analytics/ReportBuilder'),
  {
    loading: () => <div className="h-64 flex items-center justify-center">Loading report builder...</div>,
    ssr: false,
  }
);

const ReportViewer = dynamic(
  () => import('@/components/analytics/ReportViewer'),
  {
    loading: () => <div className="h-64 flex items-center justify-center">Loading report viewer...</div>,
    ssr: false,
  }
);

const DataExport = dynamic(
  () => import('@/components/analytics/DataExport'),
  {
    loading: () => <div className="h-32 flex items-center justify-center">Loading export...</div>,
    ssr: false,
  }
);

export default function AnalyticsComponentsContent() {
  const [savedReport, setSavedReport] = useState<{
    id: string;
    name: string;
    description?: string;
    dateRange: { start: string; end: string };
    format: 'table' | 'chart' | 'both';
    data: {
      table?: Array<Record<string, unknown>>;
      chart?: Array<{ label: string; value: number }>;
      chartType?: 'line' | 'bar' | 'pie' | 'area';
    };
    generatedAt: string;
  } | null>(null);

  return (
    <PageContainer>
      <PageHeader
        title="Composants d'Analytique"
        description="Composants pour l'analyse de données, génération de rapports et export"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Analytique' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Analytics Dashboard">
          <AnalyticsDashboard
            onDateRangeChange={(range) => {
              logger.info('Date range changed:', { range });
            }}
            onExport={() => {
              logger.info('Export analytics');
            }}
          />
        </Section>

        <Section title="Report Builder">
          <div className="max-w-4xl">
            <ReportBuilder
              onSave={async (config) => {
                logger.info('Report saved:', { config });
                // Simulate report generation
                const report = {
                  id: String(Date.now()),
                  name: config.name,
                  description: config.description,
                  dateRange: config.dateRange,
                  format: config.format,
                  data: {
                    table: [
                      { date: '2024-01-01', revenue: 12500, users: 1200 },
                      { date: '2024-01-02', revenue: 13200, users: 1250 },
                      { date: '2024-01-03', revenue: 14800, users: 1300 },
                    ],
                    chart: [
                      { label: 'Jan', value: 12500 },
                      { label: 'Feb', value: 15200 },
                      { label: 'Mar', value: 18900 },
                    ],
                    chartType: 'line' as const,
                  },
                  generatedAt: new Date().toISOString(),
                };
                setSavedReport(report);
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
              onPreview={(config) => {
                logger.info('Preview report:', { config });
              }}
            />
          </div>
        </Section>

        {savedReport && (
          <Section title="Report Viewer">
            <ReportViewer
              report={savedReport}
              onRefresh={async () => {
                logger.info('Refreshing report');
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
              onExport={async (format) => {
                logger.info('Exporting report:', { format });
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
              onShare={() => {
                logger.info('Sharing report');
              }}
            />
          </Section>
        )}

        <Section title="Data Export">
          <div className="max-w-2xl">
            <DataExport
              onExport={async (config) => {
                logger.info('Exporting data:', { config });
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

