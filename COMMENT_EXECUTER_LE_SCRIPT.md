# 📋 Comment Exécuter le Script de Diagnostic

## 🎯 Script à Exécuter
`backend/scripts/diagnose_plan_change_issue.py`

## 🚀 Méthode 1 : Via Railway CLI (Recommandé)

### Étape 1 : Installer Railway CLI (si pas déjà fait)
```bash
# Windows (PowerShell)
iwr https://railway.app/install.sh | iex

# Ou via npm
npm install -g @railway/cli
```

### Étape 2 : Se connecter à Railway
```bash
railway login
```

### Étape 3 : Lier le projet
```bash
cd d:\sites-nucleus\New-Arise
railway link
```

### Étape 4 : Exécuter le script
```bash
# Avec votre email
railway run python backend/scripts/diagnose_plan_change_issue.py --email votre@email.com

# Ou avec votre user_id (si vous le connaissez)
railway run python backend/scripts/diagnose_plan_change_issue.py --user-id 123
```

---

## 🖥️ Méthode 2 : En Local (si vous avez accès à la DB)

### Étape 1 : Activer l'environnement virtuel Python
```bash
cd d:\sites-nucleus\New-Arise\backend

# Si vous utilisez venv
.\venv\Scripts\activate

# Ou si vous utilisez conda
conda activate votre-env
```

### Étape 2 : Configurer les variables d'environnement
Assurez-vous d'avoir un fichier `.env` avec :
```
DATABASE_URL=postgresql://user:password@host:port/dbname
STRIPE_SECRET_KEY=sk_test_...
```

### Étape 3 : Exécuter le script
```bash
python scripts/diagnose_plan_change_issue.py --email votre@email.com
```

---

## 🌐 Méthode 3 : Via Railway Dashboard (Interface Web)

### Étape 1 : Aller sur Railway
1. Ouvrez https://railway.app
2. Connectez-vous
3. Sélectionnez votre projet "modelebackend-production"

### Étape 2 : Ouvrir la console
1. Cliquez sur votre service backend
2. Cliquez sur l'onglet "Deployments" ou "Shell"
3. Ouvrez un terminal

### Étape 3 : Exécuter le script
```bash
cd /app
python backend/scripts/diagnose_plan_change_issue.py --email votre@email.com
```

---

## 📊 Exemple de Sortie Attendue

```
================================================================================
DIAGNOSTIC DU PROBLÈME DE CHANGEMENT DE PLAN
================================================================================

👤 Utilisateur trouvé:
   ID: 123
   Email: votre@email.com
   Nom: Prénom Nom

📋 Souscriptions trouvées: 2
--------------------------------------------------------------------------------

1. Souscription ID: 45
   Statut: ACTIVE
   Créée le: 2025-01-15 10:30:00
   Période actuelle: 2025-01-15 → 2025-02-15
   Plan ID: 15
   Plan Nom: SELF EXPLORATION
   Plan Prix: $250.00
   Plan Stripe Price ID: price_xxxxx
   Stripe Subscription ID: sub_xxxxx
   Stripe Price ID (actuel): price_yyyyy
   Plan dans Stripe: REVELATION (ID: 16)
   ⚠️  INCOHÉRENCE: Plan dans DB (15) != Plan dans Stripe (16)

================================================================================
✅ SOUSCRIPTION ACTIVE:
================================================================================
   ID: 45
   Statut: ACTIVE
   Plan: SELF EXPLORATION (ID: 15, $250.00)

================================================================================
📦 PLANS DISPONIBLES:
================================================================================
   ID: 14 | Nom: WELLNESS | Prix: $99.00 | Stripe Price ID: price_aaa
   ID: 15 | Nom: SELF EXPLORATION | Prix: $250.00 | Stripe Price ID: price_bbb
   ID: 16 | Nom: REVELATION | Prix: $299.00 | Stripe Price ID: price_ccc
```

---

## 🔍 Interprétation des Résultats

### ✅ Si tout est cohérent
- Le plan dans la DB = Le plan dans Stripe
- Pas de message d'erreur
- **Action** : Le problème est ailleurs (cache frontend, etc.)

### ⚠️ Si incohérence détectée
- Le plan dans la DB ≠ Le plan dans Stripe
- Message : `INCOHÉRENCE: Plan dans DB (X) != Plan dans Stripe (Y)`
- **Action** : Le webhook n'a pas mis à jour la DB, ou l'upgrade a échoué

### ❌ Si erreur
- Plan non trouvé dans Stripe
- Erreur de connexion
- **Action** : Vérifier les logs et la configuration

---

## 🛠️ Dépannage

### Erreur : "Module not found"
```bash
# Installer les dépendances
pip install -r backend/requirements.txt
```

### Erreur : "Database connection failed"
- Vérifier que `DATABASE_URL` est correct
- Vérifier que vous avez accès à la base de données

### Erreur : "Stripe API key not found"
- Vérifier que `STRIPE_SECRET_KEY` est dans les variables d'environnement

---

## 📝 Note Importante

Le script nécessite :
- Accès à la base de données PostgreSQL
- Clé API Stripe configurée
- Python 3.8+

Si vous n'avez pas accès direct, utilisez Railway CLI qui exécutera le script dans l'environnement de production avec toutes les variables d'environnement configurées.
