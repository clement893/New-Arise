/**
 * Global Theme Provider - Fetches and applies the active theme from the backend.
 */
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getActiveTheme } from '@/lib/api/theme';
import { logger } from '@/lib/logger';
import type { ThemeConfigResponse, ThemeConfig } from '@modele/types';
import { generateColorShades, generateRgb } from './color-utils';

interface GlobalThemeContextType {
  theme: ThemeConfigResponse | null;
  isLoading: boolean;
  error: Error | null;
  refreshTheme: () => Promise<void>;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(
  undefined
);

interface GlobalThemeProviderProps {
  children: ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfigResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTheme = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const activeTheme = await getActiveTheme();
      setTheme(activeTheme);
      applyThemeConfig(activeTheme.config);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load theme');
      // Only log error if it's not a network error (backend not available)
      if (!error.message.includes('Backend not available')) {
        setError(error);
        logger.error('Failed to fetch global theme', error);
      } else {
        // Backend not available - use default theme silently
        logger.warn('Backend not available, using default theme');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeConfig = (config: ThemeConfig) => {
    // Apply CSS variables to document root
    const root = document.documentElement;
    
    // Generate color shades from base colors
    if (config.primary_color) {
      const primaryShades = generateColorShades(config.primary_color);
      Object.entries(primaryShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-primary-${shade}`, color);
        if (shade === '500') {
          root.style.setProperty(`--color-primary-rgb`, generateRgb(color));
        }
      });
    }
    
    if (config.secondary_color) {
      const secondaryShades = generateColorShades(config.secondary_color);
      Object.entries(secondaryShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-secondary-${shade}`, color);
        if (shade === '500') {
          root.style.setProperty(`--color-secondary-rgb`, generateRgb(color));
        }
      });
    }
    
    if (config.danger_color) {
      const dangerShades = generateColorShades(config.danger_color);
      Object.entries(dangerShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-danger-${shade}`, color);
        if (shade === '500') {
          root.style.setProperty(`--color-danger-rgb`, generateRgb(color));
        }
      });
    }
    
    if (config.warning_color) {
      const warningShades = generateColorShades(config.warning_color);
      Object.entries(warningShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-warning-${shade}`, color);
        if (shade === '500') {
          root.style.setProperty(`--color-warning-rgb`, generateRgb(color));
        }
      });
    }
    
    if (config.info_color) {
      const infoShades = generateColorShades(config.info_color);
      Object.entries(infoShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-info-${shade}`, color);
      });
    }
    
    if (config.success_color) {
      // Success colors use secondary shades, but we can also generate specific ones
      const successShades = generateColorShades(config.success_color);
      Object.entries(successShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-success-${shade}`, color);
        if (shade === '500') {
          root.style.setProperty(`--color-success-rgb`, generateRgb(color));
        }
      });
    }
    
    // Apply fonts
    if (config.font_family) {
      root.style.setProperty('--font-family', `${config.font_family}, sans-serif`);
      root.style.setProperty('--font-family-heading', `${config.font_family}, sans-serif`);
      root.style.setProperty('--font-family-subheading', `${config.font_family}, sans-serif`);
      // Apply to body
      if (typeof document !== 'undefined') {
        document.body.style.fontFamily = `var(--font-family), sans-serif`;
      }
    }
    
    // Apply border radius
    if (config.border_radius) {
      root.style.setProperty('--border-radius', config.border_radius);
    }
    
    // Update status colors to use theme colors
    root.style.setProperty('--color-status-todo', `var(--color-primary-500)`);
    root.style.setProperty('--color-status-in-progress', `var(--color-warning-500)`);
    root.style.setProperty('--color-status-done', `var(--color-secondary-500)`);
    root.style.setProperty('--color-status-error', `var(--color-danger-500)`);
    
    // Update chart colors
    root.style.setProperty('--color-chart-default', `var(--color-primary-500)`);
    root.style.setProperty('--color-chart-success', `var(--color-secondary-500)`);
    root.style.setProperty('--color-chart-warning', `var(--color-warning-500)`);
    root.style.setProperty('--color-chart-danger', `var(--color-danger-500)`);
    
    // Update text link color to use primary color
    root.style.setProperty('--color-text-link', `var(--color-primary-500)`);
    root.style.setProperty('--color-text-link-rgb', `var(--color-primary-rgb)`);
    
    // Update error and success colors
    root.style.setProperty('--color-error', `var(--color-danger-500)`);
    root.style.setProperty('--color-error-rgb', `var(--color-danger-rgb)`);
    root.style.setProperty('--color-success', `var(--color-secondary-500)`);
    root.style.setProperty('--color-success-rgb', `var(--color-secondary-rgb)`);
  };

  useEffect(() => {
    fetchTheme();
    
    // Refresh theme every 5 minutes to catch updates
    const interval = setInterval(fetchTheme, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshTheme = async () => {
    await fetchTheme();
  };

  return (
    <GlobalThemeContext.Provider
      value={{
        theme,
        isLoading,
        error,
        refreshTheme,
      }}
    >
      {children}
    </GlobalThemeContext.Provider>
  );
}

export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error('useGlobalTheme must be used within a GlobalThemeProvider');
  }
  return context;
}

