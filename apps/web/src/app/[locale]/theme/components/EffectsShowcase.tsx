/**
 * Effects Showcase Component
 * Displays effects (shadows, border radius, etc.) from the theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { Card } from '@/components/ui';

export function EffectsShowcase() {
  const { theme } = useGlobalTheme();

  if (!theme?.config) {
    return <Card>Chargement...</Card>;
  }

  const config = theme.config;
  const shadows = config.shadow || {};
  const borderRadius = config.borderRadius || {};

  const ShadowSection = () => {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Shadows</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(shadows).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="text-sm text-muted-foreground">{key}</div>
              <div
                className="bg-white rounded-lg p-6 border border-border"
                style={{ boxShadow: String(value) }}
              >
                Card with {key} shadow
              </div>
              <code className="text-xs text-muted-foreground block break-all">{String(value)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const BorderRadiusSection = () => {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Border Radius</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Object.entries(borderRadius).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <div className="text-sm text-muted-foreground">{key}</div>
              <div
                className="bg-primary-500 w-full h-20"
                style={{ borderRadius: String(value) }}
              />
              <code className="text-xs text-muted-foreground">{String(value)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <ShadowSection />
      <BorderRadiusSection />
    </div>
  );
}
