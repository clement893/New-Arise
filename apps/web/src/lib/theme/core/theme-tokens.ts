/**
 * Theme Tokens
 * Generated tokens from the centralized theme configuration
 * 
 * This file exports the theme tokens for use throughout the application.
 * Tokens are generated from theme-config.ts to ensure consistency.
 */

import { getThemeTokens } from './theme-config';

/**
 * Theme tokens
 * Generated from the centralized theme configuration
 * 
 * @example
 * ```ts
 * import { themeTokens } from '@/lib/theme';
 * const primaryColor = themeTokens.colors.primary.base;
 * ```
 */
export const themeTokens = getThemeTokens();

/**
 * Get a token value from a CSS variable
 * 
 * @param token - CSS variable token (e.g., 'var(--color-primary)')
 * @returns The computed value or the token string if not found
 */
export function getTokenValue(token: string): string {
  if (typeof window === 'undefined') {
    return token;
  }
  const root = document.documentElement;
  // Extract CSS variable name from token
  const varName = token.replace(/var\(--([^)]+)\)/, '$1');
  const value = getComputedStyle(root).getPropertyValue(`--${varName}`).trim();
  return value || token;
}

/**
 * Set a token value as a CSS variable
 * 
 * @param varName - CSS variable name (e.g., 'color-primary' without --)
 * @param value - Value to set
 */
export function setTokenValue(varName: string, value: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  const root = document.documentElement;
  root.style.setProperty(`--${varName}`, value);
}
