# 📋 Plan d'Intégration API par Batch

Plan structuré pour connecter toutes les pages aux API backend, en évitant les erreurs de build et TypeScript.

---

## 🎯 Objectif

Connecter toutes les pages marquées comme nécessitant une connexion DB/Backend aux endpoints API existants, en suivant une approche par batch pour minimiser les risques et faciliter le suivi.

---

## 📐 Méthodologie

### Principe de Fonctionnement

1. **Batch par Batch** : Traiter 3-5 pages similaires à la fois
2. **Vérifications à chaque étape** :
   - ✅ TypeScript compile sans erreurs
   - ✅ Build Next.js réussit
   - ✅ Tests passent (si disponibles)
   - ✅ Pas de régressions sur les pages existantes
3. **Commit & Push** : Après chaque batch validé
4. **Rapport de Progression** : Documenter chaque batch
5. **Documentation Finale** : Mettre à jour la doc template

### Structure d'un Batch

Chaque batch contient :
- **Pages à traiter** (3-5 pages similaires)
- **API endpoints nécessaires**
- **Étapes de développement**
- **Tests de validation**
- **Vérification automatique** (via outil de vérification API)
- **Checklist de vérification**

---

## 📦 Batch 1 : Pages Management (Priorité Haute)

### Pages à Traiter
1. `/content/pages` - Liste des pages
2. `/content/pages/[slug]/edit` - Éditeur de page
3. `/content/pages/[slug]/preview` - Aperçu de page
4. `/pages/[slug]` - Rendu dynamique

### API Endpoints Disponibles
- `GET /api/v1/pages` - Liste des pages
- `GET /api/v1/pages/{slug}` - Obtenir une page par slug
- `POST /api/v1/pages` - Créer une page
- `PUT /api/v1/pages/{page_id}` - Mettre à jour une page
- `DELETE /api/v1/pages/{page_id}` - Supprimer une page

### Étapes de Développement

#### Étape 1.1 : Créer les fonctions API
**Fichier**: `apps/web/src/lib/api/pages.ts`

```typescript
import { apiClient } from './client';

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface PageCreate {
  slug: string;
  title: string;
  content: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface PageUpdate {
  slug?: string;
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'archived';
}

export const pagesAPI = {
  list: async (skip = 0, limit = 100) => {
    const response = await apiClient.get<Page[]>('/v1/pages', {
      params: { skip, limit },
    });
    return (response as any).data || response;
  },

  get: async (slug: string) => {
    const response = await apiClient.get<Page>(`/v1/pages/${slug}`);
    return (response as any).data || response;
  },

  create: async (data: PageCreate) => {
    const response = await apiClient.post<Page>('/v1/pages', data);
    return (response as any).data || response;
  },

  update: async (id: number, data: PageUpdate) => {
    const response = await apiClient.put<Page>(`/v1/pages/${id}`, data);
    return (response as any).data || response;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/v1/pages/${id}`);
  },
};
```

**Vérifications** :
- [ ] TypeScript compile sans erreurs
- [ ] Types exportés correctement

#### Étape 1.2 : Intégrer dans `/content/pages/page.tsx`
**Modifications** :
- Remplacer les TODO par les appels API réels
- Utiliser `pagesAPI.list()` dans `loadPages()`
- Utiliser `pagesAPI.create()` dans `handlePageCreate()`
- Utiliser `pagesAPI.update()` dans `handlePageUpdate()`
- Utiliser `pagesAPI.delete()` dans `handlePageDelete()`

**Vérifications** :
- [ ] TypeScript compile
- [ ] Gestion d'erreurs correcte
- [ ] États de chargement gérés

#### Étape 1.3 : Intégrer dans `/content/pages/[slug]/edit/page.tsx`
**Modifications** :
- Charger la page avec `pagesAPI.get(slug)`
- Sauvegarder avec `pagesAPI.update(id, data)`

**Vérifications** :
- [ ] TypeScript compile
- [ ] Gestion des erreurs 404

#### Étape 1.4 : Intégrer dans `/content/pages/[slug]/preview/page.tsx`
**Modifications** :
- Charger la page avec `pagesAPI.get(slug)`

**Vérifications** :
- [ ] TypeScript compile

#### Étape 1.5 : Intégrer dans `/pages/[slug]/page.tsx`
**Modifications** :
- Charger la page avec `pagesAPI.get(slug)`
- Gérer le cas où la page n'existe pas (404)

**Vérifications** :
- [ ] TypeScript compile
- [ ] Gestion 404 correcte

### Checklist de Validation Batch 1

- [ ] Tous les fichiers TypeScript compilent sans erreurs
- [ ] Build Next.js réussit : `pnpm build`
- [ ] Pas d'erreurs de lint : `pnpm lint`
- [ ] Les 4 pages fonctionnent correctement
- [ ] Gestion d'erreurs testée (404, erreurs réseau)
- [ ] États de chargement affichés correctement
- [ ] **Vérification API automatique** ⭐ **Via page de test** : Ouvrir `http://localhost:3000/test/api-connections` → Cliquer "Check Detailed" → Vérifier que les pages sont "connected"
- [ ] **Vérification API automatique** (alternative) : `pnpm api:check` montre les pages comme "connected"

