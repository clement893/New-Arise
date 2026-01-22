-- Script de diagnostic pour vérifier les plans dans la base de données
-- Ce script permet de voir tous les plans et leurs IDs pour identifier les problèmes

-- 1. Afficher tous les plans avec leurs détails
SELECT 
    id,
    name,
    amount,
    (amount::numeric / 100) as price_dollars,
    currency,
    interval,
    interval_count,
    status,
    is_popular,
    stripe_price_id,
    created_at,
    updated_at
FROM plans 
ORDER BY id;

-- 2. Vérifier les abonnements récents et leurs plans associés
SELECT 
    s.id as subscription_id,
    s.user_id,
    s.plan_id,
    p.name as plan_name,
    p.amount as plan_amount,
    (p.amount::numeric / 100) as plan_price_dollars,
    s.status as subscription_status,
    s.created_at as subscription_created_at
FROM subscriptions s
LEFT JOIN plans p ON s.plan_id = p.id
ORDER BY s.created_at DESC
LIMIT 20;

-- 3. Compter les abonnements par plan
SELECT 
    p.id,
    p.name,
    p.amount,
    (p.amount::numeric / 100) as price_dollars,
    COUNT(s.id) as subscription_count
FROM plans p
LEFT JOIN subscriptions s ON p.id = s.plan_id
GROUP BY p.id, p.name, p.amount
ORDER BY p.id;

-- 4. Vérifier s'il y a des incohérences entre les prix et les noms de plans
SELECT 
    id,
    name,
    amount,
    (amount::numeric / 100) as price_dollars,
    CASE 
        WHEN name = 'WELLNESS' AND amount != 9900 THEN '⚠️ WELLNESS devrait être $99 (9900 cents)'
        WHEN name = 'SELF EXPLORATION' AND amount != 25000 THEN '⚠️ SELF EXPLORATION devrait être $250 (25000 cents)'
        WHEN name = 'REVELATION' AND amount != 29900 THEN '⚠️ REVELATION devrait être $299 (29900 cents)'
        ELSE '✓ OK'
    END as status_check
FROM plans
WHERE name IN ('WELLNESS', 'SELF EXPLORATION', 'REVELATION')
ORDER BY name;
