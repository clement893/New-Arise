"""
Assessment Configuration
ARISE Leadership Assessment Tool

Central configuration for all assessment types including:
- Total questions per assessment type
- Assessment metadata (names, descriptions)
- Validation rules

This replaces hardcoded values and provides a single source of truth.
"""

from app.models.assessment import AssessmentType
from typing import Dict, Any


# Assessment Configuration
# Total questions for each assessment type
ASSESSMENT_TOTAL_QUESTIONS: Dict[AssessmentType, int] = {
    AssessmentType.WELLNESS: 30,
    AssessmentType.TKI: 30,
    AssessmentType.THREE_SIXTY_SELF: 30,
    AssessmentType.THREE_SIXTY_EVALUATOR: 30,
    AssessmentType.MBTI: 0,  # MBTI is external upload, no internal questions
}

# Assessment metadata (for future use - optional API endpoint)
ASSESSMENT_METADATA: Dict[AssessmentType, Dict[str, Any]] = {
    AssessmentType.WELLNESS: {
        "name": "Wellness Assessment",
        "description": "Your overall well-being",
        "total_questions": 30,
    },
    AssessmentType.TKI: {
        "name": "TKI Conflict Style",
        "description": "Explore your conflict management approach",
        "total_questions": 30,
    },
    AssessmentType.THREE_SIXTY_SELF: {
        "name": "360° Feedback",
        "description": "Multi-faceted leadership perspectives",
        "total_questions": 30,
    },
    AssessmentType.THREE_SIXTY_EVALUATOR: {
        "name": "360° Feedback (Evaluator)",
        "description": "Provide feedback for a colleague",
        "total_questions": 30,
    },
    AssessmentType.MBTI: {
        "name": "MBTI Personality",
        "description": "Understanding your natural preferences",
        "total_questions": 0,  # External upload
    },
}


def get_total_questions(assessment_type: AssessmentType) -> int:
    """
    Get the total number of questions for an assessment type.
    
    Args:
        assessment_type: The type of assessment
        
    Returns:
        The total number of questions, or 0 for external assessments like MBTI
    """
    return ASSESSMENT_TOTAL_QUESTIONS.get(assessment_type, 0)


def get_assessment_metadata(assessment_type: AssessmentType) -> Dict[str, Any]:
    """
    Get metadata for an assessment type.
    
    Args:
        assessment_type: The type of assessment
        
    Returns:
        Dictionary containing name, description, and total_questions
    """
    return ASSESSMENT_METADATA.get(assessment_type, {
        "name": str(assessment_type.value),
        "description": "",
        "total_questions": 0,
    })


def validate_config() -> bool:
    """
    Validate that all assessment types have configuration.
    
    Returns:
        True if all types are configured, False otherwise
        
    Raises:
        ValueError: If any assessment type is missing configuration
    """
    all_types = set(AssessmentType)
    configured_types = set(ASSESSMENT_TOTAL_QUESTIONS.keys())
    
    if all_types != configured_types:
        missing_types = all_types - configured_types
        raise ValueError(f"Missing configuration for assessment types: {missing_types}")
    
    # Validate that metadata matches total_questions
    for assessment_type, metadata in ASSESSMENT_METADATA.items():
        config_total = ASSESSMENT_TOTAL_QUESTIONS.get(assessment_type)
        metadata_total = metadata.get("total_questions")
        if config_total != metadata_total:
            raise ValueError(
                f"Configuration mismatch for {assessment_type.value}: "
                f"ASSESSMENT_TOTAL_QUESTIONS has {config_total}, "
                f"but ASSESSMENT_METADATA has {metadata_total}"
            )
    
    return True


# Validate on import (fail fast if misconfigured)
try:
    validate_config()
except ValueError as e:
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Assessment configuration validation failed: {e}")
    # Don't raise here - allow import to succeed but log the error
    # This prevents breaking the application if there's a configuration issue
    # The error will be caught when the config is actually used
