# Database Schema Review

## 🔍 Production Database Analysis

Based on the codebase models and expected schema, here's a comprehensive review of your database structure.

## ✅ Expected Tables (17 tables)

### Core Tables
1. **users** - User accounts
2. **roles** - Role definitions (RBAC)
3. **permissions** - Permission definitions
4. **role_permissions** - Role-Permission mapping
5. **user_roles** - User-Role assignments

### Team & Collaboration
6. **teams** - Teams/Organizations
7. **team_members** - Team membership with roles
8. **invitations** - Team/user invitations

### Billing & Subscriptions
9. **plans** - Subscription plans
10. **subscriptions** - User subscriptions
11. **invoices** - Payment invoices

### Application Data
12. **projects** - User projects
13. **themes** - Theme configurations
14. **files** - File metadata

### API & Integration
15. **api_keys** - API key management
16. **webhook_events** - Webhook event logs

### Security Audit (if implemented)
17. **security_audit_logs** - Security audit trail

---

## 📋 Detailed Table Structure Review

### 1. Users Table ✅ CRITICAL

**Required Columns:**
- `id` (Integer, PK)
- `email` (String, UNIQUE, NOT NULL, INDEXED)
- `hashed_password` (String, NOT NULL)
- `first_name` (String(100), nullable, indexed)
- `last_name` (String(100), nullable, indexed)
- `is_active` (Boolean, default=True, NOT NULL, indexed)
- `theme_preference` (String(20), nullable) - **DEPRECATED** but may exist
- `created_at` (DateTime(timezone), NOT NULL, indexed)
- `updated_at` (DateTime(timezone), NOT NULL, indexed)

**Required Indexes:**
- `idx_users_email` - Email lookup
- `idx_users_is_active` - Active user filtering
- `idx_users_created_at` - Creation date sorting
- `idx_users_updated_at` - Update date sorting

**Foreign Keys:** None (root table)

**Issues to Check:**
- ✅ Email must be unique
- ✅ Password must be hashed (bcrypt)
- ⚠️ `theme_preference` is deprecated but may still exist in DB

---

### 2. Roles Table ✅ CRITICAL

**Required Columns:**
- `id` (Integer, PK)
- `name` (String(100), UNIQUE, NOT NULL, indexed)
- `slug` (String(100), UNIQUE, NOT NULL, indexed)
- `description` (Text, nullable)
- `is_system` (Boolean, default=False, NOT NULL)
- `is_active` (Boolean, default=True, NOT NULL, indexed)
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_roles_name` - Name lookup
- `idx_roles_is_active` - Active role filtering

**Foreign Keys:** None

**Issues to Check:**
- ✅ System roles (superadmin, admin) should exist
- ✅ Slug must be unique

---

### 3. Permissions Table

**Required Columns:**
- `id` (Integer, PK)
- `resource` (String(100), NOT NULL, indexed)
- `action` (String(50), NOT NULL, indexed)
- `name` (String(200), UNIQUE, NOT NULL) - Format: "resource:action"
- `description` (Text, nullable)
- `created_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_permissions_resource` - Resource filtering
- `idx_permissions_action` - Action filtering
- `idx_permissions_resource_action` - Composite index

---

### 4. Role Permissions Table

**Required Columns:**
- `id` (Integer, PK)
- `role_id` (Integer, FK → roles.id, NOT NULL, indexed)
- `permission_id` (Integer, FK → permissions.id, NOT NULL, indexed)
- `created_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_role_permissions_role` - Role lookup
- `idx_role_permissions_permission` - Permission lookup
- `idx_role_permissions_unique` - UNIQUE(role_id, permission_id)

**Foreign Keys:**
- `role_id` → `roles.id` (ON DELETE CASCADE)
- `permission_id` → `permissions.id` (ON DELETE CASCADE)

---

### 5. User Roles Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `role_id` (Integer, FK → roles.id, NOT NULL, indexed)
- `created_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_user_roles_user` - User lookup
- `idx_user_roles_role` - Role lookup
- `idx_user_roles_unique` - UNIQUE(user_id, role_id)

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)
- `role_id` → `roles.id` (ON DELETE CASCADE)

---

### 6. Teams Table

**Required Columns:**
- `id` (Integer, PK)
- `name` (String(200), NOT NULL, indexed)
- `slug` (String(200), UNIQUE, NOT NULL, indexed)
- `description` (Text, nullable)
- `owner_id` (Integer, FK → users.id, NOT NULL, indexed)
- `is_active` (Boolean, default=True, NOT NULL, indexed)
- `settings` (Text, nullable) - JSON string
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_teams_name` - Name lookup
- `idx_teams_slug` - Slug lookup
- `idx_teams_owner` - Owner lookup
- `idx_teams_is_active` - Active team filtering

