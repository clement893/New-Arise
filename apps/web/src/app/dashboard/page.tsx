'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useAuthStore } from '@/lib/store';
import { Card, Badge, Container, StatsCard, StatusCard, ServiceTestCard } from '@/components/ui';

function DashboardContent() {
  const { user } = useAuthStore();

  return (
    <Container className="py-8 lg:py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Profile Card */}
        <Card title="Your Profile">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <Badge variant={user?.is_active ? 'success' : 'default'}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
              <Badge variant={user?.is_verified ? 'success' : 'default'}>
                {user?.is_verified ? '✓ Yes' : '✗ No'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card title="Quick Stats">
          <div className="space-y-4">
            <StatsCard
              title="Resources"
              value="0"
              className="bg-primary-100 dark:bg-primary-900/40 border-primary-200 dark:border-primary-800"
            />
            <StatsCard
              title="Files"
              value="0"
              className="bg-secondary-100 dark:bg-secondary-900/40 border-secondary-200 dark:border-secondary-800"
            />
            <StatsCard
              title="Activities"
              value="0"
              className="bg-info-100 dark:bg-info-900/40 border-info-200 dark:border-info-800"
            />
          </div>
        </Card>
      </div>

      {/* API Status */}
      <Card title="API Status" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusCard
            title="✓ Backend Connected"
            description="API is running"
            status="success"
          />
          <StatusCard
            title="✓ Database Connected"
            description="PostgreSQL is running"
            status="success"
          />
          <StatusCard
            title="✓ Authentication"
            description="JWT is working"
            status="success"
          />
        </div>
      </Card>

      {/* Test Pages */}
      <Card
        title="Service Tests"
        subtitle="Test and verify the configuration of integrated services"
        className="mt-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        </div>
      </Card>
    </Container>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}
