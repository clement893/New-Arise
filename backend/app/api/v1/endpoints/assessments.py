"""
Assessment API Endpoints

Endpoints pour gérer les assessments ARISE (TKI, Wellness, 360°, MBTI).

Routes:
- POST /start: Démarrer un nouvel assessment
- POST /{id}/responses: Sauvegarder une réponse
- POST /{id}/submit: Soumettre un assessment complété
- GET /{id}/results: Récupérer les résultats
- GET /user/assessments: Liste des assessments de l'utilisateur
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.models.assessment import (
    Assessment,
    AssessmentResponse,
    AssessmentResult,
    AssessmentType,
    AssessmentStatus
)
from app.services import tki_service, feedback360_service, wellness_service
from app.core.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter()


# ============================================================================
# SCHEMAS PYDANTIC
# ============================================================================

class StartAssessmentRequest(BaseModel):
    """Requête pour démarrer un assessment"""
    type: str  # "TKI", "WELLNESS", "THREE_SIXTY_SELF", "MBTI"


class SaveResponseRequest(BaseModel):
    """Requête pour sauvegarder une réponse"""
    question_id: str
    response_data: dict


class AssessmentResponse(BaseModel):
    """Réponse d'un assessment"""
    id: int
    user_id: int
    type: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class AssessmentResultResponse(BaseModel):
    """Réponse avec les résultats d'un assessment"""
    assessment: dict
    results: dict


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.post("/start", status_code=status.HTTP_201_CREATED)
async def start_assessment(
    request: StartAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Démarre un nouvel assessment.

    Args:
        request: Type d'assessment à démarrer
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Assessment créé avec status NOT_STARTED

    Raises:
        HTTPException 400: Type d'assessment invalide
    """
    # Valider le type d'assessment
    try:
        assessment_type = AssessmentType(request.type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid assessment type. Must be one of: {[t.value for t in AssessmentType]}"
        )

    # Créer l'assessment
    assessment = Assessment(
        user_id=current_user.id,
        type=assessment_type,
        status=AssessmentStatus.NOT_STARTED
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "id": assessment.id,
        "type": assessment.type.value,
        "status": assessment.status.value,
        "created_at": assessment.created_at,
        "message": "Assessment started successfully"
    }


@router.post("/{assessment_id}/responses", status_code=status.HTTP_200_OK)
async def save_response(
    assessment_id: int,
    request: SaveResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sauvegarde une réponse à une question d'assessment.

    Args:
        assessment_id: ID de l'assessment
        request: Question ID et données de réponse
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Message de confirmation

    Raises:
        HTTPException 404: Assessment non trouvé
        HTTPException 403: Assessment n'appartient pas à l'utilisateur
        HTTPException 400: Assessment déjà complété
    """
    # Vérifier que l'assessment existe et appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    if assessment.status == AssessmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a completed assessment"
        )

    # Créer ou mettre à jour la réponse
    response = db.query(AssessmentResponse).filter(
        AssessmentResponse.assessment_id == assessment_id,
        AssessmentResponse.question_id == request.question_id
    ).first()

    if response:
        # Mettre à jour la réponse existante
        response.response_data = request.response_data
        response.answered_at = datetime.utcnow()
    else:
        # Créer une nouvelle réponse
        response = AssessmentResponse(
            assessment_id=assessment_id,
            question_id=request.question_id,
            response_data=request.response_data
        )
        db.add(response)

    # Mettre à jour le statut de l'assessment à IN_PROGRESS
    if assessment.status == AssessmentStatus.NOT_STARTED:
        assessment.status = AssessmentStatus.IN_PROGRESS
        assessment.started_at = datetime.utcnow()

    assessment.updated_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Response saved successfully",
        "question_id": request.question_id
    }


