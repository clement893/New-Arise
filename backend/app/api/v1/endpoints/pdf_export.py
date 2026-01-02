"""
PDF Export Endpoints

Endpoints pour exporter les résultats d'assessments en PDF.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

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
