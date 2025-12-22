/**
 * Components Playground Page
 * Page de démonstration et test de tous les composants avec gestion de thème dynamique
 */

'use client';

import { ThemeManager } from '@/components/theme/ThemeManager';
import { ComponentGallery } from '@/components/theme/ComponentGallery';

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Composants UI - Playground
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testez et visualisez tous les composants avec le gestionnaire de thème dynamique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Theme Manager */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ThemeManager />
            </div>
          </div>

          {/* Main Content - Component Gallery */}
          <div className="lg:col-span-3">
            <ComponentGallery />
          </div>
        </div>
      </div>
    </div>
  );
}

