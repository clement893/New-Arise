"""
Assessments API Endpoints
ARISE Leadership Assessment Tool
"""

from typing import List, Optional, Dict, Any
import json
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, UniqueConstraint
from sqlalchemy.orm import selectinload
from sqlalchemy.exc import IntegrityError
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
        
        # Determine total questions based on assessment type
        total_questions = 30  # Default for TKI, WELLNESS, THREE_SIXTY_SELF
        if assessment.assessment_type == AssessmentType.MBTI:
            total_questions = 0  # MBTI is external upload
        
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
        
        # Check if answer already exists
        result = await db.execute(
            select(AssessmentAnswer)
            .where(
                AssessmentAnswer.assessment_id == assessment_id,
                AssessmentAnswer.question_id == request.question_id
            )
        )
        existing_answer = result.scalar_one_or_none()
        
        if existing_answer:
            # Update existing answer
            existing_answer.answer_value = str(request.answer_value)  # Ensure it's a string
            # updated_at will be automatically updated by SQLAlchemy's onupdate
        else:
            # Create new answer
            new_answer = AssessmentAnswer(
                assessment_id=assessment_id,
                question_id=str(request.question_id),
                answer_value=str(request.answer_value)
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
            # Answer already exists, try to update it
            try:
                result = await db.execute(
                    select(AssessmentAnswer)
                    .where(
                        AssessmentAnswer.assessment_id == assessment_id,
                        AssessmentAnswer.question_id == request.question_id
                    )
                )
                existing_answer = result.scalar_one_or_none()
                if existing_answer:
                    existing_answer.answer_value = str(request.answer_value)
                    # updated_at will be automatically updated
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment is already completed"
        )
    
    # Get all answers
    result = await db.execute(
        select(AssessmentAnswer)
        .where(AssessmentAnswer.assessment_id == assessment_id)
    )
    answers = result.scalars().all()
    
    # Calculate scores based on assessment type
    from app.services.assessment_scoring import calculate_scores
    
    scores = calculate_scores(
        assessment_type=assessment.assessment_type,
        answers=answers
    )
    
    # Update assessment
    assessment.status = AssessmentStatus.COMPLETED
    assessment.completed_at = datetime.utcnow()
    assessment.raw_score = {answer.question_id: answer.answer_value for answer in answers}
    assessment.processed_score = scores
    
    # Create assessment result
    # Note: Database has result_data column, not scores. We'll store scores in result_data.
    from sqlalchemy import text
    
    try:
        # Serialize scores to JSON string for PostgreSQL JSONB column
        result_data_json = json.dumps(scores)
        await db.execute(
            text("""
                INSERT INTO assessment_results (assessment_id, result_data, created_at, updated_at)
                VALUES (:assessment_id, CAST(:result_data AS jsonb), NOW(), NOW())
                ON CONFLICT (assessment_id) DO UPDATE
                SET result_data = CAST(:result_data AS jsonb), updated_at = NOW()
            """),
            {
                "assessment_id": assessment.id,
                "result_data": result_data_json
            }
        )
        
        await db.commit()
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
        
        # Get assessment result using raw SQL since database has result_data, not scores
        from sqlalchemy import text
        result_query = await db.execute(
            text("""
                SELECT id, assessment_id, result_data, created_at, updated_at
                FROM assessment_results
                WHERE assessment_id = :assessment_id
            """),
            {"assessment_id": assessment_id}
        )
        result_row = result_query.first()
        
        if not result_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment results not found. The assessment may not be completed yet."
            )
        
        # Extract data from raw SQL result
        result_id, result_assessment_id, result_data, created_at, updated_at = result_row
        
        if result_data is None:
            logger.error(f"Could not retrieve result_data for assessment {assessment_id}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Assessment results are incomplete. Please contact support."
            )
        
        # Get assessment type from the assessment object
        assessment_type = assessment.assessment_type
        assessment_type_str = assessment_type.value if hasattr(assessment_type, 'value') else str(assessment_type)
        
        # Use created_at as generated_at (database doesn't have generated_at)
        generated_at = created_at or datetime.now(timezone.utc)
        
        return AssessmentResultResponse(
            id=result_id,
            assessment_id=result_assessment_id,
            assessment_type=assessment_type_str,
            scores=result_data,  # result_data contains the scores
            insights=None,  # Database doesn't have insights column
            recommendations=None,  # Database doesn't have recommendations column
            comparison_data=None,  # Database doesn't have comparison_data column
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
            
            # Validate role
            try:
                evaluator_role = EvaluatorRole(evaluator_data.role.upper())
            except ValueError as e:
                logger.error(f"Invalid evaluator role: {evaluator_data.role}. Error: {e}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid evaluator role: {evaluator_data.role}. Must be one of: PEER, MANAGER, DIRECT_REPORT, STAKEHOLDER"
                )
            
            # Create evaluator record
            # Use raw SQL to avoid SQLAlchemy schema cache issues after migration
            try:
                from sqlalchemy import text
                
                # Insert using raw SQL to bypass SQLAlchemy schema cache
                # invitation_sent_at will be updated after email is sent successfully
                insert_result = await db.execute(
                    text("""
                        INSERT INTO assessment_360_evaluators 
                        (assessment_id, evaluator_name, evaluator_email, evaluator_role, invitation_token, 
                         invitation_sent_at, invitation_opened_at, started_at, completed_at, status, evaluator_assessment_id)
                        VALUES 
                        (:assessment_id, :evaluator_name, :evaluator_email, :evaluator_role::evaluatorrole, :invitation_token,
                         NULL, NULL, NULL, NULL, 'NOT_STARTED'::assessmentstatus, NULL)
                        RETURNING id, created_at, updated_at
                    """),
                    {
                        "assessment_id": self_assessment.id,
                        "evaluator_name": evaluator_data.name,
                        "evaluator_email": evaluator_data.email,
                        "evaluator_role": evaluator_role.value,  # Use .value to get the string value
                        "invitation_token": invitation_token
                    }
                )
                evaluator_row = insert_result.first()
                evaluator_id = evaluator_row[0] if evaluator_row else None
                logger.debug(f"Added evaluator {evaluator_data.email} (ID: {evaluator_id}) to database for assessment {self_assessment.id}")
            except Exception as add_error:
                error_type = type(add_error).__name__
                error_message = str(add_error)
                logger.error(
                    f"Error creating evaluator record for {evaluator_data.email}: {error_type}: {error_message}",
                    exc_info=True,
                    extra={
                        "user_id": current_user.id,
                        "assessment_id": self_assessment.id,
                        "evaluator_email": evaluator_data.email,
                        "error_type": error_type
                    }
                )
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
        
        # Commit all changes to database
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
            logger.error(
                f"❌ DATABASE ERROR committing 360 feedback assessment: {error_type}: {error_message}",
                exc_info=True
            )
            logger.error(
                f"   User ID: {current_user.id}, Assessment ID: {self_assessment.id if hasattr(self_assessment, 'id') else 'N/A'}, Evaluators: {len(invited_evaluators)}"
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save 360 feedback assessment to database: {error_type}: {error_message}"
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
        logger.error(
            f"Error in start_360_feedback: {error_type}: {error_message}",
            exc_info=True,
            extra={
                "user_id": current_user.id,
                "evaluators_count": len(request.evaluators) if request.evaluators else 0,
                "error_type": error_type
            }
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
    invited_evaluators = []
    
    for evaluator_data in request.evaluators:
        # Generate unique token
        invitation_token = secrets.token_urlsafe(32)
        
        evaluator = Assessment360Evaluator(
            assessment_id=assessment_id,
            evaluator_name=evaluator_data.name,
            evaluator_email=evaluator_data.email,
            evaluator_role=EvaluatorRole(evaluator_data.role.upper()),
            invitation_token=invitation_token,
            status=AssessmentStatus.NOT_STARTED
        )
        db.add(evaluator)
        
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
                evaluator.invitation_sent_at = datetime.utcnow()
                logger.info(f"Sent 360 evaluator invitation email to {evaluator_data.email}")
            else:
                logger.warning(f"Email service not configured, skipping email to {evaluator_data.email}")
        except Exception as e:
            logger.error(f"Failed to send invitation email to {evaluator_data.email}: {e}", exc_info=True)
        
        invited_evaluators.append({
            "name": evaluator_data.name,
            "email": evaluator_data.email,
            "role": evaluator_data.role
        })
    
    await db.commit()
    
    return {
        "message": f"Invited {len(invited_evaluators)} evaluators successfully",
        "evaluators": invited_evaluators
    }


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
    answers: List[Dict[str, Any]] = Body(..., description="List of answers with question_id and answer_value"),
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
        for answer_data in answers:
            question_id = answer_data.get("question_id")
            answer_value = str(answer_data.get("answer_value"))
            
            if not question_id or not answer_value:
                continue
            
            # Check if answer already exists
            result = await db.execute(
                select(AssessmentAnswer)
                .where(
                    AssessmentAnswer.assessment_id == evaluator_assessment.id,
                    AssessmentAnswer.question_id == question_id
                )
            )
            existing_answer = result.scalar_one_or_none()
            
            if existing_answer:
                existing_answer.answer_value = answer_value
            else:
                new_answer = AssessmentAnswer(
                    assessment_id=evaluator_assessment.id,
                    question_id=question_id,
                    answer_value=answer_value
                )
                db.add(new_answer)
        
        await db.flush()
        
        # Get all answers for scoring
        result = await db.execute(
            select(AssessmentAnswer)
            .where(AssessmentAnswer.assessment_id == evaluator_assessment.id)
        )
        all_answers = result.scalars().all()
        
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
        logger.error(f"Error submitting evaluator assessment: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit evaluation: {str(e)}"
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
