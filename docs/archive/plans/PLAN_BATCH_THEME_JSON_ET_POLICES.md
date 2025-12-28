# Plan par Batch : Fix JSON Complexe + Support Polices (S3)

## Objectif Global

1. ✅ Fixer la sauvegarde de JSON complexe (glassmorphism, etc.)
2. ✅ Ajouter l'upload de polices vers S3
3. ✅ Ajouter la sélection de polices dans les thèmes
4. ✅ Mettre à jour la documentation template

## État Actuel

✅ **Backend API Polices** : Existe déjà (`backend/app/api/v1/endpoints/theme_fonts.py`)
- POST `/v1/theme-fonts` - Upload police
- GET `/v1/theme-fonts` - Liste polices
- GET `/v1/theme-fonts/{font_id}` - Détails police
- DELETE `/v1/theme-fonts/{font_id}` - Suppression police

✅ **Client API Frontend** : Existe déjà (`apps/web/src/lib/api/theme-font.ts`)
- `uploadFont()`, `listFonts()`, `getFont()`, `deleteFont()`

✅ **Modèle Base de Données** : Existe déjà (`backend/app/models/theme_font.py`)

❌ **Composant Upload Frontend** : À créer
❌ **Intégration dans ThemeEditor** : À faire
❌ **Chargement dynamique** : À améliorer
❌ **Fix JSON complexe** : À faire

## Structure des Batches

### BATCH 1 : Fix Sauvegarde JSON Complexe (Critique)
**Objectif** : Permettre la sauvegarde de structures JSON complexes sans perte de données

**Fichiers à modifier** :
- `apps/web/src/app/[locale]/admin/themes/components/ThemeEditor.tsx`

**Changements** :
1. Modifier `handleSave` pour utiliser `...state.config` et préserver toute la structure
2. Ajouter des fallbacks pour compatibilité avec formulaire

**Tests** :
- ✅ Build TypeScript sans erreurs
- ✅ Test manuel : sauvegarder JSON glassmorphism complet
- ✅ Vérifier que tous les champs sont préservés

**Commit** : `fix(theme): préserver structures JSON complexes lors sauvegarde`

---

### BATCH 2 : Vérification API Polices (Déjà Intégrée ✅)
**Objectif** : Vérifier que tout fonctionne (skip si OK)

**Vérifications rapides** :
- ✅ API enregistrée dans `backend/app/api/v1/router.py` (ligne 68-70)
- ✅ Tous les endpoints existent (POST, GET, GET/{id}, DELETE)
- ✅ Client API frontend complet

**Action** : Test rapide manuel si nécessaire, sinon skip ce batch

**Commit** : `chore: vérification API polices (déjà intégrée)`

---

### BATCH 3 : Frontend - Composant Upload Polices
**Objectif** : Créer composant pour uploader et gérer les polices

**Fichiers à créer/modifier** :
- `apps/web/src/components/theme/FontUploader.tsx` (nouveau)
- `apps/web/src/lib/api/theme-font.ts` (existe déjà - ✅ complet)
- `apps/web/src/app/[locale]/admin/themes/components/ThemeEditor.tsx` (intégrer uploader)

**Changements** :
1. ✅ Client API existe déjà (`theme-font.ts`) :
   - ✅ `uploadFont(file: File)` existe
   - ✅ `listFonts()` existe
   - ✅ `getFont(fontId)` existe
   - ✅ `deleteFont(fontId)` existe
2. Créer composant `FontUploader.tsx` :
   - Zone de drag & drop pour upload
   - Liste des polices uploadées avec preview
   - Bouton suppression pour chaque police
   - Sélection de police pour thème (checkbox ou radio)
   - Affichage métadonnées (nom, famille, poids, style)
3. Intégrer dans `ThemeEditor` :
   - Ajouter onglet "Polices" ou section dans onglet Form
   - Permettre sélection de polices multiples (pour différentes variantes)

