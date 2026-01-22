"""
Assessments API Endpoints
ARISE Leadership Assessment Tool
"""

from typing import List, Optional, Dict, Any
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, File, UploadFile, Form
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, UniqueConstraint, text
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from datetime import datetime, timezone

from app.core.database import get_db
from app.dependencies import get_current_user, require_admin_or_superadmin
from app.models.user import User
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    Assessment360Evaluator,
    AssessmentResult,
    AssessmentQuestion,
    AssessmentType,
    AssessmentStatus,
    EvaluatorRole,
)
from app.config.assessment_config import get_total_questions
from app.config.assessment_questions import get_questions_for_type

router = APIRouter()


# ============================================================================
# Pydantic Schemas
# ============================================================================

class AssessmentListItem(BaseModel):
    """Assessment list item response"""
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    assessment_type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    score_summary: Optional[Dict[str, Any]] = None
    answer_count: Optional[int] = 0  # Number of answers provided
    total_questions: Optional[int] = 30  # Total number of questions (30 for most assessments)
    created_at: Optional[datetime] = None
    user_being_evaluated: Optional[Dict[str, Any]] = None  # For evaluator assessments: name and email of the person being evaluated

    class Config:
        from_attributes = True


class AssessmentStartRequest(BaseModel):
    """Request to start an assessment"""
    assessment_type: AssessmentType


class AssessmentAnswerRequest(BaseModel):
    """Request to save an answer"""
    question_id: str = Field(..., description="Question ID (e.g., 'wellness_q1')")
    answer_value: str = Field(..., description="Answer value (integer 1-5 or string 'A'/'B')")


class EvaluatorAnswerRequest(BaseModel):
    """Request for a single evaluator answer"""
    question_id: str = Field(..., description="Question ID")
    answer_value: str = Field(..., description="Answer value")


class EvaluatorSubmitRequest(BaseModel):
    """Request to submit evaluator assessment with list of answers"""
    answers: List[EvaluatorAnswerRequest] = Field(..., description="List of answers")


class AssessmentSubmitResponse(BaseModel):
    """Response after submitting an assessment"""
    assessment_id: int
    status: str
    completed_at: datetime
    score: Dict[str, Any]
    message: str


class Evaluator360Data(BaseModel):
    """Evaluator data for 360 feedback"""
    name: str = Field(..., description="Evaluator name")
    email: EmailStr = Field(..., description="Evaluator email")
    role: str = Field(..., description="Evaluator role (PEER, MANAGER, DIRECT_REPORT, STAKEHOLDER)")


class Evaluator360InviteRequest(BaseModel):
    """Request to invite 360 evaluators"""
    evaluators: List[Evaluator360Data] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="List of evaluators (3 recommended)"
    )


class Start360FeedbackRequest(BaseModel):
    """Request to start a 360 feedback with evaluators"""
    evaluators: List[Evaluator360Data] = Field(
        default_factory=list,
        min_items=0,
        max_items=10,
        description="List of evaluators (0 or more, can add more later)"
    )


class AssessmentResultResponse(BaseModel):
    """Assessment result response"""
    id: int
    assessment_id: int
    assessment_type: str
    scores: Dict[str, Any]
    insights: Optional[Dict[str, Any]]
    recommendations: Optional[Dict[str, Any]]
    comparison_data: Optional[Dict[str, Any]]  # For 360 assessments
    generated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Question Management Schemas
# ============================================================================

class AssessmentQuestionResponse(BaseModel):
    """Assessment question response"""
    id: int
    question_id: str
    assessment_type: str
    question: Optional[str] = None
    pillar: Optional[str] = None
    number: Optional[int] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    mode_a: Optional[str] = None
    mode_b: Optional[str] = None
    capability: Optional[str] = None
    question_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssessmentQuestionCreate(BaseModel):
    """Create assessment question request"""
    question_id: str = Field(..., description="Unique question ID (e.g., wellness_q1, tki_1, 360_1)")
    assessment_type: str = Field(..., description="Assessment type (wellness, tki, 360_self, 360_evaluator)")
    question: Optional[str] = Field(None, description="Question text (for Wellness and 360°)")
    pillar: Optional[str] = Field(None, description="Wellness pillar")
    number: Optional[int] = Field(None, description="Question number")
    option_a: Optional[str] = Field(None, description="TKI option A")
    option_b: Optional[str] = Field(None, description="TKI option B")
    mode_a: Optional[str] = Field(None, description="TKI mode A")
    mode_b: Optional[str] = Field(None, description="TKI mode B")
    capability: Optional[str] = Field(None, description="360° capability")
    question_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class AssessmentQuestionUpdate(BaseModel):
    """Update assessment question request"""
    question: Optional[str] = Field(None, description="Question text")
    pillar: Optional[str] = Field(None, description="Wellness pillar")
    number: Optional[int] = Field(None, description="Question number")
    option_a: Optional[str] = Field(None, description="TKI option A")
    option_b: Optional[str] = Field(None, description="TKI option B")
    mode_a: Optional[str] = Field(None, description="TKI mode A")
    mode_b: Optional[str] = Field(None, description="TKI mode B")
    capability: Optional[str] = Field(None, description="360° capability")
    question_metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/list", response_model=List[AssessmentListItem])
@router.get("/my-assessments", response_model=List[AssessmentListItem])
async def list_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all assessments for the current user
    Includes both self-assessments and evaluator assessments (where user is a contributor)
    """
    # First, get all evaluator assessment IDs where current user is the evaluator
    # This will help us exclude them from self-assessments
    evaluator_assessment_ids_result = await db.execute(
        select(Assessment360Evaluator.evaluator_assessment_id)
        .where(
            Assessment360Evaluator.evaluator_email == current_user.email,
            Assessment360Evaluator.evaluator_assessment_id.isnot(None)
        )
    )
    evaluator_assessment_ids = [row[0] for row in evaluator_assessment_ids_result.fetchall() if row[0] is not None]

    # Get self-assessments (excluding evaluator assessments)
    # Evaluator assessments have the same user_id as the person being evaluated, so we exclude them
    where_clause = (
        Assessment.user_id == current_user.id,
        Assessment.assessment_type != AssessmentType.THREE_SIXTY_EVALUATOR
    )
    if evaluator_assessment_ids:
        where_clause = where_clause + (Assessment.id.notin_(evaluator_assessment_ids),)
    
    result = await db.execute(
        select(Assessment, User)
        .join(User, Assessment.user_id == User.id)
        .where(*where_clause)
        .order_by(Assessment.created_at.desc())
    )
    results = result.all()

    # Get evaluator assessments (where user is a contributor)
    # Find all evaluator records where current user is the evaluator
    from app.core.logging import logger
    evaluator_records_result = await db.execute(
        select(Assessment360Evaluator)
        .where(
            Assessment360Evaluator.evaluator_email == current_user.email,
            Assessment360Evaluator.evaluator_assessment_id.isnot(None)
        )
    )
    evaluator_records = evaluator_records_result.scalars().all()
    logger.info(f"[my-assessments] Found {len(evaluator_records)} evaluator records for user {current_user.email}")
    
    evaluator_results = []
    for evaluator_record in evaluator_records:
        # Get the evaluator's assessment
        if evaluator_record.evaluator_assessment_id:
            assessment_result = await db.execute(
                select(Assessment)
                .where(Assessment.id == evaluator_record.evaluator_assessment_id)
            )
            evaluator_assessment = assessment_result.scalar_one_or_none()
            
            if evaluator_assessment and evaluator_assessment.status == AssessmentStatus.COMPLETED:
                # Get the parent assessment (the THREE_SIXTY_SELF assessment)
                parent_assessment_result = await db.execute(
                    select(Assessment)
                    .where(Assessment.id == evaluator_record.assessment_id)
                )
                parent_assessment = parent_assessment_result.scalar_one_or_none()
                
                if parent_assessment:
                    # Get the user being evaluated (owner of the parent assessment)
                    evaluated_user_result = await db.execute(
                        select(User)
                        .where(User.id == parent_assessment.user_id)
                    )
                    evaluated_user = evaluated_user_result.scalar_one_or_none()
                    
                    if evaluated_user:
                        logger.info(f"[my-assessments] Adding evaluator assessment {evaluator_assessment.id} for evaluated user {evaluated_user.email}")
                        evaluator_results.append((evaluator_record, evaluator_assessment, evaluated_user))

    # Format response
    response = []
    
    # Add self-assessments
    for assessment, user in results:
        score_summary = None
        if assessment.processed_score:
            # Extract summary based on type
            if assessment.assessment_type == AssessmentType.WELLNESS:
                score_summary = {
                    "total_score": assessment.processed_score.get("total_score"),
                    "percentage": assessment.processed_score.get("percentage"),
                }
            elif assessment.assessment_type == AssessmentType.TKI:
                score_summary = {
                    "dominant_mode": assessment.processed_score.get("dominant_mode"),
                }
            elif assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF:
                score_summary = {
                    "total_score": assessment.processed_score.get("total_score"),
                }

        # Count answers for this assessment
        answer_count_result = await db.execute(
            select(func.count(AssessmentAnswer.id))
            .where(AssessmentAnswer.assessment_id == assessment.id)
        )
        answer_count = answer_count_result.scalar() or 0

        # Get total questions from configuration (replaces hardcoded value)
        total_questions = get_total_questions(assessment.assessment_type)

        # Get user name
        user_name = None
        if user.first_name or user.last_name:
            user_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        elif user.email:
            user_name = user.email.split("@")[0]

        response.append(AssessmentListItem(
            id=assessment.id,
            user_id=assessment.user_id,
            user_email=user.email,
            user_name=user_name,
            assessment_type=assessment.assessment_type.value,
            status=assessment.status.value,
            started_at=assessment.started_at,
            completed_at=assessment.completed_at,
            score_summary=score_summary,
            answer_count=answer_count,
            total_questions=total_questions,
            created_at=assessment.created_at,
            user_being_evaluated=None
        ))
    
    # Add evaluator assessments (where user is a contributor)
    for evaluator, assessment, evaluated_user in evaluator_results:
        score_summary = None
        if assessment.processed_score:
            score_summary = {
                "total_score": assessment.processed_score.get("total_score"),
            }

        # Count answers for this assessment
        answer_count_result = await db.execute(
            select(func.count(AssessmentAnswer.id))
            .where(AssessmentAnswer.assessment_id == assessment.id)
        )
        answer_count = answer_count_result.scalar() or 0

        # Get total questions from configuration
        total_questions = get_total_questions(assessment.assessment_type)

        # Get name of the person being evaluated
        evaluated_user_name = None
        if evaluated_user.first_name or evaluated_user.last_name:
            evaluated_user_name = f"{evaluated_user.first_name or ''} {evaluated_user.last_name or ''}".strip()
        elif evaluated_user.email:
            evaluated_user_name = evaluated_user.email.split("@")[0]

        # Convert to THREE_SIXTY_SELF type for display purposes (it's actually an evaluator assessment)
        response.append(AssessmentListItem(
            id=assessment.id,
            user_id=assessment.user_id,
            user_email=evaluated_user.email,
            user_name=evaluated_user_name,
            assessment_type=AssessmentType.THREE_SIXTY_SELF.value,  # Display as 360 feedback
            status=assessment.status.value,
            started_at=assessment.started_at,
            completed_at=assessment.completed_at,
            score_summary=score_summary,
            answer_count=answer_count,
            total_questions=total_questions,
            created_at=assessment.created_at,
            user_being_evaluated={
                "name": evaluated_user_name,
                "email": evaluated_user.email
            }
        ))

    # Sort all assessments by created_at descending (most recent first)
    response.sort(key=lambda x: x.created_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)

    return response


@router.get("/admin/all", response_model=List[AssessmentListItem])
async def admin_list_all_assessments(
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of all assessments for all users (admin only)
    """
    result = await db.execute(
        select(Assessment, User)
        .join(User, Assessment.user_id == User.id)
        .where(
            Assessment.assessment_type != AssessmentType.THREE_SIXTY_EVALUATOR  # Exclude evaluator assessments
        )
        .order_by(Assessment.created_at.desc())
    )
    results = result.all()

    # Format response
    response = []
    for assessment, user in results:
        score_summary = None
        if assessment.processed_score:
            # Extract summary based on type
            if assessment.assessment_type == AssessmentType.WELLNESS:
                score_summary = {
                    "total_score": assessment.processed_score.get("total_score"),
                    "percentage": assessment.processed_score.get("percentage"),
                }
            elif assessment.assessment_type == AssessmentType.TKI:
                score_summary = {
                    "dominant_mode": assessment.processed_score.get("dominant_mode"),
                }
            elif assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF:
                score_summary = {
                    "total_score": assessment.processed_score.get("total_score"),
                }

        # Count answers for this assessment
        answer_count_result = await db.execute(
            select(func.count(AssessmentAnswer.id))
            .where(AssessmentAnswer.assessment_id == assessment.id)
        )
        answer_count = answer_count_result.scalar() or 0

        # Get total questions from configuration (replaces hardcoded value)
        total_questions = get_total_questions(assessment.assessment_type)

        # Get user name
        user_name = None
        if user.first_name or user.last_name:
            user_name = f"{user.first_name or ''} {user.last_name or ''}".strip()
        elif user.email:
            user_name = user.email.split("@")[0]

        response.append(AssessmentListItem(
            id=assessment.id,
            user_id=assessment.user_id,
            user_email=user.email,
            user_name=user_name,
            assessment_type=assessment.assessment_type.value,
            status=assessment.status.value,
            started_at=assessment.started_at,
            completed_at=assessment.completed_at,
            score_summary=score_summary,
            answer_count=answer_count,
            total_questions=total_questions,
            created_at=assessment.created_at
        ))

    return response


