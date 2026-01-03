# 🔧 Fix "Cannot Find Path" Error

## Problem
You're not in the right directory. Let's fix it!

## Solution

### Step 1: Check Where You Are

In your PowerShell, type:
```powershell
pwd
```

This shows your current location.

### Step 2: Go to the Project Root

Type this **full path**:
```powershell
cd C:\Users\cleme\New-Arise
```

Press Enter.

### Step 3: Verify You're in the Right Place

Type:
```powershell
pwd
```

You should see: `C:\Users\cleme\New-Arise`

### Step 4: Now Go to Backend

```powershell
cd backend
```

---

## Alternative: Use Full Path

Instead of `cd backend`, you can use the full path directly:

```powershell
cd C:\Users\cleme\New-Arise\backend
```

This works from anywhere!

---

## Quick Checklist

1. ✅ Open PowerShell
2. ✅ Type: `cd C:\Users\cleme\New-Arise`
3. ✅ Type: `cd backend`
4. ✅ You should now be in: `C:\Users\cleme\New-Arise\backend`

---

## Still Not Working?

Type this to see what folders exist:
```powershell
cd C:\Users\cleme\New-Arise
dir
```

You should see a `backend` folder in the list.
