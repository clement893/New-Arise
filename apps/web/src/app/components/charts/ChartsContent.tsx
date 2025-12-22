'use client';

import { useState } from 'react';
import { Chart, Card, Button } from '@/components/ui';
import type { ChartDataPoint } from '@/components/ui';
import { PageHeader, PageContainer, Section, PageNavigation } from '@/components/layout';

const lineChartData: ChartDataPoint[] = [
  { label: 'Jan', value: 65 },
  { label: 'Fév', value: 59 },
  { label: 'Mar', value: 80 },
  { label: 'Avr', value: 81 },
  { label: 'Mai', value: 56 },
  { label: 'Jun', value: 55 },
];

const barChartData: ChartDataPoint[] = [
  { label: 'Lun', value: 20 },
  { label: 'Mar', value: 35 },
  { label: 'Mer', value: 40 },
  { label: 'Jeu', value: 25 },
  { label: 'Ven', value: 30 },
  { label: 'Sam', value: 15 },
  { label: 'Dim', value: 10 },
];

const areaChartData: ChartDataPoint[] = [
  { label: 'Q1', value: 100 },
  { label: 'Q2', value: 150 },
  { label: 'Q3', value: 120 },
  { label: 'Q4', value: 180 },
];

export default function ChartsContent() {
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'area'>('line');

  return (
    <PageContainer>
      <PageHeader
        title="Composants de Graphiques"
        description="Composants pour visualiser des données avec des graphiques interactifs"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Composants', href: '/components' }, { label: 'Graphiques' }]}
      />

      <div className="space-y-8">
        <Section title="Chart - Ligne">
          <Card>
            <Chart
              type="line"
              data={lineChartData}
              title="Évolution des ventes"
              height={300} />
          </Card>
        </Section>

        <Section title="Chart - Barres">
          <Card>
            <Chart
              type="bar"
              data={barChartData}
              title="Ventes hebdomadaires"
              height={300} />
          </Card>
        </Section>

        <Section title="Chart - Aire">
          <Card>
            <Chart
              type="area"
              data={areaChartData}
              title="Revenus trimestriels"
              height={300} />
          </Card>
        </Section>

        <Section title="Chart interactif">
          <Card>
            <div className="mb-4 flex gap-2">
              <Button
                variant={selectedChart === 'line' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('line')}
              >
                Ligne
              </Button>
              <Button
                variant={selectedChart === 'bar' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('bar')}
              >
                Barres
              </Button>
              <Button
                variant={selectedChart === 'area' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedChart('area')}
              >
                Aire
              </Button>
            </div>
            <Chart
              type={selectedChart}
              data={lineChartData}
              title={`Graphique en ${selectedChart === 'line' ? 'ligne' : selectedChart === 'bar' ? 'barres' : 'aire'}`}
              height={300} />
          </Card>
        </Section>

        <Section title="Informations">
          <Card>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-semibold mb-2">Types de graphiques disponibles:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Line:</strong> Graphique en ligne pour visualiser des tendances</li>
                  <li><strong>Bar:</strong> Graphique en barres pour comparer des valeurs</li>
                  <li><strong>Area:</strong> Graphique en aire pour montrer l'évolution cumulée</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Utilisation:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { Chart } from '@/components/ui';
import type { ChartDataPoint } from '@/components/ui';

const data: ChartDataPoint[] = [
  { label: 'Jan', value: 65 },
  { label: 'Fév', value: 59 },
];

<Chart
  type="line"
  data={data}
  title="Mon graphique"
  height={300} />`}
                </pre>
              </div>
            </div>
          </Card>
        </Section>
      </div>

      <PageNavigation prev={{ label: 'Utilitaires', href: '/components/utils' }} home={{ label: 'Retour à l\'accueil', href: '/components' }} />
    </PageContainer>
  );
}

