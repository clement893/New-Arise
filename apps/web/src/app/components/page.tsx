/**
 * Components Index Page
 * Page d'accueil avec liens vers toutes les catégories de composants
 * 
 * Performance: Uses dynamic import for code splitting
 */

import nextDynamic from 'next/dynamic';

// Dynamically import ComponentsContent for route-based code splitting
const ComponentsContent = nextDynamic(
  () => import('./ComponentsContent'),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div className="text-xl text-gray-600">Chargement des composants...</div>
        </div>
      </div>
    ),
    ssr: true, // Enable SSR for SEO
  }
);

// Force dynamic rendering to avoid CSS file issues during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ComponentsPage() {
  return <ComponentsContent />;
}
