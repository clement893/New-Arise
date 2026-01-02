'use client';

// Force dynamic rendering for all dashboard pages
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardCustomLayout from '@/components/layout/DashboardCustomLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ConditionalDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Use custom layout only for the main dashboard page
  const isMainDashboard = pathname === '/dashboard' || pathname === '/fr/dashboard' || pathname === '/en/dashboard';
  
  if (isMainDashboard) {
    return (
      <ProtectedRoute>
        <DashboardCustomLayout>{children}</DashboardCustomLayout>
      </ProtectedRoute>
    );
  }
  
  // Use default layout for all other dashboard pages
  return <DashboardLayout>{children}</DashboardLayout>;
}