**Foreign Keys:**
- `owner_id` → `users.id`

---

### 7. Team Members Table

**Required Columns:**
- `id` (Integer, PK)
- `team_id` (Integer, FK → teams.id, NOT NULL, indexed)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `role_id` (Integer, FK → roles.id, NOT NULL, indexed)
- `is_active` (Boolean, default=True, NOT NULL)
- `joined_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_team_members_team` - Team lookup
- `idx_team_members_user` - User lookup
- `idx_team_members_role` - Role lookup
- `idx_team_members_unique` - UNIQUE(team_id, user_id)

**Foreign Keys:**
- `team_id` → `teams.id`
- `user_id` → `users.id`
- `role_id` → `roles.id`

---

### 8. Invitations Table

**Required Columns:**
- `id` (Integer, PK)
- `email` (String(255), NOT NULL, indexed)
- `token` (String(64), UNIQUE, NOT NULL, indexed)
- `team_id` (Integer, FK → teams.id, nullable, indexed)
- `role_id` (Integer, FK → roles.id, nullable, indexed)
- `invited_by_id` (Integer, FK → users.id, NOT NULL, indexed)
- `status` (String(20), default='pending', NOT NULL, indexed)
- `message` (Text, nullable)
- `expires_at` (DateTime(timezone), NOT NULL, indexed)
- `accepted_at` (DateTime(timezone), nullable)
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_invitations_email` - Email lookup
- `idx_invitations_token` - Token lookup
- `idx_invitations_team` - Team lookup
- `idx_invitations_status` - Status filtering
- `idx_invitations_expires_at` - Expiration filtering

**Foreign Keys:**
- `team_id` → `teams.id`
- `role_id` → `roles.id`
- `invited_by_id` → `users.id`

---

### 9. Plans Table

**Required Columns:**
- `id` (Integer, PK)
- `name` (String(200), NOT NULL)
- `description` (Text, nullable)
- `amount` (Numeric(10,2), NOT NULL)
- `currency` (String(3), default='usd')
- `interval` (Enum, NOT NULL) - 'month', 'year', 'week', 'day'
- `interval_count` (Integer, default=1)
- `stripe_price_id` (String(255), UNIQUE, nullable, indexed)
- `features` (Text, nullable) - JSON array
- `status` (Enum, default='active') - 'active', 'inactive', 'archived'
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_plans_stripe_id` - Stripe price lookup
- `idx_plans_status` - Status filtering
- `idx_plans_interval` - Interval filtering

---

### 10. Subscriptions Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `plan_id` (Integer, FK → plans.id, NOT NULL)
- `stripe_subscription_id` (String(255), UNIQUE, nullable, indexed)
- `stripe_customer_id` (String(255), nullable, indexed)
- `stripe_payment_method_id` (String(255), nullable)
- `status` (Enum, default='incomplete', NOT NULL, indexed)
- `current_period_start` (DateTime(timezone), nullable)
- `current_period_end` (DateTime(timezone), nullable, indexed)
- `cancel_at_period_end` (Boolean, default=False, NOT NULL)
- `canceled_at` (DateTime(timezone), nullable)
- `trial_start` (DateTime(timezone), nullable)
- `trial_end` (DateTime(timezone), nullable)
- `metadata` (Text, nullable) - JSON string
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_subscriptions_user_id` - User lookup
- `idx_subscriptions_status` - Status filtering
- `idx_subscriptions_stripe_id` - Stripe subscription lookup
- `idx_subscriptions_current_period_end` - Period end filtering

**Foreign Keys:**
- `user_id` → `users.id`
- `plan_id` → `plans.id`

**Status Values:**
- `active`, `canceled`, `past_due`, `unpaid`, `trialing`, `incomplete`, `incomplete_expired`

---

### 11. Invoices Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `subscription_id` (Integer, FK → subscriptions.id, nullable)
- `stripe_invoice_id` (String(255), UNIQUE, nullable)
- `amount` (Numeric(10,2), NOT NULL)
- `currency` (String(3), default='usd')
- `status` (String(20), NOT NULL) - 'paid', 'pending', 'failed', 'uncollectible'
- `invoice_date` (DateTime(timezone), NOT NULL)
- `due_date` (DateTime(timezone), nullable)
- `paid_at` (DateTime(timezone), nullable)
- `invoice_number` (String(100), UNIQUE, nullable)
- `pdf_url` (String(500), nullable)
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_invoices_user_id` - User lookup
- `idx_invoices_subscription_id` - Subscription lookup
- `idx_invoices_status` - Status filtering
- `idx_invoices_invoice_date` - Date filtering

