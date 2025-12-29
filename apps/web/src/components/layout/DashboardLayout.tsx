/**
 * Shared Dashboard Layout Component
 * 
 * Best Practice: Use a shared layout component to ensure consistency
 * across all internal pages (dashboard, settings, profile, etc.)
 * 
 * Benefits:
 * - Single source of truth for navigation
 * - Consistent UI/UX across pages
 * - Easier maintenance (one place to update)
 * - Prevents layout drift between pages
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/Sidebar';
import DashboardFooter from '@/components/layout/DashboardFooter';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Shield,
  User,
  Settings
} from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin or superadmin
  const isAdmin = user?.is_admin;

  // Shared sidebar items - consistent across all pages
  const sidebarItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: <Settings className="w-5 h-5" />,
    },
    {
      label: 'Projets',
      href: '/dashboard/projects',
      icon: <FolderKanban className="w-5 h-5" />,
    },
    {
      label: 'Super Admin',
      href: '/dashboard/become-superadmin',
      icon: <Shield className="w-5 h-5" />,
    },
    // Admin link - only visible to admins and superadmins
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            href: '/admin',
            icon: <Shield className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-muted dark:to-muted">
      {/* Mobile/Tablet Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile/Tablet Sidebar */}
      <aside
        className={clsx(
          'xl:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out w-64 sm:w-72',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          items={sidebarItems}
          currentPath={pathname}
          className="h-full"
          user={user}
          showSearch={true}
        />
      </aside>

      {/* Desktop Layout */}
      <div className="flex h-screen pt-0 xl:pt-0">
        {/* Desktop Sidebar */}
        <aside className="hidden xl:block">
          <Sidebar
            items={sidebarItems}
            currentPath={pathname}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-screen sticky top-0"
            user={user}
            showSearch={true}
          />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 2xl:py-8">
            {children}
          </main>

          {/* Dashboard Footer */}
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
