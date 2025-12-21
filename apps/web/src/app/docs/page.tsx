'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';


import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const uiComponents = [
    'Accordion', 'Alert', 'Badge', 'Breadcrumb', 'Button', 'Card', 'Checkbox',
    'DataTable', 'DataTableEnhanced', 'DatePicker', 'Dropdown', 'ExportButton',
    'FileUpload', 'FileUploadWithPreview', 'Form', 'FormBuilder', 'Input',
    'KanbanBoard', 'Modal', 'Pagination', 'Progress', 'Radio', 'Select',
    'Skeleton', 'Spinner', 'Switch', 'Tabs', 'Textarea', 'Toast', 'Tooltip'
  ];

  const hooks = [
    'useAuth', 'useForm', 'usePagination', 'useFilters', 'usePermissions',
    'useLogger', 'useDebounce', 'useLocalStorage', 'useMediaQuery'
  ];

  const features = [
    {
      category: 'Frontend',
      items: [
        'Next.js 16 avec App Router et Turbopack',
        'React 19 avec Server Components',
        'TypeScript 5 avec configuration stricte',
        'Tailwind CSS 3 pour le styling',
        'Biblioth??que UI compl??te (30+ composants ERP)',
        'Hooks r??utilisables personnalis??s',
        'NextAuth.js v5 avec OAuth Google',
        'Protection des routes avec middleware',
        'Gestion centralis??e des erreurs',
        'Logging structur??',
        'Support du mode sombre',
        'Responsive design mobile-first'
      ]
    },
    {
      category: 'Backend',
      items: [
        'FastAPI avec documentation OpenAPI/Swagger automatique',
        'Pydantic v2 pour la validation des donn??es',
        'SQLAlchemy async ORM',
        'Alembic pour les migrations de base de donn??es',
        'PostgreSQL avec support async',
        'Authentification JWT avec refresh tokens',
        'Tests avec pytest',
        'Logging avec loguru',
        'Gestion standardis??e des erreurs',
        'API RESTful compl??te',
        'Support CORS configur??',
        'Rate limiting'
      ]
    },
    {
      category: 'Types Partag??s',
      items: [
        'Package @modele/types pour les types TypeScript partag??s',
        'G??n??ration automatique depuis les sch??mas Pydantic',
        'Synchronisation frontend/backend',
        'Types type-safe end-to-end'
      ]
    },
    {
      category: 'DevOps & Outils',
      items: [
        'Turborepo pour monorepo optimis??',
        'pnpm workspaces pour la gestion des d??pendances',
        'GitHub Actions CI/CD',
        'Pre-commit hooks avec Husky',
        'Docker & Docker Compose',
        'Pr??t pour d??ploiement Railway',
        'G??n??rateurs de code (composants, pages, routes API)',
        'Scripts de migration de base de donn??es',
        'Configuration ESLint et Prettier',
        'Storybook pour la documentation des composants'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation Technique du Template
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Vue d'ensemble compl??te de tous les ??l??ments inclus dans ce template full-stack
          </p>
        </div>

        {/* Composants UI */}
        <Card title="Composants UI (30+)" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uiComponents.map((component) => (
              <div
                key={component}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono"
              >
                {component}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Tous les composants sont disponibles dans <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">@/components/ui</code> et export??s depuis <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">@/components/ui/index.ts</code>
          </p>
        </Card>

        {/* Hooks */}
        <Card title="Hooks Personnalis??s" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hooks.map((hook) => (
              <div
                key={hook}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
              >
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400">
                  {hook}
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Disponible dans <code>@/hooks/{hook.toLowerCase()}</code>
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Fonctionnalit??s par cat??gorie */}
        {features.map((feature) => (
          <Card
            key={feature.category}
            title={feature.category}
            className="mb-6"
          >
            <ul className="space-y-2">
              {feature.items.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">???</span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}

        {/* Structure du projet */}
        <Card title="Structure du Projet" className="mb-6">
          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <pre>{MODELE-NEXTJS-FULLSTACK/
????????? apps/
???   ????????? web/                    # Next.js 16 frontend
???       ????????? src/
???       ???   ????????? app/           # Pages et layouts
???       ???   ????????? components/    # Composants React
???       ???   ???   ????????? ui/        # Composants UI r??utilisables
???       ???   ???   ????????? providers/ # Providers React
???       ???   ????????? hooks/         # Hooks personnalis??s
???       ???   ????????? lib/           # Utilitaires
???       ???   ???   ????????? api/       # Client API
???       ???   ???   ????????? auth/      # Authentification
???       ???   ???   ????????? errors/    # Gestion d'erreurs
???       ???   ???   ????????? logger/    # Logging
???       ???   ????????? store/         # State management
???       ????????? package.json
????????? backend/                    # FastAPI backend
???   ????????? app/
???   ???   ????????? api/               # Endpoints API
???   ???   ????????? models/            # Mod??les SQLAlchemy
???   ???   ????????? schemas/           # Sch??mas Pydantic
???   ???   ????????? services/          # Logique m??tier
???   ????????? alembic/               # Migrations DB
????????? packages/
    ????????? types/                  # Types TypeScript partag??s}</pre>
          </div>
        </Card>

        {/* Scripts disponibles */}
        <Card title="Scripts Disponibles" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">D??veloppement</h4>
              <ul className="space-y-1 text-sm">
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">pnpm dev</code> - D??marrer le frontend</li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">pnpm dev:full</code> - D??marrer frontend + backend</li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">pnpm build</code> - Build de production</li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">pnpm lint</code> - Linter le code</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Backend</h4>
              <ul className="space-y-1 text-sm">
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">alembic upgrade head</code> - Migrations DB</li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">pytest</code> - Lancer les tests</li>
                <li><code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">uvicorn app.main:app --reload</code> - D??marrer le serveur</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Technologies utilis??es */}
        <Card title="Stack Technologique" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Next.js', version: '16.1.0' },
              { name: 'React', version: '19.0.0' },
              { name: 'TypeScript', version: '5.x' },
              { name: 'Tailwind CSS', version: '3.x' },
              { name: 'FastAPI', version: '0.115+' },
              { name: 'Python', version: '3.11+' },
              { name: 'PostgreSQL', version: '14+' },
              { name: 'Turborepo', version: '2.x' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
              >
                <div className="font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{tech.version}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}