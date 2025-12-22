'use client';

import { PageHeader, PageContainer } from '@/components/layout';

// Disable static generation to avoid CSS file issues during build
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function AdminPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Administration"
        description="Panneau d'administration"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Administration' }]}
      />
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bienvenue dans l'administration</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est en cours de développement.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

