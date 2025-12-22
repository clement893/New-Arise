/**
 * Sentry Client Configuration
 * This file configures Sentry for the client-side
 * Sentry is optional - this file will no-op if @sentry/nextjs is not installed
 */

// @ts-nocheck - Sentry is optional and may not be installed
let Sentry: typeof import('@sentry/nextjs') | null = null;

try {
  // Construct module name dynamically to prevent webpack static analysis
  const moduleParts = ['@sentry', '/', 'nextjs'];
  const moduleName = moduleParts.join('');
  Sentry = typeof require !== 'undefined' ? require(moduleName) : null;
} catch {
  // Sentry not installed, continue without it
}

if (Sentry && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.sentry\.io\/api/,
          process.env.NEXT_PUBLIC_API_URL || '',
        ],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }
      return event;
    },
  });
}
