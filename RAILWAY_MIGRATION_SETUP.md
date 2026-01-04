# Railway Migration Setup

## ✅ Automatic Migration (Recommended - Already Configured)

The migrations are **already configured** to run automatically via `backend/entrypoint.sh`.

The `entrypoint.sh` script now:
1. Runs SQL migrations from `backend/migrations/` directory
2. Executes `python scripts/run_migrations.py` before starting the server
3. Continues even if migrations fail (logs warning but starts server)

**This means migrations will run automatically on every deploy!**

## Option 1: Using Railway CLI (For Manual Execution)

If you want to run migrations manually without deploying:

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Link your project
```bash
railway link
```

### Step 4: Run migrations manually
```bash
railway run -s backend python scripts/run_migrations.py
```

Or if you're in the backend directory:
```bash
cd backend
railway run python scripts/run_migrations.py
```

## Option 2: Using Railway Shell

1. Open Railway dashboard
2. Go to your backend service
3. Open Shell/Terminal
4. Run: `python scripts/run_migrations.py`

## Migration Script Location

The migration script is at: `backend/scripts/run_migrations.py`

It will:
1. Find all `.sql` files in `backend/migrations/`
2. Skip `assessment_tables.sql` (initial migration)
3. Execute other migrations in alphabetical order
4. Continue even if one migration fails (logs error but continues)
5. Automatically convert `postgresql+asyncpg://` URLs to `postgresql+psycopg2://` for sync SQLAlchemy

## Current Migration

The migration `fix_assessment_70_status.sql` will:
1. Fix assessment 70 status if it's "completed" but has no results
2. Fix all other assessments with the same issue (preventive)

## How It Works

1. **On Deploy**: Railway runs `entrypoint.sh`
2. **entrypoint.sh** calls `python scripts/run_migrations.py`
3. **run_migrations.py** executes all SQL files in `migrations/` directory
4. **Server starts** after migrations complete (or continue even if migrations fail)

## Verify Migration Ran

Check Railway logs for:
```
Running SQL migrations...
Executing migration: fix_assessment_70_status.sql
✅ Successfully executed fix_assessment_70_status.sql
Migration execution completed
```
