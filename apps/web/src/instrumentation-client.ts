/**
 * Sentry Client Configuration
 * This file configures Sentry for the browser/client-side
 * 
 * Note: This file replaces sentry.client.config.ts for Turbopack compatibility
 * See: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
 */

import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
const SENTRY_RELEASE = process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,
    
    // Enable debug mode in development to see what's happening
    debug: SENTRY_ENVIRONMENT === 'development' && process.env.NEXT_PUBLIC_SENTRY_DEBUG === 'true',
    
    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Session Replay (optional - can be expensive)
    replaysSessionSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // Always record sessions with errors
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
      Sentry.browserTracingIntegration(),
    ],
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly enabled
      if (SENTRY_ENVIRONMENT === 'development' && process.env.NEXT_PUBLIC_SENTRY_ENABLE_DEV !== 'true') {
        return null;
      }
      
      // Filter out known non-critical errors to reduce rate limiting
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network errors that are likely user-related (offline, etc.)
        if (
          error.message.includes('NetworkError') ||
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network request failed')
        ) {
          return null;
        }
        
        // Ignore ResizeObserver errors (common browser quirk)
        if (error.message.includes('ResizeObserver loop')) {
          return null;
        }
        
        // Ignore MIME type errors (usually server configuration issues, not code errors)
        if (error.message.includes('MIME type') || error.message.includes('Refused to execute')) {
          return null;
        }
        
        // Ignore React minified errors #418 (usually hydration or dangerouslySetInnerHTML issues)
        if (error.message.includes('Minified React error #418') || error.message.includes('#418')) {
          logger.warn('React error #418 detected - likely HTML rendering issue', { event });
          return null; // Don't spam Sentry with these
        }
        
        // Ignore Sentry rate limiting errors (429)
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          return null; // Don't send Sentry errors about Sentry itself
        }
        
        // Ignore chunk loading errors (usually user network issues or cache)
        if (error.message.includes('Loading chunk') || error.message.includes('Failed to fetch dynamically imported module')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Ignore specific error patterns to reduce rate limiting
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'atomicFindClose',
      'fb_xd_fragment',
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'conduitPage',
      
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      
      // ResizeObserver
      'ResizeObserver loop',
      
      // MIME type errors (server configuration issues)
      'Refused to execute script',
      'MIME type',
      
      // React errors
      'Minified React error #418',
      'Minified React error #',
      
      // Sentry rate limiting
      '429',
      'Too Many Requests',
      
      // Chunk loading (usually cache issues)
      'Loading chunk',
      'Failed to fetch dynamically imported module',
    ],
    
    // Set user context
    initialScope: {
      tags: {
        component: 'client',
      },
    },
  });
} else {
  // Log warning if Sentry is not configured
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    logger.warn('[Sentry] NEXT_PUBLIC_SENTRY_DSN is not set. Sentry error tracking is disabled.');
  }
}

// Export the router transition hook for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

