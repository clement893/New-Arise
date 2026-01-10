# Fix Assessment Results Schema Migration

## Problème

L'erreur suivante se produit lors de la sauvegarde des résultats d'assessment :

```
column assessment_results.user_id does not exist
```

**Cause :** Le modèle SQLAlchemy `AssessmentResult` définit une colonne `user_id`, mais la table `assessment_results` dans la base de données ne contient pas cette colonne. Il y a un décalage entre le modèle et le schéma de la base de données.

## Solution

Une migration SQL a été créée pour ajouter toutes les colonnes manquantes à la table `assessment_results` pour qu'elle corresponde au modèle.

### Fichier de migration

`backend/migrations/fix_assessment_results_schema.sql`

### Colonnes ajoutées/corrigées

1. **user_id** (INTEGER, NOT NULL) - Ajoutée avec migration des données existantes
2. **scores** (JSONB) - Renommée depuis `result_data` ou ajoutée
3. **insights** (JSONB, nullable) - Ajoutée
4. **recommendations** (JSONB, nullable) - Ajoutée
5. **comparison_data** (JSONB, nullable) - Ajoutée
6. **report_generated** (BOOLEAN, default false) - Ajoutée
7. **report_url** (VARCHAR(500), nullable) - Ajoutée
8. **generated_at** (TIMESTAMP WITH TIME ZONE) - Renommée depuis `created_at` ou ajoutée
9. **updated_at** (TIMESTAMP WITH TIME ZONE) - Corrigée pour inclure timezone

## Application de la migration

### Option 1 : Automatique (développement)

Le script `backend/scripts/run_migrations.py` exécutera automatiquement cette migration :

```bash
cd backend
python scripts/run_migrations.py
```

### Option 2 : Manuelle (production)

Pour appliquer la migration manuellement sur Railway ou en production :

1. **Via Railway CLI :**
   ```bash
   railway connect
   psql < backend/migrations/fix_assessment_results_schema.sql
   ```

2. **Via psql direct :**
   ```bash
   psql $DATABASE_URL -f backend/migrations/fix_assessment_results_schema.sql
   ```

3. **Via l'interface Railway :**
   - Aller dans l'onglet "Data" de votre service PostgreSQL
   - Ouvrir la console SQL
   - Copier-coller le contenu de `fix_assessment_results_schema.sql`
   - Exécuter

### Option 3 : Via le backend (si script disponible)

Si le backend a un endpoint pour exécuter des migrations (non recommandé en production), vous pouvez l'utiliser.

## Vérification

Après avoir appliqué la migration, vérifiez que les colonnes existent :

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessment_results' 
ORDER BY ordinal_position;
```

Vous devriez voir toutes les colonnes listées ci-dessus.

## Notes importantes

- La migration est **idempotente** : elle peut être exécutée plusieurs fois sans erreur
- Les données existantes sont **préservées** :
  - `user_id` est rempli depuis la table `assessments`
  - `result_data` est renommé en `scores` si les deux existent
- La migration utilise des blocs `DO $$ ... END $$` pour vérifier l'existence des colonnes avant de les ajouter

## Rollback

Si vous devez annuler cette migration (non recommandé), vous pouvez :

```sql
-- ATTENTION: Cela supprimera les colonnes et les données associées
ALTER TABLE assessment_results 
DROP COLUMN IF EXISTS user_id,
DROP COLUMN IF EXISTS insights,
DROP COLUMN IF EXISTS recommendations,
DROP COLUMN IF EXISTS comparison_data,
DROP COLUMN IF EXISTS report_generated,
DROP COLUMN IF EXISTS report_url;
```

**⚠️ AVERTISSEMENT :** Ne faites pas de rollback si vous avez déjà des données importantes dans ces colonnes.
