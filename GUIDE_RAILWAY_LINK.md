# 🔗 Guide : Lier le Projet à Railway

## 📍 Quand Railway demande de choisir un service

Quand vous exécutez `railway link`, Railway peut vous demander de choisir entre plusieurs services :

### ✅ **Choisissez : BACKEND** (ou "modelebackend-production")

**Pourquoi ?**
- Le script Python s'exécute dans l'environnement backend
- La base de données est accessible depuis le backend
- Les variables d'environnement (DATABASE_URL, STRIPE_SECRET_KEY) sont dans le backend

### ❌ **Ne choisissez PAS :**
- Frontend (modeleweb-production) - Pas de base de données
- Database directement - Le script a besoin de l'environnement backend complet

---

## 🚀 Étapes Complètes

### 1. Installer Railway CLI (si pas déjà fait)
```powershell
npm install -g @railway/cli
```

### 2. Se connecter
```powershell
railway login
```

### 3. Aller dans le dossier du projet
```powershell
cd d:\sites-nucleus\New-Arise
```

### 4. Lier le projet
```powershell
railway link
```

**Quand Railway demande :**
```
? Select a project:
  > modelebackend-production (backend)
    modeleweb-production (frontend)
    [Autres options...]
```

**→ Choisissez : `modelebackend-production` (backend)**

**Si Railway demande ensuite :**
```
? Select a service:
  > Backend Service
    Database Service
    [Autres services...]
```

**→ Choisissez : `Backend Service`**

---

## ✅ Vérification

Après avoir lié, vous pouvez vérifier que c'est correct :

```powershell
railway status
```

Cela devrait afficher quelque chose comme :
```
Service: Backend Service
Project: modelebackend-production
```

---

## 🧪 Tester la Connexion

Une fois lié, testez le script :

```powershell
railway run python backend/scripts/diagnose_plan_change_issue.py --email timmm@gmail.com
```

Si tout fonctionne, vous verrez le diagnostic au lieu d'une erreur de connexion.

---

## 🔄 Si vous avez lié au mauvais service

Si vous avez lié au frontend par erreur :

```powershell
# Délier
railway unlink

# Relier au backend
railway link
# → Choisissez modelebackend-production
```

---

## 📝 Note

- Vous pouvez avoir plusieurs projets Railway liés
- Chaque dossier peut être lié à un service différent
- Pour les scripts Python, vous devez toujours être lié au **backend**
