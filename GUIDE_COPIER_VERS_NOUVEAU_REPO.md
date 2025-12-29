# 📦 Guide : Copier le projet vers un nouveau dépôt Git

Ce guide vous explique comment copier complètement votre projet vers un nouveau dépôt Git **sans perdre aucune donnée**, y compris l'historique Git complet, les branches, et les tags.

---

## 🎯 Méthode recommandée : Migration complète avec historique

Cette méthode préserve **tout** : l'historique Git complet, toutes les branches, tous les tags, et tous les commits.

### Étape 1 : Vérifier l'état actuel

```powershell
# Vérifier que vous êtes dans le bon répertoire
cd C:\Users\cleme\MODELE-NEXTJS-FULLSTACK

# Vérifier l'état Git actuel
git status

# Vérifier les remotes existants
git remote -v

# Vérifier toutes les branches
git branch -a

# Vérifier les tags
git tag
```

### Étape 2 : S'assurer que tout est commité

```powershell
# Vérifier s'il y a des modifications non commitées
git status

# Si vous avez des modifications, les ajouter et commiter
git add .
git commit -m "chore: sauvegarde avant migration vers nouveau repo"
```

### Étape 3 : Créer un nouveau dépôt sur GitHub/GitLab

1. Allez sur GitHub/GitLab et créez un **nouveau dépôt vide**
2. **NE PAS** initialiser avec README, .gitignore, ou licence
3. Copiez l'URL du nouveau dépôt (ex: `https://github.com/votre-username/nouveau-nom-repo.git`)

### Étape 4 : Ajouter le nouveau dépôt comme remote

```powershell
# Option A : Remplacer complètement l'ancien remote
git remote set-url origin https://github.com/votre-username/nouveau-nom-repo.git

# Option B : Ajouter le nouveau dépôt comme remote supplémentaire (recommandé pour sécurité)
git remote add nouveau-origin https://github.com/votre-username/nouveau-nom-repo.git
```

### Étape 5 : Pousser tout le contenu vers le nouveau dépôt

```powershell
# Si vous avez utilisé Option A (remplacement)
git push -u origin --all          # Pousser toutes les branches
git push -u origin --tags         # Pousser tous les tags

# Si vous avez utilisé Option B (ajout)
git push -u nouveau-origin --all  # Pousser toutes les branches
git push -u nouveau-origin --tags # Pousser tous les tags

# Ensuite, définir comme origin principal
git remote set-url origin https://github.com/votre-username/nouveau-nom-repo.git
git remote remove nouveau-origin  # Optionnel : supprimer le remote temporaire
```

### Étape 6 : Vérifier que tout est bien copié

```powershell
# Vérifier les remotes
git remote -v

# Vérifier que toutes les branches sont présentes
git branch -a

# Vérifier que tous les tags sont présents
git tag

# Vérifier l'historique
git log --oneline --graph --all
```

---

## 🔄 Méthode alternative : Script automatisé

Utilisez le script PowerShell fourni (`scripts/copier-vers-nouveau-repo.ps1`) pour automatiser tout le processus.

```powershell
.\scripts\copier-vers-nouveau-repo.ps1
```

Le script vous demandera :
- L'URL du nouveau dépôt
- Si vous voulez garder l'ancien remote comme backup
- Confirmation avant de pousser

---

## 📋 Checklist de vérification

Avant de supprimer l'ancien dépôt, vérifiez :

- [ ] ✅ Toutes les branches sont présentes dans le nouveau dépôt
- [ ] ✅ Tous les tags sont présents
- [ ] ✅ L'historique complet est visible (`git log`)
- [ ] ✅ Les fichiers sont identiques (comparer quelques fichiers clés)
- [ ] ✅ Les remotes sont correctement configurés
- [ ] ✅ Vous pouvez faire un `git pull` depuis le nouveau dépôt
- [ ] ✅ Les workflows CI/CD fonctionnent (si applicable)

---

## 🚨 Points importants à retenir

### ✅ Ce qui sera copié automatiquement :
- ✅ Tous les fichiers du projet
- ✅ L'historique Git complet (tous les commits)
- ✅ Toutes les branches (main, develop, feature/*, etc.)
- ✅ Tous les tags
- ✅ La configuration Git (.git/config)
- ✅ Les hooks Git (si présents)

### ⚠️ Ce qui ne sera PAS copié :
- ❌ Les fichiers ignorés par `.gitignore` (node_modules, .env, etc.)
- ❌ Les remotes Git (vous devez les reconfigurer)
- ❌ Les secrets et variables d'environnement (normal, c'est sécurisé)

### 🔐 Sécurité

**IMPORTANT** : Les fichiers suivants ne doivent JAMAIS être commités :
- `.env` et `.env.local`
- `backend/.env`
- `apps/web/.env.local`
- Tous les fichiers contenant des secrets

Vérifiez qu'ils sont bien dans `.gitignore` avant de pousser !

---

## 🔧 Dépannage

### Problème : "remote origin already exists"

```powershell
# Voir les remotes existants
git remote -v

# Supprimer l'ancien remote
git remote remove origin

# Ajouter le nouveau
git remote add origin https://github.com/votre-username/nouveau-repo.git
```

### Problème : "failed to push some refs"

```powershell
# Forcer le push (ATTENTION : seulement si vous êtes sûr)
git push -u origin --all --force
git push -u origin --tags --force
```

### Problème : "authentication failed"

```powershell
# Vérifier votre authentification Git
git config --global user.name
git config --global user.email

# Si vous utilisez GitHub, vous devrez peut-être utiliser un token
# Voir : https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token
```

---

## 📝 Après la migration

### 1. Mettre à jour les références dans le code

Cherchez et remplacez les références à l'ancien dépôt :

```powershell
# Rechercher les références à l'ancien repo
grep -r "github.com/clement893/MODELE-NEXTJS-FULLSTACK" .
grep -r "MODELE-NEXTJS-FULLSTACK" .
```

Fichiers à vérifier :
- `README.md`
- `package.json`
- `CONTRIBUTING.md`
- `.github/workflows/*.yml`
- Toute documentation

### 2. Mettre à jour les URLs dans les workflows CI/CD

Si vous avez des workflows GitHub Actions, mettez à jour les URLs si nécessaire.

### 3. Notifier votre équipe

Si vous travaillez en équipe, informez-les du changement de dépôt.

---

## 🎉 C'est fait !

Votre projet est maintenant copié vers le nouveau dépôt avec tout l'historique. Vous pouvez continuer à travailler normalement !

```powershell
# Vérifier que tout fonctionne
git status
git pull
git push
```

---

## 📚 Ressources supplémentaires

- [Documentation Git - Working with Remotes](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes)
- [GitHub - Moving a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/duplicating-a-repository)