@router.post("/{assessment_id}/submit", status_code=status.HTTP_200_OK)
async def submit_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Soumet un assessment complété et calcule les résultats.

    Cette fonction:
    1. Vérifie que toutes les questions sont répondues
    2. Calcule les scores selon le type d'assessment
    3. Génère les interprétations
    4. Génère les recommandations
    5. Stocke les résultats dans assessment_results
    6. Met à jour le status à COMPLETED

    Args:
        assessment_id: ID de l'assessment
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Résultats calculés de l'assessment

    Raises:
        HTTPException 404: Assessment non trouvé
        HTTPException 403: Assessment n'appartient pas à l'utilisateur
        HTTPException 400: Questions manquantes ou assessment déjà complété
    """
    # Vérifier que l'assessment existe et appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    if assessment.status == AssessmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment already completed"
        )

    # Vérifier que toutes les questions sont répondues
    responses_count = db.query(AssessmentResponse).filter(
        AssessmentResponse.assessment_id == assessment_id
    ).count()

    # Nombre de questions attendues par type
    expected_count = {
        AssessmentType.TKI: 30,
        AssessmentType.WELLNESS: 30,
        AssessmentType.THREE_SIXTY_SELF: 30,
        AssessmentType.MBTI: 60
    }

    expected = expected_count.get(assessment.type, 30)

    if responses_count < expected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not all questions answered. Expected {expected}, got {responses_count}"
        )

    # Calculer les résultats selon le type d'assessment
    try:
        if assessment.type == AssessmentType.TKI:
            result = tki_service.analyze_tki_assessment(assessment_id, db)
        elif assessment.type == AssessmentType.WELLNESS:
            result = wellness_service.analyze_wellness_assessment(assessment_id, db)
        elif assessment.type == AssessmentType.THREE_SIXTY_SELF:
            result = feedback360_service.analyze_360_assessment(assessment_id, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Assessment type {assessment.type} not yet supported"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating results: {str(e)}"
        )

    # Mettre à jour le statut de l'assessment
    assessment.status = AssessmentStatus.COMPLETED
    assessment.completed_at = datetime.utcnow()
    assessment.updated_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Assessment submitted successfully",
        "assessment_id": assessment_id,
        "results": result
    }


@router.get("/{assessment_id}/results", status_code=status.HTTP_200_OK)
async def get_assessment_results(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère les résultats d'un assessment complété.

    Args:
        assessment_id: ID de l'assessment
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Assessment et résultats calculés

    Raises:
        HTTPException 404: Assessment ou résultats non trouvés
        HTTPException 403: Assessment n'appartient pas à l'utilisateur
        HTTPException 400: Assessment pas encore complété
    """
    # Vérifier que l'assessment existe et appartient à l'utilisateur
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    if assessment.status != AssessmentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assessment not completed yet. Please submit the assessment first."
        )

    # Récupérer les résultats
    result = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == assessment_id
    ).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not found. Please try submitting the assessment again."
        )

    return {
        "assessment": {
            "id": assessment.id,
            "type": assessment.type.value,
            "status": assessment.status.value,
            "started_at": assessment.started_at,
            "completed_at": assessment.completed_at,
            "created_at": assessment.created_at
        },
        "results": {
            "scores": result.scores,
            "insights": result.insights,
            "recommendations": result.recommendations,
            "comparison": result.comparison if result.comparison else None
        }
    }


@router.get("/user/assessments", status_code=status.HTTP_200_OK)
async def get_user_assessments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    type: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Récupère tous les assessments de l'utilisateur.

    Args:
        current_user: Utilisateur authentifié
        db: Session de base de données
        type: Filtrer par type d'assessment (optionnel)
        status: Filtrer par statut (optionnel)

    Returns:
        Liste des assessments de l'utilisateur
    """
    query = db.query(Assessment).filter(
        Assessment.user_id == current_user.id
    )

    # Filtrer par type si spécifié
    if type:
        try:
            assessment_type = AssessmentType(type)
            query = query.filter(Assessment.type == assessment_type)
        except ValueError:
            pass  # Ignorer les types invalides

    # Filtrer par statut si spécifié
    if status:
        try:
            assessment_status = AssessmentStatus(status)
            query = query.filter(Assessment.status == assessment_status)
        except ValueError:
            pass  # Ignorer les statuts invalides

    assessments = query.order_by(Assessment.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "type": a.type.value,
            "status": a.status.value,
            "started_at": a.started_at,
            "completed_at": a.completed_at,
            "created_at": a.created_at
        }
        for a in assessments
    ]


@router.get("/{assessment_id}", status_code=status.HTTP_200_OK)
async def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Récupère les détails d'un assessment.

    Args:
        assessment_id: ID de l'assessment
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Détails de l'assessment

    Raises:
        HTTPException 404: Assessment non trouvé
        HTTPException 403: Assessment n'appartient pas à l'utilisateur
    """
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    # Compter les réponses
    responses_count = db.query(AssessmentResponse).filter(
        AssessmentResponse.assessment_id == assessment_id
    ).count()

    # Nombre de questions attendues
    expected_count = {
        AssessmentType.TKI: 30,
        AssessmentType.WELLNESS: 30,
        AssessmentType.THREE_SIXTY_SELF: 30,
        AssessmentType.MBTI: 60
    }

    return {
        "id": assessment.id,
        "type": assessment.type.value,
        "status": assessment.status.value,
        "started_at": assessment.started_at,
        "completed_at": assessment.completed_at,
        "created_at": assessment.created_at,
        "progress": {
            "answered": responses_count,
            "total": expected_count.get(assessment.type, 30),
            "percentage": (responses_count / expected_count.get(assessment.type, 30)) * 100
        }
    }


