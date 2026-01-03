'use client';

// Force dynamic rendering for all profile pages
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ConditionalProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use DashboardLayout for all profile pages to ensure consistent menu and background
  return <DashboardLayout>{children}</DashboardLayout>;
}
