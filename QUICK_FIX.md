# ⚡ Quick Fix for Database Connection

## The Problem
You have **TWO PostgreSQL instances** trying to use port 5432:
1. Your Docker container (which we want to use)
2. A local PostgreSQL installation (which is interfering)

## ✅ Easiest Solution: Change Docker Port

**Step 1:** Edit `docker-compose.yml` and change the postgres port:

```yaml
postgres:
  # ... other settings ...
  ports:
    - "5433:5432"  # Changed from 5432:5432
```

**Step 2:** Update `backend/.env`:

```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/modele_db
```

**Step 3:** Restart Docker:

```powershell
docker-compose down
docker-compose up -d postgres redis
```

**Step 4:** Run migrations:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
```

---

## Alternative: Stop Local PostgreSQL

If you don't need the local PostgreSQL:

1. Open **Services** (Windows + R → `services.msc`)
2. Find "PostgreSQL" service
3. Right-click → **Stop**
4. Right-click → **Properties** → Set to **Manual** (so it doesn't start automatically)

Then try migrations again!
