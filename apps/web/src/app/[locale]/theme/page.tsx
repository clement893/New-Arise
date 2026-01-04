/**
 * Theme Showcase Page
 * Displays comprehensive theme visualization
 */

'use client';

import { PageHeader } from '@/components/layout';
import { Container } from '@/components/ui';
import Tabs from '@/components/ui/Tabs';
import { ThemeOverview } from './components/ThemeOverview';
import { ColorPalette } from './components/ColorPalette';
import { TypographyShowcase } from './components/TypographyShowcase';
import { SpacingShowcase } from './components/SpacingShowcase';
import { ComponentShowcase } from './components/ComponentShowcase';
import { EffectsShowcase } from './components/EffectsShowcase';
import { ThemeCodeView } from './components/ThemeCodeView';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ThemeShowcasePage() {
  const tabs = [
    {
      id: 'overview',
      label: 'Vue d\'ensemble',
      content: <ThemeOverview />,
    },
    {
      id: 'colors',
      label: 'Couleurs',
      content: <ColorPalette />,
    },
    {
      id: 'typography',
      label: 'Typographie',
      content: <TypographyShowcase />,
    },
    {
      id: 'spacing',
      label: 'Espacements',
      content: <SpacingShowcase />,
    },
    {
      id: 'components',
      label: 'Composants',
      content: <ComponentShowcase />,
    },
    {
      id: 'effects',
      label: 'Effets',
      content: <EffectsShowcase />,
    },
    {
      id: 'code',
      label: 'Code',
      content: <ThemeCodeView />,
    },
  ];

  return (
    <Container>
      <PageHeader
        title="Visualisation du Thème"
        description="Explorez tous les éléments de design du thème actuel"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Thème' },
        ]}
      />

      <div className="mt-6">
        <Tabs tabs={tabs} defaultTab="overview" />
      </div>
    </Container>
  );
}
