/**
 * Locale-based Layout
 * Wraps the app with next-intl provider and RTL support
 */

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import AppProviders from '@/components/providers/AppProviders';
import { App } from '../app';
import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter';
import { PerformanceScripts } from '@/components/performance/PerformanceScripts';
import { ResourceHints } from '@/lib/performance/resourceHints';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { SchemaMarkup } from '@/components/seo';
import { GoogleAnalytics } from '@/components/marketing/GoogleAnalytics';
import RTLProvider from '@/components/i18n/RTLProvider';
import SkipLink from '@/components/ui/SkipLink';
import type { Locale } from '@/i18n/routing';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MODELE-NEXTJS-FULLSTACK',
  description: 'Full-stack template with Next.js 16 frontend and FastAPI backend',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // themeColor will be set dynamically by theme system, using a neutral fallback here
  themeColor: '#2563eb', // Fallback - will be overridden by theme when loaded
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Get API URL for resource hints
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_DEFAULT_API_URL || 'http://localhost:8000';
  const apiHost = apiUrl.replace(/^https?:\/\//, '').split('/')[0];

  // Generate default Open Graph metadata
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appName = process.env.NEXT_PUBLIC_APP_NAME || 'MODELE-NEXTJS-FULLSTACK';
  const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Full-stack template with Next.js 16 frontend and FastAPI backend';

  return (
    <html lang={locale} className={inter.variable} data-api-url={apiUrl} suppressHydrationWarning>
      <head>
        {/* Minimal CSS structure - no default colors. Theme colors come from API via GlobalThemeProvider */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Base structure - colors will be applied by GlobalThemeProvider from API theme */
              :root {
                /* Font and layout variables only - no colors */
                --font-family: Inter, system-ui, -apple-system, sans-serif;
                --font-family-heading: Inter, system-ui, -apple-system, sans-serif;
                --font-family-subheading: Inter, system-ui, -apple-system, sans-serif;
                --border-radius: 8px;
              }
              
              /* Body uses CSS variables that will be set by theme system */
              body {
                background-color: var(--color-background);
                color: var(--color-foreground);
                font-family: var(--font-family, Inter, system-ui, sans-serif);
              }
            `,
          }}
        />
        
        {/* Resource hints for performance */}
        {apiHost && (
          <>
            <link rel="dns-prefetch" href={`//${apiHost}`} />
            <link rel="preconnect" href={`//${apiHost}`} crossOrigin="anonymous" />
          </>
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Open Graph tags */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={appName} />
        <meta property="og:locale" content={locale === 'fr' ? 'fr_FR' : locale === 'ar' ? 'ar_SA' : locale === 'he' ? 'he_IL' : 'en_US'} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body 
        className={`${inter.className} bg-background text-foreground`}
        style={{ 
          fontFamily: 'var(--font-family, Inter, system-ui, sans-serif)',
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-foreground)'
        }}
        suppressHydrationWarning
        // Note: suppressHydrationWarning can be removed after testing confirms no hydration errors
        // We've fixed the root cause (removed direct body style manipulation from inline script)
      >
        <SkipLink />
        <SchemaMarkup
          type="organization"
          data={{
            name: appName,
            url: baseUrl,
            description: appDescription,
          }}
        />
        <SchemaMarkup
          type="website"
          data={{
            name: appName,
            url: baseUrl,
            description: appDescription,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/search?q={search_term_string}`,
              },
            },
          }}
        />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <NextIntlClientProvider messages={messages}>
          <RTLProvider>
            <PerformanceScripts />
            <ResourceHints />
            <ErrorBoundary>
              <AppProviders>
                <App>
                  {children}
                </App>
              </AppProviders>
            </ErrorBoundary>
            <WebVitalsReporter />
          </RTLProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

