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

import { useState, useMemo, memo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/Sidebar';
import { ThemeToggleWithIcon } from '@/components/ui/ThemeToggle';
import { 
  LayoutDashboard, 
  Shield,
  User,
  FileText,
  Award,
  TrendingUp,
  ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Memoize sidebar items to prevent recreation on every render
// This ensures the sidebar doesn't re-render unnecessarily during navigation
const createSidebarItems = (isAdmin: boolean) => [
  {
    label: 'User',
    href: '/profile',
    icon: <User className="w-5 h-5" />,
  },
  {
    label: 'Reputation plan',
    href: '/dashboard/reputation-plan',
    icon: <Award className="w-5 h-5" />,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: 'Assessments',
    href: '/dashboard/assessments',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    label: 'Results & Reports',
    href: '/dashboard/reports',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: 'Development plan',
    href: '/dashboard/development-plan',
    icon: <TrendingUp className="w-5 h-5" />,
  },
  // Additional items (optional, can be hidden or shown based on needs)
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

// Memoize the sidebar component to prevent re-renders during navigation
const MemoizedSidebar = memo(Sidebar);

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin or superadmin
  const isAdmin = user?.is_admin ?? false;

  // Memoize sidebar items - only recreate if admin status changes
  // This prevents the sidebar from re-rendering on every navigation
  const sidebarItems = useMemo(
    () => createSidebarItems(isAdmin),
    [isAdmin]
  );

  // Memoize callbacks to prevent re-renders
  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleHomeClick = useCallback(() => {
    router.push('/');
    setMobileMenuOpen(false);
  }, [router]);

  const handleLogoutClick = useCallback(() => {
    logout();
    setMobileMenuOpen(false);
  }, [logout]);

  const handleDesktopHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleDesktopLogoutClick = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/images/dashboard-bg.jpg)',
        }}
      />
      {/* Subtle overlay pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none z-0"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          backgroundSize: '30px 30px',
        }}
      />
      {/* Mobile/Tablet Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Mobile/Tablet Sidebar - Fixed position, persists during navigation */}
      <aside
        className={clsx(
          'xl:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-64 sm:w-72',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <MemoizedSidebar
          items={sidebarItems}
          currentPath={pathname}
          className="h-full"
          user={user}
          showSearch={true}
          isMobile={true}
          onClose={handleMobileMenuClose}
          onHomeClick={handleHomeClick}
          themeToggleComponent={<ThemeToggleWithIcon />}
          onLogoutClick={handleLogoutClick}
        />
      </aside>

      {/* Desktop Layout - Sidebar stays fixed, only content changes */}
      <div className="flex h-screen pt-0 xl:pt-0">
        {/* Desktop Sidebar - Fixed position, persists during navigation */}
        <aside className="hidden xl:block">
          <MemoizedSidebar
            items={sidebarItems}
            currentPath={pathname}
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleCollapse}
            className="h-screen sticky top-0"
            user={user}
            showSearch={true}
            onHomeClick={handleDesktopHomeClick}
            themeToggleComponent={<ThemeToggleWithIcon />}
            onLogoutClick={handleDesktopLogoutClick}
          />
        </aside>

        {/* Main Content - Only this part changes during navigation */}
        <div className="flex-1 flex flex-col min-w-0 w-full relative z-10">
          {/* Page Content - This is the only part that updates on navigation */}
          <main 
            key={pathname} 
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 2xl:py-8"
            style={{
              animation: 'fadeInSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Next.js App Router keeps layouts persistent by default
  // The layout component stays mounted, only {children} changes during navigation
  // This ensures the sidebar stays in place while only the content area updates
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}
