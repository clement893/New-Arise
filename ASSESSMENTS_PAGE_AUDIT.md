# Assessments Page Audit - Hardcoded Values and Issues

## Executive Summary
This audit identifies hardcoded values and issues in the assessments dashboard page (`/fr/dashboard/assessments`) that prevent proper reactivity to API data changes, particularly for TKI and 360 Feedback assessments (Wellness appears to work correctly).

## Issues Found

### 1. **Hardcoded Total Questions in Backend**
**Location:** `backend/app/api/v1/endpoints/assessments.py:161`

```python
# Determine total questions based on assessment type
total_questions = 30  # Default for TKI, WELLNESS, THREE_SIXTY_SELF
if assessment.assessment_type == AssessmentType.MBTI:
    total_questions = 0  # MBTI is external upload
```

**Problem:** All assessment types (TKI, WELLNESS, THREE_SIXTY_SELF) have `total_questions` hardcoded to 30. While all three currently have 30 questions, this creates a maintenance issue:
- If question arrays change in the frontend, backend won't reflect the change
- No validation that the hardcoded value matches actual question count
- Creates inconsistency risk if questions are added/removed

**Impact:** Low (currently matches reality, but creates technical debt)

**Recommendation:** Calculate `total_questions` dynamically based on assessment type, or store in database/config.

---

### 2. **Hardcoded Percentage Calculation in TKI Results**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/tki/results/page.tsx:68-69`

```typescript
const getModePercentage = (count: number) => {
  return Math.round((count / 30) * 100);
};
```

**Problem:** The divisor is hardcoded to 30. If TKI ever has a different number of questions, this calculation will be incorrect.

**Impact:** Medium (creates risk if question count changes)

**Recommendation:** Use `tkiQuestions.length` or get total from API data.

---

### 3. **Display Order Based on Hardcoded Config**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx:430-432`

```typescript
const displayAssessments: AssessmentDisplay[] = Object.entries(ASSESSMENT_CONFIG)
  .filter(([type]) => type !== '360_evaluator')
  .map(([type, config]) => {
    // ...
  });
```

**Problem:** The page iterates through `ASSESSMENT_CONFIG` (hardcoded) first, then finds matching API assessments. This means:
- Display order is determined by config order, not API data
- If an assessment type exists in config but not in API, it still shows with status 'available'
- Assessment types not in config won't show even if they exist in API

**Impact:** Medium (display logic driven by config rather than API)

**Recommendation:** Consider iterating through API assessments first, then enrich with config data.

---

### 4. **Hardcoded Assessment Metadata**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx:72-100`

```typescript
const ASSESSMENT_CONFIG: Record<string, { title: string; description: string; icon: LucideIcon; externalLink?: string; requiresEvaluators?: boolean }> = {
  mbti: {
    title: 'MBTI Personality',
    description: 'Understanding your natural preferences',
    icon: Brain,
    externalLink: 'https://www.psychometrics.com/assessments/mbti/',
  },
  tki: {
    title: 'TKI Conflict Style',
    description: 'Explore your conflict management approach',
    icon: Target,
  },
  // ...
};
```

**Problem:** Titles, descriptions, and icons are hardcoded in the frontend. While this is reasonable for display metadata, it means:
- Changes require code deployment
- No way to customize per-user/tenant
- Metadata not available via API

**Impact:** Low (acceptable for static metadata, but limits flexibility)

**Recommendation:** Keep as-is for now, but consider moving to API/DB if customization is needed.

---

### 5. **Cache Duration May Cause Stale Data**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx:113`

```typescript
if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
  // Use cached data
}
```

**Problem:** Cache is valid for 5 minutes. During this time, if a user completes questions in another tab/window, the assessments page won't reflect the changes until cache expires.

**Impact:** Medium (user experience issue)

**Recommendation:** 
- Reduce cache duration
- Add cache invalidation on focus/visibility
- Use event listeners for cross-tab updates

---

### 6. **No Real-time Updates After Answer Submission**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx`

**Problem:** When returning from results pages or after completing questions, the page may not automatically refresh. The `useEffect` at line 316-335 listens for visibility/focus changes, but:
- Doesn't refresh on router navigation back
- May use stale cache
- No explicit refresh after assessment completion

**Impact:** High (core user experience issue - page doesn't reflect latest state)

**Recommendation:**
- Add router refresh on mount (if returning from results)
- Clear cache when returning from assessment/question pages
- Add polling or WebSocket for real-time updates

---

### 7. **Progress Bar Uses API Data (Good)**
**Location:** `apps/web/src/app/[locale]/dashboard/assessments/page.tsx:1220-1301`

**Status:** ✅ **WORKING CORRECTLY**
- Uses `answerCount` and `totalQuestions` from API
- Calculates progress dynamically
- No hardcoded values in progress calculation

---

### 8. **Status Determination Uses API Data (Good)**
**Location:** `apps/web/src/lib/utils/assessmentStatus.ts`

**Status:** ✅ **WORKING CORRECTLY**
- Uses `answer_count` and `total_questions` from API
- Logic is dynamic and reactive
- No hardcoded status values

---

## Summary by Assessment Type

### Wellness
- ✅ Status: Works correctly
- ✅ Progress: Uses API data
- ✅ Buttons: React to status changes

### TKI
- ⚠️ Results page: Hardcoded 30 in percentage calculation (line 68)
- ⚠️ Backend: Hardcoded 30 for total_questions
- ✅ Status: Uses API data
- ✅ Progress: Uses API data

### 360 Feedback
- ⚠️ Backend: Hardcoded 30 for total_questions
- ✅ Status: Uses API data
- ✅ Progress: Uses API data

### MBTI
- ✅ External assessment - no internal questions
- ✅ Handled correctly

---

## Priority Fixes

### High Priority
1. **Add cache invalidation on navigation back from results/assessment pages**
2. **Ensure page refreshes when returning from assessment completion**
3. **Add explicit refresh after answering questions**

### Medium Priority
1. **Fix hardcoded 30 in TKI results percentage calculation**
2. **Consider reducing cache duration or adding smarter invalidation**
3. **Document that assessment metadata is intentionally hardcoded**

### Low Priority
1. **Consider making backend total_questions dynamic (if question counts may change)**
2. **Consider API endpoint for assessment metadata (if customization needed)**

---

## Testing Recommendations

1. **Test cross-tab updates:** Complete questions in one tab, check if assessments page updates in another
2. **Test navigation back:** Complete assessment → view results → go back to assessments page → verify status updates
3. **Test cache expiration:** Complete questions → wait >5 min → refresh page → verify data updates
4. **Test with different question counts:** If possible, test with modified question arrays to verify hardcoded values cause issues
