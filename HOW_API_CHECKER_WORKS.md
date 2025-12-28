# 🔍 Comment Fonctionne l'Outil de Vérification des Connexions API

Explication détaillée du fonctionnement des scripts automatisés de vérification des connexions API.

---

## 🎯 Vue d'Ensemble

L'outil consiste en **3 scripts Node.js** qui analysent automatiquement votre codebase pour vérifier les connexions API entre le frontend et le backend.

---

## 📦 Les 3 Scripts

### 1. `check-api-connections.js` - Vérificateur Frontend

**Ce qu'il fait** :
1. Scanne tous les fichiers `page.tsx` et `page.ts` dans `apps/web/src/app/[locale]`
2. Extrait les appels API (directs et via modules)
3. Détecte les TODOs liés aux API
4. Vérifie si les modules API existent
5. Vérifie si les fonctions API existent
6. Vérifie si les endpoints backend existent
7. Génère un rapport de statut

**Comment ça marche** :

```javascript
// 1. Trouve tous les fichiers page.tsx
findPageFiles('apps/web/src/app/[locale]')
// → ['app/[locale]/content/pages/page.tsx', ...]

// 2. Pour chaque page, extrait les appels API
extractApiCalls('app/[locale]/content/pages/page.tsx')
// → {
//     direct: [{ method: 'GET', endpoint: '/v1/pages' }],
//     module: [{ module: 'pagesAPI', method: 'list' }],
//     todos: [{ text: 'TODO: Load pages from API', line: 41 }]
//   }

// 3. Vérifie si le module existe
checkApiModule('pages')
// → { exists: true, path: 'lib/api/pages.ts' }

// 4. Vérifie si la fonction existe
checkApiFunction('lib/api/pages.ts', 'list')
// → true

// 5. Vérifie si l'endpoint backend existe
checkBackendEndpoint('/v1/pages')
// → { exists: true, file: 'backend/.../pages.py' }

// 6. Détermine le statut
// → 'connected' | 'partial' | 'needs-integration' | 'static'
```

**Exemple de sortie** :
```
📊 API Connection Status Report
================================================================================

📈 Summary:
  Total pages analyzed: 150
  ✅ Connected: 120
  ⚠️  Partial: 15
  ❌ Needs integration: 10
  🟡 Static: 5

❌ Pages Needing API Integration:
  - /content/pages
  - /forms/[id]/submissions
```

### 2. `check-api-connections-backend.js` - Vérificateur Backend

**Ce qu'il fait** :
1. Scanne tous les fichiers Python dans `backend/app/api/v1/endpoints`
2. Extrait tous les endpoints (`@router.get()`, `@router.post()`, etc.)
3. Vérifie si les modules sont enregistrés dans le router principal
4. Liste tous les endpoints par module

**Comment ça marche** :

```python
# 1. Lit un fichier Python backend
# backend/app/api/v1/endpoints/pages.py

@router.get("/pages")  # ← Détecté
async def list_pages(...):
    ...

@router.post("/pages")  # ← Détecté
async def create_page(...):
    ...

# 2. Extrait les endpoints
extractEndpoints('pages.py')
// → [
//     { method: 'GET', path: '/pages', file: 'pages.py' },
//     { method: 'POST', path: '/pages', file: 'pages.py' }
//   ]

# 3. Vérifie l'enregistrement dans router.py
checkRouterRegistration({ file: 'pages.py' })
// → Vérifie si 'pages.router' est inclus dans api_router
```

**Exemple de sortie** :
```
📊 Found 150 endpoints in 25 modules

📈 Summary:
  ✅ Registered modules: 23
  ❌ Unregistered modules: 2

❌ Unregistered Modules:
  - surveys
  - reports
```

### 3. `generate-api-connection-report.js` - Générateur de Rapport

**Ce qu'il fait** :
1. Utilise `check-api-connections.js` pour analyser toutes les pages
2. Génère un rapport markdown complet
3. Inclut statistiques, problèmes, et analyse détaillée

**Comment ça marche** :

```javascript
// 1. Analyse toutes les pages
const analyses = pageFiles.map(analyzePage)

// 2. Génère le markdown
generateMarkdownReport(analyses, 'API_CONNECTION_REPORT.md')
// → Crée un fichier markdown avec :
//    - Résumé statistique
//    - Liste des pages nécessitant une intégration
//    - Liste des pages avec connexions partielles
//    - Analyse détaillée de chaque page
```