@router.delete("/{assessment_id}", status_code=status.HTTP_200_OK)
async def delete_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Supprime un assessment.

    Args:
        assessment_id: ID de l'assessment
        current_user: Utilisateur authentifié
        db: Session de base de données

    Returns:
        Message de confirmation

    Raises:
        HTTPException 404: Assessment non trouvé
        HTTPException 403: Assessment n'appartient pas à l'utilisateur
    """
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.user_id == current_user.id
    ).first()

    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    db.delete(assessment)
    db.commit()

    return {
        "message": "Assessment deleted successfully",
        "assessment_id": assessment_id
    }


# ============================================================================
# NOTES POUR CURSOR
# ============================================================================

"""
NOTES POUR CURSOR - ENDPOINTS ASSESSMENTS

1. ROUTES DISPONIBLES:
   - POST /api/v1/assessments/start: Démarrer un assessment
   - POST /api/v1/assessments/{id}/responses: Sauvegarder une réponse
   - POST /api/v1/assessments/{id}/submit: Soumettre et calculer
   - GET /api/v1/assessments/{id}/results: Récupérer les résultats
   - GET /api/v1/assessments/user/assessments: Liste des assessments
   - GET /api/v1/assessments/{id}: Détails d'un assessment
   - DELETE /api/v1/assessments/{id}: Supprimer un assessment

2. AUTHENTIFICATION:
   Tous les endpoints nécessitent un utilisateur authentifié (Bearer token).

3. WORKFLOW TYPIQUE:
   1. POST /start avec {"type": "TKI"}
   2. POST /{id}/responses pour chaque question
   3. POST /{id}/submit quand toutes les questions sont répondues
   4. GET /{id}/results pour afficher les résultats

4. GESTION DES ERREURS:
   - 400: Données invalides ou assessment pas prêt
   - 403: Accès non autorisé
   - 404: Assessment ou résultats non trouvés
   - 500: Erreur serveur lors du calcul

5. INTÉGRATION AVEC LES SERVICES:
   - tki_service.analyze_tki_assessment()
   - wellness_service.analyze_wellness_assessment()
   - feedback360_service.analyze_360_assessment()

6. ENREGISTREMENT DANS LE ROUTER:
   Dans backend/app/api/v1/api.py:
   ```python
   from app.api.v1.endpoints import assessments

   api_router.include_router(
       assessments.router,
       prefix="/assessments",
       tags=["assessments"]
   )
   ```

7. TESTS:
   ```bash
   # Démarrer un assessment
   curl -X POST http://localhost:8000/api/v1/assessments/start \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type": "TKI"}'

   # Sauvegarder une réponse
   curl -X POST http://localhost:8000/api/v1/assessments/1/responses \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"question_id": "q1", "response_data": {"selected_mode": "competing"}}'

   # Soumettre
   curl -X POST http://localhost:8000/api/v1/assessments/1/submit \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Récupérer les résultats
   curl http://localhost:8000/api/v1/assessments/1/results \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
"""


