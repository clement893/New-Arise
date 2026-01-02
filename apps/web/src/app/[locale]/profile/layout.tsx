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
  const pathname = usePathname();
  
  // Use custom layout for the main profile page
  const isMainProfile = pathname === '/profile' || pathname === '/fr/profile' || pathname === '/en/profile';
  
  if (isMainProfile) {
    return (
      <ProtectedRoute>
        <DashboardCustomLayout>{children}</DashboardCustomLayout>
      </ProtectedRoute>
    );
  }
  
  // Use default layout for all other profile pages
  return <DashboardLayout>{children}</DashboardLayout>;
}
