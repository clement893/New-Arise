# Mémoire : Vérification TypeScript OBLIGATOIRE

## ⚠️ RÈGLE ABSOLUE ET SYSTÉMATIQUE ⚠️

**À CHAQUE FOIS QUE TU ÉCRIS DU CODE, TU DOIS VÉRIFIER LES ERREURS TYPESCRIPT IMMÉDIATEMENT APRÈS.**

Cette vérification est **OBLIGATOIRE** et doit être faite **SYSTÉMATIQUEMENT**, **TOUT LE TEMPS**, **SANS EXCEPTION**.

## Procédure OBLIGATOIRE à suivre

### Étape 1 : Après CHAQUE modification de code
- ✅ Après avoir écrit ou modifié un fichier TypeScript/TSX
- ✅ Après avoir créé un nouveau composant
- ✅ Après avoir modifié des types ou interfaces
- ✅ Après avoir ajouté des imports ou des exports
- ✅ **IMMÉDIATEMENT**, sans attendre

### Étape 2 : Vérification systématique
1. Utiliser l'outil `read_lints` pour vérifier les erreurs
2. Si tu as modifié un fichier spécifique, vérifier ce fichier : `read_lints [chemin_du_fichier]`
3. Si tu as modifié plusieurs fichiers, vérifier tous les fichiers modifiés
4. Si tu n'es pas sûr, vérifier tout le projet : `read_lints`

### Étape 3 : Correction obligatoire
- ❌ **NE JAMAIS** considérer une tâche terminée s'il y a des erreurs TypeScript
- ✅ **TOUJOURS** corriger toutes les erreurs TypeScript avant de terminer
- ✅ Vérifier particulièrement :
   - Les types manquants ou incorrects
   - Les imports manquants ou incorrects
   - Les propriétés non définies
   - Les erreurs de typage strict
   - Les erreurs de syntaxe TypeScript

## Commande à utiliser

```bash
# Vérifier les erreurs TypeScript dans un fichier spécifique
read_lints [chemin_du_fichier]

# Vérifier toutes les erreurs TypeScript du projet
read_lints
```

## Règle d'or

**PAS DE CODE SANS VÉRIFICATION TYPESCRIPT = PAS DE TÂCHE TERMINÉE**

Cette vérification fait partie intégrante du processus d'écriture de code, pas une étape optionnelle.

## Date de création
2025-01-27

## Date de mise à jour
2025-01-27 (renforcement de la règle)

## Note importante
Cette mémoire doit être **CONSULTÉE ET APPLIQUÉE** à chaque modification de code. C'est une règle non-négociable pour garantir la qualité et la cohérence du codebase TypeScript.
