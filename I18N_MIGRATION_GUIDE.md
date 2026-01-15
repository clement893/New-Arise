# Guide de Migration i18n

Ce guide explique comment migrer les textes hardcodés vers le système de traduction next-intl pour supporter le français via le switcher de langue.

## Structure des fichiers de traduction

Les traductions sont stockées dans :
- `apps/web/messages/en.json` - Traductions anglaises
- `apps/web/messages/fr.json` - Traductions françaises

## Comment utiliser les traductions

### 1. Importer useTranslations

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('admin.pages'); // Namespace de traduction
  const tCommon = useTranslations('common'); // Pour les traductions communes
}
```

### 2. Remplacer les textes hardcodés

**Avant :**
```tsx
<PageHeader
  title="Page Management"
  description="Manage site content pages"
/>
```

**Après :**
```tsx
<PageHeader
  title={t('title')}
  description={t('description')}
/>
```

### 3. Utiliser les paramètres dynamiques

**Avant :**
```tsx
<p>Are you sure you want to delete the page <strong>{page.title}</strong>?</p>
```

**Après :**
```tsx
<p>{t('deleteModal.message', { title: page.title })}</p>
```

Dans le fichier JSON :
```json
{
  "deleteModal": {
    "message": "Are you sure you want to delete the page {title}?"
  }
}
```

## Pages déjà migrées

- ✅ `admin/pages/AdminPagesContent.tsx` - Exemple de migration complète
- ✅ Traductions ajoutées dans `en.json` et `fr.json` pour :
  - `admin.settings`
  - `admin.pages`
  - `admin.articles`
  - `admin.plans`

## Pages à migrer

Les pages suivantes doivent être migrées pour supporter le français :

1. **Admin pages :**
   - `admin/settings/AdminSettingsContent.tsx`
   - `admin/articles/AdminArticlesContent.tsx`
   - `admin/plans/page.tsx`
   - `admin/organizations/AdminOrganizationsContent.tsx`
   - `admin/users/AdminUsersContent.tsx`
   - `admin/media/AdminMediaContent.tsx`
   - `admin/invitations/page.tsx`
   - `admin/rbac/page.tsx`
   - `admin/teams/page.tsx`
   - `admin/api-keys/AdminAPIKeysContent.tsx`

2. **Dashboard pages :**
   - `dashboard/admin/users/page.tsx`
   - `dashboard/admin/assessment-management/page.tsx`
   - `dashboard/evaluators/page.tsx`
   - `dashboard/reseau/*` (toutes les pages)
   - `dashboard/assessments/*` (toutes les pages)
   - `dashboard/coach/*` (toutes les pages)

3. **Composants :**
   - `components/reseau/*` (tous les composants)
   - `components/ui/*` (composants avec textes hardcodés)

## Étapes de migration

1. **Identifier les textes hardcodés** dans le composant
2. **Ajouter les clés de traduction** dans `en.json` et `fr.json`
3. **Importer useTranslations** dans le composant
4. **Remplacer les textes** par des appels à `t()`
5. **Tester** avec le switcher de langue

## Exemple complet

Voir `apps/web/src/app/[locale]/admin/pages/AdminPagesContent.tsx` pour un exemple complet de migration.