**Foreign Keys:**
- `user_id` → `users.id`
- `subscription_id` → `subscriptions.id`

---

### 12. Projects Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `name` (String(255), NOT NULL, indexed)
- `description` (Text, nullable)
- `status` (Enum, default='active', NOT NULL, indexed)
- `created_at` (DateTime(timezone), NOT NULL, indexed)
- `updated_at` (DateTime(timezone), NOT NULL, indexed)

**Required Indexes:**
- `idx_projects_user_id` - User lookup
- `idx_projects_status` - Status filtering
- `idx_projects_created_at` - Creation date sorting
- `idx_projects_updated_at` - Update date sorting

**Foreign Keys:**
- `user_id` → `users.id`

**Status Values:**
- `active`, `archived`, `completed`

---

### 13. Themes Table

**Required Columns:**
- `id` (Integer, PK)
- `name` (String(100), UNIQUE, NOT NULL, indexed)
- `display_name` (String(200), NOT NULL)
- `description` (Text, nullable)
- `config` (JSON, NOT NULL) - Theme configuration
- `is_active` (Boolean, default=False, NOT NULL, indexed)
- `created_by` (Integer, nullable) - User ID
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_themes_is_active` - Active theme lookup

**Issues to Check:**
- ⚠️ Only ONE theme should have `is_active=True` at a time
- ✅ `config` should be valid JSON

---

### 14. Files Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `filename` (String(500), NOT NULL)
- `file_path` (String(1000), NOT NULL)
- `file_size` (Integer, NOT NULL)
- `mime_type` (String(100), nullable)
- `storage_type` (String(50), default='local') - 'local', 's3'
- `is_public` (Boolean, default=False, NOT NULL)
- `created_at` (DateTime(timezone), NOT NULL)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_files_user_id` - User lookup
- `idx_files_storage_type` - Storage type filtering
- `idx_files_is_public` - Public file filtering

**Foreign Keys:**
- `user_id` → `users.id`

---

### 15. API Keys Table

**Required Columns:**
- `id` (Integer, PK)
- `user_id` (Integer, FK → users.id, NOT NULL, indexed)
- `name` (String(200), NOT NULL)
- `description` (Text, nullable)
- `key_hash` (String(255), UNIQUE, NOT NULL, indexed)
- `key_prefix` (String(20), NOT NULL)
- `rotation_policy` (String(50), default='manual', NOT NULL)
- `last_rotated_at` (DateTime(timezone), nullable)
- `next_rotation_at` (DateTime(timezone), nullable, indexed)
- `rotation_count` (Integer, default=0, NOT NULL)
- `last_used_at` (DateTime(timezone), nullable, indexed)
- `usage_count` (Integer, default=0, NOT NULL)
- `expires_at` (DateTime(timezone), nullable, indexed)
- `is_active` (Boolean, default=True, NOT NULL, indexed)
- `revoked_at` (DateTime(timezone), nullable)
- `revoked_reason` (Text, nullable)
- `created_at` (DateTime(timezone), NOT NULL, indexed)
- `updated_at` (DateTime(timezone), NOT NULL)

**Required Indexes:**
- `idx_api_keys_user_id` - User lookup
- `idx_api_keys_key_hash` - Key hash lookup
- `idx_api_keys_is_active` - Active key filtering
- `idx_api_keys_expires_at` - Expiration filtering
- `idx_api_keys_created_at` - Creation date sorting

**Foreign Keys:**
- `user_id` → `users.id` (ON DELETE CASCADE)

**Security Checks:**
- ✅ Keys must be hashed (never store plain text)
- ✅ Key prefix should match pattern (e.g., 'sk_live_', 'sk_test_')

---

### 16. Webhook Events Table