@router.post("/start")
async def start_assessment(
    request: AssessmentStartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new assessment or resume an existing one
    Note: For 360° feedback (THREE_SIXTY_SELF), use /360/start endpoint instead
    """
    from app.core.logging import logger
    logger.info(
        f"Received assessment start request: type={request.assessment_type}, user_id={current_user.id}",
        context={
            "assessment_type": str(request.assessment_type),
            "assessment_type_value": request.assessment_type.value if hasattr(request.assessment_type, 'value') else str(request.assessment_type),
            "user_id": current_user.id
        }
    )
    
    # 360° feedback assessments must use the /360/start endpoint to invite evaluators
    if request.assessment_type == AssessmentType.THREE_SIXTY_SELF:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="For 360° feedback assessments, please use the /assessments/360/start endpoint to invite evaluators first"
        )

    try:
        # Check if there's an existing in-progress assessment
        result = await db.execute(
            select(Assessment)
            .where(
                Assessment.user_id == current_user.id,
                Assessment.assessment_type == request.assessment_type,
                Assessment.status.in_([AssessmentStatus.NOT_STARTED, AssessmentStatus.IN_PROGRESS])
            )
            .order_by(Assessment.created_at.desc())
        )
        existing_assessment = result.scalar_one_or_none()

        if existing_assessment:
            # Resume existing assessment
            if existing_assessment.status == AssessmentStatus.NOT_STARTED:
                existing_assessment.status = AssessmentStatus.IN_PROGRESS
                existing_assessment.started_at = datetime.utcnow()
                await db.commit()
                await db.refresh(existing_assessment)

            return {
                "id": existing_assessment.id,
                "assessment_id": existing_assessment.id,
                "status": existing_assessment.status.value,
                "message": "Resuming existing assessment"
            }

        # Create new assessment
        new_assessment = Assessment(
            user_id=current_user.id,
            assessment_type=request.assessment_type,
            status=AssessmentStatus.IN_PROGRESS,
            started_at=datetime.utcnow()
        )
        db.add(new_assessment)
        await db.commit()
        await db.refresh(new_assessment)

        return {
            "id": new_assessment.id,
            "assessment_id": new_assessment.id,
            "status": new_assessment.status.value,
            "message": "Assessment started successfully"
        }
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error starting assessment: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start assessment: {str(e)}"
        )


@router.post("/{assessment_id}/answer")
async def save_answer(
    assessment_id: int,
    request: AssessmentAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Save an answer to a question
    """
    from app.core.logging import logger

    try:
        # Validate request
        if not request.question_id or not request.answer_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="question_id and answer_value are required"
            )

        # Get assessment
        result = await db.execute(
            select(Assessment)
            .where(
                Assessment.id == assessment_id,
                Assessment.user_id == current_user.id
            )
        )
        assessment = result.scalar_one_or_none()

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )

        if assessment.status == AssessmentStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment is already completed"
            )

        # SECURITY: Use SQLAlchemy ORM instead of raw SQL to prevent SQL injection
        # Check if answer already exists
        existing_answer_result = await db.execute(
            select(AssessmentAnswer)
            .where(
                AssessmentAnswer.assessment_id == assessment_id,
                AssessmentAnswer.question_id == str(request.question_id)
            )
        )
        existing_answer = existing_answer_result.scalar_one_or_none()

        if existing_answer:
            # Update existing answer using ORM
            existing_answer.answer_value = str(request.answer_value)
            # Note: answered_at will be updated automatically by database default if needed
        else:
            # Create new answer using ORM
            new_answer = AssessmentAnswer(
                assessment_id=assessment_id,
                question_id=str(request.question_id),
                answer_value=str(request.answer_value)
                # answered_at will be set by database default
            )
            db.add(new_answer)

        await db.commit()

        return {
            "message": "Answer saved successfully",
            "question_id": request.question_id
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except IntegrityError as e:
        from app.core.logging import logger
        logger.error(f"Database integrity error saving answer for assessment {assessment_id}: {e}", exc_info=True)
        await db.rollback()
        # Check if it's a unique constraint violation
        error_str = str(e).lower()
        if 'unique' in error_str or 'duplicate' in error_str:
            # Answer already exists, try to update it using ORM
            try:
                # SECURITY: Use SQLAlchemy ORM instead of raw SQL
                existing_answer_result = await db.execute(
                    select(AssessmentAnswer)
                    .where(
                        AssessmentAnswer.assessment_id == assessment_id,
                        AssessmentAnswer.question_id == str(request.question_id)
                    )
                )
                existing_answer = existing_answer_result.scalar_one_or_none()
                if existing_answer:
                    existing_answer.answer_value = str(request.answer_value)
                    await db.commit()
                    return {
                        "message": "Answer saved successfully",
                        "question_id": request.question_id
                    }
            except Exception as retry_error:
                logger.error(f"Error retrying save answer: {retry_error}", exc_info=True)
                await db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save answer due to database constraint violation"
        )
    except Exception as e:
        logger.error(
            f"Error saving answer for assessment {assessment_id}, question {request.question_id}: {type(e).__name__}: {e}",
            exc_info=True
        )
        await db.rollback()
        # Provide more detailed error message for debugging
        error_detail = str(e)
        if "column" in error_detail.lower() and "does not exist" in error_detail.lower():
            error_detail = f"Database schema mismatch: {error_detail}. Please run database migrations."
        elif "not null" in error_detail.lower():
            error_detail = f"Missing required field: {error_detail}"
        elif "foreign key" in error_detail.lower():
            error_detail = f"Invalid reference: {error_detail}"

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save answer: {error_detail}"
        )


@router.post("/{assessment_id}/submit", response_model=AssessmentSubmitResponse)
async def submit_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Submit and complete an assessment
    This will calculate scores and generate results
    """
    # Get assessment with answers
    result = await db.execute(
        select(Assessment)
        .where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id
        )
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    if assessment.status == AssessmentStatus.COMPLETED:
        from app.core.logging import logger
        from app.models.assessment import AssessmentResult
        # Check if assessment has results - if not, allow resetting and resubmitting
        result_check = await db.execute(
            select(AssessmentResult).where(AssessmentResult.assessment_id == assessment_id)
        )
        existing_result = result_check.scalar_one_or_none()
        
        if existing_result:
            # Assessment is completed and has results - don't allow resubmission
            logger.info(
                f"Attempt to submit already completed assessment {assessment_id}",
                context={
                    "assessment_id": assessment_id,
                    "user_id": current_user.id,
                    "assessment_type": assessment.assessment_type,
                    "completed_at": assessment.completed_at.isoformat() if assessment.completed_at else None
                }
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This assessment has already been completed. You can view your results in the results page."
            )
        else:
            # Assessment is marked as completed but has no results - reset status and allow submission
            logger.info(
                f"Resetting completed assessment {assessment_id} without results to allow resubmission",
                context={
                    "assessment_id": assessment_id,
                    "user_id": current_user.id,
                    "assessment_type": assessment.assessment_type,
                }
            )
            assessment.status = AssessmentStatus.IN_PROGRESS
            assessment.completed_at = None
            await db.commit()
            await db.refresh(assessment)

    # SECURITY: Use SQLAlchemy ORM instead of raw SQL to prevent SQL injection
    # Get all answers using ORM
    answers_result = await db.execute(
        select(AssessmentAnswer)
        .where(AssessmentAnswer.assessment_id == assessment_id)
    )
    answers = answers_result.scalars().all()
    
    # Check if there are any answers
    if not answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit assessment: No answers provided. Please complete at least one question before submitting."
        )

    # Calculate scores based on assessment type
    from app.services.assessment_scoring import calculate_scores
    from app.core.logging import logger

    try:
        scores = calculate_scores(
            assessment_type=assessment.assessment_type,
            answers=answers
        )
    except ValueError as e:
        logger.error(
            f"Error calculating scores for assessment {assessment_id}: {str(e)}",
            exc_info=True,
            context={
                "assessment_id": assessment_id,
                "assessment_type": assessment.assessment_type,
                "answer_count": len(answers),
                "error": str(e)
            }
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to calculate scores: {str(e)}. Please ensure all required questions are answered."
        )
    except Exception as e:
        logger.error(
            f"Unexpected error calculating scores for assessment {assessment_id}: {str(e)}",
            exc_info=True,
            context={
                "assessment_id": assessment_id,
                "assessment_type": assessment.assessment_type,
                "answer_count": len(answers),
                "error": str(e)
            }
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while calculating scores: {str(e)}"
        )

    # Update assessment
    assessment.status = AssessmentStatus.COMPLETED
    assessment.completed_at = datetime.now(timezone.utc)
    assessment.raw_score = {answer.question_id: answer.answer_value for answer in answers}
    assessment.processed_score = scores

    # Create assessment result
    # Note: Database has scores column (renamed from result_data). We'll store scores in scores column.
    try:
        # Serialize scores to JSON string for PostgreSQL JSONB column
        scores_json = json.dumps(scores)
        await db.execute(
            text("""
                INSERT INTO assessment_results (assessment_id, user_id, scores, generated_at, updated_at)
                VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), NOW(), NOW())
                ON CONFLICT (assessment_id) DO UPDATE
                SET scores = CAST(:scores AS jsonb), updated_at = NOW()
            """),
            {
                "assessment_id": assessment.id,
                "user_id": current_user.id,
                "scores": scores_json
            }
        )

        # Ensure assessment status is saved before committing
        # This ensures the status update is persisted
        await db.flush()
        await db.commit()
        
        # Log status update for debugging
        logger.info(
            f"Assessment {assessment_id} marked as COMPLETED",
            context={
                "assessment_id": assessment_id,
                "user_id": current_user.id,
                "assessment_type": assessment.assessment_type.value,
                "status": assessment.status.value,
                "answer_count": len(answers)
            }
        )
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error creating assessment result for assessment {assessment_id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save assessment results: {str(e)}"
        )
    await db.refresh(assessment)

    return AssessmentSubmitResponse(
        assessment_id=assessment.id,
        status=assessment.status.value,
        completed_at=assessment.completed_at,
        score=scores,
        message="Assessment submitted successfully"
    )


@router.get("/{assessment_id}/answers")
async def get_assessment_answers(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all answers for a specific assessment
    """
    # Get assessment
    result = await db.execute(
        select(Assessment)
        .where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id
        )
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    # Get all answers using raw SQL
    # SECURITY: Use SQLAlchemy ORM instead of raw SQL to prevent SQL injection
    answers_result = await db.execute(
        select(AssessmentAnswer.question_id, AssessmentAnswer.answer_value)
        .where(AssessmentAnswer.assessment_id == assessment_id)
        .order_by(AssessmentAnswer.question_id)
    )
    answers_rows = answers_result.all()
    
    # Convert to dict format
    answers = {row[0]: row[1] for row in answers_rows}
    
    return {
        "assessment_id": assessment_id,
        "answers": answers
    }


