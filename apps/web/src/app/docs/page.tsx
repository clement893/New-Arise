'use client';

/**
 * Documentation Page Component
 * 
 * Displays comprehensive technical documentation for the full-stack template.
 * This is a Client Component because it uses interactive features.
 * 
 * Note: Metadata is exported from layout.tsx since metadata can only be
 * exported from Server Components. See docs/layout.tsx for SEO metadata.
 * 
 * Internationalization (i18n):
 * Currently, all text is hardcoded in French. To add multi-language support:
 * 1. Install next-intl or react-i18next
 * 2. Create translation files in apps/web/src/locales/[lang]/docs.json
 * 3. Replace hardcoded strings with translation keys (e.g., t('docs.title'))
 * 4. Move FEATURES, SCRIPTS, and other text constants to translation files
 * 
 * Example structure:
 *   locales/
 *     fr/
 *       docs.json
 *     en/
 *       docs.json
 */

import { Card } from '@/components/ui';

// Type definitions for static data
interface TechStackItem {
  name: string;
  version: string;
}

interface FeatureCategory {
  category: string;
  items: readonly string[];
}

interface ScriptGroup {
  title: string;
  scripts: readonly { command: string; description: string }[];
}

/**
 * Hook path mapping function
 * Maps hook names to their file paths.
 * Note: Assumes hooks follow the naming convention @/hooks/{hookName}
 * If your hooks use a different structure, update this function accordingly.
 */
function getHookPath(hookName: string): string {
  return `@/hooks/${hookName.toLowerCase()}`;
}

// Static data constants - moved outside component to prevent recreation on every render
const UI_COMPONENTS: readonly string[] = [
  'Accordion', 'Alert', 'Badge', 'Breadcrumb', 'Button', 'Card', 'Checkbox',
  'DataTable', 'DataTableEnhanced', 'DatePicker', 'Dropdown', 'ExportButton',
  'FileUpload', 'FileUploadWithPreview', 'Form', 'FormBuilder', 'Input',
  'KanbanBoard', 'Modal', 'Pagination', 'Progress', 'Radio', 'Select',
  'Skeleton', 'Spinner', 'Switch', 'Tabs', 'Textarea', 'Toast', 'Tooltip'
] as const;

const HOOKS: readonly string[] = [
  'useAuth', 'useForm', 'usePagination', 'useFilters', 'usePermissions',
  'useLogger', 'useDebounce', 'useLocalStorage', 'useMediaQuery'
] as const;

// Compute component count at module level for better performance
const COMPONENT_COUNT = UI_COMPONENTS.length;

const FEATURES: readonly FeatureCategory[] = [
  {
    category: 'Frontend',
    items: [
      'Next.js 16 avec App Router et Turbopack',
      'React 19 avec Server Components',
      'TypeScript 5 avec configuration stricte',
      'Tailwind CSS 3 pour le styling',
      `Bibliothèque UI complète (${COMPONENT_COUNT}+ composants ERP)`,
      'Hooks réutilisables personnalisés',
      'NextAuth.js v5 avec OAuth Google',
      'Protection des routes avec middleware',
      'Gestion centralisée des erreurs',
      'Logging structuré',
      'Support du mode sombre',
      'Responsive design mobile-first'
    ]
  },
  {
    category: 'Backend',
    items: [
      'FastAPI avec documentation OpenAPI/Swagger automatique',
      'Pydantic v2 pour la validation des données',
      'SQLAlchemy async ORM',
      'Alembic pour les migrations de base de données',
      'PostgreSQL avec support async',
      'Authentification JWT avec refresh tokens',
      'Tests avec pytest',
      'Logging avec loguru',
      'Gestion standardisée des erreurs',
      'API RESTful complète',
      'Support CORS configuré',
      'Rate limiting'
    ]
  },
  {
    category: 'Types Partagés',
    items: [
      'Package @modele/types pour les types TypeScript partagés',
      'Génération automatique depuis les schémas Pydantic',
      'Synchronisation frontend/backend',
      'Types type-safe end-to-end'
    ]
  },
  {
    category: 'DevOps & Outils',
    items: [
      'Turborepo pour monorepo optimisé',
      'pnpm workspaces pour la gestion des dépendances',
      'GitHub Actions CI/CD',
      'Pre-commit hooks avec Husky',
      'Docker & Docker Compose',
      'Prêt pour déploiement Railway',
      'Générateurs de code (composants, pages, routes API)',
      'Scripts de migration de base de données',
      'Configuration ESLint et Prettier',
      'Storybook pour la documentation des composants'
    ]
  }
] as const;

/**
 * Project Structure Generator
 * 
 * Generates a tree-like representation of the project structure.
 * This function makes it easier to maintain and update the structure display.
 * 
 * Note: For i18n support, consider moving this to a translation file
 * and using a library like next-intl or react-i18next.
 */
