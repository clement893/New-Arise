"""
Evaluators Endpoints

Endpoints pour gérer les évaluateurs 360° feedback:
- Inviter des évaluateurs
- Accéder au questionnaire via token
- Soumettre les réponses
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, EmailStr
import secrets
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.assessment import (
    Assessment,
    AssessmentAnswer,
    Assessment360Evaluator,
    EvaluatorRole,
    EvaluatorStatus,
    AssessmentType
)

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class EvaluatorInvite(BaseModel):
    email: EmailStr
    name: str
    role: str  # 'manager', 'peer', 'direct_report'


class InviteEvaluatorsRequest(BaseModel):
    evaluators: List[EvaluatorInvite]


class EvaluatorResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    status: str
    invited_at: datetime
    completed_at: datetime | None


class EvaluatorAssessmentInfo(BaseModel):
    evaluator_name: str
    participant_name: str
    assessment_type: str
    expires_at: datetime


class SaveEvaluatorAnswerRequest(BaseModel):
    question_id: str
    answer_value: str


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/{assessment_id}/invite-evaluators")
async def invite_evaluators(
    assessment_id: int,
    request: InviteEvaluatorsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Invite des évaluateurs pour un assessment 360°.
    Génère des tokens uniques et envoie des emails d'invitation.
    """
    # Vérifier que l'assessment existe et appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id,
        Assessment.type == AssessmentType.THREE_SIXTY_SELF
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found or not a 360° assessment"
        )
    
    # Créer les évaluateurs
    created_evaluators = []
    for evaluator_data in request.evaluators:
        # Vérifier si l'évaluateur existe déjà
        existing = db.query(Assessment360Evaluator).filter(
            Assessment360Evaluator.assessment_id == assessment_id,
            Assessment360Evaluator.email == evaluator_data.email
        ).first()
        
        if existing:
            continue  # Skip si déjà invité
        
        # Générer un token unique
        token = secrets.token_urlsafe(32)
        
        # Mapper le role string vers l'enum
        role_mapping = {
            'manager': EvaluatorRole.MANAGER,
            'peer': EvaluatorRole.PEER,
            'direct_report': EvaluatorRole.DIRECT_REPORT,
        }
        role = role_mapping.get(evaluator_data.role, EvaluatorRole.PEER)
        
        # Créer l'évaluateur
        evaluator = Assessment360Evaluator(
            assessment_id=assessment_id,
            email=evaluator_data.email,
            name=evaluator_data.name,
            role=role,
            token=token,
            status=EvaluatorStatus.INVITED,
            invited_at=datetime.utcnow(),
            expires_at=datetime.utcnow() + timedelta(days=14)  # 2 semaines
        )
        
        db.add(evaluator)
        created_evaluators.append(evaluator)
    
    db.commit()
    
    # TODO: Envoyer les emails d'invitation
    # Pour chaque évaluateur, envoyer un email avec le lien:
    # https://arise.com/evaluator/{token}
    
    return {
        "message": f"Successfully invited {len(created_evaluators)} evaluators",
        "evaluators": [
            {
                "id": e.id,
                "email": e.email,
                "name": e.name,
                "role": e.role.value,
                "token": e.token,
            }
            for e in created_evaluators
        ]
    }


