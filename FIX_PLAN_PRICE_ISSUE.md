# Fix: Plan Price Display Issue

## Problème Identifié

Lorsqu'un utilisateur sélectionne un plan (par exemple "REVELATION $299"), le prix affiché est **$24900.00/month** au lieu de **$299.00/month**.

### Cause Racine

Le problème provient de **données incorrectes dans la base de données backend** :

- **Valeur actuelle** : `amount = 2490000` (cents)
- **Valeur attendue** : `amount = 29900` (cents pour $299.00)

Lorsque le frontend divise par 100 pour convertir de cents en dollars :
- `2490000 / 100 = $24900.00` ❌ (incorrect)
- `29900 / 100 = $299.00` ✓ (correct)

### Données API Actuelles

```json
{
  "plans": [
    {
      "name": "Test ",
      "amount": "2490000.00",  // ❌ INCORRECT - devrait être 29900
      "currency": "usd",
      "interval": "month",
      "interval_count": 1
    }
  ]
}
```

**Note** : Le backend retourne `amount` comme un string car il utilise le type `Decimal` de Python pour éviter les erreurs de précision avec l'argent. C'est une bonne pratique.

## Solutions Implémentées

### 1. Fix Frontend (✓ Complété)

Le code frontend a été mis à jour pour :

#### a) Gérer les montants en format string (Decimal)

Tous les composants d'inscription ont été mis à jour pour gérer `amount` comme `string | number` :

**Fichiers modifiés** :
- `apps/web/src/components/register/Step2_PlanSelection.tsx`
- `apps/web/src/components/register/Step3_CreateAccount.tsx`
- `apps/web/src/components/register/Step4_ReviewConfirm.tsx`
- `apps/web/src/components/register/Step5_Payment.tsx`
- `apps/web/src/stores/registrationStore.ts`

**Exemple de code** :
```typescript
const formatPrice = (plan: Plan) => {
  if (!plan.amount || plan.amount === 0) return 'Free';
  // Handle both number and string (Decimal from backend)
  const amountInCents = typeof plan.amount === 'string' 
    ? parseFloat(plan.amount) 
    : plan.amount;
  const price = (amountInCents / 100).toFixed(2);
  return `$${price}`;
};
```

#### b) Amélioration du formatage d'intervalle

```typescript
const formatInterval = (plan: Plan) => {
  const interval = plan.interval?.toUpperCase();
  const count = plan.interval_count || 1;
  
  if (interval === 'MONTH' && count === 1) return '/month';
  if (interval === 'YEAR' && count === 1) return '/year';
  if (interval === 'MONTH') return `/${count} months`;
  if (interval === 'YEAR') return `/${count} years`;
  
  return `/${count} ${plan.interval?.toLowerCase()}${count > 1 ? 's' : ''}`;
};
```

#### c) Sauvegarde du plan complet dans le store

Le store d'inscription sauvegarde maintenant toutes les informations du plan sélectionné (nom, prix, intervalle) pour les afficher sur toutes les étapes suivantes.

### 2. Fix Backend - Corriger les Données (⚠️ Action Requise)

Un script Python a été créé pour corriger les montants incorrects dans la base de données.

#### Script : `backend/scripts/fix_plan_amounts.py`

Ce script :
1. ✓ Se connecte à la base de données
2. ✓ Affiche tous les plans actifs avec leurs montants
3. ✓ Détecte les montants incorrects (trop grands)
4. ✓ Propose les corrections appropriées
5. ✓ Demande confirmation avant toute modification
6. ✓ Met à jour les plans avec les montants corrects

#### Montants Corrects Attendus

| Nom du Plan        | Montant (cents) | Prix (dollars) |
|-------------------|-----------------|----------------|
| REVELATION        | 29900           | $299.00        |
| SELF EXPLORATION  | 25000           | $250.00        |
| WELLNESS          | 9900            | $99.00         |

## Instructions pour Corriger la Base de Données

### Option 1 : Utiliser le Script Python (Recommandé)

```bash
# 1. Naviguer vers le dossier backend
cd backend

# 2. Activer l'environnement virtuel (si utilisé)
# Sur Windows :
.venv\Scripts\activate
# Sur Linux/Mac :
source .venv/bin/activate

# 3. Exécuter le script
python scripts/fix_plan_amounts.py
```

