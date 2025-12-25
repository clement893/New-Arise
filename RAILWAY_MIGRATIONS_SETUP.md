# Railway Database Migrations Setup

## ✅ Automatic Migration Configuration

Your database migrations will now run **automatically** during every Railway deployment.

## 🔧 What Was Changed

### 1. **Entrypoint Script** (`backend/entrypoint.sh`)
- ✅ Runs `alembic upgrade head` before starting the server
- ✅ Handles migration errors gracefully
- ✅ Provides clear logging

### 2. **Railway Configuration** (`backend/railway.json`)
- ✅ Updated to use `entrypoint.sh` instead of direct uvicorn command
- ✅ Ensures migrations run before server starts

### 3. **Nixpacks Configuration** (`backend/nixpacks.toml`)
- ✅ Updated to use `entrypoint.sh` for consistency

### 4. **Alembic Configuration** (`backend/alembic/env.py`)
- ✅ Automatically converts async database URL to sync URL
- ✅ Imports all models for proper migration detection
- ✅ Handles both async and sync database connections

### 5. **File Model Fix** (`backend/app/models/file.py`)
- ✅ Fixed UUID/Integer mismatch (now uses Integer to match User model)
- ✅ Updated column names to match expected schema
- ✅ Added proper indexes and foreign keys

### 6. **Migration File** (`backend/alembic/versions/011_fix_file_model.py`)
- ✅ Creates migration to fix file table structure
- ✅ Handles both new and existing tables
- ✅ Migrates data safely

## 🚀 How It Works

1. **Railway builds your app** → Installs dependencies including `psycopg2-binary`
2. **Railway starts your service** → Runs `entrypoint.sh`
3. **Entrypoint script** → Runs `alembic upgrade head`
4. **Alembic** → Applies all pending migrations
5. **Server starts** → Uvicorn starts after migrations complete

## 📋 Migration Flow

```
Railway Deployment
    ↓
entrypoint.sh executes
    ↓
Check DATABASE_URL exists
    ↓
Run: alembic upgrade head
    ↓
Alembic checks current revision
    ↓
Applies pending migrations
    ↓
Server starts: uvicorn app.main:app
```

## 🔍 Verification

After deployment, check Railway logs for:

```
==========================================
Running database migrations...
==========================================
INFO  [alembic.runtime.migration] Running upgrade ...
✅ Database migrations completed successfully
==========================================
Starting Uvicorn on 0.0.0.0:8000...
==========================================
```

## ⚠️ Important Notes

1. **First Deployment**: The first migration run may take longer as it creates all tables
2. **Migration Failures**: If migrations fail, the server will still start (with warnings)
3. **Database URL**: Railway automatically provides `DATABASE_URL` environment variable
4. **Rollback**: Use `alembic downgrade -1` if needed (requires manual intervention)

## 🛠️ Manual Migration (if needed)

If you need to run migrations manually:

```bash
# SSH into Railway service or use Railway CLI
railway run alembic upgrade head

# Check current revision
railway run alembic current

# View migration history
railway run alembic history
```

## 📊 Database Schema Status

After migrations run, your database will have:

- ✅ All 17 expected tables
- ✅ Proper foreign key relationships
- ✅ Indexes on frequently queried columns
- ✅ Correct data types (Integer IDs, timezone-aware timestamps)
- ✅ Unique constraints on critical fields

## 🎯 Next Steps

1. **Deploy to Railway** - Migrations will run automatically
2. **Check Logs** - Verify migrations completed successfully
3. **Test Application** - Ensure database operations work correctly
4. **Monitor** - Watch for any migration-related errors

---

**Status**: ✅ **Automatic migrations configured and ready for deployment**