@router.get("/{assessment_id}/evaluators")
async def get_evaluators(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère la liste des évaluateurs pour un assessment.
    """
    # Vérifier que l'assessment appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    evaluators = db.query(Assessment360Evaluator).filter(
        Assessment360Evaluator.assessment_id == assessment_id
    ).all()
    
    return {
        "evaluators": [
            EvaluatorResponse(
                id=e.id,
                email=e.email,
                name=e.name,
                role=e.role.value,
                status=e.status.value,
                invited_at=e.invited_at,
                completed_at=e.completed_at
            )
            for e in evaluators
        ]
    }


@router.get("/by-token/{token}")
async def get_evaluator_assessment(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Récupère les informations d'un assessment via le token d'évaluateur.
    Endpoint public (pas d'authentification requise).
    """
    evaluator = db.query(Assessment360Evaluator).filter(
        Assessment360Evaluator.token == token
    ).first()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired token"
        )
    
    # Vérifier l'expiration
    if evaluator.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This invitation has expired"
        )
    
    # Vérifier si déjà complété
    if evaluator.status == EvaluatorStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This assessment has already been completed"
        )
    
    # Récupérer l'assessment
    assessment = db.query(Assessment).filter(
        Assessment.id == evaluator.assessment_id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Récupérer le nom du participant
    participant = db.query(User).filter(
        User.id == assessment.user_id
    ).first()
    
    return EvaluatorAssessmentInfo(
        evaluator_name=evaluator.name,
        participant_name=participant.full_name if participant else "Unknown",
        assessment_type=assessment.type.value,
        expires_at=evaluator.expires_at
    )


@router.post("/by-token/{token}/answer")
async def save_evaluator_answer(
    token: str,
    request: SaveEvaluatorAnswerRequest,
    db: Session = Depends(get_db)
):
    """
    Sauvegarde une réponse d'évaluateur.
    Endpoint public (pas d'authentification requise).
    """
    evaluator = db.query(Assessment360Evaluator).filter(
        Assessment360Evaluator.token == token
    ).first()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid token"
        )
    
    # Vérifier l'expiration
    if evaluator.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="This invitation has expired"
        )
    
    # Créer ou mettre à jour la réponse
    existing_answer = db.query(AssessmentAnswer).filter(
        AssessmentAnswer.assessment_id == evaluator.assessment_id,
        AssessmentAnswer.question_id == request.question_id,
        AssessmentAnswer.evaluator_id == evaluator.id
    ).first()
    
    if existing_answer:
        existing_answer.answer_value = request.answer_value
        existing_answer.updated_at = datetime.utcnow()
    else:
        answer = AssessmentAnswer(
            assessment_id=evaluator.assessment_id,
            question_id=request.question_id,
            answer_value=request.answer_value,
            evaluator_id=evaluator.id,
            answered_at=datetime.utcnow()
        )
        db.add(answer)
    
    # Mettre à jour le statut de l'évaluateur
    if evaluator.status == EvaluatorStatus.INVITED:
        evaluator.status = EvaluatorStatus.IN_PROGRESS
    
    db.commit()
    
    return {"message": "Answer saved successfully"}


@router.post("/by-token/{token}/submit")
async def submit_evaluator_assessment(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Soumet l'assessment d'un évaluateur.
    Endpoint public (pas d'authentification requise).
    """
    evaluator = db.query(Assessment360Evaluator).filter(
        Assessment360Evaluator.token == token
    ).first()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid token"
        )
    
    # Vérifier que toutes les questions ont été répondues
    answer_count = db.query(AssessmentAnswer).filter(
        AssessmentAnswer.assessment_id == evaluator.assessment_id,
        AssessmentAnswer.evaluator_id == evaluator.id
    ).count()
    
    # Pour 360° feedback, on attend 30 réponses (6 capabilities x 5 questions)
    if answer_count < 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Please answer all questions. {answer_count}/30 answered."
        )
    
    # Marquer comme complété
    evaluator.status = EvaluatorStatus.COMPLETED
    evaluator.completed_at = datetime.utcnow()
    
    db.commit()
    
    # TODO: Recalculer les résultats de l'assessment principal
    # pour inclure les réponses de cet évaluateur
    
    return {
        "message": "Assessment submitted successfully",
        "completed_at": evaluator.completed_at
    }


@router.delete("/{assessment_id}/evaluators/{evaluator_id}")
async def remove_evaluator(
    assessment_id: int,
    evaluator_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime un évaluateur (annule l'invitation).
    """
    # Vérifier que l'assessment appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    evaluator = db.query(Assessment360Evaluator).filter(
        Assessment360Evaluator.id == evaluator_id,
        Assessment360Evaluator.assessment_id == assessment_id
    ).first()
    
    if not evaluator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evaluator not found"
        )
    
    # Ne pas supprimer si déjà complété
    if evaluator.status == EvaluatorStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove an evaluator who has already completed the assessment"
        )
    
    db.delete(evaluator)
    db.commit()
    
    return {"message": "Evaluator removed successfully"}