@router.get("/{assessment_id}/results", response_model=AssessmentResultResponse)
async def get_assessment_results(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get results for a completed assessment.
    
    Allows access if:
    1. The assessment belongs to the current user, OR
    2. The assessment is an evaluator assessment (360°) and the current user owns the parent 360° assessment
    """
    from app.core.logging import logger

    try:
        # First verify the assessment exists
        assessment_result = await db.execute(
            select(Assessment)
            .where(Assessment.id == assessment_id)
        )
        assessment = assessment_result.scalar_one_or_none()

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )

        # Check if assessment belongs to the user
        has_access = assessment.user_id == current_user.id

        # If not, check if it's an evaluator assessment (linked via evaluator_assessment_id)
        # Note: Evaluator assessments are created with type THREE_SIXTY_SELF, not THREE_SIXTY_EVALUATOR
        if not has_access:
            # Find the evaluator record that links this assessment
            evaluator_result = await db.execute(
                select(Assessment360Evaluator)
                .where(Assessment360Evaluator.evaluator_assessment_id == assessment_id)
            )
            evaluator = evaluator_result.scalar_one_or_none()

            if evaluator:
                # Check if the parent assessment belongs to the current user
                parent_assessment_result = await db.execute(
                    select(Assessment)
                    .where(
                        Assessment.id == evaluator.assessment_id,
                        Assessment.user_id == current_user.id
                    )
                )
                parent_assessment = parent_assessment_result.scalar_one_or_none()
                has_access = parent_assessment is not None

        if not has_access:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )

        # Get assessment result using raw SQL
        # Use ORM query to leverage the model mapping (scores -> result_data column if needed)
        result_query = await db.execute(
            select(AssessmentResult)
            .where(AssessmentResult.assessment_id == assessment_id)
        )
        result = result_query.scalar_one_or_none()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment results not found. The assessment may not be completed yet."
            )

        if not result.scores:
            logger.error(f"Could not retrieve scores for assessment {assessment_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Assessment results are incomplete. Please contact support."
            )

        # Get assessment type from the assessment object
        assessment_type = assessment.assessment_type
        assessment_type_str = assessment_type.value if hasattr(assessment_type, 'value') else str(assessment_type)

        # Use generated_at or current time as fallback
        generated_at = result.generated_at if result.generated_at else datetime.now(timezone.utc)

        return AssessmentResultResponse(
            id=result.id,
            assessment_id=result.assessment_id,
            assessment_type=assessment_type_str,
            scores=result.scores,
            insights=result.insights if result.insights else None,
            recommendations=result.recommendations if result.recommendations else None,
            comparison_data=result.comparison_data if result.comparison_data else None,
            generated_at=generated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting assessment results for assessment {assessment_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load assessment results: {str(e)}"
        )


@router.post("/360/start")
async def start_360_feedback(
    request: Start360FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Start a new 360° feedback assessment and optionally invite evaluators
    Creates the self-assessment and optionally sends invitation emails to evaluators (0 or more)
    """
    import secrets
    import os
    from app.services.email_service import EmailService
    from app.core.logging import logger

    try:
        # Validate evaluators data
        if not isinstance(request.evaluators, list):
            raise ValueError("evaluators must be a list")

        # Create the self-assessment
        try:
            self_assessment = Assessment(
                user_id=current_user.id,
                assessment_type=AssessmentType.THREE_SIXTY_SELF,
                status=AssessmentStatus.IN_PROGRESS,
                started_at=datetime.now(timezone.utc)
            )
            db.add(self_assessment)
            logger.debug(f"Added self-assessment to session for user {current_user.id}")

            try:
                await db.flush()  # Get the ID
                logger.debug(f"Flushed self-assessment, got ID: {self_assessment.id}")
            except Exception as flush_error:
                error_type = type(flush_error).__name__
                error_message = str(flush_error)
                logger.error(
                    f"❌ FLUSH ERROR creating self-assessment: {error_type}: {error_message}",
                    exc_info=True
                )
                await db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create assessment: {error_type}: {error_message}"
                )
        except HTTPException:
            raise
        except Exception as assessment_error:
            error_type = type(assessment_error).__name__
            error_message = str(assessment_error)
            logger.error(
                f"❌ ERROR creating self-assessment: {error_type}: {error_message}",
                exc_info=True
            )
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create assessment: {error_type}: {error_message}"
            )

        # Create evaluator invitations and send emails
        email_service = EmailService()
        frontend_url = os.getenv("FRONTEND_URL", os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))
        invited_evaluators = []

        for evaluator_data in request.evaluators:
            # Validate evaluator data
            if not evaluator_data.name or not evaluator_data.email:
                logger.warning(f"Skipping invalid evaluator: name={evaluator_data.name}, email={evaluator_data.email}")
                continue

            # Generate unique token
            # Note: We don't check for uniqueness before insert because:
            # 1. The probability of collision with token_urlsafe(32) is extremely low (1 in 2^256)
            # 2. The database has a unique constraint that will catch any collision
            # 3. Checking before insert can fail if the schema cache is stale
            # If a collision occurs, we'll handle it in the commit error handling
            invitation_token = secrets.token_urlsafe(32)

            # Validate role - convert to lowercase to match enum values
            try:
                evaluator_role = EvaluatorRole(evaluator_data.role.lower())
            except ValueError as e:
                logger.error(f"Invalid evaluator role: {evaluator_data.role}. Error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid evaluator role: {evaluator_data.role}. Must be one of: PEER, MANAGER, DIRECT_REPORT, STAKEHOLDER"
                )

            # Create evaluator record
            # Use SQLAlchemy ORM model to ensure schema is detected correctly
            # Assessment360Evaluator and AssessmentStatus are already imported at the top of the file
            try:
                # Convert enum value to match Python enum (lowercase)
                # The Python enum uses lowercase, but PostgreSQL uses uppercase
                # SQLAlchemy will handle the conversion
                logger.info(f"🔵 Attempting to insert evaluator {evaluator_data.email} with role {evaluator_role.value} for assessment {self_assessment.id}")
                evaluator_id = None
                try:
                    # Create evaluator using SQLAlchemy ORM model
                    # This should detect the column correctly after migration
                    evaluator = Assessment360Evaluator(
                        assessment_id=self_assessment.id,
                        evaluator_name=evaluator_data.name,
                        evaluator_email=evaluator_data.email,
                        evaluator_role=evaluator_role,  # Use the enum directly, SQLAlchemy will handle conversion
                        invitation_token=invitation_token,
                        invitation_sent_at=None,
                        invitation_opened_at=None,
                        started_at=None,
                        completed_at=None,
                        status=AssessmentStatus.NOT_STARTED,
                        evaluator_assessment_id=None
                    )
                    db.add(evaluator)
                    await db.flush()  # Flush to get the ID without committing
                    evaluator_id = evaluator.id
                    logger.info(f"✅ Successfully inserted evaluator {evaluator_data.email} (ID: {evaluator_id}) to database for assessment {self_assessment.id}")
                except Exception as insert_error:
                    # Catch ALL exceptions first, then check type
                    error_type = type(insert_error).__name__
                    error_message = str(insert_error)
                    import traceback
                    error_traceback = traceback.format_exc()

                    # Check if it's a SQLAlchemy error
                    is_sqlalchemy_error = isinstance(insert_error, (SQLAlchemyError, IntegrityError))

                    # Log with appropriate prefix based on error type
                    prefix = "❌ SQLALCHEMY ERROR" if is_sqlalchemy_error else "❌ UNEXPECTED ERROR"
                    logger.error(
                        f"{prefix} during INSERT for evaluator {evaluator_data.email}: {error_type}: {error_message}",
                        context={
                            "user_id": current_user.id,
                            "assessment_id": self_assessment.id,
                            "evaluator_email": evaluator_data.email,
                            "error_type": error_type,
                            "error_message": error_message,
                            "is_sqlalchemy_error": is_sqlalchemy_error,
                            "traceback": error_traceback
                        },
                        exc_info=insert_error
                    )
                    logger.error(f"   Full INSERT error traceback:\n{error_traceback}")
                    logger.error(f"❌ FAILED to insert evaluator {evaluator_data.email}: {error_type}: {error_message}")
                    # Print error details to stdout for Railway logs
                    print(f"❌ INSERT ERROR: {error_type}: {error_message}")
                    print(f"   Traceback: {error_traceback}")
                    await db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to insert evaluator record: {error_type}: {error_message}"
                    )

                # Commit immediately after each insert to avoid transaction issues
                try:
                    logger.info(f"🔵 Attempting to commit evaluator {evaluator_data.email} (ID: {evaluator_id})")
                    await db.commit()
                    logger.info(f"✅ Committed evaluator {evaluator_data.email} (ID: {evaluator_id}) to database")
                except (SQLAlchemyError, IntegrityError) as commit_error:
                    error_type = type(commit_error).__name__
                    error_message = str(commit_error)
                    import traceback
                    error_traceback = traceback.format_exc()
                    logger.error(
                        f"❌ ERROR committing evaluator {evaluator_data.email}: {error_type}: {error_message}",
                        context={
                            "user_id": current_user.id,
                            "assessment_id": self_assessment.id,
                            "evaluator_email": evaluator_data.email,
                            "evaluator_id": evaluator_id,
                            "error_type": error_type,
                            "error_message": error_message,
                            "traceback": error_traceback
                        },
                        exc_info=commit_error
                    )
                    logger.error(f"   Full COMMIT error traceback:\n{error_traceback}")
                    await db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to save evaluator to database: {error_type}: {error_message}"
                    )
                except Exception as commit_error:
                    error_type = type(commit_error).__name__
                    error_message = str(commit_error)
                    import traceback
                    error_traceback = traceback.format_exc()
                    # Print error details to stdout for Railway logs
                    print(f"❌ UNEXPECTED ERROR committing evaluator {evaluator_data.email}: {error_type}: {error_message}")
                    print(f"   Full traceback:\n{error_traceback}")
                    logger.error(
                        f"❌ UNEXPECTED ERROR committing evaluator {evaluator_data.email}: {error_type}: {error_message}",
                        context={
                            "user_id": current_user.id,
                            "assessment_id": self_assessment.id,
                            "evaluator_email": evaluator_data.email,
                            "evaluator_id": evaluator_id,
                            "error_type": error_type,
                            "error_message": error_message,
                            "traceback": error_traceback
                        },
                        exc_info=commit_error
                    )
                    logger.error(f"   Full UNEXPECTED COMMIT error traceback:\n{error_traceback}")
                    await db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Failed to save evaluator to database: {error_type}: {error_message}"
                    )
            except HTTPException:
                raise
            except Exception as add_error:
                error_type = type(add_error).__name__
                error_message = str(add_error)
                import traceback
                error_traceback = traceback.format_exc()
                # Print error details to stdout for Railway logs
                print(f"❌ UNEXPECTED ERROR creating evaluator record for {evaluator_data.email}: {error_type}: {error_message}")
                print(f"   Full traceback:\n{error_traceback}")
                logger.error(
                    f"❌ UNEXPECTED ERROR creating evaluator record for {evaluator_data.email}: {error_type}: {error_message}",
                    context={
                        "user_id": current_user.id,
                        "assessment_id": self_assessment.id,
                        "evaluator_email": evaluator_data.email,
                        "error_type": error_type,
                        "error_message": error_message,
                        "traceback": error_traceback
                    },
                    exc_info=add_error
                )
                logger.error(f"   Full UNEXPECTED error traceback:\n{error_traceback}")
                await db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to create evaluator record: {error_type}: {error_message}"
                )

            # Send invitation email
            evaluation_url = f"{frontend_url.rstrip('/')}/360-evaluator/{invitation_token}"

            try:
                if email_service.is_configured():
                    sender_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
                    role_label = evaluator_data.role.replace('_', ' ').title()
                    try:
                        email_service.send_360_evaluator_invitation(
                            to_email=evaluator_data.email,
                            evaluator_name=evaluator_data.name,
                            sender_name=sender_name,
                            evaluation_url=evaluation_url,
                            role=role_label
                        )
                        # Update invitation_sent_at if email was sent successfully
                        from sqlalchemy import text
                        await db.execute(
                            text("""
                                UPDATE assessment_360_evaluators
                                SET invitation_sent_at = :invitation_sent_at
                                WHERE id = :evaluator_id
                            """),
                            {
                                "evaluator_id": evaluator_id,
                                "invitation_sent_at": datetime.now(timezone.utc)
                            }
                        )
                        logger.info(f"Sent 360 evaluator invitation email to {evaluator_data.email}")
                    except Exception as email_error:
                        logger.error(f"Failed to send invitation email to {evaluator_data.email}: {email_error}", exc_info=True)
                        # Continue even if email fails - evaluator record is created
                        # invitation_sent_at remains NULL
                else:
                    logger.warning(f"Email service not configured, skipping email to {evaluator_data.email}")
            except Exception as e:
                logger.error(f"Unexpected error processing evaluator {evaluator_data.email}: {e}", exc_info=True)
                # Continue even if there's an error - evaluator record is created

            invited_evaluators.append({
                "name": evaluator_data.name,
                "email": evaluator_data.email,
                "role": evaluator_data.role
            })

        # All evaluators have been committed individually, so we just need to commit the self-assessment if it wasn't already committed
        # Note: Since we commit after each evaluator insert, the self-assessment should already be committed
        # But we'll do a final commit to ensure everything is saved
        try:
            await db.commit()
            logger.info(f"✅ Successfully committed 360 feedback assessment {self_assessment.id} to database with {len(invited_evaluators)} evaluators")
        except IntegrityError as integrity_error:
            await db.rollback()
            error_message = str(integrity_error)
            logger.error(
                f"❌ INTEGRITY ERROR committing 360 feedback assessment: {error_message}",
                exc_info=True
            )
            # Extract more details from IntegrityError
            if "invitation_token" in error_message.lower() or "unique" in error_message.lower() or "duplicate" in error_message.lower():
                detail_msg = "A token collision occurred (extremely rare). Please try again - a new token will be generated."
            elif "foreign key" in error_message.lower():
                detail_msg = "Invalid assessment reference. Please try again."
            elif "not null" in error_message.lower() or "null value" in error_message.lower():
                detail_msg = "Missing required field. Please ensure all evaluator information is provided."
            else:
                detail_msg = f"Database integrity constraint violation: {error_message}"
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=detail_msg
            )
        except Exception as commit_error:
            await db.rollback()
            error_type = type(commit_error).__name__
            error_message = str(commit_error)
            import traceback
            error_traceback = traceback.format_exc()
            logger.error(
                f"❌ DATABASE ERROR committing 360 feedback assessment: {error_type}: {error_message}",
                context={
                    "user_id": current_user.id,
                    "assessment_id": self_assessment.id if hasattr(self_assessment, 'id') else None,
                    "evaluators_count": len(invited_evaluators),
                    "error_type": error_type,
                    "error_message": error_message,
                    "traceback": error_traceback
                },
                exc_info=commit_error
            )
            logger.error(
                f"   Full traceback:\n{error_traceback}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"A database error occurred: {error_type}. Please check the server logs for details."
            )

        # Refresh to get the latest state from database
        try:
            await db.refresh(self_assessment)
        except Exception as refresh_error:
            logger.warning(f"Failed to refresh assessment after commit: {refresh_error}", exc_info=True)
            # Don't fail the request if refresh fails - the commit was successful

        return {
            "assessment_id": self_assessment.id,
            "message": f"360° feedback started and {len(invited_evaluators)} evaluators invited",
            "evaluators": invited_evaluators
        }
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        error_type = type(e).__name__
        error_message = str(e)
        import traceback
        error_traceback = traceback.format_exc()
        # Print error details to stdout for Railway logs
        print(f"❌ ERROR in start_360_feedback: {error_type}: {error_message}")
        print(f"   Full traceback:\n{error_traceback}")
        logger.error(
            f"Error in start_360_feedback: {error_type}: {error_message}",
            context={
                "user_id": current_user.id,
                "evaluators_count": len(request.evaluators) if request.evaluators else 0,
                "error_type": error_type
            },
            exc_info=e
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start 360° feedback: {error_type}: {error_message}"
        )