**Types TypeScript** :
- ✅ `ThemeFont` existe dans `packages/types/src/theme-font.ts`
- ✅ `ThemeFontCreate` existe
- ✅ `ThemeFontListResponse` existe

**Tests** :
- ✅ Build TypeScript sans erreurs
- ✅ Test upload fichier .woff2
- ✅ Test affichage liste polices
- ✅ Test suppression police
- ✅ Test sélection police

**Commit** : `feat(frontend): composant upload et gestion polices pour thèmes`

---

### BATCH 4 : Intégration Polices dans Thème
**Objectif** : Permettre la sélection de polices uploadées dans la configuration du thème

**Fichiers à modifier** :
- `apps/web/src/app/[locale]/admin/themes/components/ThemeForm.tsx`
- `apps/web/src/app/[locale]/admin/themes/components/JSONEditor.tsx`
- `apps/web/src/app/[locale]/admin/themes/components/ThemeEditor.tsx`
- `packages/types/src/theme.ts` (ajouter champs polices si nécessaire)

**Changements** :
1. Ajouter sélecteur de police dans `ThemeForm` :
   - Dropdown avec polices uploadées
   - Option "Police personnalisée" (URL)
   - Option "Police système" (Inter, etc.)
2. Mettre à jour `JSONEditor` pour supporter :
   - `fontFiles`: array d'IDs de polices
   - `fontUrl`: URL personnalisée
   - `fontFamily`: nom de la famille
3. Mettre à jour `handleSave` pour inclure les polices sélectionnées

**Structure Config** :
```typescript
{
  typography: {
    fontFamily: "Custom Font Name",
    fontFiles: [1, 2], // IDs des polices uploadées
    fontUrl: "https://...", // URL personnalisée (optionnel)
    // ... autres champs typography
  }
}
```

**Tests** :
- ✅ Build TypeScript sans erreurs
- ✅ Test sélection police dans formulaire
- ✅ Test sauvegarde avec polices
- ✅ Test JSON avec fontFiles

**Commit** : `feat(theme): intégration sélection polices dans configuration thème`

---

### BATCH 5 : Chargement Dynamique Polices
**Objectif** : Charger dynamiquement les polices sélectionnées dans le thème actif

**Fichiers à modifier** :
- `apps/web/src/lib/theme/global-theme-provider.tsx`
- `apps/web/src/lib/theme/font-loader.ts`
- `apps/web/src/lib/theme/apply-theme-config.ts`

**Changements** :
1. Modifier `applyThemeConfig` pour :
   - Détecter `fontFiles` dans config
   - Charger les fichiers depuis S3
   - Créer `@font-face` dynamiquement
2. Améliorer `font-loader.ts` :
   - Fonction `loadFontFiles(fontIds: number[])`
   - Fonction `loadCustomFont(url: string, fontFamily: string)`
3. Gérer le cache des polices chargées

**Code exemple** :
```typescript
// Dans applyThemeConfig
if (config.typography?.fontFiles && Array.isArray(config.typography.fontFiles)) {
  await loadFontFiles(config.typography.fontFiles);
}

if (config.typography?.fontUrl) {
  await loadCustomFont(config.typography.fontUrl, config.typography.fontFamily);
}
```

**Tests** :
- ✅ Build TypeScript sans erreurs
- ✅ Test chargement police depuis S3
- ✅ Test application police sur page
- ✅ Test fallback si police échoue

**Commit** : `feat(theme): chargement dynamique polices depuis S3`

---

### BATCH 6 : Documentation Template
**Objectif** : Mettre à jour la documentation pour refléter les nouvelles fonctionnalités

**Fichiers à modifier** :
- `docs/THEME_CREATION_GUIDE.md`
- `docs/THEME_MANAGEMENT.md`
- `README.md` (section thèmes si existe)
- `TEMPLATE_CUSTOMIZATION.md` (si existe)

