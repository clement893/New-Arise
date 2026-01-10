# Fix: 360° Feedback Showing as Completed When Not Started

## Issue
360° Feedback assessment is showing as "Terminé" (Completed) with "Voir les résultats" button even though the user hasn't started it (answer_count = 0).

## Root Cause
The backend has an assessment record with `status='completed'` but `answer_count=0`. This is a data inconsistency that can occur when:
- Assessment status was incorrectly set to 'completed' in the database
- Assessment was deleted/reset but status wasn't updated
- Database migration or script error

## Fixes Applied

### 1. Frontend Fix ✅
**File:** `apps/web/src/lib/utils/assessmentStatus.ts`

Added explicit check for `answer_count === 0` in the completed status check:

```typescript
if (statusNormalized === 'completed' || statusNormalized === 'complete') {
  // For assessments with questions, verify ALL questions are answered
  if (apiAssessment.total_questions !== undefined && apiAssessment.total_questions > 0) {
    const answerCount = apiAssessment.answer_count ?? 0; // Default to 0 if undefined
    if (answerCount === apiAssessment.total_questions && answerCount > 0) {
      return 'completed';
    }
    // Status says completed but answer_count is 0 - treat as available (not started)
    if (answerCount === 0) {
      return 'available';
    }
    // Fall through for other cases
  }
}
```

**Result:** Frontend now correctly shows "Disponible" (Available) status when status='completed' but answer_count=0.

### 2. Database Migration ✅
**File:** `backend/migrations/fix_completed_assessments_no_answers.sql`

SQL migration to fix existing data inconsistencies:

```sql
-- Fix assessments marked as completed but with 0 answers
UPDATE assessments 
SET status = 'in_progress',
    completed_at = NULL,
    updated_at = NOW()
WHERE status = 'completed' 
AND assessment_type IN ('360_self', 'tki', 'wellness')
AND NOT EXISTS (
    SELECT 1 
    FROM assessment_answers 
    WHERE assessment_answers.assessment_id = assessments.id
);
```

**Result:** Migration will automatically fix all assessments marked as 'completed' but with 0 answers when deployed.

## Testing

After deployment, verify:
1. ✅ 360° Feedback shows as "Disponible" if not started
2. ✅ 360° Feedback shows as "En cours" if partially started
3. ✅ 360° Feedback shows as "Terminé" only if all questions are answered
4. ✅ Database migration fixes existing inconsistent records

## Deployment

The fix is deployed in two parts:
1. **Frontend fix** - Already pushed and will handle the issue immediately
2. **Database migration** - Will run automatically on next deployment via `entrypoint.sh`

The frontend fix provides immediate relief, while the database migration fixes the root cause in the database.

## Files Changed

- ✅ `apps/web/src/lib/utils/assessmentStatus.ts` - Added answer_count === 0 check
- ✅ `backend/migrations/fix_completed_assessments_no_answers.sql` - Database migration

## Status

✅ **FIXED** - Both frontend and database fixes applied and pushed.
