# 🚀 Start Your Project - Step by Step

## Step 1: Start the Backend Server

In your PowerShell window, run these commands **one at a time**:

```powershell
cd C:\Users\cleme\New-Arise\backend
```

```powershell
.\venv\Scripts\Activate.ps1
```

(You should see `(venv)` appear at the start of your prompt)

```powershell
$env:DATABASE_URL="postgresql+asyncpg://postgres:postgres@127.0.0.1:5433/modele_db"
```

```powershell
python -m uvicorn app.main:app --reload
```

**Wait for it to say:** `Application startup complete.`

**✅ Backend is running!** Keep this window open.

---

## Step 2: Open a SECOND PowerShell Window for Frontend

1. **Open File Explorer** (Windows + E)
2. **Go to:** `C:\Users\cleme\New-Arise`
3. **Click in address bar, type:** `powershell` and press Enter
4. **In the NEW window, run:**

```powershell
pnpm dev
```

**Wait for it to say:** `Local: http://localhost:3000`

**✅ Frontend is running!**

---

## Step 3: Open Your Project in Browser

Open your web browser and go to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🎉 Success!

You should now see your project running!

---

## ⚠️ If You Get Errors

**"Cannot activate venv"** - Run this first:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**"pnpm not found"** - Make sure you're in the root folder:
```powershell
cd C:\Users\cleme\New-Arise
```

**"Database connection error"** - Make sure Docker is running:
```powershell
docker ps
```
