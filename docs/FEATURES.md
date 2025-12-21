# 🎯 Fonctionnalités du Template

Documentation complète des fonctionnalités disponibles dans le template.

## 📊 Seed de Données

### Scripts Disponibles

```bash
# Seed basique (utilisateurs)
npm run seed

# Seed étendu (données complètes)
npm run seed:extended
```

### Utilisation

```bash
# Après avoir configuré la base de données
npm run migrate  # Appliquer les migrations
npm run seed     # Générer les données de test
```

### Comptes de Test Créés

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`
- **Utilisateurs aléatoires**: 8 utilisateurs supplémentaires

## 🏗️ Templates de Modules ERP

### Modules Disponibles

1. **CRM** (`templates/modules/crm/`)
   - Gestion des leads
   - Gestion des contacts
   - Pipeline de vente

2. **Facturation** (`templates/modules/billing/`)
   - Gestion des factures
   - Gestion des paiements
   - Produits/services

### Utilisation

```bash
# Copier un template
cp -r templates/modules/crm backend/app/modules/

# Générer les types
npm run generate:types

# Créer les migrations
cd backend && alembic revision --autogenerate -m "Add CRM"
```

## 🧪 Tests E2E

### Tests Disponibles

- **auth.spec.ts**: Tests d'authentification
- **components.spec.ts**: Tests des composants UI
- **navigation.spec.ts**: Tests de navigation

### Commandes

```bash
# Exécuter tous les tests E2E
npm run test:e2e

# Interface graphique
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug
```

### Ajouter un Nouveau Test

Créer un fichier dans `apps/web/tests/e2e/`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mon Module', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/mon-page');
    // Votre test ici
  });
});
```

## 📦 Analyse de Performance

### Scripts Disponibles

```bash
# Analyser le bundle size
npm run analyze

# Build avec analyse
npm run analyze:build
```

### Optimisations Configurées

- ✅ Code splitting automatique
- ✅ Tree shaking
- ✅ Compression
- ✅ Images optimisées (AVIF, WebP)
- ✅ Lazy loading des composants

### Recommandations

Le script d'analyse fournit des recommandations pour:
- Réduire la taille des bundles
- Optimiser les imports
- Utiliser le code splitting

## 🌍 Support i18n (Multi-langue)

### Langues Supportées

- 🇫🇷 Français (par défaut)
- 🇬🇧 English
- 🇪🇸 Español

### Utilisation

```tsx
import { useTranslations } from '@/lib/i18n/hooks';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return <h1>{t.welcome}</h1>;
}
```

### Changer de Langue

```tsx
import LocaleSwitcher from '@/components/i18n/LocaleSwitcher';

<LocaleSwitcher />
```

### Ajouter une Langue

1. Ajouter dans `src/lib/i18n/config.ts`
2. Ajouter les traductions dans `src/lib/i18n/messages.ts`

## 📚 Documentation Complémentaire

- [Guide de Démarrage](./GETTING_STARTED.md)
- [Audit du Projet](./PROJECT_AUDIT.md)
- [Templates de Modules](./templates/modules/README.md)
- [Génération de Types](./scripts/generate/types/README.md)