@router.post("/{assessment_id}/360/invite-evaluators")
async def invite_360_evaluators(
    assessment_id: int,
    request: Evaluator360InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite additional evaluators for an existing 360 assessment
    """
    import secrets
    import os
    from app.services.email_service import EmailService
    from app.core.logging import logger

    # Verify assessment exists and is a 360 self assessment
    result = await db.execute(
        select(Assessment)
        .where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
            Assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF
        )
    )
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="360 Assessment not found"
        )

    # Create evaluator invitations and send emails
    email_service = EmailService()
    frontend_url = os.getenv("FRONTEND_URL", os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"))
    evaluator_objects = []  # Store evaluator objects to return complete data after commit

    for evaluator_data in request.evaluators:
        # Generate unique token
        invitation_token = secrets.token_urlsafe(32)

        evaluator = Assessment360Evaluator(
            assessment_id=assessment_id,
            evaluator_name=evaluator_data.name,
            evaluator_email=evaluator_data.email,
            evaluator_role=EvaluatorRole(evaluator_data.role.lower()),
            invitation_token=invitation_token,
            status=AssessmentStatus.NOT_STARTED
        )
        db.add(evaluator)
        evaluator_objects.append(evaluator)  # Store object to access ID after commit

        # Send invitation email
        evaluation_url = f"{frontend_url.rstrip('/')}/360-evaluator/{invitation_token}"

        try:
            if email_service.is_configured():
                sender_name = f"{current_user.first_name or ''} {current_user.last_name or ''}".strip() or current_user.email
                role_label = evaluator_data.role.replace('_', ' ').title()
                email_service.send_360_evaluator_invitation(
                    to_email=evaluator_data.email,
                    evaluator_name=evaluator_data.name,
                    sender_name=sender_name,
                    evaluation_url=evaluation_url,
                    role=role_label
                )
                evaluator.invitation_sent_at = datetime.now(timezone.utc)
                logger.info(f"Sent 360 evaluator invitation email to {evaluator_data.email}")
            else:
                logger.warning(f"Email service not configured, skipping email to {evaluator_data.email}")
        except Exception as e:
            logger.error(f"Failed to send invitation email to {evaluator_data.email}: {e}", exc_info=True)

    # Commit all evaluators and their updates (invitation_sent_at, etc.)
    await db.commit()
    
    # Refresh evaluator objects to ensure we have their IDs and latest state
    for evaluator in evaluator_objects:
        await db.refresh(evaluator)

    # Return complete evaluator data including IDs
    invited_evaluators = []
    for evaluator in evaluator_objects:
        invited_evaluators.append({
            "id": evaluator.id,
            "name": evaluator.evaluator_name,
            "email": evaluator.evaluator_email,
            "role": evaluator.evaluator_role.value,
            "status": evaluator.status.value,
            "invitation_token": evaluator.invitation_token,
            "invitation_sent_at": evaluator.invitation_sent_at.isoformat() if evaluator.invitation_sent_at else None,
            "invitation_opened_at": evaluator.invitation_opened_at.isoformat() if evaluator.invitation_opened_at else None,
            "started_at": evaluator.started_at.isoformat() if evaluator.started_at else None,
            "completed_at": evaluator.completed_at.isoformat() if evaluator.completed_at else None,
        })

    return {
        "message": f"Invited {len(invited_evaluators)} evaluators successfully",
        "evaluators": invited_evaluators
    }


@router.get("/stats/development-goals-count")
async def get_development_goals_count(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get the count of development goals (recommendations) from all completed assessments
    """
    try:
        # Get all completed assessments for the user
        result = await db.execute(
            select(AssessmentResult)
            .join(Assessment, AssessmentResult.assessment_id == Assessment.id)
            .where(Assessment.user_id == current_user.id)
        )
        results = result.scalars().all()
        
        # Count recommendations across all results
        total_recommendations = 0
        for assessment_result in results:
            if assessment_result.recommendations:
                # recommendations can be a list or dict
                if isinstance(assessment_result.recommendations, list):
                    total_recommendations += len(assessment_result.recommendations)
                elif isinstance(assessment_result.recommendations, dict):
                    # Count recommendations in dict format
                    if 'recommendations' in assessment_result.recommendations:
                        recs = assessment_result.recommendations['recommendations']
                        if isinstance(recs, list):
                            total_recommendations += len(recs)
                        else:
                            total_recommendations += 1
                    else:
                        total_recommendations += 1
                else:
                    # If it's a single recommendation or other format, count as 1
                    total_recommendations += 1
        
        return {
            "count": total_recommendations,
            "user_id": current_user.id
        }
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error getting development goals count: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve development goals count"
        )


