'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader, PageContainer, Section } from '@/components/layout';
import { Card, Button, Badge, LoadingSkeleton, ServiceTestCard } from '@/components/ui';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';

export default function AdminContent() {
  const t = useTranslations('admin.main');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader 
          title={t('title')} 
          description={t('description')}
          breadcrumbs={[
            { label: t('breadcrumbs.home'), href: '/' },
            { label: t('breadcrumbs.admin') }
          ]} 
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title={t('title')} 
        description={t('description')}
        breadcrumbs={[
          { label: t('breadcrumbs.home'), href: '/' },
          { label: t('breadcrumbs.admin') }
        ]} 
      />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card title={t('cards.invitations.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.invitations.description')}
          </p>
          <Link href="/admin/invitations">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.invitations.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.users.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.users.description')}
          </p>
          <Link href="/admin/users">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.users.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.organizations.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.organizations.description')}
          </p>
          <Link href="/admin/organizations">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.organizations.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.themes.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.themes.description')}
          </p>
          <Link href="/admin/themes">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.themes.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.plans.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.plans.description')}
          </p>
          <Link href="/admin/plans">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.plans.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.settings.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.settings.description')}
          </p>
          <Link href="/admin/settings">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.settings.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.logs.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.logs.description')}
          </p>
          <Link href="/admin-logs/testing">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.logs.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.statistics.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.statistics.description')}
          </p>
          <Link href="/admin/statistics">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.statistics.button')}
            </Button>
          </Link>
        </Card>

        <Card title={t('cards.apiKeys.title')} className="flex flex-col">
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {t('cards.apiKeys.description')}
          </p>
          <Link href="/admin/api-keys">
            <Button variant="primary" className="w-full text-sm sm:text-base">
              {t('cards.apiKeys.button')}
            </Button>
          </Link>
        </Card>

      </div>

      {/* Service Tests Section */}
      <MotionDiv variant="slideUp" delay={300} className="mt-8">
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="p-3 bg-info-100 dark:bg-info-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-info-600 dark:text-info-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Service Tests</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Test and verify the configuration of integrated services</p>
            </div>
          </div>
          {/* Service test pages removed - no longer needed */}
            <ServiceTestCard
              href="/api-connections/testing"
              title="API Connections Test"
              description="Test and verify API connections between frontend pages and backend endpoints"
              color="info"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              }
            />
        </Card>
      </MotionDiv>

      <Section title={t('systemStatus.title')} className="mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 sm:p-6 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {t('systemStatus.apiBackend')}
              </span>
              <Badge variant="success" className="text-xs sm:text-sm">{t('systemStatus.online')}</Badge>
            </div>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {t('systemStatus.database')}
              </span>
              <Badge variant="success" className="text-xs sm:text-sm">{t('systemStatus.connected')}</Badge>
            </div>
          </div>
          <div className="p-4 sm:p-6 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {t('systemStatus.services')}
              </span>
              <Badge variant="success" className="text-xs sm:text-sm">{t('systemStatus.operational')}</Badge>
            </div>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}

