'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { 
  LayoutDashboard, 
  ClipboardList, 
  BarChart3, 
  Target,
  LogOut 
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assessments', href: '/dashboard/assessments', icon: ClipboardList },
    { name: 'Results & Reports', href: '/dashboard/results', icon: BarChart3 },
    { name: 'Personal Growth Plan', href: '/dashboard/development', icon: Target },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-51 bg-white h-screen fixed left-0 top-0 flex flex-col shadow-lg" style={{ width: '204px' }}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-arise-deep-teal rounded-full flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-8 h-8 text-white">
              <path
                fill="currentColor"
                d="M20 5 C 15 5, 10 10, 10 15 C 10 20, 15 25, 20 25 C 25 25, 30 20, 30 15 C 30 10, 25 5, 20 5 M 20 15 L 20 35"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-gray-700">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
            <span className="inline-block px-2 py-0.5 bg-arise-gold/20 text-arise-gold text-xs rounded-full mt-1">
              Reputation plan
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active 
                      ? 'bg-arise-deep-teal text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-white transition-colors w-full hover:opacity-90"
          style={{ backgroundColor: '#0f454d', color: '#fff' }}
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