@router.get("/{assessment_id}/360/evaluators")
async def get_360_evaluators_status(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    include_all: bool = False  # New parameter to include evaluators from all user's 360 assessments
):
    """
    Get the status of all evaluators for a specific 360 self-assessment.
    
    If include_all=True, returns evaluators from ALL user's 360 assessments (fixes issue
    where evaluators are on older assessments but dashboard shows newest assessment).
    """
    from app.core.logging import logger
    
    # Verify assessment exists and belongs to the current user
    assessment_result = await db.execute(
        select(Assessment)
        .where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
            Assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF
        )
    )
    assessment = assessment_result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="360 Self-Assessment not found or does not belong to current user"
        )

    # Get evaluators - either from this assessment only, or from all user's 360 assessments
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
        
        logger.info(
            f"Fetching evaluators from ALL user's 360 assessments (found {len(all_assessment_ids)} assessments)",
            context={
                "requested_assessment_id": assessment_id,
                "all_assessment_ids": all_assessment_ids,
                "user_id": current_user.id,
                "evaluators_count": len(evaluators)
            }
        )
    else:
        # Get evaluators for this assessment only (original behavior)
        evaluators_result = await db.execute(
            select(Assessment360Evaluator)
            .where(Assessment360Evaluator.assessment_id == assessment_id)
            .order_by(Assessment360Evaluator.created_at)
        )
        evaluators = evaluators_result.scalars().all()
        
        logger.info(
            f"Fetching evaluators for assessment {assessment_id}",
            context={
                "assessment_id": assessment_id,
                "user_id": current_user.id,
                "evaluators_count": len(evaluators)
            }
        )

    # Format response
    evaluators_list = []
    for evaluator in evaluators:
        evaluators_list.append({
            "id": evaluator.id,
            "name": evaluator.evaluator_name,
            "email": evaluator.evaluator_email,
            "role": evaluator.evaluator_role.value,
            "status": evaluator.status.value,
            "invitation_token": evaluator.invitation_token,  # Include token for sharing links
            "invitation_sent_at": evaluator.invitation_sent_at.isoformat() if evaluator.invitation_sent_at else None,
            "invitation_opened_at": evaluator.invitation_opened_at.isoformat() if evaluator.invitation_opened_at else None,
            "started_at": evaluator.started_at.isoformat() if evaluator.started_at else None,
            "completed_at": evaluator.completed_at.isoformat() if evaluator.completed_at else None,
            "assessment_id": evaluator.assessment_id,  # Include which assessment this evaluator belongs to
            "evaluator_assessment_id": evaluator.evaluator_assessment_id,  # Include evaluator's assessment ID for fetching results
        })
        
        # Log each evaluator status for debugging
        logger.info(
            f"Evaluator {evaluator.id} ({evaluator.evaluator_name}) - Status: {evaluator.status.value}",
            context={
                "evaluator_id": evaluator.id,
                "evaluator_name": evaluator.evaluator_name,
                "status": evaluator.status.value,
                "completed_at": evaluator.completed_at.isoformat() if evaluator.completed_at else None,
                "assessment_id": evaluator.assessment_id
            }
        )

    logger.info(
        f"Returning {len(evaluators_list)} evaluators",
        context={
            "assessment_id": assessment_id,
            "include_all": include_all,
            "evaluators_count": len(evaluators_list),
            "completed_count": sum(1 for e in evaluators_list if e["status"].lower() == "completed")
        }
    )

    return {
        "assessment_id": assessment_id,
        "evaluators": evaluators_list
    }


@router.delete("/{assessment_id}/evaluators/{evaluator_id}", status_code=status.HTTP_200_OK)
async def remove_360_evaluator(
    assessment_id: int,
    evaluator_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove an evaluator from a 360 assessment (cancel invitation)
    """
    from app.core.logging import logger
    
    # Verify assessment exists and belongs to the current user
    assessment_result = await db.execute(
        select(Assessment)
        .where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
            Assessment.assessment_type == AssessmentType.THREE_SIXTY_SELF
        )
    )
    assessment = assessment_result.scalar_one_or_none()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Get evaluator
    evaluator_result = await db.execute(
        select(Assessment360Evaluator)
        .where(
            Assessment360Evaluator.id == evaluator_id,
            Assessment360Evaluator.assessment_id == assessment_id
        )
    )
    evaluator = evaluator_result.scalar_one_or_none()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluator not found"
        )
    
    # Don't allow deletion if already completed
    if evaluator.status == AssessmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove an evaluator who has already completed the assessment"
        )
    
    # Delete the evaluator
    await db.delete(evaluator)
    await db.commit()
    
    logger.info(
        f"Evaluator {evaluator_id} removed from assessment {assessment_id} by user {current_user.id}",
        context={
            "assessment_id": assessment_id,
            "evaluator_id": evaluator_id,
            "user_id": current_user.id
        }
    )
    
    return {"message": "Evaluator removed successfully"}


@router.get("/360-evaluator/{token}")
async def get_360_evaluator_assessment(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get 360 evaluator assessment by invitation token (public endpoint)
    """
    from app.core.logging import logger

    try:
        result = await db.execute(
            select(Assessment360Evaluator)
            .where(Assessment360Evaluator.invitation_token == token)
            .options(selectinload(Assessment360Evaluator.assessment))
        )
        evaluator = result.scalar_one_or_none()

        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token"
            )

        # Mark invitation as opened and update status to in_progress
        if not evaluator.invitation_opened_at:
            evaluator.invitation_opened_at = datetime.now(timezone.utc)
            # Update status to IN_PROGRESS when invitation is opened
            if evaluator.status == AssessmentStatus.NOT_STARTED:
                evaluator.status = AssessmentStatus.IN_PROGRESS
                evaluator.started_at = datetime.now(timezone.utc)
            await db.commit()

        # Get user being evaluated - fetch user directly using assessment.user_id
        user = None
        if evaluator.assessment and evaluator.assessment.user_id:
            user_result = await db.execute(
                select(User)
                .where(User.id == evaluator.assessment.user_id)
            )
            user = user_result.scalar_one_or_none()
        else:
            logger.warning(f"Assessment not found or missing user_id for evaluator {evaluator.id}")

        return {
            "evaluator_id": evaluator.id,
            "evaluator_name": evaluator.evaluator_name,
            "evaluator_email": evaluator.evaluator_email,
            "evaluator_role": evaluator.evaluator_role.value,
            "status": evaluator.status.value,
            "assessment_id": evaluator.evaluator_assessment_id,
            "user_being_evaluated": {
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() if user else None,
                "email": user.email if user else None,
            } if user else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_360_evaluator_assessment for token {token}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve evaluator assessment: {str(e)}"
        )


@router.post("/360-evaluator/{token}/submit")
async def submit_360_evaluator_assessment(
    token: str,
    request: EvaluatorSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit 360 evaluator assessment by invitation token (public endpoint)
    """
    from app.core.logging import logger
    from app.services.assessment_scoring import calculate_scores

    try:
        # Get evaluator by token
        result = await db.execute(
            select(Assessment360Evaluator)
            .where(Assessment360Evaluator.invitation_token == token)
            .options(selectinload(Assessment360Evaluator.assessment))
        )
        evaluator = result.scalar_one_or_none()

        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invalid invitation token"
            )

        # Check if already completed
        if evaluator.status == AssessmentStatus.COMPLETED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This evaluation has already been completed"
            )

        # Get or create evaluator's assessment
        evaluator_assessment = None
        if evaluator.evaluator_assessment_id:
            result = await db.execute(
                select(Assessment)
                .where(Assessment.id == evaluator.evaluator_assessment_id)
            )
            evaluator_assessment = result.scalar_one_or_none()

        if not evaluator_assessment:
            # Verify that evaluator.assessment is loaded
            if not evaluator.assessment:
                # Reload evaluator with assessment if not loaded
                await db.refresh(evaluator, ["assessment"])
                if not evaluator.assessment:
                    logger.error(f"Evaluator {evaluator.id} has no associated assessment")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Evaluator assessment relationship not found"
                    )
            
            # Create new assessment for the evaluator
            evaluator_assessment = Assessment(
                user_id=evaluator.assessment.user_id,  # Same user being evaluated
                assessment_type=AssessmentType.THREE_SIXTY_SELF,  # Use same type as main assessment
                status=AssessmentStatus.IN_PROGRESS,
                started_at=datetime.now(timezone.utc) if not evaluator.started_at else evaluator.started_at
            )
            db.add(evaluator_assessment)
            await db.flush()  # Get the ID

            evaluator.evaluator_assessment_id = evaluator_assessment.id
            if not evaluator.started_at:
                evaluator.started_at = datetime.now(timezone.utc)

        # Save all answers
        for answer_data in request.answers:
            question_id = answer_data.question_id
            answer_value = str(answer_data.answer_value)

            if not question_id or not answer_value:
                continue

            # SECURITY: Use SQLAlchemy ORM instead of raw SQL to prevent SQL injection
            # Check if answer already exists
            existing_answer_result = await db.execute(
                select(AssessmentAnswer)
                .where(
                    AssessmentAnswer.assessment_id == evaluator_assessment.id,
                    AssessmentAnswer.question_id == question_id
                )
            )
            existing_answer = existing_answer_result.scalar_one_or_none()

            if existing_answer:
                # Update existing answer using ORM
                existing_answer.answer_value = answer_value
            else:
                # Create new answer using ORM
                new_answer = AssessmentAnswer(
                    assessment_id=evaluator_assessment.id,
                    question_id=question_id,
                    answer_value=answer_value
                )
                db.add(new_answer)

        await db.flush()

        # SECURITY: Use SQLAlchemy ORM instead of raw SQL to prevent SQL injection
        # Get all answers for scoring using ORM
        answers_result = await db.execute(
            select(AssessmentAnswer)
            .where(AssessmentAnswer.assessment_id == evaluator_assessment.id)
        )
        all_answers = answers_result.scalars().all()

        # Calculate scores
        scores = calculate_scores(
            assessment_type=evaluator_assessment.assessment_type,
            answers=all_answers
        )

        # Update assessment
        evaluator_assessment.status = AssessmentStatus.COMPLETED
        evaluator_assessment.completed_at = datetime.now(timezone.utc)
        evaluator_assessment.raw_score = {answer.question_id: answer.answer_value for answer in all_answers}
        evaluator_assessment.processed_score = scores

        # Update evaluator status
        evaluator.status = AssessmentStatus.COMPLETED
        evaluator.completed_at = datetime.now(timezone.utc)

        # Create assessment result (same as in submit_assessment endpoint)
        try:
            scores_json = json.dumps(scores)
            await db.execute(
                text("""
                    INSERT INTO assessment_results (assessment_id, user_id, scores, generated_at, updated_at)
                    VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), NOW(), NOW())
                    ON CONFLICT (assessment_id) DO UPDATE
                    SET scores = CAST(:scores AS jsonb), updated_at = NOW()
                """),
                {
                    "assessment_id": evaluator_assessment.id,
                    "user_id": evaluator_assessment.user_id,
                    "scores": scores_json
                }
            )
        except Exception as e:
            logger.error(f"Error creating assessment result for evaluator assessment {evaluator_assessment.id}: {e}", exc_info=True)
            # Don't fail the whole submission if result creation fails, but log it
            # The assessment is still marked as completed

        await db.commit()

        return {
            "message": "Evaluation submitted successfully",
            "assessment_id": evaluator_assessment.id,
            "status": "completed"
        }

    except HTTPException:
        raise
    except Exception as e:
        error_type = type(e).__name__
        error_message = str(e)
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(
            f"Error submitting evaluator assessment: {error_type}: {error_message}",
            exc_info=e,
            context={
                "token": token[:20] + "..." if len(token) > 20 else token,
                "error_type": error_type,
                "error_message": error_message,
                "traceback": error_traceback
            }
        )
        print(f"❌ ERROR submitting evaluator assessment: {error_type}: {error_message}")
        print(f"   Traceback: {error_traceback}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit evaluation: {error_type}: {error_message}"
        )


@router.post("/mbti/upload-score")
async def upload_mbti_score(
    mbti_profile: str = Body(..., description="MBTI profile (e.g., 'ISTJ')"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload MBTI score from external assessment
    """
    # Validate MBTI profile
    valid_profiles = [
        "ISTJ", "ISFJ", "INFJ", "INTJ",
        "ISTP", "ISFP", "INFP", "INTP",
        "ESTP", "ESFP", "ENFP", "ENTP",
        "ESTJ", "ESFJ", "ENFJ", "ENTJ"
    ]

    if mbti_profile.upper() not in valid_profiles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MBTI profile. Must be one of: {', '.join(valid_profiles)}"
        )

    # Create or update MBTI assessment
    result = await db.execute(
        select(Assessment)
        .where(
            Assessment.user_id == current_user.id,
            Assessment.assessment_type == AssessmentType.MBTI
        )
        .order_by(Assessment.created_at.desc())
    )
    assessment = result.scalar_one_or_none()

    if assessment:
        # Update existing
        assessment.status = AssessmentStatus.COMPLETED
        assessment.completed_at = datetime.utcnow()
        assessment.processed_score = {"profile": mbti_profile.upper()}
    else:
        # Create new
        assessment = Assessment(
            user_id=current_user.id,
            assessment_type=AssessmentType.MBTI,
            status=AssessmentStatus.COMPLETED,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
            processed_score={"profile": mbti_profile.upper()}
        )
        db.add(assessment)

    await db.commit()

    return {
        "message": "MBTI score uploaded successfully",
        "profile": mbti_profile.upper()
    }


