/**
 * Theme System - Centralized Entry Point
 * 
 * This is the single entry point for all theme-related imports.
 * Use this file to import theme configuration, tokens, and utilities.
 * 
 * @example
 * ```ts
 * import { themeConfig, themeTokens, getThemeColor } from '@/lib/theme';
 * ```
 */

// Core configuration and tokens
export { themeConfig, getThemeConfig, getThemeTokens } from './core/theme-config';
export { themeTokens, getTokenValue, setTokenValue } from './core/theme-tokens';

// Types
export type { ThemeConfig, Theme, ThemeConfigResponse } from '@modele/types';

// Application
export { applyThemeConfigDirectly } from './apply-theme-config';
export { GlobalThemeProvider, useGlobalTheme } from './global-theme-provider';

// Utilities
export {
  getThemeColor,
  getThemeSpacing,
  getThemeTypography,
  hasThemeProperty,
  getThemeProperty,
} from './utils/theme-helpers';

// Default config (for compatibility)
export { DEFAULT_THEME_CONFIG } from './default-theme-config';
