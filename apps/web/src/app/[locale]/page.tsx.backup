/**
 * Home Page - Simple and clean
 * Theme loads immediately, no animations, no delays
 */

'use client';

import { Card, Container, StatsCard } from '@/components/ui';
import ButtonLink from '@/components/ui/ButtonLink';
import { 
  CheckCircle, 
  Zap, 
  Shield, 
  Code, 
  Database, 
  Globe, 
  Rocket,
  Layers,
  Users,
  Palette,
  Smartphone
} from 'lucide-react';

export default function HomePage() {
  const customFeatures = [
    {
      icon: <Code className="w-6 h-6" />,
      title: '270+ Composants React',
      description: 'Bibliothèque complète de composants UI et fonctionnels, prêts à l\'emploi',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Sécurité Enterprise',
      description: 'Authentification JWT, OAuth, MFA, RBAC et protection XSS intégrées',
      color: 'text-success-600 dark:text-success-400',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Performance Optimisée',
      description: 'Code splitting automatique, optimisation d\'images, monitoring Web Vitals',
      color: 'text-warning-600 dark:text-warning-400',
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Backend FastAPI',
      description: 'API REST moderne avec PostgreSQL, migrations Alembic, et validation Pydantic',
      color: 'text-secondary-600 dark:text-secondary-400',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'i18n Intégré',
      description: 'Support multilingue avec next-intl (FR/EN/AR/HE), routing automatique',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Thème Personnalisable',
      description: 'Dark mode, système de thème dynamique, et personnalisation complète',
      color: 'text-secondary-600 dark:text-secondary-400',
    },
  ];

  const useCases = [
    {
      title: 'Applications SaaS',
      description: 'Parfait pour créer des applications SaaS B2B ou B2C avec gestion d\'abonnements',
      icon: <Rocket className="w-5 h-5" />,
    },
    {
      title: 'Dashboards Admin',
      description: 'Tableaux de bord administratifs complets avec gestion des utilisateurs et analytics',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      title: 'E-commerce',
      description: 'Plateformes e-commerce avec gestion de produits, commandes et paiements',
      icon: <Smartphone className="w-5 h-5" />,
    },
    {
      title: 'Applications Multi-tenant',
      description: 'Support natif pour les applications multi-organisations avec isolation des données',
      icon: <Users className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Simple, no animations */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-background to-secondary-50 dark:from-muted dark:via-muted dark:to-muted overflow-hidden">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.1] px-2">
            <span className="block mb-2">MODELE-NEXTJS</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400 dark:from-primary-400 dark:via-primary-300 dark:to-primary-200">
              FULLSTACK
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2 font-medium">
            Un template de production prêt à l'emploi avec Next.js 16, React 19, 
            FastAPI et PostgreSQL. Démarrez votre projet rapidement avec une architecture moderne.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2">
            <ButtonLink href="/auth/register" size="lg" variant="primary">
              Commencer maintenant
            </ButtonLink>
            <ButtonLink href="/components" size="lg" variant="secondary">
              Voir les composants
            </ButtonLink>
            <ButtonLink href="/auth/login" size="lg" variant="outline">
              Se connecter
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-background py-12" aria-labelledby="stats-heading">
        <Container>
          <h2 id="stats-heading" className="sr-only">Statistiques du template</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" role="list" aria-label="Statistiques">
            <div role="listitem">
              <StatsCard
                title="Composants"
                value="270+"
                icon={<Code className="w-6 h-6" aria-hidden="true" />}
              />
            </div>
            <div role="listitem">
              <StatsCard
                title="Catégories"
                value="32"
                icon={<Layers className="w-6 h-6" aria-hidden="true" />}
              />
            </div>
            <div role="listitem">
              <StatsCard
                title="Technologies"
                value="15+"
                icon={<Zap className="w-6 h-6" aria-hidden="true" />}
              />
            </div>
            <div role="listitem">
              <StatsCard
                title="Sécurité"
                value="100%"
                icon={<Shield className="w-6 h-6" aria-hidden="true" />}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="bg-background py-20" aria-labelledby="features-heading">
        <Container>
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un template complet avec toutes les fonctionnalités essentielles pour démarrer rapidement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16" role="list" aria-label="Fonctionnalités principales">
            {customFeatures.map((feature, index) => (
              <Card key={index} hover className="p-6" role="listitem">
                <div className={`${feature.color} mb-4`} aria-hidden="true">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Use Cases Section */}
      <div className="bg-background py-20">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Cas d'usage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Parfait pour différents types d'applications web modernes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-16">
            {useCases.map((useCase, index) => (
              <Card key={index} hover className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="text-primary-600 dark:text-primary-400 flex-shrink-0">
                    {useCase.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {useCase.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {useCase.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </div>

      {/* Key Features List */}
      <div className="bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-muted dark:to-muted py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                Fonctionnalités SaaS
              </h2>
              <ul className="space-y-4">
                {[
                  'Gestion d\'abonnements avec Stripe',
                  'Gestion d\'équipes multi-utilisateurs',
                  'Système d\'invitations par email',
                  'RBAC avec permissions granulaires',
                  'Tableau de bord analytics intégré',
                  'Support multi-organisations',
                  'Feature flags pour déploiements progressifs',
                  'Système de préférences utilisateur',
                  'Annonces et bannières système',
                  'Feedback et support intégré',
                  'Onboarding multi-étapes',
                  'Documentation et aide intégrées',
                  'Tâches planifiées et jobs en arrière-plan',
                  'Sauvegardes et restauration',
                  'Gestion de modèles d\'email',
                  'Audit trail de sécurité',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
                Expérience Développeur
              </h2>
              <ul className="space-y-4">
                {[
                  'Génération de code CLI intégrée',
                  'Types TypeScript auto-générés',
                  'Hot reload frontend & backend',
                  'Tests unitaires et E2E inclus',
                  'CI/CD avec GitHub Actions',
                  'Docker Compose pour le développement',
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </div>

      {/* Quick Links */}
      <div className="bg-background py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                Dashboard
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Accédez à votre tableau de bord pour gérer vos projets et données.
              </p>
              <ButtonLink href="/dashboard" variant="ghost" className="w-full">
                Accéder au dashboard
              </ButtonLink>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Code className="w-5 h-5 sm:w-6 sm:h-6 text-success-600 dark:text-success-400" />
                Composants
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Explorez notre bibliothèque de 270+ composants réutilisables.
              </p>
              <ButtonLink href="/components" variant="ghost" className="w-full">
                Voir les composants
              </ButtonLink>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-600 dark:text-secondary-400" />
                Documentation
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                Consultez la documentation complète pour apprendre à utiliser le template.
              </p>
              <ButtonLink href="/docs" variant="ghost" className="w-full">
                Lire la documentation
              </ButtonLink>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  );
}