@router.post("/mbti/upload-pdf")
async def upload_mbti_pdf(
    file: Optional[UploadFile] = File(None),
    profile_url: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload MBTI PDF results from 16Personalities and extract results using OCR
    Can accept either a file upload or a profile URL
    """
    import logging
    from app.services.pdf_ocr_service import PDFOCRService
    
    logger = logging.getLogger(__name__)
    
    # Validate input - must have either file or profile_url
    if not file and not profile_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a PDF file or a 16Personalities profile URL must be provided"
        )
    
    if file and profile_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide either a file OR a profile URL, not both"
        )
    
    pdf_bytes = None
    
    # Handle file upload
    if file:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No file provided"
            )
        
        # Check file extension
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF files are accepted."
            )
        
        # Check file size (max 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
            )
        
        if len(file_content) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        pdf_bytes = file_content
    
    # Handle profile URL
    elif profile_url:
        # Validate URL format
        if not profile_url.startswith('https://www.16personalities.com/profiles/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 16Personalities URL. Expected format: https://www.16personalities.com/profiles/..."
            )
        # PDF bytes will be downloaded later in the try block
        pdf_bytes = None
    
    # Ensure we have either file or URL
    if not file and not profile_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a PDF file or a 16Personalities profile URL must be provided"
        )
    
    try:
        logger.info(f"Starting MBTI PDF upload for user {current_user.id}")
        
        # Check if OCR service is configured
        logger.debug("Checking if OCR service is configured...")
        try:
            is_configured = PDFOCRService.is_configured()
            logger.debug(f"OCR service configured check result: {is_configured}")
        except Exception as config_check_error:
            logger.error(f"Error checking OCR service configuration: {config_check_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Error checking OCR service configuration: {str(config_check_error)}"
            )
        
        if not is_configured:
            logger.error("OCR service is not configured")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OCR service is not configured. Please configure OPENAI_API_KEY and install required dependencies (PyMuPDF, Pillow)."
            )
        
        logger.debug("OCR service is configured, initializing...")
        # Initialize OCR service
        try:
            ocr_service = PDFOCRService()
            logger.debug("OCR service initialized successfully")
        except Exception as init_error:
            logger.error(f"Failed to initialize OCR service: {init_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to initialize OCR service: {str(init_error)}. Please check OPENAI_API_KEY and ensure PyMuPDF and Pillow are installed."
            )
        
        # Extract MBTI data from URL or PDF
        extracted_data = None
        
        if profile_url and not pdf_bytes:
            # First, try HTML parsing (faster and more direct)
            logger.info(f"Extracting MBTI data from 16Personalities profile URL using HTML parsing: {profile_url}")
            html_error_msg = None
            pdf_error_msg = None
            
            try:
                extracted_data = await ocr_service.extract_mbti_from_html_url(profile_url)
                logger.info(f"Successfully extracted MBTI data from HTML: {extracted_data.get('mbti_type', 'unknown')}")
            except Exception as html_error:
                html_error_msg = str(html_error)
                logger.warning(f"HTML parsing failed: {html_error_msg}. Falling back to PDF download...")
                # Fall back to PDF download method
                try:
                    pdf_bytes = await ocr_service.download_pdf_from_url(profile_url)
                    logger.info(f"Successfully downloaded PDF ({len(pdf_bytes)} bytes) from profile URL")
                except Exception as download_error:
                    pdf_error_msg = str(download_error)
                    logger.error(f"Both HTML parsing and PDF download failed", exc_info=True)
                    
                    # Provide detailed error message
                    error_detail = f"Failed to extract data from URL.\n\n"
                    error_detail += f"HTML parsing error: {html_error_msg}\n\n"
                    error_detail += f"PDF download error: {pdf_error_msg}\n\n"
                    
                    # Add specific guidance based on error type
                    if "Playwright" in html_error_msg or "playwright" in html_error_msg.lower():
                        error_detail += "⚠️ Playwright issue detected. This usually means the browser engine is not properly installed on the server.\n"
                        error_detail += "Please contact support to ensure Playwright and Chromium are installed on the production server."
                    elif "Timeout" in html_error_msg or "timeout" in html_error_msg.lower():
                        error_detail += "⏱️ The page took too long to load. Please try again or use the PDF upload option instead."
                    elif "403" in html_error_msg or "forbidden" in html_error_msg.lower():
                        error_detail += "🔒 Access forbidden. Please ensure your 16Personalities profile is set to PUBLIC in your profile settings."
                    else:
                        error_detail += "💡 Try uploading a PDF file instead: Go to your profile on 16personalities.com and download the PDF, then upload it here."
                    
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=error_detail
                    )
        
        # If we have PDF bytes but no extracted data yet, extract from PDF
        if pdf_bytes and not extracted_data:
            logger.info(f"Extracting MBTI results from PDF for user {current_user.id} (PDF size: {len(pdf_bytes)} bytes)")
            try:
                extracted_data = await ocr_service.extract_mbti_results(pdf_bytes)
                logger.info(f"Successfully extracted MBTI data from PDF: {extracted_data.get('mbti_type', 'unknown')}")
            except Exception as extract_error:
                logger.error(f"Failed to extract MBTI results from PDF: {extract_error}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to extract MBTI results from PDF: {str(extract_error)}"
                )
        
        # Ensure we have extracted data at this point
        if not extracted_data:
            logger.error("No MBTI data could be extracted")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No MBTI data could be extracted from the provided source"
            )
        
        # Validate extracted data
        logger.debug(f"Validating extracted data: {extracted_data}")
        mbti_type = extracted_data.get("mbti_type")
        
        # Allow for -T/-A suffix (e.g., INTJ-T)
        mbti_type_clean = mbti_type.replace('-T', '').replace('-A', '') if mbti_type else None
        
        if not mbti_type_clean or len(str(mbti_type_clean)) != 4:
            logger.error(f"Invalid MBTI type extracted: {mbti_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not extract valid MBTI type. Extracted: {mbti_type}. Please ensure the source contains valid MBTI results from 16Personalities."
            )
        
        # Convert extracted data to assessment scores format
        dimension_preferences = extracted_data.get("dimension_preferences", {})
        
        # Create score structure compatible with assessment_scoring
        scores = {
            "mbti_type": mbti_type.upper(),
            "dimension_preferences": dimension_preferences,
            "description": extracted_data.get("description"),
            "strengths": extracted_data.get("strengths", []),
            "challenges": extracted_data.get("challenges", [])
        }
        
        # Find or create MBTI assessment
        result = await db.execute(
            select(Assessment)
            .where(
                Assessment.user_id == current_user.id,
                Assessment.assessment_type == AssessmentType.MBTI
            )
            .order_by(Assessment.created_at.desc())
        )
        assessment = result.scalar_one_or_none()
        
        if assessment:
            # Update existing assessment
            assessment.status = AssessmentStatus.COMPLETED
            assessment.completed_at = datetime.now(timezone.utc)
            assessment.processed_score = scores
            assessment.raw_score = {"source": "pdf_ocr", "extracted_data": extracted_data}
        else:
            # Create new assessment
            assessment = Assessment(
                user_id=current_user.id,
                assessment_type=AssessmentType.MBTI,
                status=AssessmentStatus.COMPLETED,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                processed_score=scores,
                raw_score={"source": "pdf_ocr", "extracted_data": extracted_data}
            )
            db.add(assessment)
        
        try:
            await db.commit()
            await db.refresh(assessment)
            logger.debug(f"Assessment saved/updated successfully: {assessment.id}")
        except Exception as commit_error:
            logger.error(f"Failed to commit assessment: {commit_error}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save assessment: {str(commit_error)}"
            )
        
        # Create or update assessment result using raw SQL to handle both 'scores' and 'result_data' columns
        logger.debug(f"Creating/updating assessment result for assessment {assessment.id}")
        try:
            # First check if result exists
            check_result = await db.execute(
                text("""
                    SELECT id FROM assessment_results
                    WHERE assessment_id = :assessment_id
                """),
                {"assessment_id": assessment.id}
            )
            existing_result = check_result.first()
            
            # Generate comprehensive insights including leadership capabilities
            from app.services.mbti_service import interpret_mbti_results
            
            # Extract base MBTI type (remove -T or -A variant for insights generation)
            base_mbti_type = mbti_type_clean
            comprehensive_insights = interpret_mbti_results(base_mbti_type, dimension_preferences)
            
            # Merge extracted data with generated insights
            insights_json = json.dumps({
                "description": extracted_data.get("description"),
                "strengths": extracted_data.get("strengths", []),
                "challenges": extracted_data.get("challenges", []),
                "dimensions": extracted_data.get("dimension_preferences", {}),
                "leadership_capabilities": comprehensive_insights.get("leadership_capabilities", {})
            })
            recommendations_json = json.dumps({})
            scores_json = json.dumps(scores)
            
            # Check which column exists in the database (result_data or scores)
            # Try to detect column name by checking table structure
            column_check = await db.execute(
                text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'assessment_results' 
                    AND column_name IN ('scores', 'result_data', 'generated_at', 'created_at', 'insights', 'recommendations')
                    ORDER BY column_name
                """)
            )
            columns = [row[0] for row in column_check.fetchall()]
            
            # Determine which column to use - prefer 'scores' if exists, otherwise 'result_data'
            scores_column = 'scores' if 'scores' in columns else ('result_data' if 'result_data' in columns else None)
            
            if not scores_column:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database schema error: Neither 'scores' nor 'result_data' column found in assessment_results table"
                )
            
            if existing_result:
                # Update existing result
                logger.debug(f"Updating existing assessment result using column '{scores_column}'")
                if scores_column == 'scores' and 'insights' in columns:
                    # New schema with scores, insights, recommendations
                    await db.execute(
                        text(f"""
                            UPDATE assessment_results
                            SET {scores_column} = CAST(:scores AS jsonb),
                                insights = CAST(:insights AS jsonb),
                                recommendations = CAST(:recommendations AS jsonb),
                                updated_at = :updated_at
                            WHERE assessment_id = :assessment_id
                        """),
                        {
                            "assessment_id": assessment.id,
                            "scores": scores_json,
                            "insights": insights_json,
                            "recommendations": recommendations_json,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                else:
                    # Old schema with result_data only
                    await db.execute(
                        text(f"""
                            UPDATE assessment_results
                            SET {scores_column} = CAST(:scores AS jsonb),
                                updated_at = :updated_at
                            WHERE assessment_id = :assessment_id
                        """),
                        {
                            "assessment_id": assessment.id,
                            "scores": scores_json,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
            else:
                # Create new result
                logger.debug(f"Creating new assessment result using column '{scores_column}'")
                if scores_column == 'scores' and 'insights' in columns and 'generated_at' in columns:
                    # New schema with all columns
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, insights, recommendations, generated_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), CAST(:insights AS jsonb), CAST(:recommendations AS jsonb), :generated_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "insights": insights_json,
                            "recommendations": recommendations_json,
                            "generated_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                elif scores_column == 'scores' and 'generated_at' in columns:
                    # Schema with scores and generated_at (but no insights/recommendations)
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, generated_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), :generated_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "generated_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                elif scores_column == 'scores' and 'created_at' in columns:
                    # Transitional schema with scores but created_at instead of generated_at
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, created_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), :created_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "created_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                else:
                    # Old schema with result_data - no timestamp columns
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column})
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb))
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json
                        }
                    )
            
            await db.commit()
            logger.debug(f"Assessment result saved successfully for assessment {assessment.id}")
        except Exception as result_error:
            logger.error(f"Failed to create/update assessment result: {result_error}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save assessment result: {str(result_error)}"
            )
        
        logger.info(f"Successfully extracted MBTI results from PDF: {mbti_type} for user {current_user.id}")
        
        # Return response
        return {
            "assessment_id": assessment.id,
            "mbti_type": mbti_type.upper(),
            "scores": scores,
            "message": "PDF uploaded and results extracted successfully"
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Error extracting MBTI results from PDF: {str(e)}", exc_info=True)
        try:
            await db.rollback()
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract MBTI results from PDF: {str(e)}"
        )
    except Exception as e:
        error_type = type(e).__name__
        error_message = str(e)
        
        # Log full error details
        try:
            logger.error(
                f"Error processing MBTI PDF: {error_type}: {error_message}",
                exc_info=True,
                extra={
                    "user_id": current_user.id if current_user else None,
                    "filename": file.filename if file and hasattr(file, 'filename') else None,
                    "profile_url": profile_url,
                    "file_size": len(pdf_bytes) if pdf_bytes else 0,
                    "error_type": error_type,
                    "error_message": error_message
                }
            )
        except Exception as log_error:
            # If logging fails, at least print to stderr
            print(f"CRITICAL: Failed to log error. Original error: {error_type}: {error_message}")
            print(f"Logging error: {log_error}")
        
        # Rollback transaction if active
        try:
            await db.rollback()
        except Exception as rollback_error:
            logger.error(f"Failed to rollback transaction: {rollback_error}")
        
        # Return more detailed error in development, generic in production
        detail_message = f"Failed to process PDF: {error_type}: {error_message}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail_message
        )


