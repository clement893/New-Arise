/**
 * Centralized Theme Configuration
 * Single source of truth for all theme values and tokens
 * 
 * This file centralizes the theme configuration and provides utilities
 * to access theme values throughout the application.
 */

import { DEFAULT_THEME_CONFIG } from '../default-theme-config';
import type { ThemeConfig } from '@modele/types';

/**
 * Central theme configuration
 * Uses the default theme config as the base, but can be extended
 * to support runtime theme changes from the API
 */
export const themeConfig: ThemeConfig = {
  ...DEFAULT_THEME_CONFIG,
} as const;

/**
 * Get theme configuration
 * Returns the centralized theme configuration
 */
export function getThemeConfig(): ThemeConfig {
  return themeConfig;
}

/**
 * Get theme tokens from configuration
 * Generates tokens from the theme config for use in components
 */
export function getThemeTokens() {
  const config = getThemeConfig();
  
  return {
    colors: {
      primary: {
        base: `var(--color-primary, ${config.primary_color})`,
        hover: 'var(--color-primary-hover, var(--color-primary))',
        focus: 'var(--color-primary-focus, var(--color-primary))',
        foreground: 'var(--color-primary-foreground, #ffffff)',
      },
      secondary: {
        base: `var(--color-secondary, ${config.secondary_color})`,
        hover: 'var(--color-secondary-hover, var(--color-secondary))',
        foreground: 'var(--color-secondary-foreground, #ffffff)',
      },
      accent: {
        base: `var(--color-accent, #f59e0b)`,
        hover: 'var(--color-accent-hover, var(--color-accent))',
        foreground: 'var(--color-accent-foreground, #000000)',
      },
      background: {
        base: `var(--color-background, ${config.colors?.background || '#ffffff'})`,
        muted: `var(--color-muted, ${config.colors?.muted || '#f3f4f6'})`,
      },
      foreground: {
        base: `var(--color-foreground, ${config.colors?.foreground || '#000000'})`,
        muted: `var(--color-muted-foreground, ${config.colors?.mutedForeground || '#6b7280'})`,
      },
      border: `var(--color-border, ${config.colors?.border || '#e5e7eb'})`,
      input: `var(--color-input, ${config.colors?.input || '#ffffff'})`,
      ring: `var(--color-ring, ${config.colors?.ring || config.primary_color})`,
      destructive: {
        base: `var(--color-destructive, ${config.danger_color})`,
        foreground: 'var(--color-destructive-foreground, #ffffff)',
      },
      success: {
        base: `var(--color-success, ${config.success_color})`,
        foreground: 'var(--color-success-foreground, #ffffff)',
      },
      warning: {
        base: `var(--color-warning, ${config.warning_color})`,
        foreground: 'var(--color-warning-foreground, #000000)',
      },
      info: {
        base: `var(--color-info, ${config.info_color})`,
        foreground: 'var(--color-info-foreground, #ffffff)',
      },
      // ARISE Brand Colors
      arise: {
        deepTeal: `var(--color-arise-deep-teal, ${config.colors?.ariseDeepTeal || '#0A3A40'})`,
        deepTealAlt: `var(--color-arise-deep-teal-alt, ${config.colors?.ariseDeepTealAlt || '#1B5E6B'})`,
        gold: `var(--color-arise-gold, ${config.colors?.ariseGold || '#D4AF37'})`,
        goldAlt: `var(--color-arise-gold-alt, ${config.colors?.ariseGoldAlt || '#F4B860'})`,
        darkGray: `var(--color-arise-dark-gray, ${config.colors?.ariseDarkGray || '#2e2e2e'})`,
        lightBeige: `var(--color-arise-light-beige, ${config.colors?.ariseLightBeige || '#F5F5DC'})`,
        beige: `var(--color-arise-beige, ${config.colors?.ariseBeige || '#E9E4D4'})`,
        textDark: `var(--color-arise-text-dark, ${config.colors?.ariseTextDark || '#1a202c'})`,
        textLight: `var(--color-arise-text-light, ${config.colors?.ariseTextLight || '#ffffff'})`,
      },
    },
    spacing: {
      xs: `var(--spacing-xs, ${config.spacing?.xs || '4px'})`,
      sm: `var(--spacing-sm, ${config.spacing?.sm || '8px'})`,
      md: `var(--spacing-md, ${config.spacing?.md || '16px'})`,
      lg: `var(--spacing-lg, ${config.spacing?.lg || '24px'})`,
      xl: `var(--spacing-xl, ${config.spacing?.xl || '32px'})`,
      '2xl': `var(--spacing-2xl, ${config.spacing?.['2xl'] || '48px'})`,
      '3xl': `var(--spacing-3xl, ${config.spacing?.['3xl'] || '64px'})`,
      unit: `var(--spacing-unit, ${config.spacing?.unit || '8px'})`,
    },
    borderRadius: {
      none: `var(--border-radius-none, ${config.borderRadius?.none || '0'})`,
      sm: `var(--border-radius-sm, ${config.borderRadius?.sm || '2px'})`,
      base: `var(--border-radius-base, ${config.borderRadius?.base || '4px'})`,
      md: `var(--border-radius-md, ${config.borderRadius?.md || '6px'})`,
      lg: `var(--border-radius-lg, ${config.borderRadius?.lg || '8px'})`,
      xl: `var(--border-radius-xl, ${config.borderRadius?.xl || '12px'})`,
      '2xl': `var(--border-radius-2xl, ${config.borderRadius?.['2xl'] || '16px'})`,
      full: `var(--border-radius-full, ${config.borderRadius?.full || '9999px'})`,
    },
    typography: {
      fontFamily: {
        sans: `var(--typography-font-family-sans, ${config.typography?.fontFamily || 'Inter, system-ui, sans-serif'})`,
        mono: `var(--typography-font-family-mono, ${config.typography?.fontFamilyMono || 'Fira Code, monospace'})`,
        heading: `var(--typography-font-family-heading, ${config.typography?.fontFamilyHeading || config.typography?.fontFamily || 'Inter, system-ui, sans-serif'})`,
        subheading: `var(--typography-font-family-subheading, ${config.typography?.fontFamilySubheading || config.typography?.fontFamily || 'Inter, system-ui, sans-serif'})`,
      },
      fontSize: {
        xs: `var(--typography-font-size-xs, ${config.typography?.fontSize?.xs || '12px'})`,
        sm: `var(--typography-font-size-sm, ${config.typography?.fontSize?.sm || '14px'})`,
        base: `var(--typography-font-size-base, ${config.typography?.fontSize?.base || '16px'})`,
        lg: `var(--typography-font-size-lg, ${config.typography?.fontSize?.lg || '18px'})`,
        xl: `var(--typography-font-size-xl, ${config.typography?.fontSize?.xl || '20px'})`,
        '2xl': `var(--typography-font-size-2xl, ${config.typography?.fontSize?.['2xl'] || '24px'})`,
        '3xl': `var(--typography-font-size-3xl, ${config.typography?.fontSize?.['3xl'] || '30px'})`,
        '4xl': `var(--typography-font-size-4xl, ${config.typography?.fontSize?.['4xl'] || '36px'})`,
      },
      fontWeight: {
        normal: `var(--typography-font-weight-normal, ${(config.typography?.fontWeight as Record<string, string | number> | undefined)?.['normal'] || '400'})`,
        medium: `var(--typography-font-weight-medium, ${(config.typography?.fontWeight as Record<string, string | number> | undefined)?.['medium'] || '500'})`,
        semibold: `var(--typography-font-weight-semibold, ${(config.typography?.fontWeight as Record<string, string | number> | undefined)?.['semibold'] || '600'})`,
        bold: `var(--typography-font-weight-bold, ${(config.typography?.fontWeight as Record<string, string | number> | undefined)?.['bold'] || '700'})`,
      },
      lineHeight: {
        tight: `var(--typography-line-height-tight, ${config.typography?.lineHeight?.tight || '1.25'})`,
        normal: `var(--typography-line-height-normal, ${config.typography?.lineHeight?.normal || '1.5'})`,
        relaxed: `var(--typography-line-height-relaxed, ${config.typography?.lineHeight?.relaxed || '1.75'})`,
      },
    },
    shadows: {
      sm: `var(--shadow-sm, ${config.shadow?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)'})`,
      base: `var(--shadow-base, ${config.shadow?.base || '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'})`,
      md: `var(--shadow-md, ${config.shadow?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'})`,
      lg: `var(--shadow-lg, ${config.shadow?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'})`,
      xl: `var(--shadow-xl, ${config.shadow?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'})`,
    },
    breakpoints: {
      sm: `var(--breakpoint-sm, ${config.breakpoint?.sm || '640px'})`,
      md: `var(--breakpoint-md, ${config.breakpoint?.md || '768px'})`,
      lg: `var(--breakpoint-lg, ${config.breakpoint?.lg || '1024px'})`,
      xl: `var(--breakpoint-xl, ${config.breakpoint?.xl || '1280px'})`,
      '2xl': `var(--breakpoint-2xl, ${config.breakpoint?.['2xl'] || '1536px'})`,
    },
    zIndex: {
      dropdown: 1000,
      sticky: 1020,
      fixed: 1030,
      modalBackdrop: 1040,
      modal: 1050,
      popover: 1060,
      tooltip: 1070,
    },
    transitions: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  };
}
