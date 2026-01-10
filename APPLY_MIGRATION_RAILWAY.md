# Comment Appliquer la Migration assessment_results sur Railway

## Option 1 : Via Railway CLI (Recommandé)

```bash
# 1. Lier le projet Railway (une seule fois)
railway link

# 2. Exécuter la migration directement
railway run --service backend psql $DATABASE_URL -f migrations/fix_assessment_results_schema.sql

# OU via le script Python
railway run --service backend python scripts/apply_assessment_results_migration.py
```

## Option 2 : Via l'Interface Web Railway

1. Allez sur [Railway Dashboard](https://railway.app)
2. Sélectionnez votre projet
3. Allez dans votre service **PostgreSQL** (ou backend)
4. Cliquez sur l'onglet **"Data"** → **"Query"**
5. Ouvrez la console SQL
6. Copiez-collez le contenu du fichier `backend/migrations/fix_assessment_results_schema.sql`
7. Cliquez sur **"Execute"**

## Option 3 : Via Railway Connect (Terminal)

```bash
# 1. Se connecter à la base de données Railway
railway connect

# 2. Une fois connecté, exécuter la migration
\i backend/migrations/fix_assessment_results_schema.sql

# OU si vous êtes dans le répertoire backend
\i migrations/fix_assessment_results_schema.sql
```

## Option 4 : Via l'endpoint API (Temporaire - Non recommandé en production)

Un endpoint temporaire peut être créé, mais **⚠️ À SUPPRIMER après utilisation** pour des raisons de sécurité.

## Vérification

Après avoir appliqué la migration, vérifiez que les colonnes existent :

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'assessment_results' 
ORDER BY ordinal_position;
```

Vous devriez voir :
- `id`
- `assessment_id`
- `user_id` ✅ (nouvelle colonne)
- `scores` ✅ (renommé depuis result_data ou ajouté)
- `insights` ✅ (nouvelle colonne)
- `recommendations` ✅ (nouvelle colonne)
- `comparison_data` ✅ (nouvelle colonne)
- `report_generated` ✅ (nouvelle colonne)
- `report_url` ✅ (nouvelle colonne)
- `generated_at` ✅ (renommé depuis created_at ou ajouté)
- `updated_at` ✅