function generateProjectStructure(): string {
  const structure = [
    'MODELE-NEXTJS-FULLSTACK/',
    '+-- apps/',
    '|   +-- web/',
    '|   |   +-- src/',
    '|   |   |   +-- app/',
    '|   |   |   +-- components/',
    '|   |   |   |   +-- ui/',
    '|   |   |   |   +-- providers/',
    '|   |   |   +-- hooks/',
    '|   |   |   +-- lib/',
    '|   |   |   |   +-- api/',
    '|   |   |   |   +-- auth/',
    '|   |   |   |   +-- errors/',
    '|   |   |   |   +-- logger/',
    '|   |   |   |   +-- store/',
    '|   |   +-- package.json',
    '+-- backend/',
    '|   +-- app/',
    '|   |   +-- api/',
    '|   |   +-- models/',
    '|   |   +-- schemas/',
    '|   |   +-- services/',
    '|   +-- alembic/',
    '+-- packages/',
    '    +-- types/'
  ];
  
  return structure.join('\n');
}

const PROJECT_STRUCTURE = generateProjectStructure();

const SCRIPTS: readonly ScriptGroup[] = [
  {
    title: 'Développement',
    scripts: [
      { command: 'pnpm dev', description: 'Démarrer le frontend' },
      { command: 'pnpm dev:full', description: 'Démarrer frontend + backend' },
      { command: 'pnpm build', description: 'Build de production' },
      { command: 'pnpm lint', description: 'Linter le code' }
    ]
  },
  {
    title: 'Backend',
    scripts: [
      { command: 'alembic upgrade head', description: 'Migrations DB' },
      { command: 'pytest', description: 'Lancer les tests' },
      { command: 'uvicorn app.main:app --reload', description: 'Démarrer le serveur' }
    ]
  }
] as const;

/**
 * Technology Stack
 * Standardized version format: Use specific versions where available,
 * or minimum version with '+' suffix for ranges (e.g., "3.11+" means 3.11 or higher)
 */
const TECH_STACK: readonly TechStackItem[] = [
  { name: 'Next.js', version: '16.1.0' },
  { name: 'React', version: '19.0.0' },
  { name: 'TypeScript', version: '5.3.3' },
  { name: 'Tailwind CSS', version: '3.4.1' },
  { name: 'FastAPI', version: '0.115.0+' },
  { name: 'Python', version: '3.11.0+' },
  { name: 'PostgreSQL', version: '14.0+' },
  { name: 'Turborepo', version: '2.0.0' }
] as const;

/**
 * Documentation Page Component
 * 
 * Note: This component renders static content, so no loading state is needed.
 * If you add dynamic content in the future, consider adding a loading.tsx file
 * or loading state management.
 * 
 * Error handling: Errors are caught by the error.tsx boundary in the app directory.
 */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8" role="banner">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Documentation Technique du Template
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Vue d'ensemble complète de tous les éléments inclus dans ce template full-stack
          </p>
        </header>

        <Card title={`Composants UI (${COMPONENT_COUNT}+)`} className="mb-6" aria-label={`Liste de ${COMPONENT_COUNT} composants UI`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {UI_COMPONENTS.map((component) => (
              <div
                key={component}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono"
                role="listitem"
              >
                {component}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Tous les composants sont disponibles dans <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">@/components/ui</code> et exportés depuis <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">@/components/ui/index.ts</code>
          </p>
        </Card>

        <Card title="Hooks Personnalisés" className="mb-6" aria-label="Liste des hooks personnalisés disponibles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
            {HOOKS.map((hook) => (
              <div
                key={hook}
                className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                role="listitem"
              >
                <code className="text-sm font-mono text-blue-600 dark:text-blue-400" aria-label={`Hook ${hook}`}>
                  {hook}
                </code>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Disponible dans <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">{getHookPath(hook)}</code>
                </p>
              </div>
            ))}
          </div>
        </Card>

        {FEATURES.map((feature) => (
          <Card
            key={feature.category}
            title={feature.category}
            className="mb-6"
            aria-label={`Fonctionnalités ${feature.category}`}
          >
            <ul className="space-y-2" role="list">
              {feature.items.map((item, index) => (
                <li key={`${feature.category}-${index}`} className="flex items-start" role="listitem">
                  <span className="text-green-500 mr-2" aria-hidden="true">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}

        <Card title="Structure du Projet" className="mb-6" aria-label="Structure du projet">
          <div className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words" aria-label="Structure du projet">
              {PROJECT_STRUCTURE}
            </pre>
          </div>
        </Card>

        <Card title="Scripts Disponibles" className="mb-6" aria-label="Scripts disponibles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCRIPTS.map((group) => (
              <div key={group.title}>
                <h4 className="font-semibold mb-2">{group.title}</h4>
                <ul className="space-y-1 text-sm" role="list">
                  {group.scripts.map((script, index) => (
                    <li key={`${group.title}-${index}`} role="listitem">
                      <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded" aria-label={`Commande: ${script.command}`}>
                        {script.command}
                      </code>
                      <span className="mx-2" aria-hidden="true">-</span>
                      <span>{script.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Stack Technologique" className="mb-6" aria-label="Stack technologique utilisée">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="list">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg"
                role="listitem"
                aria-label={`${tech.name} version ${tech.version}`}
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