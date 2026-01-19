-- Script SQL pour corriger rapidement les montants des plans
-- Les montants doivent être en cents (ex: 29900 = $299.00)

-- Vérifier les montants actuels
SELECT id, name, amount, interval, status 
FROM plans 
WHERE status = 'active'
ORDER BY name;

-- Corriger le plan REVELATION ($299)
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    description = 'Complete leadership assessment with 360° feedback',
    updated_at = NOW()
WHERE (name LIKE '%Test%' OR name LIKE '%REVELATION%') 
  AND status = 'active';

-- Ajouter ou corriger SELF EXPLORATION ($250) si nécessaire
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, created_at, updated_at)
SELECT 'SELF EXPLORATION', 
       'Professional assessment with wellness check', 
       25000, 
       'usd', 
       'month', 
       1, 
       'active',
       NOW(),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE name LIKE '%SELF EXPLORATION%'
)
ON CONFLICT DO NOTHING;

UPDATE plans 
SET amount = 25000,
    description = 'Professional assessment with wellness check',
    updated_at = NOW()
WHERE name LIKE '%SELF EXPLORATION%' AND status = 'active';

-- Ajouter ou corriger WELLNESS ($99) si nécessaire
INSERT INTO plans (name, description, amount, currency, interval, interval_count, status, created_at, updated_at)
SELECT 'WELLNESS', 
       'Basic wellness assessment', 
       9900, 
       'usd', 
       'month', 
       1, 
       'active',
       NOW(),
       NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM plans WHERE name LIKE '%WELLNESS%'
)
ON CONFLICT DO NOTHING;

UPDATE plans 
SET amount = 9900,
    description = 'Basic wellness assessment',
    updated_at = NOW()
WHERE name LIKE '%WELLNESS%' AND status = 'active';

-- Vérifier les montants après correction
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval, status 
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;
