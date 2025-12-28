/**
 * Simple Dark Mode Hook
 * Dark mode follows system preference by default, or user preference if set
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Get current theme mode from localStorage (user preference)
 * Defaults to 'system' to follow system preferences
 */
function getThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  return (localStorage.getItem('theme') as ThemeMode | null) || 'system';
}

/**
 * Resolve theme mode to actual dark/light
 */
function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

/**
 * Apply theme class to DOM
 */
function applyThemeClass(isDark: boolean) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(isDark ? 'dark' : 'light');
}

/**
 * Simple Dark Mode Hook
 * 
 * Dark mode follows system preference by default, or user preference if explicitly set.
 * The inline script in layout.tsx applies the correct mode before first paint.
 * 
 * @returns { isDark: boolean, toggle: () => void, setMode: (mode: ThemeMode) => void, mode: ThemeMode }
 * 
 * @example
 * ```tsx
 * const { isDark, toggle } = useDarkMode();
 * 
 * return (
 *   <button onClick={toggle}>
 *     {isDark ? '☀️ Light' : '🌙 Dark'}
 *   </button>
 * );
 * ```
 */
export function useDarkMode() {
  // Read current state from DOM (already set by inline script)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  
  // Get mode from localStorage (defaults to 'system')
  const [mode, setModeState] = useState<ThemeMode>(() => getThemeMode());

  // Sync with DOM changes (e.g., from external changes)
  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const current = root.classList.contains('dark');
      if (current !== isDark) {
        setIsDark(current);
      }
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [isDark]);

  // Listen to system preference changes (when mode is 'system')
  useEffect(() => {
    if (mode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light';
      applyThemeClass(resolved === 'dark');
      setIsDark(resolved === 'dark');
    };

    // Apply initial system preference if not already set
    const initialResolved = resolveTheme('system');
    if (document.documentElement.classList.contains('dark') !== (initialResolved === 'dark')) {
      applyThemeClass(initialResolved === 'dark');
      setIsDark(initialResolved === 'dark');
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  const toggle = useCallback(() => {
    const newIsDark = !isDark;
    applyThemeClass(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    setModeState(newIsDark ? 'dark' : 'light');
    setIsDark(newIsDark);
  }, [isDark]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme', newMode);
    
    if (newMode === 'system') {
      const resolved = resolveTheme('system');
      applyThemeClass(resolved === 'dark');
      setIsDark(resolved === 'dark');
    } else {
      const isDarkMode = newMode === 'dark';
      applyThemeClass(isDarkMode);
      setIsDark(isDarkMode);
    }
  }, []);

  return {
    isDark,
    toggle,
    setMode,
    mode,
  };
}

