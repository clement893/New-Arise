'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, type Locale } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

/**
 * Language Toggle Component for Landing Page
 * Simple toggle between French and English
 */
export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname(); // Returns pathname WITHOUT locale prefix (next-intl behavior)
  const router = useRouter(); // Returns next-intl router with locale-aware navigation
  const searchParams = useSearchParams();

  const toggleLanguage = () => {
    // Toggle between 'fr' and 'en' only
    const newLocale: Locale = locale === 'fr' ? 'en' : 'fr';
    
    // pathname from usePathname() already excludes the locale prefix
    // Preserve query parameters when switching locale
    const queryString = searchParams ? searchParams.toString() : '';
    const pathnameWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use next-intl's router.push with locale option to properly handle locale switching
    // This automatically handles adding/removing locale prefixes based on routing config
    router.push(pathnameWithQuery, { locale: newLocale });
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
