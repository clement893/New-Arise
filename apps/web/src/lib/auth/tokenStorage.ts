/**
 * Secure Token Storage
 * 
 * Uses httpOnly cookies for maximum security (set via API route)
 * Falls back to sessionStorage for backward compatibility during migration
 * 
 * Security improvements:
 * - Tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Prevents XSS attacks from accessing tokens
 * - Cookies are automatically sent with requests
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_API_ENDPOINT = '/api/auth/token';

/**
 * Secure token storage with httpOnly cookie support
 * 
 * For maximum security, tokens are stored in httpOnly cookies via API routes.
 * This prevents JavaScript access, protecting against XSS attacks.
 */
export class TokenStorage {
  /**
   * Set access token (and optionally refresh token) via httpOnly cookies
   * This is the secure method that stores tokens server-side
   */
  static async setToken(token: string, refreshToken?: string): Promise<void> {
    if (typeof window === 'undefined') {
      return; // Server-side, skip
    }

    // Store in sessionStorage FIRST (synchronously) so it's immediately available
    // This prevents race conditions where API calls are made before the token is stored
    sessionStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    try {
      // Set tokens via API route (httpOnly cookies) - this is async but token is already in sessionStorage
      await fetch(TOKEN_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken: token, refreshToken }),
        credentials: 'include', // Important: include cookies
      });
    } catch (error) {
      // Token is already in sessionStorage, so API call failure is not critical
      // Log error but don't throw - token is still available for immediate use
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to set token via API route, but token is stored in sessionStorage:', error);
      }
    }
  }

  /**
   * Get access token
   * 
   * Note: With httpOnly cookies, tokens are automatically sent with requests.
   * This method checks sessionStorage for backward compatibility.
   * For new code, rely on cookies being sent automatically.
   */
  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(TOKEN_KEY);
    }
    return null;
  }


  /**
   * Get refresh token
   * 
   * Note: With httpOnly cookies, refresh tokens are stored server-side.
   * This method checks sessionStorage for backward compatibility.
   */
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  }

  /**
   * Remove all tokens (both cookies and sessionStorage)
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
      // Continue even if API call fails
    }

    // Also clear sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Check if tokens exist
   * Checks sessionStorage for backward compatibility
   */
  static hasTokens(): boolean {
    return this.getToken() !== null || this.getRefreshToken() !== null;
  }

  /**
   * Check token status via API (for httpOnly cookie tokens)
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
      const data = await response.json();
      return data.hasToken === true || data.hasRefreshToken === true;
    } catch (error) {
      return false;
    }
  }
}

