/**
 * Color Palette Component
 * Displays all colors from the theme with dedicated ARISE section
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { DEFAULT_THEME_CONFIG } from '@/lib/theme/default-theme-config';
import { Card } from '@/components/ui';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateColorShades } from '@/lib/theme/color-utils';

// ARISE Brand Colors - Always available with default values
const ARISE_DEFAULT_COLORS = {
  'Deep Teal': DEFAULT_THEME_CONFIG.colors.ariseDeepTeal,
  'Deep Teal Alt': DEFAULT_THEME_CONFIG.colors.ariseDeepTealAlt,
  'Button Primary': DEFAULT_THEME_CONFIG.colors.ariseButtonPrimary,
  'Button Primary Hover': DEFAULT_THEME_CONFIG.colors.ariseButtonPrimaryHover,
  'Gold': DEFAULT_THEME_CONFIG.colors.ariseGold,
  'Gold Alt': DEFAULT_THEME_CONFIG.colors.ariseGoldAlt,
  'Dark Gray': DEFAULT_THEME_CONFIG.colors.ariseDarkGray,
  'Light Beige': DEFAULT_THEME_CONFIG.colors.ariseLightBeige,
  'Beige': DEFAULT_THEME_CONFIG.colors.ariseBeige,
  'Text Dark': DEFAULT_THEME_CONFIG.colors.ariseTextDark,
  'Text Light': DEFAULT_THEME_CONFIG.colors.ariseTextLight,
};

export function ColorPalette() {
  const { theme } = useGlobalTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getColorValue = (value: string): string => {
    if (typeof window === 'undefined') return value;
    
    if (value.startsWith('var(')) {
      const varName = value.replace('var(--', '').replace(')', '').trim();
      const computed = getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim();
      return computed || value;
    }
    return value;
  };

  const ColorSwatch = ({ name, value, description }: { name: string; value: string; description?: string }) => {
    const isCopied = copiedColor === value;
    const colorValue = getColorValue(value);
    const isLight = colorValue.startsWith('#') && parseInt(colorValue.slice(1, 3), 16) > 200;
    
    return (
      <div className="group">
        <div
          className="w-full h-24 rounded-lg border border-border cursor-pointer relative overflow-hidden shadow-sm"
          style={{ backgroundColor: colorValue }}
          onClick={() => handleCopyColor(value)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            {isCopied ? (
              <Check className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <Copy className={`w-5 h-5 ${isLight ? 'text-gray-800' : 'text-white'} opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity`} />
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium">{name}</div>
          {description && <div className="text-xs text-muted-foreground mb-1">{description}</div>}
          <code className="text-xs text-muted-foreground break-all">{value}</code>
        </div>
      </div>
    );
  };

  const ColorGroup = ({ title, colors, description }: { title: string; colors: Record<string, string>; description?: string }) => {
    if (!colors || Object.keys(colors).length === 0) return null;

    return (
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <ColorSwatch key={key} name={key} value={String(value)} />
          ))}
        </div>
      </Card>
    );
  };

  // ARISE Brand Colors Section - Always displayed
  const AriseBrandColors = () => {
    const config = theme?.config;
    const colors = config?.colors || {};
    
    // Merge theme colors with defaults (theme takes precedence)
    const ariseColors: Record<string, string> = {};
    
    Object.entries(ARISE_DEFAULT_COLORS).forEach(([displayName, defaultValue]) => {
      const keyMap: Record<string, string> = {
        'Deep Teal': 'ariseDeepTeal',
        'Deep Teal Alt': 'ariseDeepTealAlt',
        'Button Primary': 'ariseButtonPrimary',
        'Button Primary Hover': 'ariseButtonPrimaryHover',
        'Gold': 'ariseGold',
        'Gold Alt': 'ariseGoldAlt',
        'Dark Gray': 'ariseDarkGray',
        'Light Beige': 'ariseLightBeige',
        'Beige': 'ariseBeige',
        'Text Dark': 'ariseTextDark',
        'Text Light': 'ariseTextLight',
      };
      
      const configKey = keyMap[displayName];
      const themeValue = colors[configKey as keyof typeof colors];
      ariseColors[displayName] = themeValue ? String(themeValue) : defaultValue;
    });

    return (
      <Card className="p-6 border-2 border-primary/20">
        <div className="mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg">ARISE</span>
            <span>Brand Colors</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Couleurs importantes de la marque ARISE - Ces couleurs sont toujours disponibles même si le thème n'est pas chargé.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(ariseColors).map(([name, value]) => {
            const descriptions: Record<string, string> = {
              'Deep Teal': 'Couleur principale ARISE',
              'Deep Teal Alt': 'Alternative pour dashboard',
              'Button Primary': 'Boutons principaux',
              'Button Primary Hover': 'État hover boutons',
              'Gold': 'Or ARISE',
              'Gold Alt': 'Or alternatif pour boutons',
              'Dark Gray': 'Fond sombre',
              'Light Beige': 'Beige clair',
              'Beige': 'Beige standard',
              'Text Dark': 'Texte sombre',
              'Text Light': 'Texte clair',
            };
            return (
              <ColorSwatch 
                key={name} 
                name={name} 
                value={value} 
                description={descriptions[name]}
              />
            );
          })}
        </div>
      </Card>
    );
  };

  const PrimaryColors = () => {
    if (!theme?.config) return null;
    
    const primaryColor = theme.config.primary_color || '#2563eb';
    const shades = generateColorShades(primaryColor);
    
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {Object.entries(shades).map(([shade, color]) => (
            <div key={shade}>
              <ColorSwatch name={`Primary ${shade}`} value={color} />
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Only show other colors if theme is loaded
  if (!theme?.config) {
    return (
      <div className="space-y-6">
        <AriseBrandColors />
        <Card className="p-6">
          <p className="text-muted-foreground text-center">
            Chargement du thème... Les couleurs ARISE sont affichées ci-dessus avec leurs valeurs par défaut.
          </p>
        </Card>
      </div>
    );
  }

  const config = theme.config;
  const colors = config.colors || {};
  const semanticColors: Record<string, string> = {};
  const baseColors: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    // Skip ARISE colors as they're shown in dedicated section
    if (key.startsWith('arise')) {
      return;
    }
    if (['danger', 'warning', 'info', 'success', 'destructive'].includes(key)) {
      semanticColors[key] = String(value);
    } else {
      baseColors[key] = String(value);
    }
  });

  return (
    <div className="space-y-6">
      <AriseBrandColors />
      <PrimaryColors />
      {Object.keys(baseColors).length > 0 && <ColorGroup title="Base Colors" colors={baseColors} />}
      {Object.keys(semanticColors).length > 0 && <ColorGroup title="Semantic Colors" colors={semanticColors} />}
    </div>
  );
}
