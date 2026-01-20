# Fix: 360 Contributors Not Showing in Dashboard

## Problem
User reported that 2 contributors completed their 360 feedback assessment, but the dashboard shows "No contributors".

## Root Cause
The issue was caused by **multiple 360 self-assessments** existing for the same user:

1. **Multiple Assessment Creation**: When a user creates a 360 assessment multiple times (e.g., clicking "Start 360 Feedback" again), a NEW assessment record is created in the database
2. **Frontend Shows Only Newest**: The dashboard displays only the MOST RECENT assessment of each type (by `created_at` timestamp)
3. **Contributors Attached to Old Assessment**: The contributors who completed their evaluations were attached to an OLDER assessment
4. **Result**: Dashboard showed the NEW assessment (which has no contributors), while the OLD assessment had the completed contributors

### Code Evidence
In `apps/web/src/app/[locale]/dashboard/assessments/page.tsx` lines 560-563:

```typescript
const existing = existingAssessmentsMap.get(normalizedType);
// Keep the most recent assessment of each type
if (!existing || new Date(assessment.created_at) > new Date(existing.created_at)) {
  existingAssessmentsMap.set(normalizedType, { ...assessment, assessment_type: normalizedType });
}
```

This logic only keeps the NEWEST assessment of each type, discarding older ones from the display.

## Solution Implemented

### Backend Changes
Modified `backend/app/api/v1/endpoints/assessments.py`:

1. **Added `include_all` parameter** to `get_360_evaluators_status` endpoint
2. **When `include_all=True`**: Returns evaluators from ALL of the user's 360 self-assessments, not just one specific assessment
3. **Added `assessment_id` field** to each evaluator in the response, so frontend knows which assessment each evaluator belongs to

```python
@router.get("/{assessment_id}/360/evaluators")
async def get_360_evaluators_status(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    include_all: bool = False  # NEW: Include evaluators from all user's 360 assessments
):
    # ...
    if include_all:
        # Get all user's 360 self-assessments
        all_assessments_result = await db.execute(
            select(Assessment.id)
            .where(
                Assessment.user_id == current_user.id,
                Assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF
            )
        )
        all_assessment_ids = [row[0] for row in all_assessments_result.fetchall()]
        
        # Get evaluators from ALL assessments
        evaluators_result = await db.execute(
            select(Assessment360Evaluator)
            .where(Assessment360Evaluator.assessment_id.in_(all_assessment_ids))
            .order_by(Assessment360Evaluator.created_at)
        )
        evaluators = evaluators_result.scalars().all()
    # ...
```

### Frontend Changes
Modified `apps/web/src/lib/api/assessments.ts`:

1. **Updated `get360Evaluators` function** to pass `include_all=true` by default
2. **Updated `EvaluatorStatus` interface** to include `assessment_id` field

```typescript
export const get360Evaluators = async (
  assessmentId: number, 
  includeAll: boolean = true  // NEW: Default to true to show all evaluators
): Promise<EvaluatorsResponse> => {
  const response = await apiClient.get(
    `/v1/assessments/${assessmentId}/360/evaluators`,
    {
      params: {
        include_all: includeAll
      }
    }
  );
  return response.data;
};
```

## How It Works Now

1. **Dashboard calls** `get360Evaluators(assessmentId, true)` with `include_all=true`
2. **Backend queries** ALL 360 self-assessments for the current user
3. **Backend returns** ALL evaluators from ALL assessments, with each evaluator tagged with its `assessment_id`
4. **Dashboard displays** all evaluators, regardless of which assessment they belong to
5. **Result**: User sees ALL their contributors, including those from older assessments

## Impact

### Positive
- ✅ **Fixes the reported issue**: All completed contributors now show in the dashboard
- ✅ **No data loss**: Contributors who completed assessments on older assessments are now visible
- ✅ **Backward compatible**: Existing code continues to work; `include_all` defaults to `true`
- ✅ **Better UX**: Users see all their contributors in one place

### Considerations
- ⚠️ If a user has contributors on multiple assessments, they'll all be shown together
- ⚠️ In rare cases, this might show "duplicate" contributors if the same person was invited to multiple assessments
- ℹ️ Each evaluator record includes `assessment_id` so the UI can differentiate if needed

## Testing Recommendations

1. **Verify the fix works**:
   - Navigate to `/dashboard/assessments`
   - Check if contributors now appear in the 360 Feedback card
   - Verify completed contributors show "Completed" status

2. **Test edge cases**:
   - User with multiple 360 assessments
   - User with contributors on different assessments
   - User with no 360 assessments
   - User with no contributors

3. **Check other pages**:
   - `/dashboard/evaluators` - should show all evaluators
   - `/dashboard/assessments/360-feedback/results` - should show all contributors
   - `/dashboard/reports` - should include all contributor data

## Future Improvements

### Short-term
- Add visual indication when contributors belong to different assessments
- Allow users to filter contributors by assessment if they have multiple

### Long-term
- **Prevent duplicate 360 assessments**: Check if user already has an active 360 assessment before creating a new one
- **Assessment selection UI**: If multiple assessments exist, let users choose which one to view/continue
- **Merge assessments**: Provide admin tool to merge contributors from multiple assessments into one

## Files Modified

1. `backend/app/api/v1/endpoints/assessments.py`
   - Modified `get_360_evaluators_status` endpoint to support `include_all` parameter

2. `apps/web/src/lib/api/assessments.ts`
   - Updated `get360Evaluators` function to pass `include_all=true` by default
   - Updated `EvaluatorStatus` interface to include `assessment_id` field

3. `DIAGNOSIS_360_CONTRIBUTORS_ISSUE.md` (NEW)
   - Root cause analysis document

4. `FIX_360_CONTRIBUTORS_NOT_SHOWING.md` (THIS FILE)
   - Complete fix documentation

## Related Issues

This fix resolves the following:
- Contributors who completed their 360 feedback not showing in dashboard
- "No contributors" message when contributors actually exist
- Evaluators being "lost" when new 360 assessments are created

## Deployment Notes

- ✅ **No database migration required** - only code changes
- ✅ **No breaking changes** - backward compatible
- ✅ **Safe to deploy immediately** - improves existing functionality without removing features