### Commande de Test

**Méthode 1 : Page de Test Interactive** ⭐ **Recommandé** (voir `API_CONNECTION_TEST_COMPLETE_GUIDE.md`) :
1. Ouvrir `http://localhost:3000/test/api-connections`
2. Cliquer "Refresh" pour voir les statistiques
3. Cliquer "Check Detailed" pour vérifier chaque page
4. Cliquer "Generate Report" puis "Download" pour sauvegarder le rapport

**Méthode 2 : Ligne de Commande** :
```bash
# Vérifier TypeScript
pnpm --filter web type-check

# Vérifier le build
pnpm --filter web build

# Vérifier le lint
pnpm --filter web lint

# Vérifier les connexions API (automatique)
pnpm api:check
```

### Commit & Push
```bash
git add apps/web/src/lib/api/pages.ts apps/web/src/app/[locale]/content/pages apps/web/src/app/[locale]/pages
git commit -m "Batch 1: Connect pages management to API

- Add pagesAPI with CRUD operations
- Integrate /content/pages with API
- Integrate /content/pages/[slug]/edit with API
- Integrate /content/pages/[slug]/preview with API
- Integrate /pages/[slug] with API
- Add proper error handling and loading states"
git push
```

---

## 📦 Batch 2 : Forms Submissions (Priorité Haute)

### Pages à Traiter
1. `/forms/[id]/submissions` - Visualiseur de soumissions

### API Endpoints Disponibles
- `GET /api/v1/forms/{form_id}/submissions` - Liste des soumissions

### Étapes de Développement

#### Étape 2.1 : Vérifier/Créer les fonctions API
**Fichier**: `apps/web/src/lib/api/forms.ts` (vérifier si existe)

```typescript
export const formsAPI = {
  // ... fonctions existantes ...
  
  getSubmissions: async (formId: number, skip = 0, limit = 100) => {
    const response = await apiClient.get(`/v1/forms/${formId}/submissions`, {
      params: { skip, limit },
    });
    return (response as any).data || response;
  },
};
```

#### Étape 2.2 : Intégrer dans `/forms/[id]/submissions/page.tsx`
**Modifications** :
- Charger les soumissions avec `formsAPI.getSubmissions(formId)`
- Afficher les données dans un tableau
- Gérer la pagination si nécessaire

### Checklist de Validation Batch 2

- [ ] TypeScript compile sans erreurs
- [ ] Build Next.js réussit
- [ ] Page fonctionne correctement
- [ ] Gestion d'erreurs testée

### Commit & Push
```bash
git commit -m "Batch 2: Connect form submissions to API

- Add getSubmissions to formsAPI
- Integrate /forms/[id]/submissions with API
- Add proper error handling"
git push
```

---

## 📦 Batch 3 : Surveys (Priorité Haute)

### Pages à Traiter
1. `/surveys` - Liste des sondages
2. `/surveys/[id]/preview` - Aperçu de sondage
3. `/surveys/[id]/results` - Résultats de sondage

### API Endpoints à Vérifier/Créer
- `GET /api/v1/surveys` - Liste des sondages
- `GET /api/v1/surveys/{survey_id}` - Obtenir un sondage
- `GET /api/v1/surveys/{survey_id}/responses` - Obtenir les réponses

**Note**: Si ces endpoints n'existent pas, ils doivent être créés dans le backend d'abord.

### Étapes de Développement

#### Étape 3.1 : Vérifier les endpoints backend
**Action**: Vérifier si `/api/v1/surveys` existe dans `backend/app/api/v1/endpoints/`

**Si n'existe pas** :
1. Créer `backend/app/api/v1/endpoints/surveys.py`
2. Implémenter les endpoints CRUD
3. Ajouter au router principal

#### Étape 3.2 : Créer les fonctions API frontend
**Fichier**: `apps/web/src/lib/api/surveys.ts`

