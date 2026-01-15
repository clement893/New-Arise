'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { TokenStorage } from '@/lib/auth/tokenStorage';
import { checkMySuperAdminStatus } from '@/lib/api/admin';
import { logger } from '@/lib/logger';
import { getErrorStatus } from '@/lib/errors';
import { useHydrated } from '@/hooks/useHydrated';

/**
 * Protected Route Component
 * 
 * Prevents unauthorized access to routes requiring authentication.
 * Automatically redirects to login if user is not authenticated.
 * Prevents flash of unauthenticated content during auth check.
 * 
 * @example
 * ```tsx
 * // Basic protection
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Admin-only route
 * <ProtectedRoute requireAdmin>
 *   <AdminPanel />
 * </ProtectedRoute>
 * ```
 */
interface ProtectedRouteProps {
  /** Child components to protect */
  children: ReactNode;
  /** Require admin privileges */
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, setUser } = useAuthStore();
  const isHydrated = useHydrated();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const checkingRef = useRef(false);
  const lastUserRef = useRef(user);
  const lastTokenRef = useRef(token);
  const lastPathnameRef = useRef<string>(pathname);

  useEffect(() => {
    // Wait for hydration to complete before checking auth
    if (!isHydrated) {
      return;
    }

    // If user changed, update refs but only reset if going from authenticated to unauthenticated
    const userChanged = lastUserRef.current !== user;
    const pathnameChanged = lastPathnameRef.current !== pathname;
    
    // Detect authentication state transitions
    // SECURITY: Tokens are in httpOnly cookies, so we check user only
    // Token check will be done asynchronously in checkAuth()
    const wasAuthenticated = !!lastUserRef.current;
    const isNowAuthenticated = !!user;
    
    if (userChanged) {
      lastUserRef.current = user;
      
      // Only reset if we lost authentication (not if we gained it)
      if (wasAuthenticated && !isNowAuthenticated) {
        setIsAuthorized(false);
        setIsChecking(true);
        checkingRef.current = false;
      }
    }
    
    // Update pathname ref
    if (pathnameChanged) {
      lastPathnameRef.current = pathname;
    }

    // Prevent multiple simultaneous checks
    if (checkingRef.current) {
      return;
    }

    // If already authorized and only pathname changed (navigation), skip check
    if (isAuthorized && isNowAuthenticated && !userChanged && pathnameChanged) {
      setIsChecking(false);
      return;
    }

    // If already authorized and we're still authenticated, don't check again
    if (isAuthorized && isNowAuthenticated && !userChanged) {
      setIsChecking(false);
      return;
    }

    const checkAuth = async () => {
      checkingRef.current = true;
      setIsChecking(true);
      
      // SECURITY: Tokens are in httpOnly cookies, so getToken() always returns null
      // We must use hasTokensInCookies() to check if tokens exist
      const hasTokensInCookies = typeof window !== 'undefined' 
        ? await TokenStorage.hasTokensInCookies() 
        : false;
      const currentUser = user;
      const hasUser = !!currentUser;
      
      // Check if we just logged in (to avoid premature redirects)
      const justLoggedIn = typeof window !== 'undefined' && sessionStorage.getItem('just_logged_in') === 'true';
      
      // If we have tokens in cookies but no user, try to fetch user from API
      // This handles the case where Zustand persist hasn't hydrated yet but tokens exist
      let fetchedUser = currentUser;
      if (hasTokensInCookies && !hasUser && typeof window !== 'undefined') {
        // If we just logged in, wait longer for store to hydrate
        const waitTime = justLoggedIn ? 300 : 100;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Re-check user after delay (store might have hydrated)
        const storeState = useAuthStore.getState();
        if (storeState.user) {
          fetchedUser = storeState.user;
          lastUserRef.current = storeState.user;
        } else {
          try {
            const { usersAPI } = await import('@/lib/api');
            const { transformApiUserToStoreUser } = await import('@/lib/auth/userTransform');
            const response = await usersAPI.getMe();
            if (response.data) {
              const userForStore = transformApiUserToStoreUser(response.data);
              setUser(userForStore);
              // Update refs to reflect the new user
              lastUserRef.current = userForStore;
              fetchedUser = userForStore;
            }
          } catch (err: unknown) {
            // If fetching user fails, log but don't block - might be network issue
            const statusCode = getErrorStatus(err);
            if (process.env.NODE_ENV === 'development') {
              logger.debug('Failed to fetch user in ProtectedRoute', {
                error: err instanceof Error ? err.message : String(err),
                statusCode,
                justLoggedIn
              });
            }
            // Only fail if it's an auth error (401/403), not server errors (500)
            // But check if we just logged in (token exists but user not yet in store)
            // In that case, wait a bit more before redirecting
            if (statusCode === 401 || statusCode === 403) {
              // Check if this might be a timing issue after login
              const tokenStillExists = TokenStorage.getToken();
              if (tokenStillExists) {
                // If we just logged in, wait even longer before giving up
                const additionalWaitTime = justLoggedIn ? 500 : 200;
                await new Promise(resolve => setTimeout(resolve, additionalWaitTime));
                const storeStateAfterWait = useAuthStore.getState();
                if (storeStateAfterWait.user) {
                  // User appeared, continue
                  fetchedUser = storeStateAfterWait.user;
                  lastUserRef.current = storeStateAfterWait.user;
                } else if (justLoggedIn) {
                  // Still no user but we just logged in - might be a server issue
                  // Don't redirect, just log and continue (user might appear later)
                  logger.warn('User not found after login, but continuing (might be server delay)', {
                    hasToken: !!tokenStillExists,
                    pathname
                  });
                  // Continue with token check - don't redirect yet
                } else {
                  // Still no user, token is likely invalid
                  if (typeof window !== 'undefined') {
                    TokenStorage.removeTokens();
                  }
                  checkingRef.current = false;
                  setIsChecking(false);
                  setIsAuthorized(false);
                  router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                  return;
                }
              } else {
                // Token is invalid, clear it and redirect
                if (typeof window !== 'undefined') {
                  TokenStorage.removeTokens();
                }
                checkingRef.current = false;
                setIsChecking(false);
                setIsAuthorized(false);
                router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
                return;
              }
            }
            // For other errors (500, network, etc.), continue with token check
          }
        }
      }
      
      // Final auth check with potentially fetched user
      // SECURITY: Check both user in store AND tokens in httpOnly cookies
      const finalHasUser = !!fetchedUser;
      const finalHasTokens = hasTokensInCookies;
      const isAuth = finalHasUser && finalHasTokens;
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('ProtectedRoute auth check', {
          hasTokensInCookies: finalHasTokens,
          hasUser: !!user,
          fetchedUser: !!fetchedUser,
          isAuth,
          pathname,
          isAuthorized,
          wasAuthenticated,
          isNowAuthenticated: isAuth
        });
      }
      
      // If we just became authenticated (transition from unauthenticated to authenticated),
      // authorize immediately without additional checks
      if (!wasAuthenticated && isNowAuthenticated) {
        logger.debug('User just authenticated, authorizing immediately', { pathname });
        setIsAuthorized(true);
        checkingRef.current = false;
        setIsChecking(false);
        return;
      }
      
      if (!isAuth) {
        logger.debug('Not authenticated, redirecting to login', { pathname });
        checkingRef.current = false;
        setIsChecking(false);
        setIsAuthorized(false);
        router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check admin privileges if required
      if (requireAdmin) {
        // Check if user is admin OR superadmin (use fetchedUser if available)
        const userForAdminCheck = fetchedUser || user;
        let isAdmin = userForAdminCheck?.is_admin || false;
        
        // If not admin, check if user is superadmin
        if (!isAdmin) {
          try {
            // SECURITY: Tokens are in httpOnly cookies, so apiClient will use them automatically
            // No need to pass token - checkMySuperAdminStatus will use cookies via apiClient
            logger.debug('Checking superadmin status', {
              hasTokensInCookies: finalHasTokens,
              userEmail: userForAdminCheck?.email,
              is_admin: userForAdminCheck?.is_admin
            });
            const status = await checkMySuperAdminStatus(); // No token needed - uses httpOnly cookies
            logger.debug('Superadmin status check result', {
              is_superadmin: status.is_superadmin,
              email: status.email,
              user_id: status.user_id,
              is_active: status.is_active,
              userEmail: userForAdminCheck?.email
            });
            isAdmin = status.is_superadmin === true;
            if (isAdmin) {
              logger.info('User is superadmin, granting admin access', { 
                email: status.email || userForAdminCheck?.email 
              });
            } else {
              logger.warn('User is not superadmin', { 
                userEmail: userForAdminCheck?.email,
                is_admin: userForAdminCheck?.is_admin,
                apiResponse: status
              });
            }
          } catch (err: unknown) {
            // If superadmin check fails with 401/422, tokens might be invalid or expired
            const statusCode = getErrorStatus(err);
            logger.warn('Superadmin check failed', {
              status: statusCode,
              hasTokensInCookies: finalHasTokens,
              error: err instanceof Error ? err.message : String(err),
              userEmail: userForAdminCheck?.email
            });
            
            if (statusCode === 401 || statusCode === 422) {
              // Authentication error - tokens may be invalid or expired
              // SECURITY: Tokens are in httpOnly cookies, apiClient should handle refresh automatically
              // If refresh fails, tokens are invalid - redirect to login
              logger.warn('Superadmin check failed with auth error, tokens may be invalid', {
                statusCode,
                hasTokensInCookies: finalHasTokens,
                userEmail: userForAdminCheck?.email
              });
              checkingRef.current = false;
              setIsChecking(false);
              setIsAuthorized(false);
              router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}&error=unauthorized`);
              return;
            } else if (statusCode === 403) {
              // 403 means user is authenticated but doesn't have permission
              // This shouldn't happen for check-my-superadmin-status endpoint, but handle it
              logger.warn('Access forbidden (403) - user authenticated but not superadmin', {
                userEmail: userForAdminCheck?.email,
                is_admin: userForAdminCheck?.is_admin
              });
              // Don't fall back to is_admin - 403 is definitive
              isAdmin = false;
            } else {
              // For network errors or other errors, log but allow fallback to is_admin
              // This handles cases where API is temporarily unavailable
              logger.warn('Superadmin check failed with non-auth error, using is_admin fallback', { 
                status: statusCode,
                error: err instanceof Error ? err.message : String(err),
                is_admin: userForAdminCheck?.is_admin
              });
              // Keep isAdmin as is (from is_admin field check above)
            }
          }
        }
        
        if (!isAdmin) {
          checkingRef.current = false;
          setIsChecking(false);
          setIsAuthorized(false);
          router.replace('/dashboard?error=unauthorized');
          return;
        }
      }

      // Authorize access
      setIsAuthorized(true);
      checkingRef.current = false;
      setIsChecking(false);
    };

    // Check immediately
    checkAuth();
  }, [isHydrated, user, token, requireAdmin, isAuthorized]);

  // Show loader during verification
  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

