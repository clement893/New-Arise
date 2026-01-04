'use client';

import { Card, Input, Badge, Button, ClientOnly } from '@/components/ui';
import { PageHeader, PageContainer, Section, ExampleCard } from '@/components/layout';

function ThemePageContent() {
  return (
    <PageContainer>
      <PageHeader 
        title="Thème" 
        description="Découvrez le système de thème (light mode uniquement)"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Thème' }
        ]} 
      />

      <div className="space-y-8">
        <Section title="État du Thème">
          <Card>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground font-medium">Thème actif:</span>
                <Badge variant="info">light</Badge>
              </div>
              <div className="pt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> Pour modifier votre thème, veuillez utiliser la page{' '}
                  <a href="/dashboard/theme" className="underline font-semibold">
                    Paramètres de Thème
                  </a>{' '}
                  dans le dashboard.
                </p>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Composants du Thème">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ExampleCard title="Card">
              <Card>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Exemple de Card
                </h3>
                <p className="text-muted-foreground">
                  Cette card utilise le thème light mode.
                </p>
              </Card>
            </ExampleCard>

            <ExampleCard title="Input">
              <Input
                label="Email"
                placeholder="exemple@email.com"
                type="email"
              />
            </ExampleCard>

            <ExampleCard title="Badges">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </ExampleCard>

            <ExampleCard title="Boutons">
              <div className="flex flex-wrap gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </ExampleCard>
          </div>
        </Section>

        <Section title="Informations">
          <Card>
            <div className="space-y-4 text-foreground">
              <div>
                <h4 className="font-semibold mb-2">Fonctionnalités:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Thème light mode uniquement</li>
                  <li>Tous les composants UI adaptés au thème light</li>
                  <li>Couleurs ARISE intégrées</li>
                </ul>
              </div>
            </div>
          </Card>
        </Section>

        <Section title="Gestion du Thème">
          <Card>
            <div className="space-y-4 text-foreground">
              <div>
                <h4 className="font-semibold mb-2">Gestion du Thème:</h4>
                <p className="text-sm mb-4">
                  Pour personnaliser votre thème et vos préférences, veuillez vous rendre sur la page{' '}
                  <a href="/dashboard/theme" className="text-primary-600 underline font-semibold">
                    Paramètres de Thème
                  </a>{' '}
                  dans le dashboard.
                </p>
                <p className="text-sm">
                  Les administrateurs peuvent gérer les thèmes de la plateforme via le dashboard d'administration.
                </p>
              </div>
            </div>
          </Card>
        </Section>
      </div>
    </PageContainer>
  );
}

export default function ThemeContent() {
  return (
    <ClientOnly>
      <ThemePageContent />
    </ClientOnly>
  );
}