@router.post("/mbti/upload-image")
async def upload_mbti_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload MBTI screenshot/image results from 16Personalities and extract results using OCR
    Accepts image files (PNG, JPG, JPEG)
    """
    import logging
    from app.services.pdf_ocr_service import PDFOCRService
    
    logger = logging.getLogger(__name__)
    
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check file extension - accept common image formats
    allowed_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    file_ext = None
    for ext in allowed_extensions:
        if file.filename.lower().endswith(ext):
            file_ext = ext
            break
    
    if not file_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Only image files are accepted: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (max 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
        )
    
    if len(file_content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
    
    try:
        logger.info(f"Starting MBTI image upload for user {current_user.id}")
        
        # Check if OCR service is configured
        logger.debug("Checking if OCR service is configured...")
        try:
            is_configured = PDFOCRService.is_configured()
            logger.debug(f"OCR service configured check result: {is_configured}")
        except Exception as config_check_error:
            logger.error(f"Error checking OCR service configuration: {config_check_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Error checking OCR service configuration: {str(config_check_error)}"
            )
        
        if not is_configured:
            logger.error("OCR service is not configured")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OCR service is not configured. Please configure OPENAI_API_KEY and install required dependencies (PyMuPDF, Pillow)."
            )
        
        logger.debug("OCR service is configured, initializing...")
        # Initialize OCR service
        try:
            ocr_service = PDFOCRService()
            logger.debug("OCR service initialized successfully")
        except Exception as init_error:
            logger.error(f"Failed to initialize OCR service: {init_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Failed to initialize OCR service: {str(init_error)}. Please check OPENAI_API_KEY and ensure PyMuPDF and Pillow are installed."
            )
        
        logger.info(f"Extracting MBTI results from image for user {current_user.id} (image size: {len(file_content)} bytes)")
        # Extract MBTI results from image
        try:
            # Determine image format from file extension
            image_format = None
            if file_ext:
                image_format = file_ext.lstrip('.').lower()
            # Default to png if not found
            if not image_format:
                image_format = 'png'
            extracted_data = await ocr_service.extract_mbti_results_from_image(file_content, image_format)
            logger.info(f"Successfully extracted MBTI data: {extracted_data.get('mbti_type', 'unknown')}")
        except Exception as extract_error:
            logger.error(f"Failed to extract MBTI results from image: {extract_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract MBTI results from image: {str(extract_error)}"
            )
        
        # Validate extracted data
        logger.debug(f"Validating extracted data: {extracted_data}")
        mbti_type = extracted_data.get("mbti_type")
        if not mbti_type or len(str(mbti_type)) != 4:
            logger.error(f"Invalid MBTI type extracted: {mbti_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not extract valid MBTI type from image. Extracted: {mbti_type}. Please ensure the image contains valid MBTI results from 16Personalities."
            )
        
        # Convert extracted data to assessment scores format
        dimension_preferences = extracted_data.get("dimension_preferences", {})
        
        # Create score structure compatible with assessment_scoring
        scores = {
            "mbti_type": mbti_type.upper(),
            "variant": extracted_data.get("variant"),
            "personality_name": extracted_data.get("personality_name"),
            "role": extracted_data.get("role"),
            "role_description": extracted_data.get("role_description"),
            "strategy": extracted_data.get("strategy"),
            "strategy_description": extracted_data.get("strategy_description"),
            "dimension_preferences": dimension_preferences,
            "traits": extracted_data.get("traits", {}),
            "description": extracted_data.get("description"),
            "strengths": extracted_data.get("strengths", []),
            "strengths_descriptions": extracted_data.get("strengths_descriptions", {}),
            "weaknesses": extracted_data.get("weaknesses", []),
            "weaknesses_descriptions": extracted_data.get("weaknesses_descriptions", {}),
            "challenges": extracted_data.get("challenges", []),  # Keep for backward compatibility
            "research_insight": extracted_data.get("research_insight")
        }
        
        # Find or create MBTI assessment
        result = await db.execute(
            select(Assessment)
            .where(
                Assessment.user_id == current_user.id,
                Assessment.assessment_type == AssessmentType.MBTI
            )
            .order_by(Assessment.created_at.desc())
        )
        assessment = result.scalar_one_or_none()
        
        if assessment:
            # Update existing assessment
            assessment.status = AssessmentStatus.COMPLETED
            assessment.completed_at = datetime.now(timezone.utc)
            assessment.processed_score = scores
            assessment.raw_score = {"source": "image_ocr", "extracted_data": extracted_data}
        else:
            # Create new assessment
            assessment = Assessment(
                user_id=current_user.id,
                assessment_type=AssessmentType.MBTI,
                status=AssessmentStatus.COMPLETED,
                started_at=datetime.now(timezone.utc),
                completed_at=datetime.now(timezone.utc),
                processed_score=scores,
                raw_score={"source": "image_ocr", "extracted_data": extracted_data}
            )
            db.add(assessment)
        
        try:
            await db.commit()
            await db.refresh(assessment)
            logger.debug(f"Assessment saved/updated successfully: {assessment.id}")
        except Exception as commit_error:
            logger.error(f"Failed to commit assessment: {commit_error}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save assessment: {str(commit_error)}"
            )
        
        # Create or update assessment result using raw SQL to handle both 'scores' and 'result_data' columns
        logger.debug(f"Creating/updating assessment result for assessment {assessment.id}")
        try:
            # First check if result exists
            check_result = await db.execute(
                text("""
                    SELECT id FROM assessment_results
                    WHERE assessment_id = :assessment_id
                """),
                {"assessment_id": assessment.id}
            )
            existing_result = check_result.first()
            
            # Map weaknesses to challenges for consistency with PDF extraction
            # Use weaknesses if available, otherwise use challenges, otherwise empty list
            weaknesses = extracted_data.get("weaknesses", [])
            challenges = extracted_data.get("challenges", [])
            # If we have weaknesses but no challenges, use weaknesses as challenges
            if weaknesses and not challenges:
                challenges = weaknesses
            
            insights_json = json.dumps({
                "description": extracted_data.get("description"),
                "personality_name": extracted_data.get("personality_name"),
                "role": extracted_data.get("role"),
                "role_description": extracted_data.get("role_description"),
                "strategy": extracted_data.get("strategy"),
                "strategy_description": extracted_data.get("strategy_description"),
                "traits": extracted_data.get("traits", {}),
                "strengths": extracted_data.get("strengths", []),
                "strengths_descriptions": extracted_data.get("strengths_descriptions", {}),
                "weaknesses": weaknesses,
                "weaknesses_descriptions": extracted_data.get("weaknesses_descriptions", {}),
                "challenges": challenges,  # Use mapped challenges (from weaknesses if needed)
                "research_insight": extracted_data.get("research_insight"),
                "dimensions": extracted_data.get("dimension_preferences", {})
            })
            recommendations_json = json.dumps({})
            scores_json = json.dumps(scores)
            
            # Check which column exists in the database (result_data or scores)
            # Try to detect column name by checking table structure
            column_check = await db.execute(
                text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = 'assessment_results' 
                    AND column_name IN ('scores', 'result_data', 'generated_at', 'created_at', 'insights', 'recommendations')
                """)
            )
            columns = {row[0] for row in column_check.fetchall()}
            scores_column = 'scores' if 'scores' in columns else 'result_data'
            
            if existing_result:
                # Update existing result
                logger.debug(f"Updating existing assessment result using column '{scores_column}'")
                if scores_column == 'scores' and 'insights' in columns and 'recommendations' in columns:
                    await db.execute(
                        text(f"""
                            UPDATE assessment_results
                            SET {scores_column} = CAST(:scores AS jsonb),
                                insights = CAST(:insights AS jsonb),
                                recommendations = CAST(:recommendations AS jsonb),
                                updated_at = :updated_at
                            WHERE assessment_id = :assessment_id
                        """),
                        {
                            "assessment_id": assessment.id,
                            "scores": scores_json,
                            "insights": insights_json,
                            "recommendations": recommendations_json,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                elif scores_column == 'scores':
                    await db.execute(
                        text(f"""
                            UPDATE assessment_results
                            SET {scores_column} = CAST(:scores AS jsonb),
                                updated_at = :updated_at
                            WHERE assessment_id = :assessment_id
                        """),
                        {
                            "assessment_id": assessment.id,
                            "scores": scores_json,
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                else:
                    await db.execute(
                        text(f"""
                            UPDATE assessment_results
                            SET {scores_column} = CAST(:scores AS jsonb)
                            WHERE assessment_id = :assessment_id
                        """),
                        {
                            "assessment_id": assessment.id,
                            "scores": scores_json
                        }
                    )
            else:
                # Create new result
                logger.debug(f"Creating new assessment result using column '{scores_column}'")
                if scores_column == 'scores' and 'insights' in columns and 'generated_at' in columns:
                    # New schema with all columns
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, insights, recommendations, generated_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), CAST(:insights AS jsonb), CAST(:recommendations AS jsonb), :generated_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "insights": insights_json,
                            "recommendations": recommendations_json,
                            "generated_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                elif scores_column == 'scores' and 'generated_at' in columns:
                    # Schema with scores and generated_at (but no insights/recommendations)
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, generated_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), :generated_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "generated_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                elif scores_column == 'scores' and 'created_at' in columns:
                    # Transitional schema with scores but created_at instead of generated_at
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column}, created_at, updated_at)
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb), :created_at, :updated_at)
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json,
                            "created_at": datetime.now(timezone.utc),
                            "updated_at": datetime.now(timezone.utc)
                        }
                    )
                else:
                    # Fallback to result_data column
                    await db.execute(
                        text(f"""
                            INSERT INTO assessment_results (assessment_id, user_id, {scores_column})
                            VALUES (:assessment_id, :user_id, CAST(:scores AS jsonb))
                        """),
                        {
                            "assessment_id": assessment.id,
                            "user_id": current_user.id,
                            "scores": scores_json
                        }
                    )
            
            await db.commit()
            logger.debug(f"Assessment result saved/updated successfully")
        except Exception as result_error:
            logger.error(f"Failed to save assessment result: {result_error}", exc_info=True)
            await db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save assessment result: {str(result_error)}"
            )
        
        logger.info(f"Successfully extracted MBTI results from image: {mbti_type} for user {current_user.id}")
        
        # Return response
        return {
            "assessment_id": assessment.id,
            "mbti_type": mbti_type.upper(),
            "scores": scores,
            "message": "Image uploaded and results extracted successfully"
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Error extracting MBTI results from image: {str(e)}", exc_info=True)
        try:
            await db.rollback()
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to extract MBTI results from image: {str(e)}"
        )
    except Exception as e:
        error_type = type(e).__name__
        error_message = str(e)
        
        # Log full error details
        try:
            logger.error(
                f"Error processing MBTI image: {error_type}: {error_message}",
                exc_info=True,
                extra={
                    "user_id": current_user.id if current_user else None,
                    "filename": file.filename if file and hasattr(file, 'filename') else None,
                    "file_size": len(file_content) if file_content else 0,
                    "error_type": error_type,
                    "error_message": error_message
                }
            )
        except Exception as log_error:
            # If logging fails, at least print to stderr
            print(f"CRITICAL: Failed to log error. Original error: {error_type}: {error_message}")
            print(f"Logging error: {log_error}")
        
        try:
            await db.rollback()
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while processing the image: {error_message}"
        )


