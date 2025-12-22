'use client';

import { PageHeader, PageContainer } from '@/components/layout';

export default function TeamsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Équipes"
        description="Gestion des équipes et membres"
        breadcrumbs={[{ label: 'Accueil', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Équipes' }]}
      />
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gestion des équipes</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Cette page est en cours de développement.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

