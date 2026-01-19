# 🎯 CORRECTION DES PRIX - GUIDE COMPLET

## 🔴 Le Problème

Quand vous cliquez sur **"REVELATION $299"** puis **"Professional Assessment"**, vous voyez :
- ❌ **Test $24900.00/month**

Au lieu de :
- ✅ **REVELATION $299.00/month**

---

## 💡 La Cause

La base de données ne contient qu'**un seul plan** ("Test") avec un **prix incorrect**.

Il faut :
1. ✅ Créer les 3 vrais plans (REVELATION, SELF EXPLORATION, WELLNESS)
2. ✅ Avec les bons prix (29900, 25000, 9900 cents)

---

## 🚀 LA SOLUTION (5 minutes)

### Étape 1 : Ouvrir Railway
1. Allez sur **https://railway.app**
2. Ouvrez votre projet **"modelebackend-production"**
3. Cliquez sur **PostgreSQL**
4. Cliquez sur l'onglet **"Query"**

### Étape 2 : Copier le SQL
Ouvrez le fichier : **`SQL_SIMPLE_A_EXECUTER.txt`**

OU copiez directement depuis **`EXECUTEZ_CES_COMMANDES.md`**

### Étape 3 : Exécuter
Collez dans l'éditeur Railway et cliquez sur **"Run"**

### Étape 4 : Vérifier
```sql
SELECT name, (amount::numeric / 100) as price FROM plans WHERE status = 'active';
```

Vous devriez voir :
```
REVELATION       | 299.00
SELF EXPLORATION | 250.00
WELLNESS         | 99.00
```

### Étape 5 : Tester
1. https://modeleweb-production-136b.up.railway.app/register
2. **CTRL + F5** (important!)
3. Sélectionnez "Individual" → "REVELATION $299" → "Professional Assessment"
4. ✅ Vous devriez voir **$299.00/month**

---

## 📁 Fichiers Créés

| Fichier | Usage |
|---------|-------|
| **`SQL_SIMPLE_A_EXECUTER.txt`** | ⭐ **SQL simple à copier-coller** |
| **`EXECUTEZ_CES_COMMANDES.md`** | ⭐ **Guide pas-à-pas avec explications** |
| `backend/scripts/CREATE_ALL_PLANS.sql` | SQL complet avec commentaires |
| `CORRIGER_PRIX_MAINTENANT.md` | Guide de la première correction |
| `GUIDE_RAILWAY_STEP_BY_STEP.md` | Guide détaillé Railway |

---

## ❓ FAQ

### Q : Pourquoi $24900 au lieu de $299 ?
**R** : Le backend stocke les prix en **cents** pour éviter les erreurs de précision.
- **299 dollars** = **29900 cents** ✓
- Base de données actuelle : **2490000 cents** = **$24900** ❌

### Q : Pourquoi créer de nouveaux plans au lieu de modifier l'ancien ?
**R** : Il n'y a qu'un plan "Test" dans la DB. Il faut créer les 3 vrais plans.

### Q : Est-ce que le frontend est corrigé ?
**R** : ✅ OUI ! Le code frontend est déjà corrigé et fonctionne parfaitement.

### Q : Que se passe-t-il après la correction ?
**R** : L'API retournera automatiquement les 3 plans avec les bons prix. Le frontend les affichera correctement.

---

## ⚠️ Important

- **Le code frontend fonctionne déjà** ✅
- **Il faut juste corriger les données backend** ⏳
- **Une fois corrigé, ça marche instantanément** ⚡

---

## 📞 Besoin d'Aide ?

Si vous êtes bloqué à n'importe quelle étape, contactez-moi avec :
1. À quelle étape êtes-vous bloqué ?
2. Capture d'écran de l'erreur (si applicable)
3. Résultat de la commande de vérification

---

**Date** : 2026-01-19  
**Statut** : Frontend ✅ | Backend ⏳  
**Impact** : Bloque l'inscription des utilisateurs  
**Urgence** : Haute