```typescript
export interface Survey {
  id: number;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  created_at: string;
  updated_at: string;
}

export interface SurveyResponse {
  id: number;
  survey_id: number;
  responses: Record<string, unknown>;
  submitted_at: string;
}

export const surveysAPI = {
  list: async (skip = 0, limit = 100) => {
    const response = await apiClient.get<Survey[]>('/v1/surveys', {
      params: { skip, limit },
    });
    return (response as any).data || response;
  },

  get: async (surveyId: number) => {
    const response = await apiClient.get<Survey>(`/v1/surveys/${surveyId}`);
    return (response as any).data || response;
  },

  getResponses: async (surveyId: number, skip = 0, limit = 100) => {
    const response = await apiClient.get<SurveyResponse[]>(
      `/v1/surveys/${surveyId}/responses`,
      { params: { skip, limit } }
    );
    return (response as any).data || response;
  },
};
```

#### Étape 3.3 : Intégrer dans les pages
- `/surveys` : Utiliser `surveysAPI.list()`
- `/surveys/[id]/preview` : Utiliser `surveysAPI.get(id)`
- `/surveys/[id]/results` : Utiliser `surveysAPI.getResponses(id)`

### Checklist de Validation Batch 3

- [ ] Backend endpoints créés (si nécessaire)
- [ ] TypeScript compile sans erreurs
- [ ] Build Next.js réussit
- [ ] Les 3 pages fonctionnent correctement

### Commit & Push
```bash
git commit -m "Batch 3: Connect surveys to API

- Add surveysAPI with list, get, getResponses
- Integrate /surveys with API
- Integrate /surveys/[id]/preview with API
- Integrate /surveys/[id]/results with API"
git push
```

---

## 📦 Batch 4 : Dashboard Reports (Priorité Haute)

### Pages à Traiter
1. `/dashboard/reports` - Page de rapports

### API Endpoints à Vérifier/Créer
- `GET /api/v1/reports` - Liste des rapports sauvegardés
- `POST /api/v1/reports` - Sauvegarder un rapport
- `GET /api/v1/reports/{report_id}` - Obtenir un rapport

**Note**: Ces endpoints peuvent ne pas exister. Vérifier d'abord.

### Étapes de Développement

#### Étape 4.1 : Vérifier/Créer les endpoints backend
**Action**: Vérifier si `/api/v1/reports` existe

**Si n'existe pas** :
1. Créer `backend/app/api/v1/endpoints/reports.py`
2. Implémenter les endpoints
3. Ajouter au router

#### Étape 4.2 : Créer les fonctions API frontend
**Fichier**: `apps/web/src/lib/api/reports.ts`

```typescript
export interface Report {
  id: number;
  name: string;
  description?: string;
  config: ReportConfig;
  data: ReportData;
  created_at: string;
}

export const reportsAPI = {
  list: async () => {
    const response = await apiClient.get<Report[]>('/v1/reports');
    return (response as any).data || response;
  },

  get: async (reportId: number) => {
    const response = await apiClient.get<Report>(`/v1/reports/${reportId}`);
    return (response as any).data || response;
  },

  create: async (config: ReportConfig) => {
    const response = await apiClient.post<Report>('/v1/reports', config);
    return (response as any).data || response;
  },
};
```

#### Étape 4.3 : Intégrer dans `/dashboard/reports/page.tsx`
**Modifications** :
- Remplacer les données mockées par `reportsAPI.list()`
- Utiliser `reportsAPI.create()` pour sauvegarder

### Checklist de Validation Batch 4

- [ ] Backend endpoints créés (si nécessaire)
- [ ] TypeScript compile sans erreurs
- [ ] Build Next.js réussit
- [ ] Page fonctionne avec données réelles

### Commit & Push
```bash
git commit -m "Batch 4: Connect dashboard reports to API

- Add reportsAPI with CRUD operations
- Integrate /dashboard/reports with API
- Remove mock data"
git push
```

---

## 📦 Batch 5 : Content Media & Schedule (Priorité Moyenne)

### Pages à Traiter
1. `/content/media` - Bibliothèque média
2. `/content/schedule` - Contenu programmé
3. `/content/templates` - Modèles de contenu

### API Endpoints à Vérifier/Créer
- Media: `GET /api/v1/media`, `POST /api/v1/media`, `DELETE /api/v1/media/{id}`
- Schedule: `GET /api/v1/scheduled-posts`, `POST /api/v1/scheduled-posts`
- Templates: `GET /api/v1/templates`, `POST /api/v1/templates`

**Note**: Vérifier si ces endpoints existent. Si non, créer dans le backend.

### Étapes de Développement

