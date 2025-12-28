# 🔄 Explication du Workflow d'Intégration API par Batch

Ce document explique comment fonctionne le processus d'intégration API par batch et pourquoi cette approche est utilisée.

---

## 🎯 Pourquoi une Approche par Batch ?

### Avantages

1. **Réduction des Risques**
   - Chaque batch est petit et gérable (3-5 pages)
   - Facilite l'identification des problèmes
   - Permet de revenir en arrière facilement si nécessaire

2. **Éviter les Erreurs de Build**
   - Vérifications TypeScript après chaque modification
   - Build testé avant chaque commit
   - Détection précoce des problèmes

3. **Traçabilité**
   - Chaque batch a son propre commit
   - Rapports de progression détaillés
   - Historique clair des modifications

4. **Facilite les Reviews**
   - Petites MR faciles à reviewer
   - Moins de risques de conflits
   - Feedback plus rapide

5. **Documentation Progressive**
   - Documentation mise à jour au fur et à mesure
   - Pas de grosse mise à jour à la fin
   - Template toujours à jour

---

## 📋 Structure d'un Batch

### 1. Préparation

```bash
# Créer une branche pour le batch
git checkout -b batch-1-pages-api-integration

# S'assurer d'être à jour avec main
git pull origin main
```

### 2. Développement

#### Étape A : Créer les Fonctions API

**Pourquoi d'abord ?**
- Définir les types TypeScript
- S'assurer que les interfaces sont correctes
- Permet de détecter les problèmes de types tôt

**Exemple** :
```typescript
// apps/web/src/lib/api/pages.ts
export interface Page {
  id: number;
  slug: string;
  title: string;
  // ...
}

export const pagesAPI = {
  list: async () => {
    // Implémentation
  },
  // ...
};
```

**Vérification** :
```bash
pnpm --filter web type-check
# ✅ Doit compiler sans erreurs
```

#### Étape B : Intégrer dans les Pages

**Ordre recommandé** :
1. Page la plus simple d'abord (ex: liste)
2. Puis les pages plus complexes (ex: édition)
3. Enfin les pages de visualisation

**Exemple** :
```typescript
// apps/web/src/app/[locale]/content/pages/page.tsx
import { pagesAPI } from '@/lib/api/pages';

const loadPages = async () => {
  try {
    setIsLoading(true);
    const pages = await pagesAPI.list();
    setPages(pages);
  } catch (error) {
    setError('Failed to load pages');
  } finally {
    setIsLoading(false);
  }
};
```

**Vérification après chaque page** :
```bash
pnpm --filter web type-check
# ✅ Doit toujours compiler
```

#### Étape C : Gestion des Erreurs

**Pattern à suivre** :
```typescript
try {
  const data = await apiCall();
  // Traiter les données
} catch (error) {
  // Logger l'erreur
  logger.error('Operation failed', error);
  
  // Afficher un message à l'utilisateur
  setError(getErrorMessage(error) || 'An error occurred');
  
  // Optionnel: Afficher un toast
  showToast({
    message: 'Operation failed',
    type: 'error',
  });
}
```

### 3. Validation

#### Checklist Avant Commit

```bash
# 1. Vérifier TypeScript
pnpm --filter web type-check
# ✅ Aucune erreur

# 2. Vérifier le build
pnpm --filter web build
# ✅ Build réussi

# 3. Vérifier le lint
pnpm --filter web lint
# ✅ Pas d'erreurs de lint

# 4. Tester manuellement
# ✅ Ouvrir chaque page modifiée
# ✅ Vérifier que les données s'affichent
# ✅ Tester les actions (create, update, delete)
# ✅ Vérifier la gestion d'erreurs
```

#### Pourquoi ces Vérifications ?

1. **TypeScript** : Détecte les erreurs de types avant le runtime
2. **Build** : S'assure que le code compile correctement
3. **Lint** : Maintient la qualité du code
4. **Tests manuels** : Vérifie que tout fonctionne réellement

### 4. Documentation

#### Créer le Rapport de Progression

**Fichier** : `BATCH_X_PROGRESS_REPORT.md`

**Contenu** :
- Pages traitées
- API endpoints utilisés
- Modifications apportées
- Vérifications effectuées
- Problèmes rencontrés
- Prochaines étapes

#### Mettre à Jour APP_PAGES_AND_FEATURES.md

**Changements** :
- Changer ⚠️ en ✅ pour les pages connectées
- Ajouter les routes API utilisées
- Mettre à jour les statistiques

### 5. Commit & Push

```bash
# Ajouter les fichiers modifiés
git add apps/web/src/lib/api/pages.ts
git add apps/web/src/app/[locale]/content/pages
git add BATCH_X_PROGRESS_REPORT.md
git add APP_PAGES_AND_FEATURES.md

# Commit avec message descriptif
git commit -m "Batch X: Connect pages management to API

- Add pagesAPI with CRUD operations
- Integrate /content/pages with API
- Integrate /content/pages/[slug]/edit with API
- Add proper error handling and loading states
- Update documentation"

# Push
git push origin batch-X-pages-api-integration
```

### 6. Merge Request

