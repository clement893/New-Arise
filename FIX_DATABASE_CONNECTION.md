# 🔧 Fix Database Connection Issue

## Problem
There's a local PostgreSQL instance running on port 5432 that's interfering with the Docker container.

## Solution Options

### Option 1: Stop Local PostgreSQL (Recommended)

1. **Find and stop the local PostgreSQL service:**
   ```powershell
   # Find PostgreSQL services
   Get-Service | Where-Object {$_.DisplayName -like "*PostgreSQL*"}
   
   # Stop it (replace SERVICE_NAME with actual name)
   Stop-Service -Name "SERVICE_NAME"
   ```

2. **Or use Services Manager:**
   - Press `Windows + R`
   - Type `services.msc` and press Enter
   - Find "PostgreSQL" service
   - Right-click → Stop
   - Right-click → Properties → Set Startup type to "Manual"

3. **Then try migrations again:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   alembic upgrade head
   ```

### Option 2: Use Different Port for Docker

1. **Edit `docker-compose.yml`:**
   Change the postgres port mapping from:
   ```yaml
   ports:
     - "5432:5432"
   ```
   To:
   ```yaml
   ports:
     - "5433:5432"
   ```

2. **Update `backend/.env`:**
   Change:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5432/modele_db
   ```
   To:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/modele_db
   ```

3. **Restart Docker containers:**
   ```powershell
   docker-compose down
   docker-compose up -d postgres redis
   ```

4. **Run migrations:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   alembic upgrade head
   ```

### Option 3: Use Docker Network IP (Advanced)

If you want to keep both running, you can connect directly to the Docker container's IP address.

---

## Quick Fix (Try This First)

The easiest solution is to **stop the local PostgreSQL service**:

```powershell
# Check what's running on port 5432
netstat -ano | findstr :5432

# Find PostgreSQL processes
Get-Process | Where-Object {$_.ProcessName -like "*postgres*"}

# Stop PostgreSQL service (if it exists)
Stop-Service postgresql-x64-*  # Adjust name as needed
```

Then restart your Docker containers and try again!
