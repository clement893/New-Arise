import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth/jwt';

/**
 * Middleware to protect authenticated routes
 * Verifies JWT token presence and validity before allowing access
 * 
 * Security improvements:
 * - Verifies JWT tokens server-side
 * - Checks token expiration
 * - Validates token signature
 * - Supports both cookie-based and header-based authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback', // OAuth callback - needs to be public to receive token
    '/auth/forgot-password',
    '/auth/reset-password',
    '/pricing',
    '/sitemap',
    '/sitemap.xml',
    '/api/auth',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
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

  // Page routes - check httpOnly cookie
  const tokenCookie = request.cookies.get('auth-token');
  
  if (tokenCookie) {
    const payload = await verifyToken(tokenCookie.value);
    
    if (payload) {
      // Check if token is expired
      if (payload.exp && Date.now() >= (payload.exp as number) * 1000) {
        // Token expired, redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        loginUrl.searchParams.set('error', 'session_expired');
        return NextResponse.redirect(loginUrl);
      }
      
      // Token is valid, allow access
      // Add user info to headers for Server Components to use
      const response = NextResponse.next();
      response.headers.set('x-user-id', payload.sub || '');
      return response;
    }
  }

  // No valid token found, redirect to login
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

// Configure the routes on which the middleware applies
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

