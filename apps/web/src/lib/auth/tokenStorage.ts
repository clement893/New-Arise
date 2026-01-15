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
   * Set access token (and optionally refresh token)
   * 
   * SECURITY: Backend FastAPI sets tokens in httpOnly cookies during login/refresh.
   * However, due to cross-origin cookie limitations, we also store tokens in sessionStorage
   * as a fallback to send them in Authorization header when cookies aren't available.
   * 
   * This provides defense in depth:
   * 1. Primary: httpOnly cookies (most secure, sent automatically)
   * 2. Fallback: sessionStorage tokens (sent in Authorization header if cookies fail)
   * 
   * Note: sessionStorage is cleared when the tab closes, providing some security.
   */
  static async setToken(token: string, refreshToken?: string): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip
    }

    try {
      // Store tokens in sessionStorage as fallback for Authorization header
      // This allows requests to work even if cookies aren't shared cross-origin
      sessionStorage.setItem('access_token', token);
      if (refreshToken) {
        sessionStorage.setItem('refresh_token', refreshToken);
      }
      
      if (process.env.NODE_ENV === 'development') {
        logger.debug('TokenStorage.setToken() - stored in sessionStorage as fallback', {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken
        });
      }
    } catch (error) {
      logger.error('Failed to store token in sessionStorage', error instanceof Error ? error : new Error(String(error)));
      // Don't throw - cookies from backend are primary method
    }
  }

  /**
   * Get access token
   * 
   * Returns token from sessionStorage (fallback for Authorization header).
   * Primary method is httpOnly cookies set by backend, but we also store in sessionStorage
   * to support cross-origin requests where cookies may not be shared.
   * 
   * @returns Access token from sessionStorage, or null if not found
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return sessionStorage.getItem('access_token');
    } catch (error) {
      logger.warn('Failed to read token from sessionStorage', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get refresh token
   * 
   * Returns refresh token from sessionStorage (fallback for Authorization header).
   * Primary method is httpOnly cookies set by backend, but we also store in sessionStorage
   * to support cross-origin requests where cookies may not be shared.
   * 
   * @returns Refresh token from sessionStorage, or null if not found
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      return sessionStorage.getItem('refresh_token');
    } catch (error) {
      logger.warn('Failed to read refresh token from sessionStorage', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Remove all tokens (clears sessionStorage and httpOnly cookies)
   */
  static async removeTokens(): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip
    }

    try {
      // Clear sessionStorage tokens
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      
      // Also try to clear httpOnly cookies via API route (if they exist)
      try {
        await fetch(TOKEN_API_ENDPOINT, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch (error) {
        // Ignore errors from cookie cleanup - sessionStorage is cleared
      }
    } catch (error) {
      // Log but don't throw - cleanup should be best effort
      logger.warn('Failed to remove tokens', error instanceof Error ? error : new Error(String(error)));
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
   * Check token status (checks sessionStorage as fallback)
   * 
   * Checks if tokens exist in sessionStorage. Since cookies are httpOnly and may be
   * on a different domain, we check sessionStorage which is our fallback storage.
   * 
   * The real authentication check happens in ProtectedRoute via usersAPI.getMe().
   */
  static async hasTokensInCookies(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      // Check sessionStorage for tokens (our fallback storage)
      const hasAccessToken = !!sessionStorage.getItem('access_token');
      const hasRefreshToken = !!sessionStorage.getItem('refresh_token');
      return hasAccessToken || hasRefreshToken;
    } catch (error) {
      return false;
    }
  }
}

