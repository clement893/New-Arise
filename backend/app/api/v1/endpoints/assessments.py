"""
Assessments API Endpoints
ARISE Leadership Assessment Tool
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

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


class Evaluator360InviteRequest(BaseModel):
    """Request to invite 360 evaluators"""
    evaluators: List[Dict[str, str]] = Field(
        ...,
        description="List of evaluators with name, email, and role"
    )
    # Example: [{"name": "John Doe", "email": "john@example.com", "role": "peer"}]


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
        
        response.append(AssessmentListItem(
            id=assessment.id,
            assessment_type=assessment.assessment_type.value,
            status=assessment.status.value,
            started_at=assessment.started_at,
            completed_at=assessment.completed_at,
            score_summary=score_summary
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
    """
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
        existing_answer.answer_value = request.answer_value
        existing_answer.answered_at = datetime.utcnow()
    else:
        # Create new answer
        new_answer = AssessmentAnswer(
            assessment_id=assessment_id,
            question_id=request.question_id,
            answer_value=request.answer_value
        )
        db.add(new_answer)
    
    await db.commit()
    
    return {
        "message": "Answer saved successfully",
        "question_id": request.question_id
    }


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
    assessment_result = AssessmentResult(
        assessment_id=assessment.id,
        user_id=current_user.id,
        scores=scores,
        insights=None,  # Will be generated later
        recommendations=None  # Will be generated later
    )
    db.add(assessment_result)
    
    await db.commit()
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
    # Get assessment result
    result = await db.execute(
        select(AssessmentResult)
        .join(Assessment, AssessmentResult.assessment_id == Assessment.id)
        .where(
            AssessmentResult.assessment_id == assessment_id,
            Assessment.user_id == current_user.id
        )
    )
    assessment_result = result.scalar_one_or_none()
    
    if not assessment_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment results not found"
        )
    
    # Get assessment type
    result = await db.execute(
        select(Assessment.assessment_type)
        .where(Assessment.id == assessment_id)
    )
    assessment_type = result.scalar_one()
    
    # Convert assessment_type to string if it's an enum
    assessment_type_str = assessment_type if isinstance(assessment_type, str) else assessment_type.value
    
    return AssessmentResultResponse(
        id=assessment_result.id,
        assessment_id=assessment_result.assessment_id,
        assessment_type=assessment_type_str,
        scores=assessment_result.scores,
        insights=assessment_result.insights,
        recommendations=assessment_result.recommendations,
        comparison_data=assessment_result.comparison_data,
        generated_at=assessment_result.generated_at
    )


@router.post("/{assessment_id}/360/invite-evaluators")
async def invite_360_evaluators(
    assessment_id: int,
    request: Evaluator360InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite evaluators for a 360 assessment
    """
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
    
    # Create evaluator invitations
    import secrets
    invited_evaluators = []
    
    for evaluator_data in request.evaluators:
        # Generate unique token
        invitation_token = secrets.token_urlsafe(32)
        
        evaluator = Assessment360Evaluator(
            assessment_id=assessment_id,
            evaluator_name=evaluator_data["name"],
            evaluator_email=evaluator_data["email"],
            evaluator_role=EvaluatorRole(evaluator_data["role"]),
            invitation_token=invitation_token,
            status=AssessmentStatus.NOT_STARTED
        )
        db.add(evaluator)
        invited_evaluators.append({
            "name": evaluator_data["name"],
            "email": evaluator_data["email"],
            "role": evaluator_data["role"]
        })
    
    await db.commit()
    
    # TODO: Send invitation emails
    
    return {
        "message": f"Invited {len(invited_evaluators)} evaluators successfully",
        "evaluators": invited_evaluators
    }


@router.get("/360-evaluator/{token}")
async def get_360_evaluator_assessment(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get 360 evaluator assessment by invitation token (public endpoint)
    """
    result = await db.execute(
        select(Assessment360Evaluator)
        .where(Assessment360Evaluator.invitation_token == token)
    )
    evaluator = result.scalar_one_or_none()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invitation token"
        )
    
    # Mark invitation as opened
    if not evaluator.invitation_opened_at:
        evaluator.invitation_opened_at = datetime.utcnow()
        await db.commit()
    
    return {
        "evaluator_name": evaluator.evaluator_name,
        "evaluator_role": evaluator.evaluator_role.value,
        "status": evaluator.status.value,
        "assessment_id": evaluator.evaluator_assessment_id
    }


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
