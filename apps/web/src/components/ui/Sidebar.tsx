'use client';

import { ReactNode, useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ChevronRight, ChevronLeft, ChevronDown, Search, X, Home, LogOut } from 'lucide-react';
import Input from './Input';

interface SidebarItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  currentPath?: string;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: {
    name?: string;
    email?: string;
  } | null;
  showSearch?: boolean; // New prop for search bar (UX/UI improvements - Batch 8)
  // New props for header and footer actions
  notificationsComponent?: ReactNode;
  onHomeClick?: () => void;
  themeToggleComponent?: ReactNode;
  onLogoutClick?: () => void;
  onClose?: () => void; // For mobile menu close button
  isMobile?: boolean; // To hide text labels in mobile mode
}

export default function Sidebar({
  items,
  currentPath,
  className,
  collapsed = false,
  onToggleCollapse,
  user,
  showSearch = false, // Search bar disabled by default for backward compatibility
  notificationsComponent,
  onHomeClick,
  themeToggleComponent,
  onLogoutClick,
  onClose,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const activePath = currentPath || pathname;
  
  // Improved active detection - check exact match or if path starts with href
  const normalizePath = (path: string | undefined | null): string => {
    if (!path) return '';
    // Remove locale prefix (e.g., /fr/dashboard -> /dashboard)
    let normalized = path;
    if (normalized.match(/^\/[a-z]{2}\//)) {
      normalized = normalized.replace(/^\/[a-z]{2}/, '');
    }
    // Remove query params and hash
    const withoutQuery = normalized.split('?')[0] || '';
    return withoutQuery.split('#')[0] || '';
  };

  // Debug: log active path in development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[Sidebar] Active path:', activePath, 'Current path:', currentPath, 'Pathname:', pathname);
      console.log('[Sidebar] Normalized active path:', normalizePath(activePath));
    }
  }, [activePath, currentPath, pathname]);

  // Auto-expand only "Individual" section by default, keep others collapsed
  useEffect(() => {
    const initialExpanded = new Set<string>();
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        // Only expand "Individual" section by default
        if (item.label === 'Individual') {
          initialExpanded.add(item.label);
        }
      }
    });
    setExpandedItems(initialExpanded);
  }, [items]);
  
  // Filter items based on search query (UX/UI improvements - Batch 8)
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim() || !showSearch) {
      return items;
    }
    
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(query);
      const matchesChildren = item.children?.some(
        (child) => child.label.toLowerCase().includes(query) || child.href?.toLowerCase().includes(query)
      );
      return matchesLabel || matchesChildren;
    }).map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter(
          (child) =>
            child.label.toLowerCase().includes(query) ||
            child.href?.toLowerCase().includes(query)
        );
        return { ...item, children: filteredChildren };
      }
      return item;
    });
  }, [items, searchQuery, showSearch]);

  const toggleItem = (label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const normalizedActivePath = normalizePath(activePath);
    const normalizedHref = normalizePath(item.href);
    
    // Special handling for exact routes like /dashboard - they should only be active on exact match
    // For other routes, allow prefix matching (e.g., /dashboard/assessments matches /dashboard/assessments/*)
    // Normalize both paths to handle trailing slashes
    const normalizedHrefClean = normalizedHref?.replace(/\/$/, '') || '';
    const normalizedActivePathClean = normalizedActivePath?.replace(/\/$/, '') || '';
    const isExactRoute = normalizedHrefClean === '/dashboard';
    const isActive = item.href && (
      normalizedActivePathClean === normalizedHrefClean || 
      (!isExactRoute && normalizedActivePathClean && normalizedHrefClean && normalizedActivePathClean.startsWith(normalizedHrefClean + '/'))
    );
    
    // Debug in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && item.href) {
      if (isActive) {
        console.log('[Sidebar] Active item detected:', item.label, 'Path:', normalizedActivePath, 'Href:', normalizedHref, 'IsExactRoute:', isExactRoute);
      }
    }

    return (
      <div key={item.label}>
        <div
          className={clsx(
            'flex items-center justify-between rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative', // Improved spacing and touch target (UX/UI improvements - Batch 8, 17)
            collapsed 
              ? 'px-2 py-2 min-h-[40px] justify-center' 
              : 'px-lg py-md min-h-[44px]',
            isActive
              ? 'bg-arise-button-primary text-white font-medium'
              : 'text-gray-700 hover:bg-gray-100',
            level > 0 && !collapsed && 'ml-lg' // Increased indentation for nested items (only when not collapsed)
          )}
        >
          {item.href ? (
            <Link
              href={item.href}
              className={clsx(
                "flex items-center min-w-0",
                collapsed ? "justify-center w-full" : "flex-1 space-x-3",
                isActive && "text-white"
              )}
              style={isActive ? { color: '#ffffff' } : undefined}
            >
              {item.icon && (
                <span 
                  className={clsx("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5", isActive && "text-white")}
                  style={isActive ? { color: '#ffffff' } : undefined}
                >
                  {item.icon}
                </span>
              )}
              {!collapsed && (
                <span 
                  className={clsx("flex-1 truncate text-sm font-medium", isActive && "text-white")}
                  style={isActive ? { color: '#ffffff' } : undefined}
                >
                  {item.label}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={item.onClick || (hasChildren ? () => toggleItem(item.label) : undefined)}
              className={clsx(
                "flex items-center text-left min-w-0",
                collapsed ? "justify-center w-full" : "flex-1 space-x-3",
                isActive && "text-white"
              )}
              style={isActive ? { color: '#ffffff' } : undefined}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-label={hasChildren ? `Toggle ${item.label}` : item.label}
            >
              {item.icon && (
                <span 
                  className={clsx("flex-shrink-0", collapsed ? "w-5 h-5" : "w-5 h-5", isActive && "text-white")}
                  style={isActive ? { color: '#ffffff' } : undefined}
                >
                  {item.icon}
                </span>
              )}
              {!collapsed && (
                <span 
                  className={clsx("flex-1 truncate text-sm font-medium", isActive && "text-white")}
                  style={isActive ? { color: '#ffffff' } : undefined}
                >
                  {item.label}
                </span>
              )}
            </button>
          )}
          {!collapsed && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              {item.badge && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                isExpanded ? (
                  <ChevronDown className={clsx("w-4 h-4 transition-transform", isActive ? "text-white" : "text-gray-500")} />
                ) : (
                  <ChevronRight className={clsx("w-4 h-4 transition-transform", isActive ? "text-white" : "text-gray-500")} />
                )
              )}
            </div>
          )}
        </div>
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Auto-expand groups that contain active items (UX/UI improvements - Batch 8)
  useMemo(() => {
    items.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => {
            if (!child.href) return false;
            const normalizedActive = normalizePath(activePath);
            const normalizedChild = normalizePath(child.href);
            return normalizedActive === normalizedChild || 
                   (normalizedActive && normalizedChild && normalizedActive.startsWith(normalizedChild + '/'));
          }
        );
        if (hasActiveChild && !expandedItems.has(item.label)) {
          setExpandedItems((prev) => new Set(prev).add(item.label));
        }
      }
    });
  }, [items, activePath, expandedItems]);

  return (
    <aside
      className={clsx(
        'bg-white border-r border-gray-200 h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col overflow-x-hidden',
        collapsed ? 'w-16' : 'w-51',
        className
      )}
    >
      {/* Header: ARISE Logo */}
      <div className={clsx(
        'border-b border-gray-200 flex-shrink-0',
        collapsed ? 'p-2' : 'p-lg'
      )}>
        <Link 
          href="/dashboard"
          className={clsx(
            'flex items-center justify-center',
            collapsed && 'justify-center',
            'hover:opacity-80 transition-opacity cursor-pointer'
          )}
          title="Retour au dashboard"
        >
          <h1 className={clsx(
            "text-2xl font-bold text-arise-deep-teal",
            collapsed && "text-xl"
          )}>
            {collapsed ? 'A' : 'ARISE'}
          </h1>
        </Link>
      </div>

      {/* User info */}
      {user && (
        <div className={clsx(
          'border-b border-gray-200 flex-shrink-0',
          collapsed ? 'p-2' : 'p-lg'
        )}>
          <div className={clsx(
            'flex items-center',
            collapsed ? 'justify-center' : 'gap-3'
          )}>
            <div className={clsx(
              "rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0",
              collapsed ? "w-10 h-10" : "w-10 h-10 min-w-[44px] min-h-[44px]"
            )}>
              <span className="text-sm font-medium text-primary-700">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user.email}
                  </p>
                </div>
                {notificationsComponent && (
                  <div className="flex-shrink-0">
                    {notificationsComponent}
                  </div>
                )}
              </div>
            )}
            {collapsed && notificationsComponent && (
              <div className="flex-shrink-0">
                {notificationsComponent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Bar (UX/UI improvements - Batch 8) */}
      {showSearch && !collapsed && (
        <div className="px-lg py-md border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 h-10 text-sm"
              aria-label="Rechercher dans la navigation"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      <nav className={clsx(
        'space-y-1 flex-1 overflow-y-auto overflow-x-hidden',
        collapsed ? 'p-2' : 'p-lg'
      )}>
        {filteredItems.length === 0 ? (
          <div className="px-lg py-md text-sm text-gray-500 text-center">
            Aucun résultat trouvé
          </div>
        ) : (
          filteredItems.map((item) => renderItem(item))
        )}
      </nav>
      
      {/* Footer: Collapse, Close button (mobile), Home, Theme Toggle, Logout (bottom) */}
      {(onToggleCollapse || onClose || onHomeClick || themeToggleComponent || onLogoutClick) && (
        <div className={clsx(
          'border-t border-gray-200 flex-shrink-0',
          collapsed ? 'p-2' : 'p-lg'
        )}>
          <div className={clsx(
            'flex items-center gap-2',
            collapsed || isMobile ? 'justify-center flex-wrap' : 'justify-start'
          )}>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                ) : (
                  <ChevronLeft className="w-5 h-5 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]" />
                )}
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Fermer le menu"
                title="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {onHomeClick && (
              <button
                onClick={onHomeClick}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Retour à l'accueil"
                title="Retour à l'accueil"
              >
                <Home className="w-5 h-5" />
              </button>
            )}
            {themeToggleComponent && (
              <div className="flex-shrink-0 flex items-center justify-center">
                {themeToggleComponent}
              </div>
            )}
            {onLogoutClick && (
              <button
                onClick={onLogoutClick}
                className={clsx(
                  "rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-[44px] flex items-center justify-center text-white bg-arise-dark-gray",
                  collapsed || isMobile ? "p-2 min-w-[44px]" : "px-4 py-3 gap-3 w-full"
                )}
                aria-label="Déconnexion"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
                {!collapsed && !isMobile && <span className="text-sm font-medium">Logout</span>}
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