**Exemple de sortie** :
Fichier `API_CONNECTION_REPORT.md` avec :
```markdown
# API Connection Report

## Summary
- Total pages analyzed: 150
- ✅ Connected: 120
- ⚠️ Partial: 15
- ❌ Needs integration: 10

## ❌ Pages Needing API Integration
### /content/pages
- Path: `app/[locale]/content/pages/page.tsx`
- TODOs:
  - Line 41: TODO: Load pages from API
```

---

## 🔍 Détection des Patterns

### Pattern 1 : Appels API Directs

**Code détecté** :
```typescript
apiClient.get('/v1/pages')
apiClient.post('/v1/pages', data)
apiClient.put('/v1/pages/1', data)
apiClient.delete('/v1/pages/1')
```

**Regex utilisée** :
```javascript
/apiClient\.(get|post|put|patch|delete)\(['"`]([^'"`]+)['"`]/g
```

**Résultat** :
```javascript
{
  method: 'GET',
  endpoint: '/v1/pages',
  line: 42
}
```

### Pattern 2 : Appels via Modules

**Code détecté** :
```typescript
import { pagesAPI } from '@/lib/api/pages';
pagesAPI.list()
pagesAPI.get(slug)
pagesAPI.create(data)
```

**Regex utilisée** :
```javascript
/(\w+API)\.(\w+)\(/g  // Pour les appels
/import.*from ['"`]@\/lib\/api\/(\w+)['"`]/g  // Pour les imports
```

**Résultat** :
```javascript
{
  module: 'pagesAPI',
  method: 'list',
  line: 45,
  moduleExists: true,
  functionExists: true
}
```

### Pattern 3 : TODOs

**Code détecté** :
```typescript
// TODO: Load pages from API
// FIXME: Connect to API
// TODO: Replace with API call
```

**Regex utilisée** :
```javascript
/TODO.*API|TODO.*api|FIXME.*API|FIXME.*api/g
```

**Résultat** :
```javascript
{
  text: 'TODO: Load pages from API',
  line: 41
}
```

---

## ✅ Vérifications Effectuées

### Vérification 1 : Module API Existe ?

**Processus** :
```javascript
// 1. Nom du module extrait : 'pagesAPI'
// 2. Enlève 'API' : 'pages'
// 3. Cherche le fichier : 'lib/api/pages.ts'
const moduleFile = path.join('lib/api', 'pages.ts')

// 4. Vérifie l'existence
fs.existsSync(moduleFile)
// → true ou false
```

### Vérification 2 : Fonction Existe dans le Module ?

**Processus** :
```javascript
// 1. Lit le fichier du module
const content = fs.readFileSync('lib/api/pages.ts')

// 2. Cherche la fonction 'list'
const patterns = [
  /list\s*:/,           // pagesAPI.list:
  /list\s*=\s*async/,    // list = async
  /function\s+list/,     // function list
  /const\s+list\s*=/     // const list =
]

// 3. Vérifie si un pattern correspond
patterns.some(pattern => pattern.test(content))
// → true ou false
```

### Vérification 3 : Endpoint Backend Existe ?

**Processus** :
```javascript
// 1. Endpoint : '/v1/pages'
// 2. Enlève '/v1/' : 'pages'
// 3. Prend le premier segment : 'pages'
// 4. Cherche le fichier : 'backend/.../endpoints/pages.py'

// 5. Lit le fichier Python
const content = fs.readFileSync('backend/.../pages.py')

// 6. Cherche le pattern
/@router\.(get|post|put|patch|delete)\(["']\/pages["']/
// → true ou false
```

---

## 📊 Détermination du Statut

### Algorithme de Statut

```javascript
function determineStatus(analysis) {
  // Si a des TODOs mais pas d'appels API
  if (analysis.hasTodos && !analysis.hasApiCalls) {
    return 'needs-integration';
  }
  
  // Si a des appels API et aucun problème
  if (analysis.hasApiCalls && analysis.issues.length === 0) {
    return 'connected';
  }
  
  // Si a des appels API mais des problèmes
  if (analysis.hasApiCalls && analysis.issues.length > 0) {
    return 'partial';
  }
  
  // Si pas d'appels API et pas de TODOs
  if (!analysis.hasApiCalls && !analysis.hasTodos) {
    return 'static';
  }
  
  return 'unknown';
}
```

### Exemples

**Page avec TODOs mais pas d'API** :
```typescript
// TODO: Load pages from API
const loadPages = async () => {
  setPages([]); // Pas d'appel API
};
```
→ **Statut** : `needs-integration`

**Page avec API fonctionnelle** :
```typescript
import { pagesAPI } from '@/lib/api/pages';
const loadPages = async () => {
  const pages = await pagesAPI.list(); // ✅ API existe
};
```
→ **Statut** : `connected`

**Page avec API mais problème** :
```typescript
import { pagesAPI } from '@/lib/api/pages';
const loadPages = async () => {
  const pages = await pagesAPI.list(); // ⚠️ Module n'existe pas
};
```
→ **Statut** : `partial`

---

## 🔄 Workflow Complet

### Étape par Étape

```
1. Lancer le script
   └─> pnpm api:check

2. Script scanne les fichiers
   └─> Trouve tous les page.tsx
   └─> Pour chaque page :
       ├─> Extrait les appels API
       ├─> Extrait les TODOs
       ├─> Vérifie les modules
       ├─> Vérifie les fonctions
       └─> Vérifie les endpoints backend

3. Génère le rapport
   └─> Calcule les statistiques
   └─> Classe les pages par statut
   └─> Affiche les résultats

4. Code de sortie
   └─> 0 = Tout OK
   └─> 1 = Problèmes détectés
```

---

## 🎯 Utilisation dans le Plan par Batch

### Avant un Batch

```bash
# 1. Vérifier l'état initial
pnpm api:check > before.txt

# 2. Identifier les pages à traiter
cat before.txt | grep "Needs integration"
# → /content/pages
# → /forms/[id]/submissions
```

### Pendant le Développement

```bash
# Après avoir modifié une page
node scripts/check-api-connections.js --page /content/pages

# Vérifier que :
# - Le statut passe de "needs-integration" à "connected"
# - Aucun problème n'est détecté
```

### Après un Batch

```bash
# 1. Vérifier les résultats
pnpm api:check > after.txt

# 2. Comparer
diff before.txt after.txt

# 3. Générer un rapport
pnpm api:report --output BATCH_1_REPORT.md
```

---

## 📈 Avantages

### 1. Automatisation
- ✅ Pas besoin de vérifier manuellement chaque page
- ✅ Détection automatique des problèmes
- ✅ Rapport généré automatiquement

### 2. Précision
- ✅ Analyse le code réel, pas la documentation
- ✅ Détecte les TODOs oubliés
- ✅ Vérifie que les endpoints existent vraiment

### 3. Traçabilité
- ✅ Historique des changements
- ✅ Comparaison avant/après
- ✅ Documentation automatique

### 4. Intégration CI/CD
- ✅ Peut être exécuté dans les pipelines
- ✅ Fait échouer le CI si des problèmes sont détectés
- ✅ Génère des rapports pour les MR

---

## 🚀 Exemple Complet

### Scénario : Vérifier Batch 1

```bash
# 1. Avant
$ pnpm api:check
📊 API Connection Status Report
================================================================================
📈 Summary:
  Total pages analyzed: 150
  ✅ Connected: 120
  ❌ Needs integration: 15

❌ Pages Needing API Integration:
  - /content/pages
  - /content/pages/[slug]/edit
  - /content/pages/[slug]/preview
  - /pages/[slug]

# 2. Travailler sur Batch 1
# ... créer pagesAPI ...
# ... intégrer dans les pages ...

# 3. Vérifier après chaque page
$ node scripts/check-api-connections.js --page /content/pages
✅ /content/pages - Status: connected

# 4. Après Batch 1
$ pnpm api:check
📊 API Connection Status Report
================================================================================
📈 Summary:
  Total pages analyzed: 150
  ✅ Connected: 124  ← +4 pages !
  ❌ Needs integration: 11  ← -4 pages !

# 5. Générer rapport
$ pnpm api:report --output BATCH_1_REPORT.md
✅ Report generated: BATCH_1_REPORT.md
```

---

## 🎓 Conclusion

Les outils automatisent complètement la vérification des connexions API :

1. **Détection automatique** des appels API et TODOs
2. **Vérification automatique** des modules et endpoints
3. **Rapport automatique** de l'état des connexions
4. **Intégration facile** dans le workflow de développement

Cela permet de :
- ✅ Suivre la progression facilement
- ✅ Détecter les problèmes rapidement
- ✅ Documenter automatiquement les changements
- ✅ Intégrer dans CI/CD pour éviter les régressions

---

*Document créé le: [Date]*
*Dernière mise à jour: [Date]*