**Required Columns:**
- `id` (Integer, PK)
- `event_type` (String(100), NOT NULL, indexed)
- `source` (String(50), NOT NULL) - 'stripe', 'custom'
- `payload` (Text, NOT NULL) - JSON string
- `status` (String(20), default='pending', NOT NULL) - 'pending', 'processed', 'failed'
- `processed_at` (DateTime(timezone), nullable)
- `error_message` (Text, nullable)
- `created_at` (DateTime(timezone), NOT NULL, indexed)

**Required Indexes:**
- `idx_webhook_events_type` - Event type lookup
- `idx_webhook_events_status` - Status filtering
- `idx_webhook_events_created_at` - Date filtering

---

## 🔍 Critical Issues to Check

### 1. Missing Tables
Run this query to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### 2. Missing Indexes
All foreign keys should have indexes. Check:
```sql
SELECT 
    tc.table_name,
    kcu.column_name,
    CASE WHEN idx.indexname IS NULL THEN 'MISSING INDEX' ELSE 'OK' END as index_status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN pg_indexes idx 
    ON idx.tablename = tc.table_name 
    AND idx.indexdef LIKE '%' || kcu.column_name || '%'
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';
```

### 3. Missing Unique Constraints
Check critical unique constraints:
```sql
-- Check users.email is unique
SELECT COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Check teams.slug is unique
SELECT COUNT(*) FROM teams GROUP BY slug HAVING COUNT(*) > 1;

-- Check api_keys.key_hash is unique
SELECT COUNT(*) FROM api_keys GROUP BY key_hash HAVING COUNT(*) > 1;
```

### 4. Foreign Key Integrity
Check for orphaned records:
```sql
-- Orphaned subscriptions
SELECT COUNT(*) FROM subscriptions s 
LEFT JOIN users u ON s.user_id = u.id 
WHERE u.id IS NULL;

-- Orphaned team members
SELECT COUNT(*) FROM team_members tm
LEFT JOIN teams t ON tm.team_id = t.id
LEFT JOIN users u ON tm.user_id = u.id
WHERE t.id IS NULL OR u.id IS NULL;
```

### 5. Data Type Issues
Check for incorrect data types:
```sql
-- Check if timestamps are timezone-aware
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
AND (column_name LIKE '%_at' OR column_name = 'created_at' OR column_name = 'updated_at')
AND data_type != 'timestamp with time zone';
```

---

## 📊 Recommended Queries for Production Check

### Quick Health Check
```sql
-- Table count
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Index count
SELECT COUNT(*) as index_count
FROM pg_indexes 
WHERE schemaname = 'public';

-- Foreign key count
SELECT COUNT(*) as fk_count
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
```

### Check Critical Constraints
```sql
-- Users table integrity
SELECT 
    COUNT(*) as total_users,
    COUNT(DISTINCT email) as unique_emails,
    COUNT(*) - COUNT(DISTINCT email) as duplicate_emails
FROM users;

-- Active users
SELECT COUNT(*) as active_users FROM users WHERE is_active = true;

-- Teams with valid owners
SELECT COUNT(*) as teams_with_valid_owners
FROM teams t
JOIN users u ON t.owner_id = u.id
WHERE u.is_active = true;
```

---

## ✅ Action Items

1. **Run Schema Check Script** - Use the provided script to analyze your production database
2. **Verify All Tables Exist** - Ensure all 17 expected tables are present
3. **Check Indexes** - Verify all foreign keys have indexes
4. **Validate Constraints** - Check unique constraints and foreign keys
5. **Review Data Types** - Ensure timestamps are timezone-aware
6. **Check Orphaned Records** - Find and fix any orphaned foreign key references
7. **Verify Critical Columns** - Ensure required columns exist with correct types

---

## 🚨 Common Issues Found in Production

1. **Missing Indexes** - Foreign keys without indexes cause slow queries
2. **Incorrect Data Types** - Timestamps without timezone cause timezone issues
3. **Missing Constraints** - Unique constraints not enforced at DB level
4. **Orphaned Records** - Foreign key references to deleted records
5. **Missing Columns** - New columns from migrations not applied
6. **Deprecated Columns** - Old columns still present (like `theme_preference`)

---

**Next Steps:**
1. Connect to your production database using the provided connection string
2. Run the schema check queries above
3. Compare results with this document
4. Create migration if discrepancies are found
5. Document any production-specific changes