**Créer une MR** avec :
- Description du batch
- Liste des pages modifiées
- Lien vers le rapport de progression
- Checklist de validation

**Attendre review** avant de merger.

---

## 🔍 Détection et Résolution des Problèmes

### Problème TypeScript

**Symptôme** : Erreur de type lors de `type-check`

**Solution** :
1. Vérifier les types dans l'interface API
2. Vérifier que les types correspondent aux données backend
3. Utiliser `as` ou `type assertion` si nécessaire (avec précaution)

**Exemple** :
```typescript
// Si le backend retourne un format différent
const response = await apiClient.get('/v1/pages');
const pages = (response as any).data || response as Page[];
```

### Problème de Build

**Symptôme** : Erreur lors de `pnpm build`

**Solution** :
1. Vérifier les imports
2. Vérifier que tous les fichiers existent
3. Vérifier les dépendances

**Exemple** :
```typescript
// ❌ Mauvais import
import { pagesAPI } from '@/lib/api/page'; // Fichier n'existe pas

// ✅ Bon import
import { pagesAPI } from '@/lib/api/pages';
```

### Problème d'API

**Symptôme** : Erreur 404 ou 500 lors des appels API

**Solution** :
1. Vérifier que l'endpoint existe dans le backend
2. Vérifier l'URL de l'API
3. Vérifier l'authentification
4. Vérifier les paramètres de la requête

**Exemple** :
```typescript
// Vérifier l'endpoint dans le backend
// backend/app/api/v1/endpoints/pages.py

// Vérifier l'URL
const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log('API URL:', API_URL);

// Vérifier l'authentification
const token = TokenStorage.getToken();
console.log('Token:', token ? 'Present' : 'Missing');
```

---

## 📊 Suivi de Progression

### Tableau de Bord

Créer un fichier `API_INTEGRATION_STATUS.md` :

```markdown
# API Integration Status

## Batch 1: Pages Management
- [x] API functions created
- [x] Pages integrated
- [x] Tests passed
- [x] Documentation updated
- [x] Merged to main

## Batch 2: Forms Submissions
- [ ] API functions created
- [ ] Pages integrated
- [ ] Tests passed
- [ ] Documentation updated
- [ ] Merged to main

## Batch 3: Surveys
- [ ] Backend endpoints created
- [ ] API functions created
- [ ] Pages integrated
- [ ] Tests passed
- [ ] Documentation updated
- [ ] Merged to main

...
```

### Métriques

- **Pages connectées** : X / Y
- **API endpoints créés** : X
- **Batches complétés** : X / Y
- **Erreurs TypeScript** : 0
- **Erreurs de build** : 0

---

## 🎓 Bonnes Pratiques

### 1. Toujours Vérifier TypeScript

```bash
# Après chaque modification
pnpm --filter web type-check
```

### 2. Utiliser les Types Existants

```typescript
// ✅ Utiliser les types du package @modele/types si disponibles
import type { Page } from '@modele/types';

// ✅ Sinon, définir les types localement
export interface Page {
  id: number;
  // ...
}
```

### 3. Gérer les Erreurs Correctement

```typescript
// ✅ Toujours utiliser try/catch
try {
  const data = await apiCall();
} catch (error) {
  logger.error('Error', error);
  setError(getErrorMessage(error));
}

// ❌ Ne pas ignorer les erreurs
const data = await apiCall(); // Pas de gestion d'erreur
```

### 4. Documenter les Modifications

```typescript
// ✅ Ajouter des commentaires pour les cas complexes
/**
 * Load pages from API with pagination support
 * @param skip - Number of pages to skip
 * @param limit - Maximum number of pages to return
 */
const loadPages = async (skip = 0, limit = 100) => {
  // ...
};
```

### 5. Tester Avant de Committer

```bash
# Toujours tester avant de committer
pnpm --filter web type-check
pnpm --filter web build
pnpm --filter web lint
```

---

## 🚀 Workflow Complet en Résumé

```
1. Préparation
   └─> Créer branche
   └─> Mettre à jour depuis main

2. Développement
   └─> Créer fonctions API
   └─> Vérifier TypeScript
   └─> Intégrer dans pages
   └─> Vérifier TypeScript après chaque page
   └─> Gérer les erreurs

3. Validation
   └─> TypeScript check
   └─> Build check
   └─> Lint check
   └─> Tests manuels

4. Documentation
   └─> Créer rapport de progression
   └─> Mettre à jour APP_PAGES_AND_FEATURES.md

5. Commit & Push
   └─> Commit avec message descriptif
   └─> Push vers branche

6. Merge Request
   └─> Créer MR
   └─> Attendre review
   └─> Merger après approbation
```

---

## 📝 Template de Rapport de Progression

Voir `BATCH_PROGRESS_REPORT_TEMPLATE.md` pour un template détaillé.

---

## ✅ Résultat Final

Après tous les batches :
- ✅ Toutes les pages connectées aux API
- ✅ Aucune erreur TypeScript
- ✅ Build réussi
- ✅ Documentation complète
- ✅ Template prêt pour utilisation

---

*Document créé le: [Date]*
*Dernière mise à jour: [Date]*