**Contenu à ajouter** :
1. Section "Structures Complexes Supportées" :
   - Glassmorphism
   - Typography avancée
   - Spacing personnalisé
   - Exemples JSON complets
2. Section "Gestion des Polices" :
   - Upload de polices
   - Sélection dans thème
   - Formats supportés
   - Bonnes pratiques
3. Section "Exemples de Thèmes" :
   - Thème glassmorphism complet
   - Thème avec polices personnalisées
   - Thème dark mode avancé

**Tests** :
- ✅ Vérifier tous les liens
- ✅ Vérifier exemples de code
- ✅ Vérifier formatage markdown

**Commit** : `docs(theme): mise à jour documentation structures complexes et polices`

---

## Checklist de Validation par Batch

### Avant chaque Push

- [ ] `pnpm build` (frontend) sans erreurs
- [ ] `python -m pytest` (backend) sans erreurs (si tests existent)
- [ ] `pnpm type-check` (si disponible) sans erreurs
- [ ] Vérifier imports/exports TypeScript
- [ ] Vérifier types manquants
- [ ] Test manuel de la fonctionnalité

### Après chaque Batch

- [ ] Commit avec message descriptif
- [ ] Push vers dépôt
- [ ] Créer rapport de progression (`PROGRESS_BATCH_X.md`)

---

## Rapport de Progression Template

```markdown
# Progression Batch X : [Titre]

## ✅ Complété
- [Liste des tâches complétées]

## 🔄 En Cours
- [Tâches en cours]

## ⏭️ Prochain Batch
- [Tâches du prochain batch]

## 🐛 Problèmes Rencontrés
- [Problèmes et solutions]

## 📝 Notes
- [Notes importantes]
```

---

## Ordre d'Exécution Recommandé

1. **BATCH 1** (Critique) - Fix JSON complexe - **30 min**
2. **BATCH 2** (Vérification) - Skip si API OK - **5 min**
3. **BATCH 3** (Frontend) - Composant upload polices - **1h30**
4. **BATCH 4** (Intégration) - Sélection polices dans thème - **1h**
5. **BATCH 5** (Chargement) - Chargement dynamique polices - **1h30**
6. **BATCH 6** (Docs) - Documentation template - **45 min**

**Total estimé** : ~5h40

---

## Gestion des Erreurs TypeScript

### Erreurs Communes et Solutions

1. **Type manquant** :
   - Ajouter dans `packages/types/src/theme.ts`
   - Exporter depuis `packages/types/src/index.ts`

2. **Import introuvable** :
   - Vérifier chemin relatif/absolu
   - Vérifier exports dans fichier source

3. **Type incompatible** :
   - Utiliser `as ThemeConfig` si nécessaire
   - Ajouter `[key: string]: unknown` pour flexibilité

4. **Propriété manquante** :
   - Utiliser `(config as any).property` temporairement
   - Ajouter propriété au type si permanente

---

## Variables d'Environnement Nécessaires

### Backend
```env
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

### Frontend
Aucune nouvelle variable nécessaire (utilise API backend)

---

## Structure Config Thème avec Polices

Après implémentation, la structure config pourra inclure :

```typescript
{
  typography: {
    fontFamily: "Custom Font Name",
    fontFiles: [1, 2, 3], // IDs des polices uploadées (pour différentes variantes)
    fontUrl: "https://fonts.googleapis.com/...", // Optionnel : URL externe
    // ... autres champs typography existants
  },
  // ... autres structures complexes (colors, effects, spacing, etc.)
}
```

Le système chargera automatiquement les fichiers de polices depuis S3 en utilisant les IDs dans `fontFiles`.

---

## Notes Importantes

1. **Ne pas modifier plusieurs fichiers en même temps** - un batch à la fois
2. **Toujours tester le build avant de push**
3. **Utiliser des types stricts mais flexibles** (`[key: string]: unknown`)
4. **Documenter les changements** dans les commits
5. **Créer rapport de progression** après chaque batch