#### Étape 5.1 : Vérifier/Créer les endpoints backend
Pour chaque module (media, schedule, templates) :
1. Vérifier l'existence des endpoints
2. Créer si nécessaire
3. Ajouter au router

#### Étape 5.2 : Créer les fonctions API frontend
Créer ou mettre à jour :
- `apps/web/src/lib/api/media.ts`
- `apps/web/src/lib/api/scheduled-posts.ts`
- `apps/web/src/lib/api/templates.ts` (peut déjà exister)

#### Étape 5.3 : Intégrer dans les pages
Intégrer les appels API dans chaque page.

### Checklist de Validation Batch 5

- [ ] Backend endpoints créés (si nécessaire)
- [ ] TypeScript compile sans erreurs
- [ ] Build Next.js réussit
- [ ] Les 3 pages fonctionnent correctement

### Commit & Push
```bash
git commit -m "Batch 5: Connect content media, schedule, and templates to API

- Add mediaAPI with upload/list/delete operations
- Add scheduledPostsAPI with CRUD operations
- Update templatesAPI if needed
- Integrate all 3 pages with API"
git push
```

---

## 📦 Batch 6 : Help Center (Priorité Basse)

### Pages à Traiter
1. `/help/faq` - FAQ
2. `/help/guides` - Guides utilisateur
3. `/help/videos` - Tutoriels vidéo

### Décision Nécessaire
**Question**: Ces pages doivent-elles être dynamiques (DB) ou statiques (markdown/files) ?

**Recommandation**: 
- Si statiques → Pas besoin d'API, garder comme tel
- Si dynamiques → Créer endpoints backend et intégrer

### Étapes de Développement

#### Étape 6.1 : Décision
Décider si ces pages doivent être dynamiques.

#### Étape 6.2 : Si dynamiques
1. Créer endpoints backend
2. Créer fonctions API frontend
3. Intégrer dans les pages

#### Étape 6.3 : Si statiques
Documenter que ces pages sont intentionnellement statiques.

### Checklist de Validation Batch 6

- [ ] Décision prise et documentée
- [ ] Si dynamiques : API intégrée
- [ ] Si statiques : Documentation mise à jour

### Commit & Push
```bash
git commit -m "Batch 6: Help center pages

- [Decision: Static/Dynamic]
- [If dynamic: API integration details]
- [If static: Documentation update]"
git push
```

---

## 🧪 Page de Test API Connections ⭐ **Recommandé**

Une page de test interactive est disponible à `/test/api-connections` pour :

- ✅ Vérifier le statut des connexions API en temps réel
- ✅ Tester les connexions frontend (basique et détaillé)
- ✅ Vérifier les endpoints backend
- ✅ Générer et télécharger des rapports markdown
- ✅ Interface visuelle intuitive avec résultats formatés

### Utilisation

**Guide complet** : Voir `API_CONNECTION_TEST_COMPLETE_GUIDE.md` pour le workflow détaillé.

**Utilisation rapide** :
1. **Accéder à la page** : `http://localhost:3000/test/api-connections`
2. **Vérifier le statut rapide** : Cliquer sur "Refresh" dans "Quick Status"
3. **Tester les connexions frontend** : Cliquer sur "Check Basic" ou "Check Detailed"
4. **Vérifier le backend** : Cliquer sur "Check Backend"
5. **Générer un rapport** : Cliquer sur "Generate Report" puis "Download"

### Intégration dans le Workflow

- **Avant chaque batch** : Ouvrir la page → Cliquer "Refresh" → Noter les statistiques → Télécharger rapport
- **Après chaque page modifiée** : Ouvrir la page → Cliquer "Check Detailed" → Vérifier que la page est "connected"
- **Avant de committer** : Ouvrir la page → Cliquer "Generate Report" → Télécharger pour documentation
- **En production** : Utiliser pour vérifier l'état des connexions en temps réel

**Avantages vs ligne de commande** :
- ✅ Interface visuelle intuitive
- ✅ Résultats formatés et colorés
- ✅ Génération de rapports intégrée
- ✅ Téléchargement direct
- ✅ Utilisable en production

---

## 📝 Rapport de Progression Template

**Utiliser le template** : `BATCH_PROGRESS_REPORT_TEMPLATE.md`

Ce template inclut :
- ✅ Sections pour pages traitées, endpoints API, fichiers modifiés
- ✅ Vérifications avec page de test interactive ⭐ (recommandé)
- ✅ Vérifications avec ligne de commande (alternative)
- ✅ Statistiques avant/après avec comparaison
- ✅ Checklist complète avec vérifications automatiques
- ✅ Références aux guides (`API_CONNECTION_TEST_COMPLETE_GUIDE.md`, etc.)

