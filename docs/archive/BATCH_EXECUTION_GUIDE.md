# 🚀 Guide d'Exécution des Batches

Guide rapide pour exécuter les batches de correction du plan `CODE_FIX_PLAN.md`.

---

## 📋 Prérequis

Avant de commencer, assurez-vous que:

- ✅ Le projet build sans erreurs: `pnpm build`
- ✅ TypeScript compile: `pnpm type-check`
- ✅ Les tests passent: `pnpm test`
- ✅ Vous êtes sur la branche principale: `git checkout main` ou `git checkout INITIALComponentRICH`
- ✅ Votre dépôt est à jour: `git pull`

---

## 🎯 Workflow Rapide

### 1. Démarrer un Batch

#### Sur Linux/Mac:
```bash
./scripts/execute-batch.sh <numéro> <nom>
# Exemple:
./scripts/execute-batch.sh 1 "console-log-cleanup"
```

#### Sur Windows (PowerShell):
```powershell
.\scripts\execute-batch.ps1 -BatchNumber <numéro> -BatchName <nom>
# Exemple:
.\scripts\execute-batch.ps1 -BatchNumber 1 -BatchName "console-log-cleanup"
```

#### Manuellement:
```bash
# Créer la branche
git checkout -b fix/batch-1-console-log-cleanup

# Vérifier l'état initial
pnpm type-check
pnpm build
pnpm test
```

### 2. Appliquer les Modifications

Suivre les instructions du batch dans `CODE_FIX_PLAN.md`:

1. Lire la section du batch
2. Identifier les fichiers à modifier
3. Appliquer les modifications
4. Tester localement

### 3. Valider le Batch

#### Avec le script:
```bash
# Linux/Mac
./scripts/validate-batch.sh

# Windows (PowerShell)
.\scripts\validate-batch.ps1
```

#### Manuellement:
```bash
# Vérifier TypeScript
pnpm type-check

# Vérifier le build
pnpm build

# Vérifier les tests
pnpm test

# Vérifier les tests backend (si applicable)
cd backend && python -m pytest && cd ..
```

### 4. Créer le Rapport de Progression

1. Copier le template: `cp PROGRESS_REPORT_TEMPLATE.md PROGRESS_BATCH_X.md`
2. Remplir le rapport avec les détails du batch
3. Inclure les métriques et résultats

### 5. Commit et Push

```bash
# Ajouter les fichiers modifiés
git add .

# Commit avec message descriptif
git commit -m "fix: batch X - description du batch

- Modification 1
- Modification 2
- ...

Voir PROGRESS_BATCH_X.md pour les détails"

# Push vers le dépôt
git push origin fix/batch-X-description
```

---

## 📊 Ordre d'Exécution Recommandé

### Phase 1: Nettoyage (Batches 1-3)
**Durée estimée:** 2.5 heures

1. **Batch 1:** Console.log cleanup (30 min)
2. **Batch 2:** Types API Partie 1 (1h)
3. **Batch 3:** Types Composants Partie 2 (1h)

### Phase 2: Fonctionnalités (Batches 4-5)
**Durée estimée:** 4 heures

4. **Batch 4:** TODOs Frontend (2h)
5. **Batch 5:** TODOs Backend (2h)

### Phase 3: Optimisation (Batch 6)
**Durée estimée:** 1.5 heures

6. **Batch 6:** Requêtes Database (1.5h)

### Phase 4: Tests (Batches 7-8)
**Durée estimée:** 6 heures

7. **Batch 7:** Tests Frontend (3h)
8. **Batch 8:** Tests Backend (3h)

### Phase 5: Finalisation (Batches 9-10)
**Durée estimée:** 4 heures

9. **Batch 9:** Migrations (2h) - ⚠️ Optionnel
10. **Batch 10:** Documentation (2h)

**Total estimé:** ~18 heures

---

## ✅ Checklist par Batch

### Avant de Commencer

- [ ] Lire la section du batch dans `CODE_FIX_PLAN.md`
- [ ] Comprendre les objectifs et risques
- [ ] Vérifier les prérequis
- [ ] Créer la branche

### Pendant le Batch

- [ ] Appliquer les modifications une par une
- [ ] Tester après chaque modification importante
- [ ] Documenter les décisions prises
- [ ] Noter les problèmes rencontrés

### Avant le Commit

- [ ] `pnpm type-check` - Aucune erreur
- [ ] `pnpm build` - Build réussi
- [ ] `pnpm test` - Tous les tests passent
- [ ] Tests manuels des fonctionnalités modifiées
- [ ] Rapport de progression créé et rempli
- [ ] Code review (si applicable)

### Après le Commit

- [ ] Push vers le dépôt
- [ ] Vérifier que le push est réussi
- [ ] Mettre à jour le tableau de bord dans `CODE_FIX_PLAN.md`
- [ ] Préparer le batch suivant

---

## 🐛 Résolution de Problèmes

### Erreurs TypeScript

```bash
# Vérifier les erreurs
pnpm type-check

# Si erreurs, les corriger une par une
# Utiliser des types spécifiques au lieu de `any`
```

### Erreurs de Build

```bash
# Nettoyer le cache
rm -rf .next
pnpm build

# Vérifier les erreurs dans la console
```

### Tests qui Échouent

```bash
# Exécuter les tests en mode verbose
pnpm test --verbose

# Exécuter un test spécifique
pnpm test path/to/test.file.ts

# Vérifier les erreurs et corriger
```

### Conflits Git

```bash
# Mettre à jour la branche principale
git checkout main
git pull

# Rebaser votre branche
git checkout fix/batch-X-description
git rebase main

# Résoudre les conflits si nécessaire
```

---

## 📝 Notes Importantes

### ⚠️ Ne Jamais

- ❌ Commiter sans valider (`pnpm type-check && pnpm build && pnpm test`)
- ❌ Pousser directement sur `main` ou `INITIALComponentRICH`
- ❌ Ignorer les erreurs TypeScript
- ❌ Sauter les tests
- ❌ Oublier le rapport de progression

### ✅ Toujours

- ✅ Créer une branche pour chaque batch
- ✅ Valider avant chaque commit
- ✅ Créer un rapport de progression
- ✅ Tester manuellement les fonctionnalités modifiées
- ✅ Documenter les décisions importantes

---

## 🔗 Ressources

- **Plan complet:** `CODE_FIX_PLAN.md`
- **Template de rapport:** `PROGRESS_REPORT_TEMPLATE.md`
- **Rapport d'audit:** `CODE_AUDIT_REPORT.md`
- **Scripts d'aide:** `scripts/execute-batch.*` et `scripts/validate-batch.*`

---

## 📞 Support

Si vous rencontrez des problèmes:

1. Consulter le rapport d'audit: `CODE_AUDIT_REPORT.md`
2. Vérifier la section du batch dans `CODE_FIX_PLAN.md`
3. Consulter la documentation du projet: `docs/`
4. Créer une issue GitHub si nécessaire

---

**Bon courage avec les corrections! 🚀**
