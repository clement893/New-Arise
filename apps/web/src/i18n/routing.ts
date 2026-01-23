/**
 * i18n Routing Configuration
 * Defines supported locales and routing behavior
 */

import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

// Supported locales - Only English and French for now
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

// RTL locales (empty for now since we only support en and fr)
export const rtlLocales: Locale[] = [];

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

// Locale native names
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
};

// Check if locale is RTL
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

// Routing configuration
export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Disable automatic locale detection from browser headers
  // This ensures the root URL always serves English, not the browser's preferred language
  localeDetection: false,

  // Locale prefix strategy
  localePrefix: {
    mode: 'as-needed', // Only show locale prefix when not default
    prefixes: {
      en: '', // English has no prefix (default)
      fr: '/fr',
    },
  },
});

// Typed navigation helpers
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

