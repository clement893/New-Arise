-- ============================================
-- CORRECTION IMMÉDIATE DES PRIX
-- Copiez ce fichier complet dans Railway Query
-- ============================================

-- 1. Vérifier les prix AVANT correction
SELECT 
    id, 
    name, 
    amount as amount_cents,
    (amount::numeric / 100) as current_price_dollars,
    interval,
    status
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;

-- 2. CORRIGER REVELATION ($299)
UPDATE plans 
SET amount = 29900,
    name = 'REVELATION',
    description = 'Complete leadership assessment with 360 degree feedback',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

-- 3. Vérifier les prix APRÈS correction
SELECT 
    id, 
    name, 
    amount as amount_cents,
    (amount::numeric / 100) as corrected_price_dollars,
    interval,
    status
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;

-- RÉSULTAT ATTENDU :
-- name: REVELATION
-- amount_cents: 29900
-- corrected_price_dollars: 299.00
-- 
-- ✓ Le site affichera maintenant : $299.00/month
