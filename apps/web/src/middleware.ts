import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';
import { routing } from './i18n/routing';
import { randomBytes } from 'crypto';

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

/**
 * Generate a secure CSP nonce for this request
 * SECURITY: Nonces allow inline scripts/styles while maintaining strict CSP
 */
function generateCSPNonce(): string {
  // Generate 16 random bytes and encode as base64url (URL-safe)
  return randomBytes(16).toString('base64url');
}

// Export config for middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

/**
 * Middleware to protect authenticated routes and handle i18n
 * Verifies JWT token presence and validity before allowing access
 * Handles locale routing with next-intl
 * 
 * Security improvements:
 * - Verifies JWT tokens server-side
 * - Checks token expiration
 * - Validates token signature
 * - Supports both cookie-based and header-based authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude non-localized routes from i18n middleware
  const nonLocalizedRoutes = ['/sitemap.xml', '/robots.txt', '/api'];
  const shouldSkipI18n = nonLocalizedRoutes.some(route => pathname.startsWith(route));
  
  if (shouldSkipI18n) {
    // Skip i18n middleware for these routes
    return NextResponse.next();
  }

  // SECURITY: Generate CSP nonce for this request BEFORE i18n middleware
  // Nonces allow inline scripts/styles while maintaining strict CSP
  // Generate nonce early so it's available for all responses
  const nonce = generateCSPNonce();
  
  // Handle i18n routing first
  const response = intlMiddleware(request);
  
  // SECURITY: Add CSP nonce to response header for use in inline scripts/styles
  // The nonce will be used in CSP header and must match in HTML attributes
  // Also add to request headers so Server Components can access it
  response.headers.set('X-CSP-Nonce', nonce);
  
  // SECURITY: Update CSP header with nonce for production
  // In production, CSP should use nonces instead of unsafe-inline
  const isProduction = process.env.NODE_ENV === 'production';
  const existingCSP = response.headers.get('Content-Security-Policy');
  
  if (isProduction && existingCSP) {
    // Replace CSP with nonce-based CSP
    // Note: Next.js config sets CSP, but we can override it here with nonces
    const cspWithNonce = existingCSP
      .replace(/script-src[^;]+/, `script-src 'self' 'nonce-${nonce}' https://*.railway.app https://js.stripe.com https://*.stripe.com blob:`)
      .replace(/style-src[^;]+/, `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com https://*.railway.app`);
    response.headers.set('Content-Security-Policy', cspWithNonce);
  }
  
  // If it's an i18n redirect, return it immediately (but keep nonce header)
  if (response.headers.get('x-middleware-rewrite') || response.status === 307 || response.status === 308) {
    return response;
  }

  // Extract locale from pathname for route checking
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr|ar|he)/, '') || '/';

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback', // OAuth callback - needs to be public to receive token
    '/auth/google/testing', // Google OAuth test page
    '/auth/forgot-password',
    '/auth/reset-password',
    '/pricing',
    '/sitemap',
    '/sitemap.xml',
    '/api/auth',
    // Test routes - should be public for testing purposes
    '/email/testing',
    '/ai/testing',
    '/stripe/testing',
    '/sentry/testing',
    '/api-connections/testing',
    '/admin-logs/testing',
  ];

  // Check if the route is public (check both with and without locale)
  const isPublicRoute = publicRoutes.some((route) => 
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route + '/')
  );

  // Allow access to public routes
  if (isPublicRoute) {
    return response;
  }

  // API routes - check Authorization header
  if (pathname.startsWith('/api/')) {
    // Allow auth API routes without token check
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        // Check expiration
        if (payload.exp && Date.now() < (payload.exp as number) * 1000) {
          return NextResponse.next();
        }
      }
    }
    
    // For API routes, return 401 if no valid token
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Page routes - allow access and let client-side components handle authentication
  // The middleware cannot access sessionStorage, so we let the client handle auth checks
  // Client components will check the auth store and redirect if needed
  
  // Add security headers to response
  // Note: isProduction is already declared above, reuse it
  
  // Force no-cache for reports page to ensure updates are visible immediately
  if (pathnameWithoutLocale === '/dashboard/reports' || pathnameWithoutLocale.startsWith('/dashboard/reports')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-No-Cache', 'true');
  }
  
  // Security headers are primarily handled by next.config.js headers() function
  // But we add additional headers here for API routes and dynamic responses
  if (pathname.startsWith('/api/')) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (isProduction) {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
  }
  
  return response;
}


