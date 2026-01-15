/**
 * Authentication Store
 * 
 * Zustand store for managing authentication state with persistence.
 * Handles user data, JWT tokens, and authentication status.
 * 
 * @module lib/store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TokenStorage } from './auth/tokenStorage';

/**
 * User type enum
 */
export type UserType = 'INDIVIDUAL' | 'COACH' | 'BUSINESS' | 'ADMIN';

/**
 * User interface representing authenticated user data
 * 
 * This is the format used in the Zustand store.
 * For API responses, use transformApiUserToStoreUser to convert from backend format.
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User email address */
  email: string;
  /** User display name */
  name: string;
  /** Whether the user account is active */
  is_active: boolean;
  /** Whether the user email is verified */
  is_verified: boolean;
  /** Whether the user has admin privileges */
  is_admin?: boolean;
  /** User type (Individual, Coach, Business, Admin) */
  user_type?: UserType;
  /** User avatar URL */
  avatar_url?: string;
  /** Account creation timestamp (ISO 8601) */
  created_at?: string;
  /** Last update timestamp (ISO 8601) */
  updated_at?: string;
}

/**
 * Authentication state interface
 */
interface AuthState {
  /** Current authenticated user or null if not authenticated */
  user: User | null;
  /** JWT access token or null if not authenticated */
  token: string | null;
  /** JWT refresh token or null if not available */
  refreshToken: string | null;
  /** 
   * Checks if user is currently authenticated (synchronous check)
   * @returns True if user is present in store
   * 
   * NOTE: This is a synchronous check that only verifies user presence in store.
   * For a complete check including httpOnly cookies, use checkAuthentication().
   */
  isAuthenticated: () => boolean;
  /** 
   * Checks authentication status including httpOnly cookies (async)
   * @returns Promise<boolean> - True if both user and tokens in cookies are present
   */
  checkAuthentication: () => Promise<boolean>;
  /** 
   * Logs in a user with tokens
   * @param user - User data
   * @param token - JWT access token
   * @param refreshToken - Optional JWT refresh token
   */
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  /** Logs out the current user and clears all tokens */
  logout: () => Promise<void>;
  /** 
   * Updates the current user data
   * @param user - Updated user data
   */
  setUser: (user: User) => void;
  /** 
   * Updates the access token
   * @param token - New JWT access token
   */
  setToken: (token: string) => Promise<void>;
  /** 
   * Updates the refresh token
   * @param refreshToken - New JWT refresh token
   */
  setRefreshToken: (refreshToken: string) => Promise<void>;
  /** Current error message or null */
  error: string | null;
  /** 
   * Sets or clears the error message
   * @param error - Error message or null to clear
   */
  setError: (error: string | null) => void;
}

/**
 * SECURITY: Tokens are no longer persisted in localStorage.
 * Tokens are stored in httpOnly cookies only, which cannot be accessed by JavaScript.
 * Only user data is persisted (not tokens) for UX purposes.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null, // Not used anymore - tokens are in httpOnly cookies
      refreshToken: null, // Not used anymore - tokens are in httpOnly cookies
      error: null,

      isAuthenticated: () => {
        // SECURITY: Synchronous check - only verifies user presence in store
        // For complete check including httpOnly cookies, use checkAuthentication()
        const state = get();
        return !!state.user;
      },

      checkAuthentication: async () => {
        // SECURITY: Complete async check including httpOnly cookies
        // This verifies both user in store AND tokens in httpOnly cookies
        const hasTokens = await TokenStorage.hasTokensInCookies();
        const state = get();
        return hasTokens && !!state.user;
      },

      login: async (user: User, _token: string, _refreshToken?: string) => {
        // SECURITY: Tokens are stored in httpOnly cookies by the backend during login
        // TokenStorage.setToken() is a no-op - backend handles cookie setting
        // Only persist user data (not tokens) for UX
        // Parameters _token and _refreshToken are kept for API compatibility but not used
        set({ user, token: null, refreshToken: null, error: null });
      },

      logout: async () => {
        await TokenStorage.removeTokens();
        set({ user: null, token: null, refreshToken: null, error: null });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: async (token: string) => {
        // Store token in httpOnly cookies only
        await TokenStorage.setToken(token);
        // Don't store token in Zustand (security)
        set({ token: null });
      },

      setRefreshToken: async (refreshToken: string) => {
        // Store refresh token in httpOnly cookies only
        const currentToken = get().token || '';
        await TokenStorage.setToken(currentToken, refreshToken);
        // Don't store refresh token in Zustand (security)
        set({ refreshToken: null });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'auth-storage',
      // SECURITY: Only persist user data, NOT tokens
      // Tokens are stored in httpOnly cookies only
      partialize: (state) => ({
        user: state.user,
        // Explicitly exclude tokens from persistence
        // token: state.token,
        // refreshToken: state.refreshToken,
      }),
    }
  )
);

