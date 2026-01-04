/**
 * Theme Overview Component
 * Displays overview of the current theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { themeTokens } from '@/lib/theme';
import { Card, Badge } from '@/components/ui';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

export function ThemeOverview() {
  const { theme } = useGlobalTheme();
  const [copied, setCopied] = useState(false);

  if (!theme) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun thème chargé</p>
        </div>
      </Card>
    );
  }

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme.config, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadConfig = () => {
    const dataStr = JSON.stringify(theme.config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `theme-${theme.name}-config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const primaryColor = theme.config.primary_color || themeTokens.colors.primary.base;
  const fontFamily = theme.config.font_family || theme.config.typography?.fontFamily || 'Inter';

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{theme.display_name || theme.name}</h2>
            {theme.is_active && (
              <Badge variant="success" className="mb-2">
                Thème actif
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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Couleur principale</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border border-border"
                style={{ backgroundColor: primaryColor.replace('var(--', '').replace(')', '') || '#2563eb' }}
              />
              <code className="text-sm">{primaryColor}</code>
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
            <Badge>{theme.config.mode || 'system'}</Badge>
          </div>
        </div>

        {theme.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm text-foreground">{theme.description}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Couleurs</div>
          <div className="text-2xl font-bold">
            {Object.keys(theme.config.colors || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Espacements</div>
          <div className="text-2xl font-bold">
            {Object.keys(theme.config.spacing || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Composants</div>
          <div className="text-2xl font-bold">
            {Object.keys(theme.config.components || {}).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">Effets</div>
          <div className="text-2xl font-bold">
            {Object.keys(theme.config.effects || {}).length}
          </div>
        </Card>
      </div>
    </div>
  );
}
