# 📖 Step-by-Step Setup Guide

Follow these steps **in order** to get your project running locally.

## ✅ What's Already Done

- ✅ Environment files created (`backend/.env` and `apps/web/.env.local`)
- ✅ Frontend dependencies installed (1463 packages)
- ✅ Backend dependencies installing...

## 🎯 Step 1: Choose Your Database Setup

You need a PostgreSQL database. Choose **ONE** option:

### Option A: Docker (Easiest - Recommended) 🐳

1. **Download Docker Desktop:**
   - Go to: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Install it (this may take a few minutes)
   - **Start Docker Desktop** (wait until it's fully running - you'll see a whale icon in your system tray)

2. **Start the database:**
   ```powershell
   cd c:\Users\cleme\New-Arise
   docker-compose up -d postgres redis
   ```
   
   This will:
   - Download PostgreSQL and Redis images (first time only)
   - Start them in the background
   - Create the database automatically

3. **Verify it's running:**
   ```powershell
   docker ps
   ```
   You should see `modele_postgres` and `modele_redis` containers running.

**✅ If you chose Docker, skip to Step 3!**

---

### Option B: Install PostgreSQL Locally 💾

1. **Download PostgreSQL:**
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Choose Windows x86-64 version
   - Download and run the installer

2. **During installation:**
   - Use default port: `5432`
   - Set a password for `postgres` user (remember this!)
   - Complete the installation

3. **Create the database:**
   ```powershell
   # Open a new PowerShell window
   psql -U postgres
   ```
   
   Then in the PostgreSQL prompt:
   ```sql
   CREATE DATABASE modele_db;
   \q
   ```

4. **Update `backend/.env`:**
   - Open `backend/.env` in a text editor
   - Find the line: `DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/your_app_db`
   - Change it to: `DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/modele_db`
   - Replace `YOUR_PASSWORD` with the password you set during installation

---

## 🎯 Step 2: Install Backend Dependencies (If not done)

The dependencies should already be installing, but if you need to do it manually:

```powershell
cd c:\Users\cleme\New-Arise\backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

**Note:** If you get an error about execution policy, run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🎯 Step 3: Run Database Migrations

This creates all the database tables:

```powershell
cd c:\Users\cleme\New-Arise\backend

# Activate virtual environment (if not already active)
.\venv\Scripts\Activate.ps1

# Run migrations
alembic upgrade head
```

You should see output like:
```
INFO  [alembic.runtime.migration] Running upgrade -> abc123, Initial migration
```

---

## 🎯 Step 4: Start the Backend Server

**Open a NEW PowerShell terminal window:**

```powershell
cd c:\Users\cleme\New-Arise\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**✅ Backend is now running at http://localhost:8000**
- API Documentation: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Keep this terminal open!**

---

## 🎯 Step 5: Start the Frontend Server

**Open ANOTHER NEW PowerShell terminal window:**

```powershell
cd c:\Users\cleme\New-Arise

# Start the frontend
pnpm dev
```

You should see:
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
```

**✅ Frontend is now running at http://localhost:3000**

**Keep this terminal open too!**

---

## 🎉 Success! Your Project is Running!

Open your browser and go to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🆘 Troubleshooting

### "Port 8000 already in use"
- Another program is using port 8000
- Stop that program or change the port in the uvicorn command: `--port 8001`

### "Port 3000 already in use"
- Another program is using port 3000
- Change the port: `pnpm dev -- -p 3001`

### "Database connection failed"
- Make sure PostgreSQL is running (Docker or local service)
- Check `backend/.env` has the correct `DATABASE_URL`
- For Docker: Make sure containers are running: `docker ps`

### "Module not found" errors
- Make sure you activated the virtual environment: `.\venv\Scripts\Activate.ps1`
- Reinstall dependencies: `pip install -r requirements.txt`

### "alembic: command not found"
- Make sure you're in the `backend` directory
- Make sure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

---

## 📝 Quick Reference

### To Start Everything (after initial setup):

**Terminal 1 - Backend:**
```powershell
cd c:\Users\cleme\New-Arise\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd c:\Users\cleme\New-Arise
pnpm dev
```

**If using Docker - Start database:**
```powershell
cd c:\Users\cleme\New-Arise
docker-compose up -d postgres redis
```

---

## 🎓 Next Steps

- Explore the API at http://localhost:8000/docs
- Check out the component library
- Read the [Development Guide](./docs/DEVELOPMENT.md)
- See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for more help