@router.delete("/my-assessments/all", status_code=status.HTTP_200_OK)
async def delete_all_my_assessments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete all assessments for the current user (superadmin only)
    This will permanently delete all assessments, answers, results, and evaluators
    """
    from app.dependencies import is_superadmin
    from app.core.logging import logger
    
    # Check if user is superadmin
    is_user_superadmin = await is_superadmin(current_user, db)
    if not is_user_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can delete all their assessments"
        )
    
    try:
        # Get all assessments for this user
        result = await db.execute(
            select(Assessment)
            .where(Assessment.user_id == current_user.id)
        )
        assessments = result.scalars().all()
        
        if not assessments:
            return {
                "message": "No assessments found to delete",
                "deleted_count": 0
            }
        
        # Count assessments before deletion
        deleted_count = len(assessments)
        assessment_ids = [a.id for a in assessments]
        
        # Delete all related data using raw SQL to avoid ORM issues with answered_at column
        # Database CASCADE will handle any remaining relationships, but we're explicit for clarity
        
        if assessment_ids:
            # Build placeholders for IN clause dynamically
            placeholders = ','.join([f':id{i}' for i in range(len(assessment_ids))])
            params = {f'id{i}': assessment_id for i, assessment_id in enumerate(assessment_ids)}
            
            # 1. Delete assessment answers using raw SQL to avoid answered_at column issue
            await db.execute(
                text(f"""
                    DELETE FROM assessment_answers
                    WHERE assessment_id IN ({placeholders})
                """),
                params
            )
            
            # 2. Delete 360 evaluators using raw SQL
            await db.execute(
                text(f"""
                    DELETE FROM assessment_360_evaluators
                    WHERE assessment_id IN ({placeholders})
                """),
                params
            )
            
            # 3. Delete assessment results using raw SQL
            await db.execute(
                text(f"""
                    DELETE FROM assessment_results
                    WHERE assessment_id IN ({placeholders})
                """),
                params
            )
            
            # 4. Delete assessments themselves using raw SQL
            # This avoids triggering ORM cascade which tries to load answers with answered_at column
            await db.execute(
                text(f"""
                    DELETE FROM assessments
                    WHERE id IN ({placeholders})
                """),
                params
            )
        
        await db.commit()
        
        logger.info(
            f"Superadmin {current_user.id} ({current_user.email}) deleted all {deleted_count} assessments"
        )
        
        return {
            "message": f"Successfully deleted {deleted_count} assessments",
            "deleted_count": deleted_count
        }
    except Exception as e:
        logger.error(f"Error deleting all assessments for user {current_user.id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assessments: {str(e)}"
        )


@router.delete("/{assessment_id}", status_code=status.HTTP_200_OK)
async def delete_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a single assessment for the current user
    This will permanently delete the assessment, answers, results, and evaluators
    """
    from app.core.logging import logger
    
    try:
        # Verify assessment exists and belongs to the current user
        result = await db.execute(
            select(Assessment)
            .where(
                Assessment.id == assessment_id,
                Assessment.user_id == current_user.id
            )
        )
        assessment = result.scalar_one_or_none()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        # Delete all related data using raw SQL to avoid ORM issues with answered_at column
        # Database CASCADE will handle any remaining relationships, but we're explicit for clarity
        
        # 1. Delete assessment answers using raw SQL to avoid answered_at column issue
        await db.execute(
            text("""
                DELETE FROM assessment_answers
                WHERE assessment_id = :assessment_id
            """),
            {"assessment_id": assessment_id}
        )
        
        # 2. Delete 360 evaluators using raw SQL
        await db.execute(
            text("""
                DELETE FROM assessment_360_evaluators
                WHERE assessment_id = :assessment_id
            """),
            {"assessment_id": assessment_id}
        )
        
        # 3. Delete assessment results using raw SQL
        await db.execute(
            text("""
                DELETE FROM assessment_results
                WHERE assessment_id = :assessment_id
            """),
            {"assessment_id": assessment_id}
        )
        
        # 4. Delete assessment itself using raw SQL
        # This avoids triggering ORM cascade which tries to load answers with answered_at column
        await db.execute(
            text("""
                DELETE FROM assessments
                WHERE id = :assessment_id
            """),
            {"assessment_id": assessment_id}
        )
        
        await db.commit()
        
        logger.info(
            f"User {current_user.id} ({current_user.email}) deleted assessment {assessment_id}"
        )
        
        return {
            "message": "Assessment deleted successfully",
            "assessment_id": assessment_id
        }
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error deleting assessment {assessment_id} for user {current_user.id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete assessment: {str(e)}"
        )


# ============================================================================
# Question Management Endpoints
# ============================================================================

@router.get("/questions", response_model=List[AssessmentQuestionResponse])
async def list_questions(
    assessment_type: Optional[str] = Query(None, description="Filter by assessment type"),
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    List all assessment questions
    Requires admin or superadmin privileges
    """
    try:
        db_query = select(AssessmentQuestion)
        
        if assessment_type:
            # Validate assessment type
            try:
                assessment_type_enum = AssessmentType(assessment_type.lower())
                db_query = db_query.where(AssessmentQuestion.assessment_type == assessment_type_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid assessment type: {assessment_type}"
                )
        
        db_query = db_query.order_by(AssessmentQuestion.assessment_type, AssessmentQuestion.number, AssessmentQuestion.question_id)
        
        result = await db.execute(db_query)
        questions = result.scalars().all()
        
        return [AssessmentQuestionResponse.model_validate(q) for q in questions]
    except HTTPException:
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error listing questions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list questions: {str(e)}"
        )


@router.get("/questions/{question_id}", response_model=AssessmentQuestionResponse)
async def get_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific question by question_id
    Requires admin or superadmin privileges
    """
    try:
        result = await db.execute(
            select(AssessmentQuestion).where(AssessmentQuestion.question_id == question_id)
        )
        question = result.scalar_one_or_none()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        
        return AssessmentQuestionResponse.model_validate(question)
    except HTTPException:
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error getting question {question_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get question: {str(e)}"
        )


@router.post("/questions", response_model=AssessmentQuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: AssessmentQuestionCreate,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new question
    Requires admin or superadmin privileges
    """
    try:
        # Validate assessment type
        try:
            assessment_type_enum = AssessmentType(question_data.assessment_type.lower())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid assessment type: {question_data.assessment_type}"
            )
        
        # Check if question_id already exists
        result = await db.execute(
            select(AssessmentQuestion).where(AssessmentQuestion.question_id == question_data.question_id)
        )
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Question with ID '{question_data.question_id}' already exists"
            )
        
        # Create question
        question = AssessmentQuestion(
            question_id=question_data.question_id,
            assessment_type=assessment_type_enum,
            question=question_data.question,
            pillar=question_data.pillar,
            number=question_data.number,
            option_a=question_data.option_a,
            option_b=question_data.option_b,
            mode_a=question_data.mode_a,
            mode_b=question_data.mode_b,
            capability=question_data.capability,
            question_metadata=question_data.question_metadata
        )
        
        db.add(question)
        await db.commit()
        await db.refresh(question)
        
        return AssessmentQuestionResponse.model_validate(question)
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error creating question: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create question: {str(e)}"
        )


@router.put("/questions/{question_id}", response_model=AssessmentQuestionResponse)
async def update_question(
    question_id: str,
    question_data: AssessmentQuestionUpdate,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a question
    Requires admin or superadmin privileges
    """
    try:
        result = await db.execute(
            select(AssessmentQuestion).where(AssessmentQuestion.question_id == question_id)
        )
        question = result.scalar_one_or_none()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        
        # Update fields
        if question_data.question is not None:
            question.question = question_data.question
        if question_data.pillar is not None:
            question.pillar = question_data.pillar
        if question_data.number is not None:
            question.number = question_data.number
        if question_data.option_a is not None:
            question.option_a = question_data.option_a
        if question_data.option_b is not None:
            question.option_b = question_data.option_b
        if question_data.mode_a is not None:
            question.mode_a = question_data.mode_a
        if question_data.mode_b is not None:
            question.mode_b = question_data.mode_b
        if question_data.capability is not None:
            question.capability = question_data.capability
        if question_data.question_metadata is not None:
            question.question_metadata = question_data.question_metadata
        
        question.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(question)
        
        return AssessmentQuestionResponse.model_validate(question)
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error updating question {question_id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update question: {str(e)}"
        )


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_admin_or_superadmin),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a question
    Requires admin or superadmin privileges
    """
    try:
        result = await db.execute(
            select(AssessmentQuestion).where(AssessmentQuestion.question_id == question_id)
        )
        question = result.scalar_one_or_none()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Question with ID '{question_id}' not found"
            )
        
        await db.delete(question)
        await db.commit()
        
        return None
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        from app.core.logging import logger
        logger.error(f"Error deleting question {question_id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete question: {str(e)}"
        )

