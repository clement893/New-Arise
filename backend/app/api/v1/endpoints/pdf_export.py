"""
PDF Export Endpoints

Endpoints pour exporter les résultats d'assessments en PDF.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import secrets
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.assessment import Assessment, AssessmentResult
from app.services.pdf_export_service import generate_assessment_pdf

router = APIRouter()


@router.get("/{assessment_id}/pdf")
async def export_assessment_pdf(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exporte les résultats d'un assessment en PDF.
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
    
    # Récupérer les résultats
    result = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == assessment_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not found. Please complete the assessment first."
        )
    
    # Préparer les données pour le PDF
    results_data = {
        'scores': result.scores,
        'insights': result.insights,
        'recommendations': result.recommendations,
    }
    
    try:
        # Générer le PDF
        pdf_bytes = generate_assessment_pdf(
            assessment_type=assessment.type.value,
            results=results_data,
            user_name=current_user.full_name,
            user_email=current_user.email
        )
        
        # Nom du fichier
        filename = f"{assessment.type.value}_report_{assessment_id}.pdf"
        
        # Retourner le PDF
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation is not available. WeasyPrint is not installed."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )


@router.post("/{assessment_id}/share-link")
async def create_pdf_share_link(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crée un lien partageable pour le PDF d'un assessment.
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
    
    # Vérifier que les résultats existent
    result = db.query(AssessmentResult).filter(
        AssessmentResult.assessment_id == assessment_id
    ).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Results not found. Please complete the assessment first."
        )
    
    # Générer un token unique pour le partage
    share_token = secrets.token_urlsafe(32)
    
    # Stocker le token dans la base de données (dans assessment_results ou créer une table dédiée)
    # Pour l'instant, on va stocker dans report_url ou créer un champ share_token
    # Utilisons report_url pour stocker le token temporairement
    try:
        db.execute(
            text("""
                UPDATE assessment_results 
                SET report_url = :share_token, updated_at = NOW()
                WHERE assessment_id = :assessment_id
            """),
            {
                "share_token": share_token,
                "assessment_id": assessment_id
            }
        )
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create share link: {str(e)}"
        )
    
    # Construire l'URL du lien partageable
    # L'URL sera de la forme: {API_URL}/api/v1/pdf-export/share/{token}
    import os
    api_url = os.getenv("API_URL", os.getenv("BASE_URL", "http://localhost:8000"))
    if not api_url:
        # Fallback: construire depuis BASE_URL ou utiliser localhost
        api_url = "http://localhost:8000"
    share_url = f"{api_url}/api/v1/pdf-export/share/{share_token}"
    
    return {
        "share_token": share_token,
        "share_url": share_url,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    }


@router.get("/share/{token}")
async def get_shared_pdf(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Récupère le PDF d'un assessment via un token de partage (endpoint public).
    """
    # Trouver le résultat par token
    result_row = db.execute(
        text("""
            SELECT ar.id, ar.assessment_id, ar.user_id, ar.scores, ar.insights, ar.recommendations,
                   a.type as assessment_type
            FROM assessment_results ar
            JOIN assessments a ON a.id = ar.assessment_id
            WHERE ar.report_url = :token
        """),
        {"token": token}
    ).fetchone()
    
    if not result_row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired share link"
        )
    
    assessment_id = result_row.assessment_id
    user_id = result_row.user_id
    assessment_type = result_row.assessment_type
    
    # Récupérer l'utilisateur pour le nom et email
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Préparer les données pour le PDF
    scores = result_row.scores if isinstance(result_row.scores, dict) else {}
    insights = result_row.insights if isinstance(result_row.insights, dict) else {}
    recommendations = result_row.recommendations if isinstance(result_row.recommendations, (dict, list)) else {}
    
    results_data = {
        'scores': scores,
        'insights': insights,
        'recommendations': recommendations,
    }
    
    try:
        # Générer le PDF
        pdf_bytes = generate_assessment_pdf(
            assessment_type=assessment_type,
            results=results_data,
            user_name=user.full_name,
            user_email=user.email
        )
        
        # Nom du fichier
        filename = f"{assessment_type}_report_{assessment_id}.pdf"
        
        # Retourner le PDF
        return StreamingResponse(
            pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename={filename}"
            }
        )
        
    except ImportError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="PDF generation is not available. WeasyPrint is not installed."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {str(e)}"
        )
