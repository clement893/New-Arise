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
  // Couleurs principales
  primary: string;
  secondary: string;
  danger: string;
  warning: string;
  info: string;
  
  // Typographie - Polices
  fontFamily: string;
  fontFamilyHeading: string;
  fontFamilySubheading: string;
  
  // Typographie - Couleurs de texte
  textHeading: string;
  textSubheading: string;
  textBody: string;
  textSecondary: string;
  textLink: string;
  
  // Couleurs d'erreur et validation
  errorColor: string;
  errorBg: string;
  successColor: string;
  successBg: string;
  
  // Style
  borderRadius: string;
}

const defaultTheme: ThemeConfig = {
  primary: '#3B82F6', // blue-500
  secondary: '#10B981', // green-500
  danger: '#EF4444', // red-500
  warning: '#F59E0B', // yellow-500
  info: '#06B6D4', // cyan-500
  fontFamily: 'Inter',
  fontFamilyHeading: 'Inter',
  fontFamilySubheading: 'Inter',
  textHeading: '#111827', // gray-900
  textSubheading: '#374151', // gray-700
  textBody: '#1F2937', // gray-800
  textSecondary: '#6B7280', // gray-500
  textLink: '#3B82F6', // primary-500
  errorColor: '#EF4444', // red-500
  errorBg: '#FEF2F2', // red-50
  successColor: '#10B981', // green-500
  successBg: '#F0FDF4', // green-50
  borderRadius: '0.5rem',
};

const fontOptions = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Lora', value: 'Lora' },
  { label: 'Merriweather', value: 'Merriweather' },
];

const borderRadiusOptions = [
  { label: 'Petit (0.25rem)', value: '0.25rem' },
  { label: 'Moyen (0.5rem)', value: '0.5rem' },
  { label: 'Grand (0.75rem)', value: '0.75rem' },
  { label: 'Très grand (1rem)', value: '1rem' },
];

export function ThemeManager() {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Charger le thème depuis localStorage au démarrage
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme-colors');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setTheme({ ...defaultTheme, ...parsedTheme });
      } catch (e) {
        console.error('Erreur lors du chargement du thème:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Appliquer le thème via CSS variables
    const root = document.documentElement;
    
    // Convertir hex en RGB pour les variables CSS
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1]!, 16),
            g: parseInt(result[2]!, 16),
            b: parseInt(result[3]!, 16),
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

    // Appliquer les polices
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--font-family-heading', theme.fontFamilyHeading);
    root.style.setProperty('--font-family-subheading', theme.fontFamilySubheading);
    document.body.style.fontFamily = `var(--font-family), sans-serif`;

    // Appliquer les couleurs de texte
    const hexToRgbText = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1]!, 16)}, ${parseInt(result[2]!, 16)}, ${parseInt(result[3]!, 16)}`
        : null;
    };

    root.style.setProperty('--color-text-heading', theme.textHeading);
    root.style.setProperty('--color-text-heading-rgb', hexToRgbText(theme.textHeading) || '17, 24, 39');
    root.style.setProperty('--color-text-subheading', theme.textSubheading);
    root.style.setProperty('--color-text-subheading-rgb', hexToRgbText(theme.textSubheading) || '55, 65, 81');
    root.style.setProperty('--color-text-body', theme.textBody);
    root.style.setProperty('--color-text-body-rgb', hexToRgbText(theme.textBody) || '31, 41, 55');
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-text-secondary-rgb', hexToRgbText(theme.textSecondary) || '107, 114, 128');
    root.style.setProperty('--color-text-link', theme.textLink);
    root.style.setProperty('--color-text-link-rgb', hexToRgbText(theme.textLink) || '59, 130, 246');

    // Appliquer les couleurs d'erreur et validation
    root.style.setProperty('--color-error', theme.errorColor);
    root.style.setProperty('--color-error-rgb', hexToRgbText(theme.errorColor) || '239, 68, 68');
    root.style.setProperty('--color-error-bg', theme.errorBg);
    root.style.setProperty('--color-success', theme.successColor);
    root.style.setProperty('--color-success-rgb', hexToRgbText(theme.successColor) || '16, 185, 129');
    root.style.setProperty('--color-success-bg', theme.successBg);

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

    // Sauvegarder dans localStorage
    localStorage.setItem('theme-colors', JSON.stringify(theme));
  }, [theme, mounted]);

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

  if (!mounted) {
    return null;
  }

  return (
    <Card title="Gestionnaire de Thème Avancé" className="space-y-6">
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
          Typographie - Polices
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Police principale (corps de texte)
          </label>
          <Select
            options={fontOptions}
            value={theme.fontFamily}
            onChange={(e) => updateColor('fontFamily', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Police des titres
          </label>
          <Select
            options={fontOptions}
            value={theme.fontFamilyHeading}
            onChange={(e) => updateColor('fontFamilyHeading', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Police des sous-titres
          </label>
          <Select
            options={fontOptions}
            value={theme.fontFamilySubheading}
            onChange={(e) => updateColor('fontFamilySubheading', e.target.value)}
          />
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Typographie - Couleurs de texte
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur des titres
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.textHeading}
              onChange={(e) => updateColor('textHeading', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.textHeading}
              onChange={(e) => updateColor('textHeading', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur des sous-titres
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.textSubheading}
              onChange={(e) => updateColor('textSubheading', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.textSubheading}
              onChange={(e) => updateColor('textSubheading', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur du texte principal
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.textBody}
              onChange={(e) => updateColor('textBody', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.textBody}
              onChange={(e) => updateColor('textBody', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur du texte secondaire
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.textSecondary}
              onChange={(e) => updateColor('textSecondary', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.textSecondary}
              onChange={(e) => updateColor('textSecondary', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur des liens
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.textLink}
              onChange={(e) => updateColor('textLink', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.textLink}
              onChange={(e) => updateColor('textLink', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Error & Validation Colors */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Couleurs d'erreur et validation
        </h3>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur d'erreur
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.errorColor}
              onChange={(e) => updateColor('errorColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.errorColor}
              onChange={(e) => updateColor('errorColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Fond d'erreur
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.errorBg}
              onChange={(e) => updateColor('errorBg', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.errorBg}
              onChange={(e) => updateColor('errorBg', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Couleur de succès
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.successColor}
              onChange={(e) => updateColor('successColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.successColor}
              onChange={(e) => updateColor('successColor', e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            Fond de succès
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={theme.successBg}
              onChange={(e) => updateColor('successBg', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <Input
              value={theme.successBg}
              onChange={(e) => updateColor('successBg', e.target.value)}
              className="flex-1"
            />
          </div>
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

