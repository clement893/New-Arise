/**
 * Spacing Showcase Component
 * Displays spacing system from the theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { Card } from '@/components/ui';

export function SpacingShowcase() {
  const { theme } = useGlobalTheme();

  if (!theme?.config) {
    return <Card>Chargement...</Card>;
  }

  const config = theme.config;
  const spacing = config.spacing || {};

  const SpacingScale = () => {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spacing Scale</h3>
        <div className="space-y-4">
          {Object.entries(spacing).map(([key, value]) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">{key}</div>
              <div className="flex-1 flex items-center gap-4">
                <div
                  className="bg-primary-500 rounded"
                  style={{
                    width: String(value).replace('px', 'px'),
                    height: '24px',
                    minWidth: '4px',
                  }}
                />
              </div>
              <code className="text-xs text-muted-foreground w-20 text-right">{String(value)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const SpacingExamples = () => {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Examples</h3>
        <div className="space-y-6">
          {Object.entries(spacing).slice(0, 5).map(([key, value]) => (
            <div key={key}>
              <div className="text-sm text-muted-foreground mb-2">{key} ({String(value)})</div>
              <div className="flex gap-2">
                <div className="w-16 h-16 bg-primary-500 rounded" style={{ padding: String(value) }}>
                  <div className="w-full h-full bg-white rounded" />
                </div>
                <div className="flex-1 bg-muted rounded p-4" style={{ padding: String(value) }}>
                  <div className="bg-white rounded h-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <SpacingScale />
      <SpacingExamples />
    </div>
  );
}
