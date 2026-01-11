'use client';

import { useState, useEffect } from 'react';
import { PageHeader, PageContainer, Section } from '@/components/layout';
import { Card, Button, Badge, LoadingSkeleton, ServiceTestCard } from '@/components/ui';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import MotionDiv from '@/components/motion/MotionDiv';

export default function AdminContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader 
          title="Administration" 
          description="Panneau d'administration du système"
          breadcrumbs={[
            { label: 'Accueil', href: '/' },
            { label: 'Administration' }
          ]} 
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Administration" 
        description="Panneau d'administration du système"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Administration' }
        ]} 
      />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Invitations" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Gérer les invitations utilisateurs et les accès au système.
          </p>
          <Link href="/admin/invitations">
            <Button variant="primary" className="w-full">
              Gérer les invitations
            </Button>
          </Link>
        </Card>

        <Card title="Utilisateurs" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Consulter et gérer les utilisateurs du système.
          </p>
          <Link href="/admin/users">
            <Button variant="primary" className="w-full">
              Gérer les utilisateurs
            </Button>
          </Link>
        </Card>

        <Card title="Organisations" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Gérer les organisations et leurs paramètres.
          </p>
          <Link href="/admin/organizations">
            <Button variant="primary" className="w-full">
              Gérer les organisations
            </Button>
          </Link>
        </Card>

        <Card title="Thèmes" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Créez, modifiez et activez les thèmes de la plateforme.
          </p>
          <Link href="/admin/themes">
            <Button variant="primary" className="w-full">
              Gérer les thèmes
            </Button>
          </Link>
        </Card>

        <Card title="Plans d'abonnement" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Gérez les plans d'abonnement, modifiez les prix et descriptions.
          </p>
          <Link href="/admin/plans">
            <Button variant="primary" className="w-full">
              Gérer les plans
            </Button>
          </Link>
        </Card>

        <Card title="Paramètres" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Configuration générale du système.
          </p>
          <Link href="/admin/settings">
            <Button variant="primary" className="w-full">
              Configurer
            </Button>
          </Link>
        </Card>

        <Card title="Logs" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Consulter les logs système et les activités.
          </p>
          <Link href="/admin-logs/testing">
            <Button variant="primary" className="w-full">
              Voir les logs
            </Button>
          </Link>
        </Card>

        <Card title="Statistiques" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Visualiser les statistiques et métriques du système.
          </p>
          <Link href="/admin/statistics">
            <Button variant="primary" className="w-full">
              Voir les statistiques
            </Button>
          </Link>
        </Card>

        <Card title="Clés API" className="flex flex-col">
          <p className="text-muted-foreground mb-4">
            Consulter et gérer toutes les clés API du système.
          </p>
          <Link href="/admin/api-keys">
            <Button variant="primary" className="w-full">
              Gérer les clés API
            </Button>
          </Link>
        </Card>

      </div>

      {/* Service Tests Section */}
      <MotionDiv variant="slideUp" delay={300} className="mt-8">
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-info-100 dark:bg-info-900/30 rounded-lg">
              <Sparkles className="w-6 h-6 text-info-600 dark:text-info-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Service Tests</h3>
              <p className="text-sm text-muted-foreground">Test and verify the configuration of integrated services</p>
            </div>
          </div>
          {/* Service test pages removed - no longer needed */}
            <ServiceTestCard
              href="/api-connections/testing"
              title="API Connections Test"
              description="Test and verify API connections between frontend pages and backend endpoints"
              color="info"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
              }
            />
        </Card>
      </MotionDiv>

      <Section title="Statut du système" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                API Backend
              </span>
              <Badge variant="success">En ligne</Badge>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Base de données
              </span>
              <Badge variant="success">Connectée</Badge>
            </div>
          </div>
          <div className="p-4 border rounded-lg bg-secondary-100 dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Services
              </span>
              <Badge variant="success">Opérationnels</Badge>
            </div>
          </div>
        </div>
      </Section>
    </PageContainer>
  );
}

