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
from app.dependencies import get_current_user
from app.models.user import User
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    Assessment360Evaluator,
    AssessmentResult,
    AssessmentType,
    AssessmentStatus,
    EvaluatorRole,
)
from app.config.assessment_config import get_total_questions

router = APIRouter()


# ============================================================================
# Pydantic Schemas
# ============================================================================

class AssessmentListItem(BaseModel):
    """Assessment list item response"""
    id: int
    assessment_type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    score_summary: Optional[Dict[str, Any]] = None
    answer_count: Optional[int] = 0  # Number of answers provided
    total_questions: Optional[int] = 30  # Total number of questions (30 for most assessments)

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
    """
    result = await db.execute(
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .order_by(Assessment.created_at.desc())
    )
    assessments = result.scalars().all()

    # Format response
    response = []
    for assessment in assessments:
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

        response.append(AssessmentListItem(
            id=assessment.id,
            assessment_type=assessment.assessment_type.value,
            status=assessment.status.value,
            started_at=assessment.started_at,
            completed_at=assessment.completed_at,
            score_summary=score_summary,
            answer_count=answer_count,
            total_questions=total_questions
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

        # Check if answer already exists using raw SQL to avoid answered_at column issue
        check_result = await db.execute(
            text("""
                SELECT id, assessment_id, question_id, answer_value
                FROM assessment_answers
                WHERE assessment_id = :assessment_id AND question_id = :question_id
            """),
            {
                "assessment_id": assessment_id,
                "question_id": str(request.question_id)
            }
        )
        existing_row = check_result.fetchone()

        if existing_row:
            # Update existing answer using raw SQL
            await db.execute(
                text("""
                    UPDATE assessment_answers
                    SET answer_value = :answer_value
                    WHERE id = :id
                """),
                {
                    "id": existing_row[0],
                    "answer_value": str(request.answer_value)
                }
            )
        else:
            # Create new answer using raw SQL (without answered_at to avoid asyncpg cache issue)
            await db.execute(
                text("""
                    INSERT INTO assessment_answers (assessment_id, question_id, answer_value)
                    VALUES (:assessment_id, :question_id, :answer_value)
                """),
                {
                    "assessment_id": assessment_id,
                    "question_id": str(request.question_id),
                    "answer_value": str(request.answer_value)
                }
            )

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
            # Answer already exists, try to update it using raw SQL
            try:
                check_result = await db.execute(
                    text("""
                        SELECT id, assessment_id, question_id, answer_value
                        FROM assessment_answers
                        WHERE assessment_id = :assessment_id AND question_id = :question_id
                    """),
                    {
                        "assessment_id": assessment_id,
                        "question_id": str(request.question_id)
                    }
                )
                existing_row = check_result.fetchone()
                if existing_row:
                    await db.execute(
                        text("""
                            UPDATE assessment_answers
                            SET answer_value = :answer_value
                            WHERE id = :id
                        """),
                        {
                            "id": existing_row[0],
                            "answer_value": str(request.answer_value)
                        }
                    )
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

    # Get all answers using raw SQL to avoid answered_at column issue
    answers_result = await db.execute(
        text("""
            SELECT id, assessment_id, question_id, answer_value
            FROM assessment_answers
            WHERE assessment_id = :assessment_id
        """),
        {
            "assessment_id": assessment_id
        }
    )
    answers_rows = answers_result.fetchall()
    
    # Check if there are any answers
    if not answers_rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit assessment: No answers provided. Please complete at least one question before submitting."
        )
    
    # Convert to AssessmentAnswer objects for calculate_scores
    # Create a simple class that mimics AssessmentAnswer structure
    class SimpleAnswer:
        def __init__(self, id, assessment_id, question_id, answer_value):
            self.id = id
            self.assessment_id = assessment_id
            self.question_id = question_id
            self.answer_value = answer_value
    
    answers = [SimpleAnswer(row[0], row[1], row[2], row[3]) for row in answers_rows]

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
    answers_result = await db.execute(
        text("""
            SELECT question_id, answer_value
            FROM assessment_answers
            WHERE assessment_id = :assessment_id
            ORDER BY question_id
        """),
        {
            "assessment_id": assessment_id
        }
    )
    answers_rows = answers_result.fetchall()
    
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
    Get results for a completed assessment
    """
    from app.core.logging import logger

    try:
        # First verify the assessment exists and belongs to the user
        assessment_result = await db.execute(
            select(Assessment)
            .where(
                Assessment.id == assessment_id,
                Assessment.user_id == current_user.id
            )
        )
        assessment = assessment_result.scalar_one_or_none()

        if not assessment:
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
    db: AsyncSession = Depends(get_db)
):
    """
    Get the status of all evaluators for a specific 360 self-assessment
    """
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

    # Get all evaluators for this assessment
    evaluators_result = await db.execute(
        select(Assessment360Evaluator)
        .where(Assessment360Evaluator.assessment_id == assessment_id)
        .order_by(Assessment360Evaluator.created_at)
    )
    evaluators = evaluators_result.scalars().all()

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
        })

    return {
        "assessment_id": assessment_id,
        "evaluators": evaluators_list
    }


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

        # Mark invitation as opened
        if not evaluator.invitation_opened_at:
            evaluator.invitation_opened_at = datetime.now(timezone.utc)
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

            # Check if answer already exists using raw SQL to avoid answered_at column issue
            check_result = await db.execute(
                text("""
                    SELECT id, assessment_id, question_id, answer_value
                    FROM assessment_answers
                    WHERE assessment_id = :assessment_id AND question_id = :question_id
                """),
                {
                    "assessment_id": evaluator_assessment.id,
                    "question_id": question_id
                }
            )
            existing_row = check_result.fetchone()

            if existing_row:
                # Update existing answer using raw SQL
                await db.execute(
                    text("""
                        UPDATE assessment_answers
                        SET answer_value = :answer_value
                        WHERE id = :id
                    """),
                    {
                        "id": existing_row[0],
                        "answer_value": answer_value
                    }
                )
            else:
                # Create new answer using raw SQL (without answered_at to avoid asyncpg cache issue)
                await db.execute(
                    text("""
                        INSERT INTO assessment_answers (assessment_id, question_id, answer_value)
                        VALUES (:assessment_id, :question_id, :answer_value)
                    """),
                    {
                        "assessment_id": evaluator_assessment.id,
                        "question_id": question_id,
                        "answer_value": answer_value
                    }
                )

        await db.flush()

        # Get all answers for scoring using raw SQL to avoid answered_at column issue
        answers_result = await db.execute(
            text("""
                SELECT id, assessment_id, question_id, answer_value
                FROM assessment_answers
                WHERE assessment_id = :assessment_id
            """),
            {
                "assessment_id": evaluator_assessment.id
            }
        )
        answers_rows = answers_result.fetchall()
        
        # Convert to AssessmentAnswer objects for calculate_scores
        # Create a simple class that mimics AssessmentAnswer structure
        class SimpleAnswer:
            def __init__(self, id, assessment_id, question_id, answer_value):
                self.id = id
                self.assessment_id = assessment_id
                self.question_id = question_id
                self.answer_value = answer_value
        
        all_answers = [SimpleAnswer(row[0], row[1], row[2], row[3]) for row in answers_rows]

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
        
        # Download PDF from URL if needed
        if profile_url and not pdf_bytes:
            logger.info(f"Downloading PDF from 16Personalities profile URL: {profile_url}")
            try:
                pdf_bytes = await ocr_service.download_pdf_from_url(profile_url)
                logger.info(f"Successfully downloaded PDF ({len(pdf_bytes)} bytes) from profile URL")
            except Exception as download_error:
                logger.error(f"Failed to download PDF from URL: {download_error}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to download PDF from URL: {str(download_error)}"
                )
        
        # Ensure we have PDF bytes at this point
        if not pdf_bytes:
            logger.error("No PDF data available for processing")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No PDF data available for processing"
            )
        
        logger.info(f"Extracting MBTI results from PDF for user {current_user.id} (PDF size: {len(pdf_bytes)} bytes)")
        # Extract MBTI results from PDF
        try:
            extracted_data = await ocr_service.extract_mbti_results(pdf_bytes)
            logger.info(f"Successfully extracted MBTI data: {extracted_data.get('mbti_type', 'unknown')}")
        except Exception as extract_error:
            logger.error(f"Failed to extract MBTI results from PDF: {extract_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract MBTI results from PDF: {str(extract_error)}"
            )
        
        # Validate extracted data
        logger.debug(f"Validating extracted data: {extracted_data}")
        mbti_type = extracted_data.get("mbti_type")
        if not mbti_type or len(str(mbti_type)) != 4:
            logger.error(f"Invalid MBTI type extracted: {mbti_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not extract valid MBTI type from PDF. Extracted: {mbti_type}. Please ensure the PDF contains valid MBTI results from 16Personalities."
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
            
            insights_json = json.dumps({
                "description": extracted_data.get("description"),
                "strengths": extracted_data.get("strengths", []),
                "challenges": extracted_data.get("challenges", []),
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
                    AND column_name IN ('scores', 'result_data')
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
                    # Old schema with result_data
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

