'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { useHydrated } from '@/hooks/useHydrated';
import Button from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export function Header() {
  const t = useTranslations('landing.header');
  const { isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const isHydrated = useHydrated();
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && 
          menuButtonRef.current && !menuButtonRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <nav className="bg-white/80 backdrop-blur-[40px] shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-arise-deep-teal">ARISE</span>
          </Link>

          {/* Navigation Desktop - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/about" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('about')}
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('pricing')}
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('news')}
            </Link>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {isHydrated && isAuthenticated() ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
                  Admin
                </Link>
                <LanguageToggle />
                <Button asChild className="bg-[#D8B868] hover:bg-[#D8B868]/90 text-white rounded-2xl px-6 py-2">
                  <Link href="/register">{t('getStarted')}</Link>
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
                  {t('signIn')}
                </Link>
                <LanguageToggle />
                <Button asChild className="bg-[#D8B868] hover:bg-[#D8B868]/90 text-white rounded-2xl px-6 py-2">
                  <Link href="/register">{t('getStarted')}</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 hover:bg-gray-100 focus:ring-arise-deep-teal min-h-[44px]"
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
            'md:hidden border-t border-gray-200 overflow-hidden transition-all duration-300 ease-in-out bg-white',
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
              className="text-gray-700 hover:text-arise-deep-teal transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-gray-50"
            >
              Accueil
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-arise-deep-teal transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-gray-50"
            >
              {t('about')}
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-arise-deep-teal transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-gray-50"
            >
              {t('pricing')}
            </Link>
            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-arise-deep-teal transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-gray-50"
            >
              {t('news')}
            </Link>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex flex-col gap-2 px-2">
                {isHydrated && isAuthenticated() ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-gray-700 hover:text-arise-deep-teal">
                        Admin
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="primary" className="w-full bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white">
                        {t('getStarted')}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-gray-700 hover:text-arise-deep-teal">
                        {t('signIn')}
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" variant="primary" className="w-full bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white">
                        {t('getStarted')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
}
