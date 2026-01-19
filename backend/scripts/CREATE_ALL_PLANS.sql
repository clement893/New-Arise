-- ============================================
-- CRÉATION ET CORRECTION DES PLANS
-- Ce script va créer les 3 plans avec les bons prix
-- ============================================

-- 1. Vérifier les plans actuels
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval, status
FROM plans 
ORDER BY id;

-- 2. Désactiver le plan "Test" actuel (incorrect)
UPDATE plans 
SET status = 'inactive',
    updated_at = NOW()
WHERE name LIKE '%Test%';

-- 3. Supprimer les anciens plans REVELATION, SELF EXPLORATION, WELLNESS s'ils existent
DELETE FROM plans WHERE name IN ('REVELATION', 'SELF EXPLORATION', 'WELLNESS');

-- 4. Créer REVELATION ($299)
INSERT INTO plans (
    name, 
    description, 
    amount, 
    currency, 
    interval, 
    interval_count, 
    status, 
    is_popular,
    features,
    created_at, 
    updated_at
)
VALUES (
    'REVELATION',
    'Complete leadership assessment with 360 degree feedback',
    29900,  -- $299.00
    'usd',
    'month',
    1,
    'active',
    true,  -- Plan populaire
    '{"professional_assessment": true, "360_feedback": true, "wellness_pulse": true, "executive_summary": true}',
    NOW(),
    NOW()
);

-- 5. Créer SELF EXPLORATION ($250)
INSERT INTO plans (
    name, 
    description, 
    amount, 
    currency, 
    interval, 
    interval_count, 
    status,
    is_popular,
    features,
    created_at, 
    updated_at
)
VALUES (
    'SELF EXPLORATION',
    'Professional assessment with wellness check',
    25000,  -- $250.00
    'usd',
    'month',
    1,
    'active',
    false,
    '{"professional_assessment": true, "wellness_pulse": true, "executive_summary": true}',
    NOW(),
    NOW()
);

-- 6. Créer WELLNESS ($99)
INSERT INTO plans (
    name, 
    description, 
    amount, 
    currency, 
    interval, 
    interval_count, 
    status,
    is_popular,
    features,
    created_at, 
    updated_at
)
VALUES (
    'WELLNESS',
    'Basic wellness assessment',
    9900,  -- $99.00
    'usd',
    'month',
    1,
    'active',
    false,
    '{"wellness_pulse": true, "basic_summary": true}',
    NOW(),
    NOW()
);

-- 7. Vérifier les plans après création
SELECT 
    id, 
    name, 
    amount as amount_cents,
    (amount::numeric / 100) as price_dollars,
    interval,
    status,
    is_popular,
    created_at
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;

-- RÉSULTATS ATTENDUS :
-- ┌────┬─────────────────┬──────────────┬───────────────┬──────────┬────────┬────────────┐
-- │ id │ name            │ amount_cents │ price_dollars │ interval │ status │ is_popular │
-- ├────┼─────────────────┼──────────────┼───────────────┼──────────┼────────┼────────────┤
-- │  1 │ REVELATION      │ 29900        │ 299.00        │ month    │ active │ true       │
-- │  2 │ SELF EXPLORATION│ 25000        │ 250.00        │ month    │ active │ false      │
-- │  3 │ WELLNESS        │ 9900         │ 99.00         │ month    │ active │ false      │
-- └────┴─────────────────┴──────────────┴───────────────┴──────────┴────────┴────────────┘
