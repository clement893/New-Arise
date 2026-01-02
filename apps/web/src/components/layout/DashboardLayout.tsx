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

import { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Sidebar from '@/components/ui/Sidebar';
import { checkMySuperAdminStatus } from '@/lib/api/admin';
import { ThemeToggleWithIcon } from '@/components/ui/ThemeToggle';
import { 
  LayoutDashboard, 
  User,
  FileText,
  TrendingUp,
  ClipboardList,
  Users,
  Calendar,
  Briefcase,
  Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import type { UserType } from '@/lib/store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

// Memoize sidebar items to prevent recreation on every render
// This ensures the sidebar doesn't re-render unnecessarily during navigation
const createSidebarItems = (userType?: UserType, isAdmin?: boolean): SidebarItem[] => {
  // Default to INDIVIDUAL if user_type is not provided
  const type = userType || 'INDIVIDUAL';
  
  // Debug logging
  if (typeof window !== 'undefined') {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[createSidebarItems] Creating sidebar items:', { userType: type, isAdmin });
    }
  }
  
  // Super admins see all sections grouped
  // Check if type is ADMIN or if user is admin (fallback for superadmins)
  if (type === 'ADMIN' || isAdmin === true) {
    return [
      {
        label: 'Admin',
        icon: <Users className="w-5 h-5" />,
        children: [
          {
            label: 'Manage Users',
            href: '/dashboard/admin/users',
            icon: <Users className="w-5 h-5" />,
          },
          {
            label: 'Manage Tests',
            href: '/dashboard/admin/assessment-management',
            icon: <ClipboardList className="w-5 h-5" />,
          },
          {
            label: 'Profile',
            href: '/profile',
            icon: <User className="w-5 h-5" />,
          },
        ],
      },
      {
        label: 'Coach',
        icon: <Calendar className="w-5 h-5" />,
        children: [
          {
            label: 'Coachee',
            href: '/dashboard/coach/coachee',
            icon: <Users className="w-5 h-5" />,
          },
          {
            label: 'Agenda',
            href: '/dashboard/coach/agenda',
            icon: <Calendar className="w-5 h-5" />,
          },
          {
            label: 'Profile',
            href: '/profile',
            icon: <User className="w-5 h-5" />,
          },
        ],
      },
      {
        label: 'Business',
        icon: <Briefcase className="w-5 h-5" />,
        children: [
          {
            label: 'Employees',
            href: '/dashboard/business/employees',
            icon: <Briefcase className="w-5 h-5" />,
          },
          {
            label: 'Profile',
            href: '/profile',
            icon: <User className="w-5 h-5" />,
          },
        ],
      },
      {
        label: 'Individual',
        icon: <LayoutDashboard className="w-5 h-5" />,
        children: [
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
          {
            label: 'Profile',
            href: '/profile',
            icon: <User className="w-5 h-5" />,
          },
        ],
      },
    ];
  }
  
  // Coach users
  if (type === 'COACH') {
    return [
      {
        label: 'Coachee',
        href: '/dashboard/coach/coachee',
        icon: <Users className="w-5 h-5" />,
      },
      {
        label: 'Agenda',
        href: '/dashboard/coach/agenda',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        label: 'Profile',
        href: '/profile',
        icon: <User className="w-5 h-5" />,
      },
    ];
  }
  
  // Business users
  if (type === 'BUSINESS') {
    return [
      {
        label: 'Employees',
        href: '/dashboard/business/employees',
        icon: <Briefcase className="w-5 h-5" />,
      },
      {
        label: 'Profile',
        href: '/profile',
        icon: <User className="w-5 h-5" />,
      },
    ];
  }
  
  // Individual users (default)
  return [
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
    {
      label: 'Profile',
      href: '/profile',
      icon: <User className="w-5 h-5" />,
    },
  ];
};

// Memoize the sidebar component to prevent re-renders during navigation
const MemoizedSidebar = memo(Sidebar);

function DashboardLayoutContent({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  // Check superadmin status on mount
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!user || !token) {
        setIsSuperAdmin(false);
        return;
      }
      
      try {
        const status = await checkMySuperAdminStatus(token);
        setIsSuperAdmin(status.is_superadmin === true);
      } catch (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking superadmin status:', error);
        }
        setIsSuperAdmin(false);
      }
    };
    
    checkSuperAdmin();
  }, [user, token]);

  // Check if user is admin or superadmin
  // Use user_type directly - superadmins have user_type='ADMIN' after migration
  const userType = user?.user_type;
  
  // If user_type is ADMIN, show admin menu
  // Also check is_admin as fallback (though migration should have set user_type)
  // Also check superadmin status from API
  const isAdmin = user?.is_admin ?? false;
  const effectiveIsAdmin = isAdmin || isSuperAdmin === true;
  const effectiveUserType = (userType === 'ADMIN' || effectiveIsAdmin) ? 'ADMIN' : userType;
  
  // Debug logging (remove in production if needed)
  if (typeof window !== 'undefined') {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[DashboardLayout] User data:', {
        userType,
        isAdmin,
        isSuperAdmin,
      effectiveIsAdmin,
      effectiveUserType,
      user: user ? { id: user.id, email: user.email, user_type: user.user_type, is_admin: user.is_admin } : null
    });
    }
  }

  // Memoize sidebar items - only recreate if admin status or user type changes
  // This prevents the sidebar from re-rendering on every navigation
  const sidebarItems = useMemo(
    () => createSidebarItems(effectiveUserType, effectiveIsAdmin),
    [effectiveUserType, effectiveIsAdmin]
  );

  // Memoize callbacks to prevent re-renders
  const handleToggleCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleMobileMenuToggle = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
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
    <div className="min-h-screen relative bg-white">
      {/* Vertical lines texture */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(255, 255, 255, 0.05) 3px,
            rgba(255, 255, 255, 0.05) 4px
          )`,
        }}
      />
      {/* Mobile/Tablet Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Mobile/Tablet Sidebar - Fixed position, persists during navigation */}
      <aside
        className={clsx(
          'lg:hidden fixed top-0 left-0 h-full z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] w-64 sm:w-72',
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
        <aside className="hidden lg:block">
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
          {/* Mobile Header with Hamburger Menu */}
          <header className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex-shrink-0">
            <div className="px-4 py-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                MODELE
              </h1>
              <button
                onClick={handleMobileMenuToggle}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px]"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Page Content - This is the only part that updates on navigation */}
          <main 
            key={pathname} 
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 xl:px-8 2xl:px-10 py-4 sm:py-6 2xl:py-8 bg-white"
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
