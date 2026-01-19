# Instructions pour corriger le prix du plan

## Problème identifié

Le plan "Test" affiche un prix incorrect de **$24900.00** au lieu de **$249.00**.

### Cause
Le montant stocké en base de données est **2490000 centimes** (= $24900.00) au lieu de **24900 centimes** (= $249.00).

## Solutions apportées

### 1. Correction du formatage de l'intervalle ✅

Les fichiers suivants ont été mis à jour pour améliorer le formatage de l'intervalle:
- `apps/web/src/components/register/Step2_PlanSelection.tsx`
- `apps/web/src/components/register/Step3_CreateAccount.tsx`

**Changements:**
- Gestion insensible à la casse pour les intervalles (MONTH, month, Month)
- Suppression du "s" pour les intervalles singuliers (1 month au lieu de 1 months)
- Support pour WEEK et DAY en plus de MONTH et YEAR

### 2. Script de correction du prix en base de données

Un script a été créé: `backend/scripts/fix_plan_price.py`

## Comment corriger le prix en base de données

### Option 1: Utiliser le script automatique (recommandé)

```bash
# Aller dans le dossier backend
cd backend

# Lister tous les plans pour vérifier
python scripts/fix_plan_price.py --list

# Corriger le prix du plan Test
python scripts/fix_plan_price.py
```

Le script va:
- Chercher le plan "Test" dans la base de données
- Mettre à jour le montant de 2490000 à 24900 centimes
- Afficher l'ancien et le nouveau prix

### Option 2: Correction manuelle via SQL

Si vous préférez corriger manuellement:

```sql
-- Vérifier le prix actuel
SELECT id, name, amount, amount/100 as price_dollars 
FROM plans 
WHERE name = 'Test';

-- Corriger le prix (de 2490000 à 24900 centimes)
UPDATE plans 
SET amount = 24900 
WHERE name = 'Test';

-- Vérifier la correction
SELECT id, name, amount, amount/100 as price_dollars 
FROM plans 
WHERE name = 'Test';
```

### Option 3: Via l'interface admin (si disponible)

1. Connectez-vous à l'interface admin
2. Accédez à la gestion des plans
3. Modifiez le plan "Test"
4. Changez le montant de 2490000 à 24900 centimes
5. Sauvegardez

## Vérification

Après la correction, le prix devrait s'afficher comme:
- **Étape 2**: "Test - $249.00/month"
- **Étape 3**: Encadré doré affichant "$249.00/month"

## Déploiement

Une fois les changements commités et poussés:

```bash
git add .
git commit -m "Fix: Correct plan price display and formatting"
git push
```

Railway redéploiera automatiquement l'application avec les corrections.

## Note importante

Le système utilise les **centimes** pour stocker les montants:
- $1.00 = 100 centimes
- $249.00 = 24900 centimes
- $24900.00 = 2490000 centimes (incorrect ❌)

Assurez-vous toujours de stocker les montants en centimes pour éviter les problèmes d'arrondi.
