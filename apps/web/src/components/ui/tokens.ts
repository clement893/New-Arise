/**
 * Design Tokens
 * Centralized design values using CSS variables from global theme
 * 
 * @deprecated This file is maintained for backward compatibility.
 * Use the centralized theme system instead:
 * ```ts
 * import { themeTokens } from '@/lib/theme';
 * const colors = themeTokens.colors;
 * ```
 * 
 * This file re-exports tokens from the centralized theme system.
 */

import { themeTokens } from '@/lib/theme';

/**
 * Color tokens using CSS variables from global theme
 * @deprecated Use themeTokens.colors from '@/lib/theme' instead
 */
export const colors = themeTokens.colors;

// Maintain backward compatibility but show deprecation warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn(
    '[DEPRECATED] Importing from "@/components/ui/tokens" is deprecated. ' +
    'Use "@/lib/theme" instead: import { themeTokens } from "@/lib/theme";'
  );
}

/**
 * Spacing tokens using CSS variables from global theme
 * @deprecated Use themeTokens.spacing from '@/lib/theme' instead
 */
export const spacing = themeTokens.spacing;

/**
 * Border radius tokens using CSS variables from global theme
 * @deprecated Use themeTokens.borderRadius from '@/lib/theme' instead
 */
export const borderRadius = themeTokens.borderRadius;

/**
 * Typography tokens using CSS variables from global theme
 * @deprecated Use themeTokens.typography from '@/lib/theme' instead
 */
export const typography = themeTokens.typography;

/**
 * Shadow tokens using CSS variables from global theme
 * @deprecated Use themeTokens.shadows from '@/lib/theme' instead
 */
export const shadows = themeTokens.shadows;

/**
 * Breakpoint tokens (for reference, actual breakpoints are in Tailwind config)
 * @deprecated Use themeTokens.breakpoints from '@/lib/theme' instead
 */
export const breakpoints = themeTokens.breakpoints;

/**
 * Z-index tokens for layering
 * @deprecated Use themeTokens.zIndex from '@/lib/theme' instead
 */
export const zIndex = themeTokens.zIndex;

/**
 * Transition tokens
 * @deprecated Use themeTokens.transitions from '@/lib/theme' instead
 */
export const transitions = themeTokens.transitions;

/**
 * Helper function to get CSS variable value
 * @deprecated Use getTokenValue from '@/lib/theme' instead
 */
export { getTokenValue } from '@/lib/theme';

/**
 * Helper function to set CSS variable value
 * @deprecated Use setTokenValue from '@/lib/theme' instead
 */
export { setTokenValue } from '@/lib/theme';