**Créer un fichier** `BATCH_X_PROGRESS_REPORT.md` pour chaque batch en copiant le template et en remplissant les sections.

---

## 🔄 Workflow Complet

### Pour Chaque Batch

1. **Préparation**
   ```bash
   git checkout -b batch-X-api-integration
   ```
   
   **Vérifier l'état initial** ⭐ **Via page de test** (recommandé) :
   - Ouvrir `http://localhost:3000/test/api-connections`
   - Cliquer "Refresh" → Noter les statistiques
   - Cliquer "Generate Report" → Télécharger `BATCH_X_BEFORE.md`
   
   **Alternative ligne de commande** :
   ```bash
   pnpm api:check > status-before-batch-X.txt
   ```

2. **Développement**
   - Suivre les étapes du batch
   - Vérifier TypeScript à chaque modification
   - Tester localement
   - **Vérifier après chaque page** ⭐ **Via page de test** :
     - Ouvrir `http://localhost:3000/test/api-connections`
     - Cliquer "Check Detailed" → Chercher la page modifiée
     - Vérifier qu'elle apparaît comme "connected" ✅
   - **Alternative ligne de commande** : `pnpm api:check --page /path/to/page`

3. **Validation**
   ```bash
   # Vérifier TypeScript
   pnpm --filter web type-check
   
   # Vérifier le build
   pnpm --filter web build
   
   # Vérifier le lint
   pnpm --filter web lint
   ```
   
   **Vérifier les connexions API** ⭐ **Via page de test** (recommandé) :
   - Ouvrir `http://localhost:3000/test/api-connections`
   - Cliquer "Refresh" → Vérifier les nouvelles statistiques
   - Cliquer "Check Detailed" → Vérifier que toutes les pages du batch sont "connected"
   - Cliquer "Check Backend" → Vérifier les endpoints backend
   - Cliquer "Generate Report" → Télécharger `BATCH_X_AFTER.md`
   
   **Alternative ligne de commande** :
   ```bash
   pnpm api:check
   pnpm api:check:backend
   ```

4. **Documentation**
   - Créer le rapport de progression (utiliser `BATCH_PROGRESS_REPORT_TEMPLATE.md`)
   - Mettre à jour `APP_PAGES_AND_FEATURES.md`
   - **Rapport API** ⭐ **Via page de test** : Utiliser le rapport téléchargé (`BATCH_X_AFTER.md`)
   - **Alternative ligne de commande** : `pnpm api:report --output BATCH_X_REPORT.md`

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "Batch X: [Description]"
   git push origin batch-X-api-integration
   ```

6. **Merge Request**
   - Créer une MR sur GitHub/GitLab
   - Inclure le rapport API généré
   - Attendre review
   - Merger après approbation

---

## 📚 Mise à Jour Documentation Finale

### Après Tous les Batches

1. **Mettre à jour `APP_PAGES_AND_FEATURES.md`**
   - Changer tous les ⚠️ en ✅ pour les pages connectées
   - Mettre à jour les statistiques
   - Ajouter les nouvelles routes API documentées
   - Documenter la page `/test/api-connections`

2. **Mettre à jour `README.md`**
   - Ajouter section sur les API disponibles
   - Documenter les nouveaux endpoints
   - Documenter la page de test API connections
   - Documenter les scripts de vérification (`pnpm api:check`)

3. **Mettre à jour `docs/API.md`** (si existe)
   - Documenter toutes les routes API
   - Ajouter des exemples d'utilisation
   - Documenter les endpoints de vérification API

4. **Créer `API_INTEGRATION_COMPLETE.md`**
   - Résumé de tous les batches
   - Liste complète des pages connectées
   - Statistiques finales
   - Utilisation de la page de test pour vérification

---

## ✅ Checklist Finale

- [ ] Tous les batches complétés
- [ ] Toutes les pages connectées aux API
- [ ] TypeScript compile sans erreurs
- [ ] Build Next.js réussit
- [ ] Tous les tests passent
- [ ] Documentation mise à jour
- [ ] README.md mis à jour
- [ ] Rapport final créé

---

## 🎯 Résultat Attendu

À la fin de tous les batches :
- ✅ Toutes les pages nécessitant une connexion API sont connectées
- ✅ Aucune erreur TypeScript ou de build
- ✅ Documentation complète et à jour
- ✅ Template prêt pour utilisation

---

*Plan créé le: [Date]*
*Dernière mise à jour: [Date]*

