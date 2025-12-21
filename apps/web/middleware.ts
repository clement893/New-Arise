/**
 * Next.js Middleware
 * Handles password protection
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PASSWORD_COOKIE = 'template_auth';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Routes publiques qui ne nÃ©cessitent pas d'authentification
  const publicRoutes = [
    '/auth/signin',
    '/auth/signout',
    '/auth/error',
    '/auth/callback',
    '/api/auth',
    '/api/public',
    '/api/auth/check-password',
    '/login-password',
  ];

  // VÃ©rifier si la route est publique
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Si c'est une route publique, laisser passer
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // VÃ©rifier l'authentification par mot de passe
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);

  const isPasswordAuthenticated = cookies[PASSWORD_COOKIE] === 'authenticated';

  if (!isPasswordAuthenticated) {
    // Rediriger vers la page de login avec mot de passe
    const loginUrl = new URL('/login-password', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // CrÃ©er la rÃ©ponse avec les headers de performance
  const response = NextResponse.next();

  // Headers de performance
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Cache pour les assets statiques
  if (pathname.startsWith('/_next/static')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // Cache pour les images
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};