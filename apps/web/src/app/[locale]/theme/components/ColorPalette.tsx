/**
 * Color Palette Component
 * Displays all colors from the theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { Card } from '@/components/ui';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { generateColorShades } from '@/lib/theme/color-utils';

export function ColorPalette() {
  const { theme } = useGlobalTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  if (!theme?.config) {
    return <Card>Chargement...</Card>;
  }

  const config = theme.config;

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const ColorSwatch = ({ name, value }: { name: string; value: string }) => {
    const isCopied = copiedColor === value;
    const colorValue = value.startsWith('var(') ? getComputedStyle(document.documentElement).getPropertyValue(value.replace('var(--', '').replace(')', '')) || value : value;
    
    return (
      <div className="group">
        <div
          className="w-full h-20 rounded-lg border border-border cursor-pointer relative overflow-hidden"
          style={{ backgroundColor: colorValue }}
          onClick={() => handleCopyColor(value)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            {isCopied ? (
              <Check className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <Copy className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="text-sm font-medium">{name}</div>
          <code className="text-xs text-muted-foreground break-all">{value}</code>
        </div>
      </div>
    );
  };

  const ColorGroup = ({ title, colors }: { title: string; colors: Record<string, string> }) => {
    if (!colors || Object.keys(colors).length === 0) return null;

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <ColorSwatch key={key} name={key} value={String(value)} />
          ))}
        </div>
      </Card>
    );
  };

  const PrimaryColors = () => {
    const primaryColor = config.primary_color || '#2563eb';
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

  const colors = config.colors || {};
  const ariseColors: Record<string, string> = {};
  const semanticColors: Record<string, string> = {};
  const baseColors: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    if (key.startsWith('arise')) {
      ariseColors[key] = String(value);
    } else if (['danger', 'warning', 'info', 'success', 'destructive'].includes(key)) {
      semanticColors[key] = String(value);
    } else {
      baseColors[key] = String(value);
    }
  });

  return (
    <div className="space-y-6">
      <PrimaryColors />
      {Object.keys(baseColors).length > 0 && <ColorGroup title="Base Colors" colors={baseColors} />}
      {Object.keys(semanticColors).length > 0 && <ColorGroup title="Semantic Colors" colors={semanticColors} />}
      {Object.keys(ariseColors).length > 0 && <ColorGroup title="ARISE Brand Colors" colors={ariseColors} />}
    </div>
  );
}
