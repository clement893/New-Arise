'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';

interface Example {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function ExamplesPage() {
  const examples: Example[] = [
    {
      id: 'dashboard',
      title: 'Exemple Dashboard',
      description: 'Un exemple de tableau de bord avec widgets et statistiques',
      href: '/examples/dashboard',
      icon: '📊',
      color: 'blue',
    },
    {
      id: 'onboarding',
      title: 'Exemple Onboarding',
      description: 'Un flux d\'onboarding étape par étape pour les nouveaux utilisateurs',
      href: '/examples/onboarding',
      icon: '🚀',
      color: 'green',
    },
    {
      id: 'settings',
      title: 'Exemple Paramètres',
      description: 'Une page de paramètres complète avec différents types de configurations',
      href: '/examples/settings',
      icon: '⚙️',
      color: 'purple',
    },
  ];

  return (
    <Container className="py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">Exemples</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Découvrez des exemples de pages et composants pour vous inspirer
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {examples.map((example) => (
          <Link key={example.id} href={example.href}>
            <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer">
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">{example.icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{example.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{example.description}</p>
                <Button variant="outline" className="w-full">
                  Voir l'exemple
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <Card>
          <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Besoin d'aide ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ces exemples sont conçus pour vous aider à comprendre comment utiliser les composants
              et créer vos propres pages. N'hésitez pas à explorer le code source pour voir comment
              ils sont implémentés.
            </p>
            <Link href="/docs">
              <Button variant="outline">
                Voir la documentation
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}
