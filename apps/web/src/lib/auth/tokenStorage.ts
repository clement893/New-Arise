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
   * SECURITY: Tokens are stored ONLY in httpOnly cookies, not in localStorage/sessionStorage.
   * This prevents XSS attacks from accessing tokens.
   */
  static async setToken(token: string, refreshToken?: string): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip
    }

    try {
      // Set tokens via API route (httpOnly cookies only)
      const response = await fetch(TOKEN_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: token, refreshToken }),
        credentials: 'include', // Important: include cookies
      });

      if (!response.ok) {
        throw new Error(`Failed to set tokens: ${response.statusText}`);
      }
    } catch (error) {
      logger.error('Failed to set token via API route', error instanceof Error ? error : new Error(String(error)));
      throw error; // Fail fast - tokens must be set securely
    }
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
   * This is the secure way to check if tokens exist, since httpOnly cookies
   * cannot be read by JavaScript.
   */
  static async hasTokensInCookies(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const response = await fetch(TOKEN_API_ENDPOINT, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return data.hasToken === true || data.hasRefreshToken === true;
    } catch (error) {
      return false;
    }
  }
}

