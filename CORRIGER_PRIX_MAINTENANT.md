# 🚨 CORRIGER LES PRIX MAINTENANT

## Le Problème
Le prix affiché est **$24900.00** au lieu de **$299.00**

## ✅ SOLUTION RAPIDE (2 minutes)

### Option A : Via Railway Web Interface (LE PLUS SIMPLE)

#### Étape 1 : Ouvrir Railway
1. Allez sur **https://railway.app**
2. Connectez-vous si nécessaire
3. Ouvrez le projet **"modelebackend-production"**

#### Étape 2 : Ouvrir la Base de Données
1. Dans le projet, cliquez sur **PostgreSQL** (l'icône de base de données)
2. Cliquez sur l'onglet **"Query"** ou **"Data"** en haut

#### Étape 3 : Exécuter cette Commande SQL

Copiez-collez EXACTEMENT ceci dans la console SQL :

```sql
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';
```

Cliquez sur **"Run"** ou **"Execute"**

#### Étape 4 : Vérifier

```sql
SELECT id, name, amount, (amount::numeric / 100) as price_dollars 
FROM plans 
WHERE status = 'active';
```

Vous devriez voir : `price_dollars = 299.00` ✓

#### Étape 5 : Tester sur le Site
1. Allez sur https://modeleweb-production-136b.up.railway.app/register
2. **IMPORTANT** : Faites **CTRL + F5** (ou CMD + SHIFT + R sur Mac) pour vider le cache
3. Sélectionnez "Individual" → "REVELATION $299"
4. Le prix devrait maintenant afficher **$299.00/month** ✓

---

### Option B : Via Railway CLI (Pour les utilisateurs avancés)

#### 1. Installer Railway CLI (si pas déjà fait)
```bash
npm install -g @railway/cli
```

#### 2. Se connecter
```bash
railway login
```

#### 3. Lier le projet
```bash
railway link
```
Sélectionnez votre projet "modelebackend-production"

#### 4. Exécuter le Script PowerShell
```powershell
.\fix_prices_railway.ps1
```

OU directement via Railway CLI :

```bash
railway run psql $DATABASE_URL
```

Puis dans psql :
```sql
UPDATE plans SET amount = 29900, name = 'REVELATION', updated_at = NOW() WHERE name LIKE '%Test%';
\q
```

---

## 📊 Valeurs Correctes

| Plan             | Nom dans DB      | Montant (cents) | Prix affiché  |
|------------------|------------------|-----------------|---------------|
| REVELATION       | REVELATION       | 29900           | $299.00/month |
| SELF EXPLORATION | SELF EXPLORATION | 25000           | $250.00/month |
| WELLNESS         | WELLNESS         | 9900            | $99.00/month  |

---

## 🔍 Pourquoi ce problème ?

- Le backend stocke les montants en **cents** (pour éviter les erreurs de précision)
- **299 dollars** = **29900 cents**
- Actuellement dans la DB : **2490000 cents** = **$24900** ❌
- Après correction : **29900 cents** = **$299** ✓

---

## ❓ Aide Supplémentaire

Si vous ne pouvez pas accéder à Railway ou si vous avez des erreurs :

1. **Vérifiez que vous êtes connecté à Railway** avec le bon compte
2. **Vérifiez que vous avez les permissions** sur le projet
3. **Contactez-moi** si le problème persiste

---

## 📝 Notes

- **Le code frontend est déjà corrigé** ✓
- **Seules les données backend doivent être corrigées**
- Une fois corrigé, **ça fonctionnera immédiatement**
- **N'oubliez pas** de faire CTRL+F5 pour vider le cache du navigateur

---

**Date** : 2026-01-19  
**Urgence** : Haute - Bloque l'inscription des utilisateurs  
**Temps estimé** : 2 minutes
