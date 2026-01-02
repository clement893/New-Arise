'use client';

export const dynamic = 'force-dynamic';

import Container from '@/components/ui/Container';

export default function AdminTestsPage() {
  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Gestion des Tests
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Page de test - Cette page devrait maintenant fonctionner
        </p>
      </div>
    </Container>
  );
}
