/**
 * Favorites Components Showcase Page
 */

'use client';

import { PageHeader, PageContainer, Section } from '@/components/layout';
import { FavoriteButton, FavoritesList } from '@/components/favorites';

export default function FavoritesComponentsContent() {
  return (
    <PageContainer>
      <PageHeader
        title="Composants Favoris"
        description="Composants pour gérer les favoris et listes de favoris"
        breadcrumbs={[
          { label: 'Accueil', href: '/' },
          { label: 'Composants', href: '/components' },
          { label: 'Favoris' },
        ]}
      />

      <div className="space-y-8 mt-8">
        <Section title="Favorite Button">
          <div className="flex gap-4 items-center">
            <FavoriteButton
              entityType="post"
              entityId={1}
              showCount={true}
              size="md"
            />
            <FavoriteButton
              entityType="post"
              entityId={2}
              showCount={false}
              size="sm"
            />
            <FavoriteButton
              entityType="post"
              entityId={3}
              showCount={true}
              size="lg"
            />
          </div>
        </Section>

        <Section title="Favorites List">
          <div className="max-w-4xl">
            <FavoritesList
              entityType="post"
              onFavoriteClick={(favorite) => {
                console.log('Favorite clicked:', favorite);
              }}
            />
          </div>
        </Section>
      </div>
    </PageContainer>
  );
}

