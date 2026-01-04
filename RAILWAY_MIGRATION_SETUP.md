# Railway Migration Setup

## Option 1: Using Railway CLI (Recommended)

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
railway run python backend/scripts/run_migrations.py
```

Or if you're in the backend directory:
```bash
cd backend
railway run python scripts/run_migrations.py
```

## Option 2: Using Pre-Deploy Command

### Option 2A: Modify Dockerfile CMD

Modify the `CMD` in `Dockerfile` to run migrations before starting the server:

```dockerfile
CMD python backend/scripts/run_migrations.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Note:** This runs migrations on every container start, which is safe but slower.

### Option 2B: Use Railway Pre-Deploy Hook

Create a `railway.toml` or use Railway's web interface to set a pre-deploy command:

```toml
[deploy]
startCommand = "python backend/scripts/run_migrations.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

Or in Railway dashboard:
1. Go to your backend service
2. Settings → Deploy
3. Add pre-deploy command: `python backend/scripts/run_migrations.py`
4. Keep start command as: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Option 3: Run via Railway Shell

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

## Current Migration

The migration `fix_assessment_70_status.sql` will:
1. Fix assessment 70 status if it's "completed" but has no results
2. Fix all other assessments with the same issue (preventive)

## Recommended Approach

**For one-time fix**: Use Railway CLI (Option 1) - run once manually

**For automatic migrations**: Use pre-deploy hook (Option 2B) - runs automatically on each deploy
