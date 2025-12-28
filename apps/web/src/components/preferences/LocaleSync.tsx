/**
 * Locale Sync Component
 * 
 * Syncs user's language preference from database with Next.js locale routing.
 * Redirects to the preferred locale if it differs from the current URL locale.
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api/client';
import { logger } from '@/lib/logger';
import type { Locale } from '@/i18n/routing';

interface LocaleSyncProps {
  children: React.ReactNode;
}

/**
 * LocaleSync - Syncs user language preference with URL locale
 * 
 * This component:
 * 1. Checks if user is authenticated
 * 2. Loads user preferences from database
 * 3. Compares preference language with current URL locale
 * 4. Redirects to preferred locale if different
 * 
 * Should be placed in the layout to run on every page load.
 */
export function LocaleSync({ children }: LocaleSyncProps) {
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;
  const { isAuthenticated } = useAuthStore();
  const [_isChecking, setIsChecking] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const syncLocale = async () => {
      // Skip if not authenticated
      if (!isAuthenticated()) {
        setIsChecking(false);
        return;
      }

      // Reset redirect flag when pathname changes (new page navigation)
      if (hasRedirected) {
        setHasRedirected(false);
      }

      try {
        // Fetch user preferences
        const response = await apiClient.get<Record<string, any>>('/v1/users/preferences');
        const data = (response as any).data || response;
        
        if (data && typeof data === 'object') {
          // Get language preference (could be 'language' or 'locale')
          const preferredLanguage = data.language || data.locale;
          
          if (preferredLanguage && preferredLanguage !== currentLocale) {
            // Get path without locale prefix
            const pathWithoutLocale = pathname.replace(/^\/(en|fr|ar|he)/, '') || '/';
            
            // Build new path with preferred locale
            const newPath = preferredLanguage === 'en' 
              ? pathWithoutLocale 
              : `/${preferredLanguage}${pathWithoutLocale}`;
            
            // Only redirect if path is different and we haven't redirected yet
            if (newPath !== pathname && !hasRedirected) {
              logger.info(`Redirecting to preferred locale: ${preferredLanguage}`, {
                currentLocale,
                preferredLanguage,
                currentPath: pathname,
                newPath,
              });
              
              setHasRedirected(true);
              window.location.href = newPath;
              return;
            }
          }
        }
      } catch (error) {
        // Silently fail - don't block page load if preferences can't be loaded
        logger.debug('Could not load preferences for locale sync:', error);
      } finally {
        setIsChecking(false);
      }
    };

    syncLocale();
  }, [isAuthenticated, currentLocale, pathname]);

  // Show children immediately - don't block rendering
  return <>{children}</>;
}

