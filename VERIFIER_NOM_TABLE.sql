-- ============================================
-- VÉRIFIER LE NOM DE LA TABLE
-- Exécutez cette commande en premier
-- ============================================

-- Vérifier si la table s'appelle "plans"
SELECT COUNT(*) as count_plans FROM plans;

-- OU vérifier si elle s'appelle "subscription_plans"
SELECT COUNT(*) as count_subscription_plans FROM subscription_plans;

-- Si "plans" retourne une erreur et "subscription_plans" fonctionne,
-- alors remplacez tous les "plans" par "subscription_plans" dans les autres scripts SQL.

-- Vérifier les colonnes de la table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('plans', 'subscription_plans')
ORDER BY ordinal_position;
