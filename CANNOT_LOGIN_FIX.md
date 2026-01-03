# 🔐 Cannot Login - Fix Guide

## Problem
You can't login because either:
1. The backend server isn't running
2. No user account exists in the database

## ✅ Solution

### Step 1: Start the Backend Server

**Open a NEW PowerShell window** and run:

```powershell
cd C:\Users\cleme\New-Arise\backend
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/modele_db"
python -m uvicorn app.main:app --reload
```

Wait until you see: `Application startup complete.`

**Keep this window open!**

---

### Step 2: Create a User Account

You have **two options**:

#### Option A: Use Seed Script (Easiest - Creates Test Users)

In a **NEW PowerShell window**:

```powershell
cd C:\Users\cleme\New-Arise\backend
.\venv\Scripts\Activate.ps1
$env:DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/modele_db"
python scripts/seed.py
```

This creates test users:
- **Email:** `admin@example.com`
- **Password:** `admin123`

#### Option B: Register via API (Create Your Own Account)

1. Go to: http://localhost:8000/docs
2. Find the `/api/v1/auth/register` endpoint
3. Click "Try it out"
4. Enter your details:
   ```json
   {
     "email": "your@email.com",
     "password": "yourpassword",
     "username": "yourusername",
     "first_name": "Your",
     "last_name": "Name"
   }
   ```
5. Click "Execute"

---

### Step 3: Login

Once you have a user account:

1. Go to: http://localhost:3000
2. Click "Login" or go to the login page
3. Enter your credentials:
   - If you used seed script: `admin@example.com` / `admin123`
   - If you registered: Your email and password

---

## ✅ Quick Checklist

- [ ] Backend server running on http://localhost:8000
- [ ] Database migrations completed (already done ✅)
- [ ] User account created (seed script or registration)
- [ ] Frontend running on http://localhost:3000
- [ ] Try logging in!

---

## 🔍 Verify Backend is Running

Open: http://localhost:8000/docs

You should see the API documentation. If you see an error, the backend isn't running.

---

## 📝 Default Test Credentials (from seed script)

- **Email:** admin@example.com
- **Password:** admin123

- **Email:** user@example.com  
- **Password:** user123
