'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { type Locale } from '@/i18n/routing';
import { clsx } from 'clsx';

/**
 * Language Toggle Component for Landing Page
 * Simple toggle between French and English
 */
export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    // Toggle between 'fr' and 'en' only
    const newLocale: Locale = locale === 'fr' ? 'en' : 'fr';
    
    // Get current pathname without locale prefix
    const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar|he)/, '') || '/';
    
    // Build new path with locale
    // English (default) has no prefix, French has /fr prefix
    const newPath = newLocale === 'en' 
      ? pathWithoutLocale 
      : `/${newLocale}${pathWithoutLocale}`;
    
    // Navigate to new locale
    router.push(newPath);
    
    // Small delay before reload to ensure navigation and locale change
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const isFrench = locale === 'fr';

  return (
    <button
      onClick={toggleLanguage}
      className={clsx(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
        'border border-gray-300 hover:border-arise-deep-teal',
        'text-gray-700 hover:text-arise-deep-teal',
        'focus:outline-none focus:ring-2 focus:ring-arise-deep-teal focus:ring-offset-2',
        isFrench && 'bg-arise-deep-teal/5 border-arise-deep-teal text-arise-deep-teal'
      )}
      aria-label={isFrench ? 'Switch to English' : 'Passer en français'}
      aria-pressed={isFrench}
    >
      {isFrench ? 'ENG' : 'FR'}
    </button>
  );
}
