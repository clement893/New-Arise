# 360 Contributors Issue Diagnosis

## Problem Statement
User reports that 2 contributors have completed their 360 feedback assessment, but the dashboard shows "No contributors".

## Root Cause Analysis

### Most Likely Cause: Multiple 360 Self-Assessments
Based on code analysis, the most probable issue is:

1. **Multiple Assessment Records**: The user may have multiple `THREE_SIXTY_SELF` assessments in the database
2. **Showing Wrong Assessment**: The dashboard displays only the MOST RECENT assessment (by `created_at` timestamp)
3. **Contributors on Old Assessment**: The contributors who completed their evaluations are attached to an OLDER assessment
4. **Result**: Dashboard shows the new assessment (no contributors) while the old assessment has the completed contributors

### Evidence from Code

In `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` lines 560-563:

```typescript
const existing = existingAssessmentsMap.get(normalizedType);
// Keep the most recent assessment of each type
if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
  existingAssessmentsMap.set(normalizedType, { ...assessment, assessment_type: normalizedType });
}
```

This logic only keeps the NEWEST assessment of each type, discarding older ones.

## Database Investigation Needed

To confirm this diagnosis, we need to check:

```sql
-- Check how many THREE_SIXTY_SELF assessments exist for the user
SELECT 
    id,
    user_id,
    assessment_type,
    status,
    created_at,
    updated_at,
    (SELECT COUNT(*) FROM assessment_360_evaluators WHERE assessment_id = assessments.id) as evaluator_count
FROM assessments
WHERE assessment_type = '360_self'
AND user_id = [USER_ID]  -- Replace with actual user ID
ORDER BY created_at DESC;

-- Check which assessment has the completed evaluators
SELECT 
    e.id,
    e.assessment_id,
    e.evaluator_name,
    e.evaluator_email,
    e.evaluator_role,
    e.status,
    e.completed_at,
    a.created_at as assessment_created_at
FROM assessment_360_evaluators e
JOIN assessments a ON e.assessment_id = a.id
WHERE a.user_id = [USER_ID]  -- Replace with actual user ID
AND a.assessment_type = '360_self'
ORDER BY a.created_at DESC, e.created_at DESC;
```

## Potential Solutions

### Option 1: Show All Contributors from All Assessments (Quick Fix)
Modify the frontend to fetch evaluators from ALL 360 self-assessments for the user, not just the most recent one.

### Option 2: Merge Assessments (Database Fix)
If there are duplicate assessments, merge the evaluators to the newest assessment in the database.

### Option 3: Better Assessment Management (Long-term Fix)
- Prevent creating duplicate 360 self-assessments
- Allow users to "continue" an existing assessment instead of creating a new one
- Show all assessments in the UI with clear indication of which one is active

## Immediate Action Items

1. ✅ Identify the issue (DONE - multiple assessments suspected)
2. ⏳ Query database to confirm multiple assessments exist
3. ⏳ Implement fix to show evaluators from all assessments
4. ⏳ Test the fix
5. ⏳ Consider preventing duplicate assessment creation in the future

## Files Involved

- Frontend: `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`
- Backend: `backend/app/api/v1/endpoints/assessments.py` (get_360_evaluators_status)
- Database: `assessment_360_evaluators` table, `assessments` table
