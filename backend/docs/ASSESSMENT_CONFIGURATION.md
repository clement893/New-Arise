# Assessment Configuration

## Overview

The assessment configuration system provides a centralized, maintainable way to manage assessment metadata and question counts. This replaces hardcoded values scattered throughout the codebase.

## Location

Configuration file: `backend/app/config/assessment_config.py`

## Usage

### Getting Total Questions

```python
from app.config.assessment_config import get_total_questions
from app.models.assessment import AssessmentType

# Get total questions for an assessment type
total = get_total_questions(AssessmentType.WELLNESS)  # Returns 30
total = get_total_questions(AssessmentType.MBTI)      # Returns 0 (external)
```

### Getting Assessment Metadata

```python
from app.config.assessment_config import get_assessment_metadata
from app.models.assessment import AssessmentType

# Get metadata for an assessment type
metadata = get_assessment_metadata(AssessmentType.TKI)
# Returns: {
#     "name": "TKI Conflict Style",
#     "description": "Explore your conflict management approach",
#     "total_questions": 30
# }
```

### Validating Configuration

```python
from app.config.assessment_config import validate_config

# Validate that all assessment types are configured correctly
try:
    validate_config()
    print("Configuration is valid")
except ValueError as e:
    print(f"Configuration error: {e}")
```

## Configuration Structure

### ASSESSMENT_TOTAL_QUESTIONS

Dictionary mapping assessment types to their total question counts:

```python
ASSESSMENT_TOTAL_QUESTIONS: Dict[AssessmentType, int] = {
    AssessmentType.WELLNESS: 30,
    AssessmentType.TKI: 30,
    AssessmentType.THREE_SIXTY_SELF: 30,
    AssessmentType.THREE_SIXTY_EVALUATOR: 30,
    AssessmentType.MBTI: 0,  # External upload
}
```

### ASSESSMENT_METADATA

Dictionary containing metadata for each assessment type:

```python
ASSESSMENT_METADATA: Dict[AssessmentType, Dict[str, Any]] = {
    AssessmentType.WELLNESS: {
        "name": "Wellness Assessment",
        "description": "Your overall well-being",
        "total_questions": 30,
    },
    # ... etc
}
```

## Integration Points

### Backend API Endpoints

The configuration is used in `backend/app/api/v1/endpoints/assessments.py`:

```python
from app.config.assessment_config import get_total_questions

# In list_assessments endpoint
total_questions = get_total_questions(assessment.assessment_type)
```

### Future Integration Points

- **Scoring Services**: Could use config to validate answer counts
- **API Metadata Endpoint**: Could expose metadata via API
- **Frontend**: Could fetch metadata from API instead of hardcoding

## Validation

The configuration is automatically validated on import:

1. **All Types Configured**: Ensures every `AssessmentType` has an entry
2. **Metadata Consistency**: Ensures `ASSESSMENT_METADATA` matches `ASSESSMENT_TOTAL_QUESTIONS`

If validation fails, an error is logged but the application continues to run (fail-safe design).

## Modifying Configuration

### Adding a New Assessment Type

1. Add the enum value to `app/models/assessment.py`:
   ```python
   class AssessmentType(str, enum.Enum):
       NEW_TYPE = "new_type"
   ```

2. Add configuration in `assessment_config.py`:
   ```python
   ASSESSMENT_TOTAL_QUESTIONS[AssessmentType.NEW_TYPE] = 25
   
   ASSESSMENT_METADATA[AssessmentType.NEW_TYPE] = {
       "name": "New Assessment",
       "description": "Description here",
       "total_questions": 25,
   }
   ```

3. Run validation to ensure it's correct:
   ```bash
   python -c "from app.config.assessment_config import validate_config; validate_config()"
   ```

### Changing Question Count

If question arrays change in the frontend:

1. Update `ASSESSMENT_TOTAL_QUESTIONS` in `assessment_config.py`
2. Update `total_questions` in `ASSESSMENT_METADATA` for the same type
3. Run validation to ensure consistency
4. Deploy the change

## Benefits

1. **Single Source of Truth**: All question counts in one place
2. **Maintainability**: Easy to update when questions change
3. **Type Safety**: Uses enums, IDE autocomplete works
4. **Validation**: Automatic checks catch configuration errors
5. **Future-Proof**: Can be extended with metadata API endpoint

## Migration Notes

### Before (Hardcoded)
```python
# In assessments.py endpoint
total_questions = 30  # Hardcoded
if assessment.assessment_type == AssessmentType.MBTI:
    total_questions = 0
```

### After (Configuration)
```python
# In assessments.py endpoint
from app.config.assessment_config import get_total_questions

total_questions = get_total_questions(assessment.assessment_type)
```

## Related Files

- `backend/app/config/assessment_config.py` - Configuration file
- `backend/app/models/assessment.py` - Assessment models and enums
- `backend/app/api/v1/endpoints/assessments.py` - API endpoint using config
- `ASSESSMENTS_PAGE_VISION_AND_PLAN.md` - Overall vision and plan

## Future Enhancements

1. **Database Storage**: Move config to database for runtime updates
2. **API Endpoint**: Expose metadata via `/api/v1/assessments/metadata`
3. **Frontend Integration**: Fetch metadata from API instead of hardcoding
4. **Validation Script**: Add script to validate config matches frontend question arrays
5. **Per-Tenant Configuration**: Allow customization per tenant/organization
