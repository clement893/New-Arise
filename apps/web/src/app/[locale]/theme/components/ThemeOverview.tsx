/**
 * Theme Overview Component
 * Displays overview of the current theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { DEFAULT_THEME_CONFIG } from '@/lib/theme/default-theme-config';
import { Card, Badge } from '@/components/ui';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

export function ThemeOverview() {
  const { theme } = useGlobalTheme();
  const [copied, setCopied] = useState(false);

  // Use default ARISE theme if no theme is loaded
  const displayTheme = theme || {
    id: 0,
    name: 'arise-default',
    display_name: 'ARISE Default Theme',
    description: 'Thème par défaut ARISE avec les couleurs de la marque',
    is_active: true,
    config: DEFAULT_THEME_CONFIG,
    updated_at: new Date().toISOString(),
  };

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(displayTheme.config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadConfig = () => {
    const dataStr = JSON.stringify(displayTheme.config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${displayTheme.name}-config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Use ARISE Deep Teal as primary color
  const primaryColor = displayTheme.config.colors?.ariseDeepTeal || 
                       displayTheme.config.primary_color || 
                       displayTheme.config.colors?.primary || 
                       '#0A3A40';
  const fontFamily = displayTheme.config.font_family || displayTheme.config.typography?.fontFamily || 'Inter';
  
  // Helper to extract color value (remove var() wrapper if present)
  const getColorValue = (color: string): string => {
    if (color.startsWith('var(')) {
      const varName = color.replace('var(--', '').replace(')', '').trim();
      if (typeof window !== 'undefined') {
        const computed = getComputedStyle(document.documentElement).getPropertyValue(`--${varName}`).trim();
        return computed || color;
      }
      return color;
    }
    return color;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{displayTheme.display_name || displayTheme.name}</h2>
            {displayTheme.is_active && (
              <Badge variant="success" className="mb-2">
                Thème actif
              </Badge>
            )}
            {!theme && (
              <Badge variant="info" className="mb-2 ml-2">
                Valeurs par défaut ARISE
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyConfig}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copié!' : 'Copier JSON'}
            </button>
            <button
              onClick={handleDownloadConfig}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Couleur principale (ARISE Deep Teal)</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border border-border"
                style={{ backgroundColor: getColorValue(primaryColor) }}
              />
              <code className="text-sm">{getColorValue(primaryColor)}</code>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Police</h3>
            <p className="text-lg" style={{ fontFamily }}>
              {fontFamily.split(',')[0]}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Mode</h3>
            <Badge>{displayTheme.config.mode || 'system'}</Badge>
          </div>
        </div>

        {displayTheme.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm text-foreground">{displayTheme.description}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Couleurs</div>
          <div className="text-2xl font-bold">
            {Object.keys(displayTheme.config.colors || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Espacements</div>
          <div className="text-2xl font-bold">
            {Object.keys(displayTheme.config.spacing || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Composants</div>
          <div className="text-2xl font-bold">
            {Object.keys(displayTheme.config.components || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Effets</div>
          <div className="text-2xl font-bold">
            {Object.keys(displayTheme.config.effects || {}).length}
          </div>
        </Card>
      </div>
    </div>
  );
}
