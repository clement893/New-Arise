'use client';

// Force dynamic rendering for all profile pages
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCustomLayout from '@/components/layout/DashboardCustomLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ConditionalProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use DashboardLayout for all profile pages to ensure consistent menu and background
  return <DashboardLayout>{children}</DashboardLayout>;
}
