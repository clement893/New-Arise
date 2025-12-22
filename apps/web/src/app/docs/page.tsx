'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DocsPage() {
  const sections = [
    {
      title: 'Démarrage Rapide',
      description: 'Commencer avec la plateforme',
      links: [
        { title: 'Installation', href: '#installation' },
        { title: 'Configuration', href: '#configuration' },
        { title: 'Premiers pas', href: '#premiers-pas' },
      ],
    },
    {
      title: 'API',
      description: 'Documentation de l\'API REST',
      links: [
        { title: 'Authentification', href: '#api-auth' },
        { title: 'Endpoints', href: '#api-endpoints' },
        { title: 'Exemples', href: '#api-examples' },
      ],
    },
    {
      title: 'Composants',
      description: 'Composants UI disponibles',
      links: [
        { title: 'Boutons', href: '#components-buttons' },
        { title: 'Formulaires', href: '#components-forms' },
        { title: 'Cartes', href: '#components-cards' },
      ],
    },
    {
      title: 'Guides',
      description: 'Guides et tutoriels',
      links: [
        { title: 'Gestion des donateurs', href: '#guides-donateurs' },
        { title: 'Création de campagnes', href: '#guides-campagnes' },
        { title: 'Rapports', href: '#guides-rapports' },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Documentation</h1>
        <p className="text-xl text-gray-600">
          Tout ce dont vous avez besoin pour utiliser la plateforme
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {sections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h2>
              <p className="text-gray-600 mb-4 text-sm">{section.description}</p>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      {/* API Documentation */}
      <Card className="mb-8">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Documentation API</h2>
          <p className="text-gray-600 mb-6">
            La documentation complète de l'API est disponible via Swagger UI. Vous pouvez explorer
            tous les endpoints, tester les requêtes et voir les schémas de données.
          </p>
          <div className="flex gap-4">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/docs`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Ouvrir Swagger UI</Button>
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/redoc`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">Ouvrir ReDoc</Button>
            </a>
          </div>
        </div>
      </Card>

      {/* Getting Started */}
      <Card className="mb-8">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Démarrage Rapide</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Installation</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>npm install</code>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Configuration</h3>
              <p className="text-gray-600 mb-3">
                Créez un fichier <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> avec vos variables d'environnement :
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>
                  NEXT_PUBLIC_API_URL=http://localhost:8000<br />
                  NEXTAUTH_URL=http://localhost:3000<br />
                  NEXTAUTH_SECRET=your-secret-key
                </code>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Lancer le serveur</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>npm run dev</code>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Resources */}
      <Card>
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ressources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Liens Utiles</h3>
              <ul className="space-y-2">
                <li>
                  <a href={process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/your-username/your-repo"} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Repository GitHub
                  </a>
                </li>
                <li>
                  <a href="/examples" className="text-blue-600 hover:underline">
                    Exemples de pages
                  </a>
                </li>
                <li>
                  <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Tableau de bord
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href={`${process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/your-username/your-repo"}/issues`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Signaler un problème
                  </a>
                </li>
                <li>
                  <a href={`${process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/your-username/your-repo"}/discussions`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Discussions
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
