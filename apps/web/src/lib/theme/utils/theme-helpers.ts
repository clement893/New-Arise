/**
 * Theme Helpers
 * Utility functions for working with theme values and tokens
 */

import type { ThemeConfig } from '@modele/types';
import { themeTokens } from '../core/theme-tokens';

/**
 * Get a color value from the theme
 * 
 * @param colorPath - Path to the color (e.g., 'primary.base', 'arise.gold')
 * @returns The color value or undefined if not found
 */
export function getThemeColor(colorPath: string): string | undefined {
  const parts = colorPath.split('.');
  let value: any = themeTokens.colors;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part as keyof typeof value];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * Get a spacing value from the theme
 * 
 * @param spacingKey - Spacing key (e.g., 'sm', 'md', 'lg')
 * @returns The spacing value or undefined if not found
 */
export function getThemeSpacing(spacingKey: string): string | undefined {
  return themeTokens.spacing[spacingKey as keyof typeof themeTokens.spacing];
}

/**
 * Get a typography value from the theme
 * 
 * @param path - Typography path (e.g., 'fontSize.base', 'fontWeight.bold')
 * @returns The typography value or undefined if not found
 */
export function getThemeTypography(path: string): string | undefined {
  const parts = path.split('.');
  let value: any = themeTokens.typography;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part as keyof typeof value];
    } else {
      return undefined;
    }
  }
  
  return typeof value === 'string' ? value : undefined;
}

/**
 * Check if a theme config has a specific property
 * 
 * @param config - Theme configuration
 * @param path - Property path (e.g., 'colors.primary', 'typography.fontSize')
 * @returns True if the property exists
 */
export function hasThemeProperty(config: ThemeConfig, path: string): boolean {
  const parts = path.split('.');
  let value: any = config;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part as keyof typeof value];
    } else {
      return false;
    }
  }
  
  return value !== undefined;
}

/**
 * Get a nested property from theme config
 * 
 * @param config - Theme configuration
 * @param path - Property path (e.g., 'colors.primary', 'typography.fontSize.base')
 * @returns The property value or undefined if not found
 */
export function getThemeProperty(config: ThemeConfig, path: string): any {
  const parts = path.split('.');
  let value: any = config;
  
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part as keyof typeof value];
    } else {
      return undefined;
    }
  }
  
  return value;
}
