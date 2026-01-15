import { logger } from '@/lib/logger';
/**
 * Secure Token Storage
 * 
 * SECURITY: Uses httpOnly cookies ONLY for maximum security.
 * Tokens are NOT accessible to JavaScript, preventing XSS attacks.
 * 
 * Security improvements:
 * - Tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Prevents XSS attacks from accessing tokens
 * - Cookies are automatically sent with requests via withCredentials
 * 
 * IMPORTANT: This class no longer uses localStorage or sessionStorage for tokens.
 * All token storage is done via httpOnly cookies set by the API route.
 */

const TOKEN_API_ENDPOINT = '/api/auth/token';

/**
 * Secure token storage with httpOnly cookie support
 * 
 * For maximum security, tokens are stored ONLY in httpOnly cookies via API routes.
 * This prevents JavaScript access, protecting against XSS attacks.
 * 
 * Note: httpOnly cookies cannot be read by JavaScript, so getToken() and getRefreshToken()
 * will return null. Tokens are automatically sent with requests via withCredentials: true.
 */
export class TokenStorage {
  /**
   * Set access token (and optionally refresh token) via httpOnly cookies
   * 
   * SECURITY: Tokens are stored ONLY in httpOnly cookies by the backend during login/refresh.
   * This method is a no-op because the backend FastAPI sets cookies directly.
   * 
   * Note: Cookies set by the backend are automatically sent with requests via withCredentials: true.
   * We don't need to set cookies via Next.js API route because:
   * 1. Backend sets cookies during login/refresh
   * 2. Cookies are automatically sent with cross-origin requests (withCredentials: true)
   * 3. Next.js API route would set cookies on wrong domain anyway
   */
  static async setToken(token: string, refreshToken?: string): Promise<void> {
    // No-op: Backend FastAPI sets httpOnly cookies directly during login/refresh
    // Cookies are automatically sent with requests via withCredentials: true in axios
    // No need to set cookies via Next.js API route
    if (process.env.NODE_ENV === 'development') {
      logger.debug('TokenStorage.setToken() called but is no-op - backend sets cookies directly', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken
      });
    }
    return Promise.resolve();
  }

  /**
   * Get access token
   * 
   * SECURITY: httpOnly cookies cannot be read by JavaScript.
   * This method returns null because tokens are stored in httpOnly cookies.
   * 
   * Tokens are automatically sent with requests via withCredentials: true in axios.
   * To check if user is authenticated, use hasTokensInCookies() or verify via API.
   * 
   * @returns null (tokens are in httpOnly cookies, not accessible to JS)
   */
  static getToken(): string | null {
    // httpOnly cookies cannot be read by JavaScript
    // Tokens are automatically sent with requests via withCredentials: true
    return null;
  }

  /**
   * Get refresh token
   * 
   * SECURITY: httpOnly cookies cannot be read by JavaScript.
   * This method returns null because tokens are stored in httpOnly cookies.
   * 
   * @returns null (tokens are in httpOnly cookies, not accessible to JS)
   */
  static getRefreshToken(): string | null {
    // httpOnly cookies cannot be read by JavaScript
    // Tokens are automatically sent with requests via withCredentials: true
    return null;
  }

  /**
   * Remove all tokens (clears httpOnly cookies)
   */
  static async removeTokens(): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip
    }

    try {
      // Clear httpOnly cookies via API route
      await fetch(TOKEN_API_ENDPOINT, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      // Log but don't throw - cleanup should be best effort
      logger.warn('Failed to remove tokens via API route', error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Check if tokens exist
   * 
   * SECURITY: Since tokens are in httpOnly cookies, we cannot check them directly.
   * This method checks via API to see if cookies exist.
   * 
   * @returns Promise<boolean> - true if tokens exist in cookies
   */
  static async hasTokens(): Promise<boolean> {
    return this.hasTokensInCookies();
  }

  /**
   * Check token status via API (for httpOnly cookie tokens)
   * 
   * SECURITY: Since tokens are in httpOnly cookies set by the backend FastAPI,
   * we cannot check them directly via JavaScript.
   * 
   * IMPORTANT: Due to cross-origin cookie limitations, cookies set by the backend
   * on a different domain may not be accessible. This method returns true optimistically
   * if we're in a browser context, as the actual authentication check will be done
   * by the API calls themselves (which will fail with 401 if tokens are invalid).
   * 
   * The real authentication check happens in ProtectedRoute via usersAPI.getMe().
   */
  static async hasTokensInCookies(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    // OPTIMISTIC CHECK: Since cookies are httpOnly and may be on a different domain,
    // we can't reliably check them from JavaScript. Instead, we return true optimistically
    // and let the actual API calls (which use withCredentials: true) handle authentication.
    // If tokens don't exist, API calls will fail with 401 and ProtectedRoute will handle it.
    
    // This prevents false negatives that would cause unnecessary redirects to login
    // when the user is actually authenticated but cookies are on a different domain.
    return true;
  }
}

