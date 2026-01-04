/**
 * Typography Showcase Component
 * Displays typography system from the theme
 */

'use client';

import { useGlobalTheme } from '@/lib/theme';
import { Card } from '@/components/ui';

export function TypographyShowcase() {
  const { theme } = useGlobalTheme();

  if (!theme?.config) {
    return <Card>Chargement...</Card>;
  }

  const config = theme.config;
  const typography = config.typography || {};

  const FontFamilySection = () => {
    const fontFamilies = {
      Sans: typography.fontFamily || config.font_family || 'Inter',
      Heading: typography.fontFamilyHeading || typography.fontFamily || config.font_family || 'Inter',
      Subheading: typography.fontFamilySubheading || typography.fontFamily || config.font_family || 'Inter',
      Mono: typography.fontFamilyMono || "'Fira Code', monospace",
    };

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Families</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(fontFamilies).map(([name, family]) => (
            <div key={name}>
              <div className="text-sm text-muted-foreground mb-2">{name}</div>
              <div className="text-lg" style={{ fontFamily: String(family) }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <code className="text-xs text-muted-foreground mt-2 block">{String(family)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const FontSizeSection = () => {
    const fontSizes = typography.fontSize || {};

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Sizes</h3>
        <div className="space-y-4">
          {Object.entries(fontSizes).map(([size, value]) => (
            <div key={size} className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">{size}</div>
              <div className="flex-1" style={{ fontSize: String(value) }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <code className="text-xs text-muted-foreground w-20 text-right">{String(value)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const FontWeightSection = () => {
    const fontWeights = typography.fontWeight || {};

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        <div className="space-y-4">
          {Object.entries(fontWeights).map(([weight, value]) => (
            <div key={weight} className="flex items-center gap-4">
              <div className="w-24 text-sm text-muted-foreground">{weight}</div>
              <div className="flex-1" style={{ fontWeight: String(value) }}>
                The quick brown fox jumps over the lazy dog
              </div>
              <code className="text-xs text-muted-foreground w-20 text-right">{String(value)}</code>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const ExamplesSection = () => {
    const fontSizes = (typography.fontSize || {}) as Record<string, string | number>;
    const fontWeights = (typography.fontWeight || {}) as Record<string, string | number>;
    const fontFamily = typography.fontFamilyHeading || typography.fontFamily || config.font_family || 'Inter';

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Examples</h3>
        <div className="space-y-6">
          <div>
            <h1 style={{ fontFamily, fontSize: fontSizes['4xl'], fontWeight: fontWeights['bold'] || '700' }}>
              Heading 1
            </h1>
          </div>
          <div>
            <h2 style={{ fontFamily, fontSize: fontSizes['3xl'], fontWeight: fontWeights['semibold'] || '600' }}>
              Heading 2
            </h2>
          </div>
          <div>
            <h3 style={{ fontFamily, fontSize: fontSizes['2xl'], fontWeight: fontWeights['semibold'] || '600' }}>
              Heading 3
            </h3>
          </div>
          <div>
            <p style={{ fontFamily, fontSize: fontSizes['base'], fontWeight: fontWeights['normal'] || '400' }}>
              Body text - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <p style={{ fontFamily, fontSize: fontSizes['sm'], fontWeight: fontWeights['normal'] || '400' }}>
              Small text - Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <FontFamilySection />
      <FontSizeSection />
      <FontWeightSection />
      <ExamplesSection />
    </div>
  );
}