Le script affichera :
```
===============================================================================
Subscription Plan Amount Fixer
================================================================================

Current plans in database:
--------------------------------------------------------------------------------
ID: 16, Name: Test, Amount: 2490000.00, Interval: month

================================================================================
Proposed fixes:
================================================================================

✗  Plan 'Test' (ID: 16): Amount is incorrect
   Current: 2490000 cents ($24900.00)
   Should be: 29900 cents ($299.00)

================================================================================
Do you want to update 1 plan(s)? (yes/no): 
```

Tapez `yes` pour appliquer les corrections.

### Option 2 : SQL Direct (Alternative)

Si vous préférez exécuter du SQL directement :

```sql
-- Vérifier les montants actuels
SELECT id, name, amount, interval 
FROM plans 
WHERE status = 'active';

-- Corriger le plan REVELATION (remplacez l'ID si différent)
UPDATE plans 
SET amount = 29900, 
    updated_at = NOW()
WHERE id = 16 AND name LIKE '%REVELATION%';

-- OU corriger tous les plans en une fois
UPDATE plans SET amount = 29900, updated_at = NOW() WHERE name LIKE '%REVELATION%';
UPDATE plans SET amount = 25000, updated_at = NOW() WHERE name LIKE '%SELF EXPLORATION%';
UPDATE plans SET amount = 9900, updated_at = NOW() WHERE name LIKE '%WELLNESS%';
```

### Option 3 : Utiliser l'Interface Admin (Si disponible)

1. Connectez-vous à l'interface d'administration
2. Allez dans la section "Plans" ou "Subscriptions"
3. Éditez chaque plan et corrigez le champ `amount`
4. Assurez-vous que les montants sont en **cents** :
   - REVELATION : `29900`
   - SELF EXPLORATION : `25000`
   - WELLNESS : `9900`

## Vérification

Après avoir appliqué le fix backend :

### 1. Vérifier via l'API

```bash
curl https://modelebackend-production-3aea.up.railway.app/api/v1/subscriptions/plans?active_only=true
```

Vous devriez voir :
```json
{
  "plans": [
    {
      "name": "REVELATION",
      "amount": "29900.00",  // ✓ CORRECT
      "currency": "usd",
      "interval": "month"
    }
  ]
}
```

### 2. Tester le Processus d'Inscription

1. Allez sur : https://modeleweb-production-136b.up.railway.app/register
2. Sélectionnez le rôle "Individual"
3. Cliquez sur "REVELATION $299"
4. Cliquez sur une fonctionnalité pour avancer à Step 2
5. **Vérifiez que le prix affiché est $299.00/month** ✓

## Résumé des Changements

### Frontend ✓
- [x] Gestion des montants en format string (Decimal)
- [x] Formatage amélioré des prix et intervalles
- [x] Sauvegarde du plan complet dans le store d'inscription
- [x] Affichage du plan sélectionné sur toutes les étapes suivantes

### Backend ⚠️ Action Requise
- [ ] Exécuter le script `fix_plan_amounts.py`
- [ ] Vérifier que les montants sont corrects via l'API
- [ ] Tester le processus d'inscription complet

## Notes Techniques

### Type Decimal dans le Backend

Le backend utilise `Decimal` pour les montants, ce qui est une bonne pratique pour :
- Éviter les erreurs de précision avec les floating-point
- Garantir des calculs financiers exacts

Le `Decimal` est sérialisé en string dans le JSON, d'où le format `"29900.00"` au lieu de `29900`.

### Structure de la Base de Données

```python
# backend/app/models/plan.py
class Plan(Base):
    __tablename__ = "plans"
    
    amount = Column(Numeric(10, 2), nullable=False)  # Price in cents
    # Peut stocker jusqu'à 99999999.99 (8 chiffres avant virgule, 2 après)
```

## Contact

Si vous rencontrez des problèmes :
1. Vérifiez les logs du script Python
2. Vérifiez les logs de la base de données
3. Contactez l'équipe de développement

---

**Date de création** : 2026-01-19  
**Auteur** : AI Assistant  
**Statut** : Frontend ✓ | Backend ⚠️ En attente de correction des données
