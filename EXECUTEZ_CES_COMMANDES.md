# 🚀 EXÉCUTEZ CES COMMANDES SQL

## 📍 Où Exécuter?
**Railway Dashboard** → Votre projet → **PostgreSQL** → Onglet **"Query"**

---

## ✅ Commandes à Exécuter (Copiez-Collez)

### Commande 1️⃣ : Désactiver l'ancien plan
```sql
UPDATE plans SET status = 'inactive' WHERE name LIKE '%Test%';
```
**Résultat attendu** : `UPDATE 1` ✓

---

### Commande 2️⃣ : Nettoyer les anciens plans
```sql
DELETE FROM plans WHERE name IN ('REVELATION', 'SELF EXPLORATION', 'WELLNESS');
```
**Résultat attendu** : `DELETE 0` ou `DELETE 1` ou `DELETE 2` ou `DELETE 3` ✓

---

### Commande 3️⃣ : Créer REVELATION ($299)
```sql
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('REVELATION', 'Complete leadership assessment with 360 degree feedback', 29900, 'usd', 'month', 1, 'active', true, NOW(), NOW());
```
**Résultat attendu** : `INSERT 0 1` ✓

---

### Commande 4️⃣ : Créer SELF EXPLORATION ($250)
```sql
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('SELF EXPLORATION', 'Professional assessment with wellness check', 25000, 'usd', 'month', 1, 'active', false, NOW(), NOW());
```
**Résultat attendu** : `INSERT 0 1` ✓

---

### Commande 5️⃣ : Créer WELLNESS ($99)
```sql
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, is_popular, created_at, updated_at)
VALUES ('WELLNESS', 'Basic wellness assessment', 9900, 'usd', 'month', 1, 'active', false, NOW(), NOW());
```
**Résultat attendu** : `INSERT 0 1` ✓

---

### Commande 6️⃣ : VÉRIFIER les plans créés
```sql
SELECT 
    id, 
    name, 
    amount, 
    (amount::numeric / 100) as price_dollars, 
    interval, 
    status,
    is_popular
FROM plans 
WHERE status = 'active' 
ORDER BY amount DESC;
```

**Résultat attendu** :
```
┌────┬─────────────────┬────────┬───────────────┬──────────┬────────┬────────────┐
│ id │ name            │ amount │ price_dollars │ interval │ status │ is_popular │
├────┼─────────────────┼────────┼───────────────┼──────────┼────────┼────────────┤
│ XX │ REVELATION      │ 29900  │ 299.00        │ month    │ active │ true       │
│ XX │ SELF EXPLORATION│ 25000  │ 250.00        │ month    │ active │ false      │
│ XX │ WELLNESS        │ 9900   │ 99.00         │ month    │ active │ false      │
└────┴─────────────────┴────────┴───────────────┴──────────┴────────┴────────────┘
```

---

## 🧪 Tester sur le Site

1. Allez sur : **https://modeleweb-production-136b.up.railway.app/register**
2. **CTRL + F5** (vider le cache)
3. Sélectionnez **"Individual"**
4. Cliquez sur **"REVELATION $299"** 
5. Cliquez sur **"Professional Assessment"**

### ✅ Vous devriez maintenant voir :

```
Choose your plan
Select the plan that best fits your needs

┌───────────────────────────────────────────┐
│ REVELATION  $299.00/month               ○ │
│ Complete leadership assessment...         │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ SELF EXPLORATION  $250.00/month         ○ │
│ Professional assessment...                │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│ WELLNESS  $99.00/month                  ○ │
│ Basic wellness assessment                 │
└───────────────────────────────────────────┘
```

**Plus de $24900.00** ! ✓

---

## ❓ Aide

### Si vous avez une erreur "column does not exist"
Votre table s'appelle peut-être `subscription_plans` au lieu de `plans`.

Remplacez `plans` par `subscription_plans` dans toutes les commandes.

### Si vous avez une erreur "permission denied"
Vérifiez que vous êtes connecté au bon compte Railway.

### Le site affiche toujours $24900
1. Vérifiez que la commande 6️⃣ montre bien les bons prix
2. Faites **CTRL + F5** (ou **CTRL + SHIFT + R**)
3. Attendez 30 secondes et réessayez

---

## 📞 Contact

Si ça ne marche toujours pas après avoir suivi toutes ces étapes, contactez-moi avec :
- Une capture d'écran du résultat de la commande 6️⃣
- Une capture d'écran de ce que vous voyez sur le site
