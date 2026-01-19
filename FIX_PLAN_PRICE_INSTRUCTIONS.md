# Instructions Rapides : Corriger les Prix des Plans

## Problème
Le prix affiché est **$24900.00/month** au lieu de **$299.00/month**

## Cause
Données incorrectes dans la base de données : `amount = 2490000` au lieu de `29900`

## Solution Rapide

### Étape 1 : Exécuter le Script de Correction

```bash
cd backend
python scripts/fix_plan_amounts.py
```

### Étape 2 : Confirmer les Modifications

Lorsque le script demande :
```
Do you want to update 1 plan(s)? (yes/no):
```

Tapez : `yes`

### Étape 3 : Vérifier

```bash
curl https://modelebackend-production-3aea.up.railway.app/api/v1/subscriptions/plans?active_only=true
```

Vous devriez voir `"amount": "29900.00"` ✓

## OU : Correction SQL Directe

```sql
UPDATE plans 
SET amount = 29900, updated_at = NOW() 
WHERE name LIKE '%REVELATION%' OR name LIKE '%Test%';
```

## Valeurs Correctes

| Plan             | Montant (cents) |
|------------------|-----------------|
| REVELATION       | 29900           |
| SELF EXPLORATION | 25000           |
| WELLNESS         | 9900            |

---

**Note** : Le frontend a déjà été corrigé. Seule la correction des données backend est nécessaire.

Pour plus de détails, voir : `FIX_PLAN_PRICE_ISSUE.md`
