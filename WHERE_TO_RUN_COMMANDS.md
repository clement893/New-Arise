# 📍 Where to Run Commands

## Quick Answer

**Open PowerShell** (or Command Prompt) and run commands there.

---

## Step-by-Step: How to Open PowerShell

### Method 1: From File Explorer (Easiest)

1. **Open File Explorer** (press `Windows + E`)
2. **Navigate to your project folder:**
   - Go to: `C:\Users\cleme\New-Arise`
3. **Right-click in the folder** (not on a file, but in empty space)
4. **Click "Open in Terminal"** or **"Open PowerShell window here"**

Now you're in the right directory! ✅

---

### Method 2: From Start Menu

1. **Press `Windows` key**
2. **Type "PowerShell"**
3. **Click "Windows PowerShell"**
4. **Navigate to your project:**
   ```powershell
   cd C:\Users\cleme\New-Arise
   ```

---

### Method 3: From Current Folder (Right-click)

1. **In File Explorer**, go to `C:\Users\cleme\New-Arise`
2. **Hold `Shift` key** and **right-click** in the folder
3. **Select "Open PowerShell window here"**

---

## ✅ Verify You're in the Right Place

After opening PowerShell, you should see something like:
```
PS C:\Users\cleme\New-Arise>
```

If you see this, you're in the right place! ✅

---

## 🐳 Now Run the Docker Command

Once you're in PowerShell and see `C:\Users\cleme\New-Arise>`, type:

```powershell
docker-compose up -d postgres redis
```

Press **Enter**.

---

## 📝 All Commands in Order

Here's where to run each command:

### 1. Start Database (if using Docker)
**Location:** PowerShell in `C:\Users\cleme\New-Arise`
```powershell
docker-compose up -d postgres redis
```

### 2. Run Migrations
**Location:** PowerShell in `C:\Users\cleme\New-Arise\backend`
```powershell
cd backend
.\venv\Scripts\Activate.ps1
alembic upgrade head
```

### 3. Start Backend
**Location:** PowerShell in `C:\Users\cleme\New-Arise\backend`
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload
```

### 4. Start Frontend (in a NEW PowerShell window)
**Location:** PowerShell in `C:\Users\cleme\New-Arise`
```powershell
cd C:\Users\cleme\New-Arise
pnpm dev
```

---

## 🎯 Visual Guide

```
Your Computer
└── C:\Users\cleme\New-Arise  ← Open PowerShell HERE first
    ├── backend\              ← Then navigate here for backend commands
    ├── apps\
    └── docker-compose.yml    ← Docker command reads this file
```

---

## 💡 Pro Tip

You can see your current location in PowerShell:
- The prompt shows: `PS C:\Users\cleme\New-Arise>`
- The part after `PS` is your current folder
- If you're not in the right place, use `cd` to change directory:
  ```powershell
  cd C:\Users\cleme\New-Arise
  ```
