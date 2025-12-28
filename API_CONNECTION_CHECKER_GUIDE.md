# 🛠️ Guide Complet : Outil de Vérification des Connexions API

Guide pratique pour utiliser les outils automatisés de vérification des connexions API.

---

## 🎯 Comment Ça Marche ?

### Principe de Fonctionnement

Les scripts analysent automatiquement votre code pour :

1. **Détecter les appels API** dans les pages frontend
2. **Vérifier si les modules API existent** dans `lib/api/`
3. **Vérifier si les fonctions API existent** dans les modules
4. **Vérifier si les endpoints backend existent** dans les fichiers Python
5. **Détecter les TODOs** indiquant des intégrations manquantes
6. **Générer des rapports** de statut

---

## 🚀 Démarrage Rapide

### Installation

Aucune installation nécessaire ! Les scripts utilisent Node.js qui est déjà requis pour le projet.

### Première Utilisation

```bash
# 1. Vérifier l'état actuel
pnpm api:check

# 2. Voir les détails
pnpm api:check:detailed

# 3. Vérifier le backend
pnpm api:check:backend

# 4. Générer un rapport
pnpm api:report
```

---

## 📋 Commandes Disponibles

### Vérification Frontend

```bash
# Vérification basique (résumé seulement)
pnpm api:check

# Vérification détaillée (toutes les informations)
pnpm api:check:detailed

# Vérifier une page spécifique
node scripts/check-api-connections.js --page /content/pages
```

### Vérification Backend

```bash
# Vérifier tous les endpoints backend
pnpm api:check:backend
```

### Génération de Rapports

```bash
# Générer un rapport markdown
pnpm api:report

# Générer avec nom personnalisé
node scripts/generate-api-connection-report.js --output MON_RAPPORT.md
```

---

## 📊 Exemple de Sortie

### Vérification Basique

```
🔍 Scanning for pages...
Found 150 pages

📝 Analyzing pages...
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
  - /surveys
  - /surveys/[id]/preview
  - /surveys/[id]/results
  - /dashboard/reports

⚠️  Pages with Partial Connections:
  - /content/media
  - /content/schedule
```

### Vérification Détaillée

```
📄 Detailed Analysis:

/content/pages
  Status: needs-integration
  Path: app/[locale]/content/pages/page.tsx
  TODOs: 3
    TODO at line 41: Load pages from API when backend endpoints are ready
    TODO at line 54: Create page via API
    TODO at line 65: Update page via API

/content/pages/[slug]/edit
  Status: needs-integration
  Path: app/[locale]/content/pages/[slug]/edit/page.tsx
  TODOs: 1
    TODO at line 39: Replace with actual page API endpoint when available
```

### Vérification Backend

```
🔍 Scanning backend endpoints...

📊 Found 150 endpoints in 25 modules

🔍 Checking router registration...

📈 Summary:
  ✅ Registered modules: 23
  ❌ Unregistered modules: 2

❌ Unregistered Modules:
  - surveys
  - reports

📋 Endpoints by Module:

✅ pages (5 endpoints)
    GET /api/v1/pages
    POST /api/v1/pages
    PUT /api/v1/pages/{page_id}
    DELETE /api/v1/pages/{page_id}
    GET /api/v1/pages/{slug}
```

---

## 🔍 Ce Que Détecte Chaque Script

### `check-api-connections.js`

#### Détecte :

1. **Appels API directs**
   ```typescript
   apiClient.get('/v1/pages')
   apiClient.post('/v1/pages', data)
   ```

2. **Appels via modules**
   ```typescript
   pagesAPI.list()
   formsAPI.getSubmissions(id)
   ```

3. **Imports de modules API**
   ```typescript
   import { pagesAPI } from '@/lib/api/pages'
   ```

4. **TODOs liés aux API**
   ```typescript
   // TODO: Load pages from API
   // FIXME: Connect to API
   ```

#### Vérifie :

1. ✅ Module API existe-t-il ? (`lib/api/[module].ts`)
2. ✅ Fonction existe-t-elle dans le module ?
3. ✅ Endpoint backend existe-t-il ?
4. ✅ Endpoint est-il enregistré dans le router ?

