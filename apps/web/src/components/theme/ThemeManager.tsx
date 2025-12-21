/**
 * Theme Manager Component
 * Permet de modifier dynamiquement le thème (couleurs, polices, etc.)
 */

'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface ThemeConfig {
  primary: string;
  secondary: string;
  danger: string;
  warning: string;
  info: string;
  fontFamily: string;
  borderRadius: string;
}

const defaultTheme: ThemeConfig = {
  primary: '#3B82F6', // blue-500
  secondary: '#10B981', // green-500
  danger: '#EF4444', // red-500
  warning: '#F59E0B', // yellow-500
  info: '#06B6D4', // cyan-500
  fontFamily: 'Inter',
  borderRadius: '0.5rem',
};

const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Montserrat', value: 'Montserrat' },
];

const borderRadiusOptions = [
  { label: 'Petit (0.25rem)', value: '0.25rem' },
  { label: 'Moyen (0.5rem)', value: '0.5rem' },
  { label: 'Grand (0.75rem)', value: '0.75rem' },
  { label: 'Très grand (1rem)', value: '1rem' },
];

export function ThemeManager() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Appliquer le thème via CSS variables
    const root = document.documentElement;
    
    // Convertir hex en RGB pour les variables CSS
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    // Fonction pour générer les nuances d'une couleur
    const generateColorShades = (hex: string, baseName: string) => {
      const rgb = hexToRgb(hex);
      if (!rgb) return;

      // Générer les nuances (50-950)
      const shades = {
        50: { r: Math.min(255, rgb.r + 200), g: Math.min(255, rgb.g + 200), b: Math.min(255, rgb.b + 200) },
        100: { r: Math.min(255, rgb.r + 150), g: Math.min(255, rgb.g + 150), b: Math.min(255, rgb.b + 150) },
        200: { r: Math.min(255, rgb.r + 100), g: Math.min(255, rgb.g + 100), b: Math.min(255, rgb.b + 100) },
        300: { r: Math.min(255, rgb.r + 50), g: Math.min(255, rgb.g + 50), b: Math.min(255, rgb.b + 50) },
        400: { r: Math.min(255, rgb.r + 25), g: Math.min(255, rgb.g + 25), b: Math.min(255, rgb.b + 25) },
        500: rgb,
        600: { r: Math.max(0, rgb.r - 25), g: Math.max(0, rgb.g - 25), b: Math.max(0, rgb.b - 25) },
        700: { r: Math.max(0, rgb.r - 50), g: Math.max(0, rgb.g - 50), b: Math.max(0, rgb.b - 50) },
        800: { r: Math.max(0, rgb.r - 100), g: Math.max(0, rgb.g - 100), b: Math.max(0, rgb.b - 100) },
        900: { r: Math.max(0, rgb.r - 150), g: Math.max(0, rgb.g - 150), b: Math.max(0, rgb.b - 150) },
      };

      Object.entries(shades).forEach(([shade, color]) => {
        const hexValue = `#${[color.r, color.g, color.b].map(x => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
        root.style.setProperty(`--color-${baseName}-${shade}`, hexValue);
      });

      root.style.setProperty(`--color-${baseName}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    };

    // Générer les nuances pour chaque couleur
    generateColorShades(theme.primary, 'primary');
    generateColorShades(theme.secondary, 'secondary');
    generateColorShades(theme.danger, 'danger');
    generateColorShades(theme.warning, 'warning');
    generateColorShades(theme.info, 'info');

    // Appliquer la police
    root.style.setProperty('--font-family', theme.fontFamily);
    document.body.style.fontFamily = `var(--font-family), sans-serif`;

    // Appliquer le border radius
    root.style.setProperty('--border-radius', theme.borderRadius);
    const style = document.createElement('style');
    style.id = 'theme-border-radius';
    style.textContent = `
      * {
        --rounded: var(--border-radius);
      }
      .rounded-lg {
        border-radius: var(--border-radius) !important;
      }
    `;
    const existingStyle = document.getElementById('theme-border-radius');
    if (existingStyle) {
      existingStyle.remove();
    }
    document.head.appendChild(style);

    // Appliquer dark mode
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDark]);

  const updateColor = (key: keyof ThemeConfig, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const exportTheme = () => {
    const themeJson = JSON.stringify(theme, null, 2);
    navigator.clipboard.writeText(themeJson);
    alert('Thème copié dans le presse-papiers !');
  };

  return (
    <Card title="Gestionnaire de Thème" className="space-y-6">
      {/* Dark Mode Toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mode sombre
          </span>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isDark ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Couleurs
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Primary
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.primary}
              onChange={(e) => updateColor('primary', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Secondary
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.secondary}
              onChange={(e) => updateColor('secondary', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Danger
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.danger}
              onChange={(e) => updateColor('danger', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.danger}
              onChange={(e) => updateColor('danger', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Warning
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.warning}
              onChange={(e) => updateColor('warning', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.warning}
              onChange={(e) => updateColor('warning', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Info
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.info}
              onChange={(e) => updateColor('info', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.info}
              onChange={(e) => updateColor('info', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Typographie
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Police de caractères
          </label>
          <Select
            options={fontOptions}
            value={theme.fontFamily}
            onChange={(e) => updateColor('fontFamily', e.target.value)}
          />
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Style
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Border Radius
          </label>
          <Select
            options={borderRadiusOptions}
            value={theme.borderRadius}
            onChange={(e) => updateColor('borderRadius', e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={resetTheme} variant="outline" className="flex-1">
          Réinitialiser
        </Button>
        <Button onClick={exportTheme} variant="primary" className="flex-1">
          Exporter
        </Button>
      </div>
    </Card>
  );
}

