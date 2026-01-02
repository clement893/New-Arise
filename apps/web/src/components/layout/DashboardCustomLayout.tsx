'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ClipboardList,
  FileText,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';

interface DashboardCustomLayoutProps {
  children: React.ReactNode;
}

export default function DashboardCustomLayout({ children }: DashboardCustomLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Results & Reports', href: '/dashboard/results', icon: FileText },
    { name: 'Development plan', href: '/dashboard/development-plan', icon: TrendingUp },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar - 280px, teal foncé (#1B5E6B) */}
      <aside className="w-[280px] bg-[#1B5E6B] flex flex-col text-white">
        {/* Logo and User Profile Section */}
        <div className="p-6 border-b border-white/20">
          {/* Logo placeholder - stylized flame/6 */}
          <div className="mb-6 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-white fill-current">
                {/* Stylized flame/6 shape */}
                <path d="M20 5 C 15 5, 10 10, 10 15 C 10 20, 15 25, 20 25 C 25 25, 30 20, 30 15 C 30 10, 25 5, 20 5 M 20 15 L 20 35" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      fill="none" 
                      strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center gap-3">
            {/* Profile Picture */}
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name || 'User'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {(user?.name?.[0] || 'J').toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{user?.name || 'John Doe'}</p>
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mt-1">
                Revelation plan
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-white/20 text-white font-medium'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content - teal clair (#2B8A9E) */}
      <main className="flex-1 bg-[#2B8A9E] overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