### `check-api-connections-backend.js`

#### Détecte :

1. **Tous les endpoints** dans les fichiers Python
   ```python
   @router.get("/pages")
   @router.post("/pages")
   ```

2. **Enregistrement dans le router**
   ```python
   api_router.include_router(pages.router, ...)
   ```

#### Vérifie :

1. ✅ Module est-il importé ?
2. ✅ Router est-il inclus ?

### `generate-api-connection-report.js`

#### Génère :

1. **Rapport markdown complet**
2. **Statistiques détaillées**
3. **Liste des problèmes**
4. **Analyse page par page**

---

## 🎓 Cas d'Usage

### Cas 1 : Vérifier Avant un Batch

```bash
# Avant de commencer Batch 1
pnpm api:check > status-before-batch-1.txt

# Voir quelles pages doivent être traitées
cat status-before-batch-1.txt | grep "Needs integration"
```

### Cas 2 : Vérifier Après un Batch

```bash
# Après avoir complété Batch 1
pnpm api:check > status-after-batch-1.txt

# Comparer les résultats
diff status-before-batch-1.txt status-after-batch-1.txt

# Générer un rapport pour la documentation
pnpm api:report --output BATCH_1_REPORT.md
```

### Cas 3 : Vérifier une Page Spécifique

```bash
# Vérifier uniquement /content/pages
node scripts/check-api-connections.js --page /content/pages

# Cela vous dira :
# - Si la page a des appels API
# - Si les modules API existent
# - Si les endpoints backend existent
# - S'il y a des TODOs
```

### Cas 4 : Vérifier le Backend

```bash
# Vérifier que tous les endpoints sont enregistrés
pnpm api:check:backend

# Si des modules ne sont pas enregistrés, vous verrez :
# ❌ Unregistered Modules:
#   - surveys
#   - reports
```

### Cas 5 : Générer un Rapport pour Documentation

```bash
# Générer un rapport complet
pnpm api:report

# Le rapport sera dans API_CONNECTION_REPORT.md
# Vous pouvez l'inclure dans votre documentation Git
```

---

## 🔧 Intégration dans le Workflow

### Dans le Plan par Batch

```bash
# 1. Avant chaque batch
pnpm api:check > status-before-batch-X.txt

# 2. Pendant le développement (après chaque page)
node scripts/check-api-connections.js --page /path/to/page

# 3. Avant de committer
pnpm api:check
# S'assurer qu'il n'y a pas de régressions

# 4. Après le batch
pnpm api:check > status-after-batch-X.txt
pnpm api:report --output BATCH_X_REPORT.md

# 5. Comparer
diff status-before-batch-X.txt status-after-batch-X.txt
```

### Dans CI/CD

Ajouter dans `.github/workflows/ci.yml` :

```yaml
- name: Check API Connections
  run: |
    pnpm api:check
    # Exit code 1 = problèmes détectés = CI échoue
```

### Dans Pre-commit Hooks

Modifier `scripts/pre-commit.js` :

```javascript
// Vérifier les connexions API
try {
  execSync('pnpm api:check', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Some pages need API integration!');
  process.exit(1);
}
```

---

## 📈 Suivi de Progression

### Tableau de Bord Automatique

Créer `scripts/generate-dashboard.js` :

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

// Exécuter la vérification
const output = execSync('pnpm api:check', { encoding: 'utf8' });

// Extraire les statistiques
const summaryMatch = output.match(/Connected: (\d+).*Partial: (\d+).*Needs integration: (\d+)/s);
if (summaryMatch) {
  const [, connected, partial, needsIntegration] = summaryMatch;
  
  const dashboard = {
    date: new Date().toISOString(),
    connected: parseInt(connected),
    partial: parseInt(partial),
    needsIntegration: parseInt(needsIntegration),
    progress: ((parseInt(connected) / 150) * 100).toFixed(1) + '%',
  };
  
  fs.writeFileSync('API_CONNECTION_DASHBOARD.json', JSON.stringify(dashboard, null, 2));
  console.log('✅ Dashboard updated:', dashboard);
}
```

---

## 🐛 Résolution des Problèmes

### Problème : Script ne trouve pas les fichiers

**Solution** :
```bash
# Vérifier que vous êtes à la racine du projet
pwd
# Doit afficher: .../MODELE-NEXTJS-FULLSTACK

