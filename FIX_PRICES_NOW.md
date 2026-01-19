# Correction Immédiate des Prix

## Problème
- REVELATION devrait être $299 mais affiche $24900
- Les montants dans la DB sont incorrects

## Solution Rapide via Railway

### 1. Se connecter à Railway
```bash
railway login
```

### 2. Lier le projet
```bash
railway link
```

### 3. Ouvrir la console PostgreSQL
```bash
railway run psql $DATABASE_URL
```

### 4. Exécuter ces commandes SQL

```sql
-- Vérifier les plans actuels
SELECT id, name, amount, interval FROM plans WHERE status = 'active';

-- Corriger REVELATION ($299)
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

-- Vérifier la correction
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval 
FROM plans 
WHERE status = 'active';

-- Quitter
\q
```

## Option 2 : Via Railway Dashboard (Interface Web)

1. Aller sur https://railway.app
2. Ouvrir votre projet "modelebackend-production"
3. Cliquer sur la base de données PostgreSQL
4. Cliquer sur "Data" ou "Query"
5. Exécuter ce SQL:

```sql
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';
```

## Option 3 : Via PgAdmin ou DBeaver

Si vous avez PgAdmin ou DBeaver installé:

1. Récupérer l'URL de connexion depuis Railway
2. Se connecter à la base de données
3. Exécuter le SQL ci-dessus

## Résultat Attendu

Après avoir exécuté le SQL, l'API retournera:
```json
{
  "amount": "29900.00"  // = $299.00 ✓
}
```

Et le site affichera: **$299.00/month** ✓

## Pour ajouter les autres plans

Une fois REVELATION corrigé, vous pouvez ajouter les autres plans:

```sql
-- SELF EXPLORATION ($250)
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, created_at, updated_at)
VALUES ('SELF EXPLORATION', 'Professional assessment with wellness check', 25000, 'usd', 'month', 1, 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- WELLNESS ($99)
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, created_at, updated_at)
VALUES ('WELLNESS', 'Basic wellness assessment', 9900, 'usd', 'month', 1, 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;
```
