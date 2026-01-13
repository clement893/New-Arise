# Mémoire : Vérification TypeScript

## Règle importante
**TOUJOURS vérifier les erreurs TypeScript après avoir modifié du code.**

## Procédure à suivre
1. Après chaque modification de fichier TypeScript/TSX
2. Utiliser l'outil `read_lints` pour vérifier les erreurs
3. Corriger toutes les erreurs TypeScript avant de considérer la tâche terminée
4. Vérifier particulièrement :
   - Les types manquants ou incorrects
   - Les imports manquants
   - Les propriétés non définies
   - Les erreurs de typage strict

## Commande à utiliser
```bash
# Vérifier les erreurs TypeScript dans un fichier spécifique
read_lints [chemin_du_fichier]

# Vérifier toutes les erreurs TypeScript du projet
read_lints
```

## Date de création
2025-01-27

## Note
Cette mémoire doit être consultée à chaque fin de modification de code pour garantir la qualité et la cohérence du codebase TypeScript.