# Vérifier que les chemins sont corrects
ls apps/web/src/app/[locale]
ls backend/app/api/v1/endpoints
```

### Problème : "Module API not found"

**Solution** :
1. Vérifier que le fichier existe : `apps/web/src/lib/api/[module].ts`
2. Si n'existe pas, créer selon le plan par batch
3. Vérifier l'import dans la page

### Problème : "Backend endpoint not found"

**Solution** :
1. Utiliser `pnpm api:check:backend` pour voir tous les endpoints
2. Vérifier que l'endpoint existe dans le bon fichier
3. Créer l'endpoint si manquant
4. Vérifier qu'il est enregistré dans `router.py`

### Problème : Faux positifs

**Solution** :
Les scripts peuvent parfois détecter des patterns qui ne sont pas de vrais appels API. Vérifier manuellement :
```bash
# Voir les détails
pnpm api:check:detailed

# Vérifier le fichier spécifique
cat apps/web/src/app/[locale]/path/to/page.tsx
```

---

## 📚 Exemples Concrets

### Exemple 1 : Vérifier Batch 1

```bash
# Avant
pnpm api:check
# Needs integration: 15

# Travailler sur Batch 1 (Pages Management)
# ... modifications ...

# Après chaque page modifiée
node scripts/check-api-connections.js --page /content/pages
# Vérifier que la page est maintenant "connected"

# Après Batch 1
pnpm api:check
# Needs integration: 11  ← 4 pages connectées !
```

### Exemple 2 : Vérifier le Backend

```bash
# Vérifier que tous les endpoints sont enregistrés
pnpm api:check:backend

# Si vous voyez :
# ❌ Unregistered Modules:
#   - surveys
#
# Alors vous devez :
# 1. Ouvrir backend/app/api/v1/router.py
# 2. Ajouter :
#    api_router.include_router(
#      surveys.router,
#      tags=["surveys"]
#    )
```

### Exemple 3 : Générer un Rapport pour MR

```bash
# Avant de créer une Merge Request
pnpm api:report --output API_STATUS.md

# Ajouter API_STATUS.md à votre MR
# Cela montre clairement ce qui a été fait
```

---

## ✅ Checklist d'Utilisation

### Avant de Commencer un Batch

- [ ] Exécuter `pnpm api:check` pour voir l'état initial
- [ ] Sauvegarder le résultat dans un fichier
- [ ] Identifier les pages à traiter dans le batch

### Pendant le Développement

- [ ] Vérifier après chaque page modifiée
- [ ] S'assurer que TypeScript compile
- [ ] Vérifier que les appels API fonctionnent

### Avant de Committer

- [ ] Exécuter `pnpm api:check` pour vérifier les progrès
- [ ] Vérifier qu'il n'y a pas de régressions
- [ ] Générer un rapport si nécessaire

### Après le Batch

- [ ] Exécuter `pnpm api:check` pour voir les résultats
- [ ] Comparer avec l'état initial
- [ ] Générer un rapport de progression
- [ ] Mettre à jour la documentation

---

## 🎯 Résultat Attendu

Après avoir utilisé les outils régulièrement :

✅ **Visibilité complète** sur l'état des connexions API  
✅ **Détection automatique** des problèmes  
✅ **Suivi de progression** facile  
✅ **Documentation automatique** des changements  
✅ **Intégration CI/CD** possible  

---

## 📖 Ressources

- **Documentation complète**: `docs/API_CONNECTION_CHECKER.md`
- **Plan d'intégration**: `API_INTEGRATION_BATCH_PLAN.md`
- **Workflow**: `API_INTEGRATION_WORKFLOW_EXPLANATION.md`
- **Liste des pages**: `APP_PAGES_AND_FEATURES.md`

---

*Guide créé le: [Date]*
*Dernière mise à jour: [Date]*

