'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { useHydrated } from '@/hooks/useHydrated';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import Button from '../ui/Button';
// ThemeToggle removed - dark mode is no longer supported
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import NotificationBellConnected from '../notifications/NotificationBellConnected';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const isHydrated = useHydrated();
  
  // Check if user has valid tokens (not just user in store)
  // This ensures that even if user persists in localStorage, we check for actual tokens
  // Check token on every render to catch logout events immediately
  const hasToken = typeof window !== 'undefined' ? !!TokenStorage.getToken() : false;
  
  // User is authenticated only if both user exists AND token exists
  const isAuthenticated = !!user && hasToken;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus management when menu opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const firstLink = mobileMenuRef.current.querySelector('a') as HTMLElement;
      firstLink?.focus();
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-foreground">
            <span className="text-white">ARISE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {/* Dark mode toggle removed */}
            {isHydrated && isAuthenticated ? (
              <>
                <NotificationBellConnected />
                <span className="text-sm text-muted-foreground hidden lg:block">
                  {user?.name || user?.email}
                </span>
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost">
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="primary" 
                  onClick={logout}
                  style={{ backgroundColor: '#0f454d', color: '#fff' }}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button size="sm" variant="ghost">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" variant="primary">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Dark mode toggle removed */}
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-foreground hover:bg-muted focus:ring-primary min-h-[44px]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          ref={mobileMenuRef}
          id="mobile-menu"
          className={clsx(
            'md:hidden border-t border-border overflow-hidden transition-all duration-300 ease-in-out',
            mobileMenuOpen ? 'max-h-[800px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          )}
          role="menu"
          aria-label="Menu mobile"
          aria-hidden={!mobileMenuOpen}
        >
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-muted/50"
              >
                Accueil
              </Link>
              {isHydrated && isAuthenticated && (
                <>
                  <div className="px-4 py-3">
                    <NotificationBellConnected />
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-muted/50"
                  >
                    Dashboard
                  </Link>
                </>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                <div className="px-2 mb-4">
                  <LanguageSwitcher />
                </div>
                {isHydrated && isAuthenticated ? (
                  <div className="flex flex-col gap-2 px-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.name || user?.email}
                    </span>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="ghost" className="w-full justify-start">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="primary" 
                      onClick={logout} 
                      className="w-full"
                      style={{ backgroundColor: '#0f454d', color: '#fff' }}
                    >
                      Déconnexion
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-2">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="ghost" className="w-full">
                        Connexion
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="primary" className="w-full">
                        Inscription
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
      </div>
    </header>
  );
}

