# Database Health Check Guide

## 🔍 Quick Health Check

Run these SQL queries in Railway's database console to verify your database is healthy.

### Access Railway Database Console

1. Go to your Railway project
2. Click on your PostgreSQL service
3. Click on "Data" tab
4. Click "Connect" or use the "Query" tab
5. Copy and paste the queries below

---

## ✅ Expected Results

### 1. All Tables Should Exist (16 tables)

Run this query to see all tables:

```sql
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected tables:**
- ✅ users
- ✅ roles
- ✅ permissions
- ✅ role_permissions
- ✅ user_roles
- ✅ teams
- ✅ team_members
- ✅ invitations
- ✅ plans
- ✅ subscriptions
- ✅ invoices
- ✅ projects
- ✅ themes
- ✅ files
- ✅ api_keys
- ✅ webhook_events

---

### 2. Check Critical Columns

#### Users Table
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Should have:**
- ✅ `id` (integer)
- ✅ `email` (varchar, NOT NULL, UNIQUE)
- ✅ `hashed_password` (varchar, NOT NULL)
- ✅ `is_active` (boolean)
- ✅ `created_at` (timestamp with time zone)
- ✅ `updated_at` (timestamp with time zone)

#### Files Table (Important - Check for UUID/Integer issue)
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'files'
ORDER BY ordinal_position;
```

**Should have:**
- ✅ `id` (integer) - **NOT UUID**
- ✅ `user_id` (integer) - **NOT UUID**
- ✅ `filename` (varchar)
- ✅ `file_path` (varchar)
- ✅ `file_size` (integer)
- ✅ `storage_type` (varchar)
- ✅ `is_public` (boolean)

---

### 3. Data Integrity Checks

#### No Duplicate Emails
```sql
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```
**Expected:** 0 rows (no duplicates)

#### No Orphaned Subscriptions
```sql
SELECT COUNT(*) as orphaned_count
FROM subscriptions s
LEFT JOIN users u ON s.user_id = u.id
WHERE u.id IS NULL;
```
**Expected:** 0

#### No Orphaned Team Members
```sql
SELECT COUNT(*) as orphaned_count
FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
LEFT JOIN users u ON tm.user_id = u.id
WHERE t.id IS NULL OR u.id IS NULL;
```
**Expected:** 0

#### Only One Active Theme
```sql
SELECT COUNT(*) as active_themes
FROM themes 
WHERE is_active = true;
```
**Expected:** 0 or 1 (not more)

---

### 4. Index Check

Check if foreign keys have indexes:

```sql
SELECT
    tc.table_name,
    kcu.column_name,
    CASE WHEN idx.indexname IS NULL THEN '❌ MISSING' ELSE '✅ OK' END as index_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN pg_indexes idx 
    ON idx.tablename = tc.table_name 
    AND idx.indexdef LIKE '%' || kcu.column_name || '%'
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

**Expected:** All should show "✅ OK"

---

### 5. Quick Summary

Run this for a quick overview:

```sql
SELECT 
    'Tables' as check_type,
    COUNT(*) as count,
    CASE WHEN COUNT(*) >= 16 THEN '✅ OK' ELSE '❌ Missing' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Indexes',
    COUNT(*),
    CASE WHEN COUNT(*) >= 50 THEN '✅ OK' ELSE '⚠️  Low' END
FROM pg_indexes 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Users',
    COUNT(*),
    '✅ OK' as status
FROM users
UNION ALL
SELECT 
    'Active Users',
    COUNT(*),
    '✅ OK' as status
FROM users WHERE is_active = true;
```

---

## 🚨 Common Issues to Check

### Issue 1: Files Table Using UUID Instead of Integer

**Symptom:** Foreign key errors when linking files to users

**Check:**
```sql
SELECT data_type 
FROM information_schema.columns 
WHERE table_name = 'files' AND column_name = 'id';
```

**Should be:** `integer` (not `uuid`)

**Fix:** Run migration `011_fix_file_model` (should run automatically on next deployment)

---

### Issue 2: Missing Indexes

**Symptom:** Slow queries on foreign key columns

**Check:** Use the index check query above

**Fix:** Indexes should be created automatically by migrations

---

### Issue 3: Missing Tables

**Symptom:** Application errors about missing tables

**Check:** Use the table existence check above

**Fix:** Run migrations: `alembic upgrade head`

---

### Issue 4: Data Integrity Issues

**Symptom:** Application errors or inconsistent data

**Check:** Use the data integrity queries above

**Fix:** Clean up orphaned records manually or via migration

---

## 📊 Full Health Check Script

For a comprehensive check, use the SQL script:

**File:** `backend/scripts/database_health_check.sql`

Copy the entire file and run it in Railway's database console.

---

## ✅ Health Check Checklist

- [ ] All 16 expected tables exist
- [ ] Users table has correct structure
- [ ] Files table uses Integer (not UUID) for IDs
- [ ] No duplicate emails
- [ ] No orphaned subscriptions
- [ ] No orphaned team members
- [ ] Only 0-1 active themes
- [ ] All foreign keys have indexes
- [ ] Timestamps are timezone-aware
- [ ] Record counts look reasonable

---

## 🎯 Expected Results Summary

| Check | Expected Result |
|-------|----------------|
| Tables | 16+ tables |
| Indexes | 50+ indexes |
| Foreign Keys | All have indexes |
| Duplicate Emails | 0 |
| Orphaned Records | 0 |
| Active Themes | 0 or 1 |
| Files Table ID Type | integer (not uuid) |

---

**Status:** ✅ **Run these queries in Railway to verify your database health**

