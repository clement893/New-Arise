/**
 * Sentry Client Configuration
 * Error tracking and monitoring
 * Sentry is optional - functions will no-op if @sentry/nextjs is not installed
 */

// @ts-nocheck
let Sentry: any = null;

// Lazy load Sentry to avoid webpack static analysis
function loadSentry() {
  if (Sentry !== null) return Sentry;
  
  try {
    // Construct module name dynamically to prevent webpack static analysis
    const moduleParts = ['@sentry', '/', 'nextjs'];
    const moduleName = moduleParts.join('');
    // @ts-expect-error - Sentry is optional
    Sentry = typeof require !== 'undefined' ? require(moduleName) : null;
  } catch {
    // Sentry not installed, continue without it
    Sentry = null;
  }
  
  return Sentry;
}

export function initSentry() {
  const sentry = loadSentry();
  if (!sentry || !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return;
  }

  if (typeof window === 'undefined') {
    // Server-side initialization
    sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
        }
        return event;
      },
    });
  } else {
    // Client-side initialization
    sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      integrations: [
        new sentry.BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.sentry\.io\/api/,
            process.env.NEXT_PUBLIC_API_URL || '',
          ],
        }),
        new sentry.Replay({
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
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  const sentry = loadSentry();
  if (!sentry) return;
  sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' | 'debug' | 'fatal' = 'info') {
  const sentry = loadSentry();
  if (!sentry) return;
  sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  const sentry = loadSentry();
  if (!sentry) return;
  sentry.setUser(user);
}

export function clearUser() {
  const sentry = loadSentry();
  if (!sentry) return;
  sentry.setUser(null);
}

