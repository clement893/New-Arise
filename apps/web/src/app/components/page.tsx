/**
 * Components Index Page
 * Page d'accueil avec liens vers toutes les catégories de composants
 */

import ComponentsContent from './ComponentsContent';

// Force dynamic rendering to avoid CSS file issues during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function ComponentsPage() {
  return <ComponentsContent />;
}
