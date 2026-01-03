'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';
import { LanguageToggle } from './LanguageToggle';

export function Header() {
  const t = useTranslations('landing.header');

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-arise-deep-teal">ARISE</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('products')}
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('pricing')}
            </Link>
            <Link href="/news" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('news')}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-gray-700 hover:text-arise-deep-teal transition-colors">
              {t('signIn')}
            </Link>
            <LanguageToggle />
            <Button asChild className="bg-arise-deep-teal hover:bg-arise-deep-teal/90 text-white">
              <Link href="/register">{t('getStarted')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
