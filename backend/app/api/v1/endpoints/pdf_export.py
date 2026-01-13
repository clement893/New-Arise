"""
PDF Export Endpoints

Endpoints pour exporter les résultats d'assessments en PDF.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import secrets
import os
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.models.assessment import Assessment, AssessmentResult, AssessmentType
from app.services.pdf_export_service import generate_assessment_pdf
from app.services.export_service import ExportService
from app.config.assessment_questions import get_questions_for_type

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


def get_assessment_answers_for_pdf(assessment_id: int, db: Session) -> Dict[str, str]:
    """
    Helper function to get all answers for an assessment (for PDF generation).
    """
    answers_result = db.execute(
        text("""
            SELECT question_id, answer_value
            FROM assessment_answers
            WHERE assessment_id = :assessment_id
            ORDER BY question_id
        """),
        {"assessment_id": assessment_id}
    ).fetchall()
    return {row[0]: row[1] for row in answers_result}


@router.get("/share/{token}")
async def get_shared_pdf(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Récupère le PDF d'un assessment via un token de partage (endpoint public).
    Génère le PDF avec le même format détaillé que le téléchargement direct.
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
    assessment_type_str = result_row.assessment_type
    
    # Récupérer l'utilisateur pour le nom et email
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get assessment type enum
    try:
        assessment_type = AssessmentType(assessment_type_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid assessment type: {assessment_type_str}"
        )
    
    # For wellness assessments, generate detailed PDF with questions/answers
    if assessment_type == AssessmentType.WELLNESS:
        # Get all answers
        answers = get_assessment_answers_for_pdf(assessment_id, db)
        
        # Get questions
        questions = get_questions_for_type(assessment_type)
        
        # Get scores
        scores = result_row.scores if isinstance(result_row.scores, dict) else {}
        pillar_scores = scores.get('pillar_scores', {})
        total_score = scores.get('total_score', 0)
        max_score = scores.get('max_score', 150)
        percentage = scores.get('percentage', 0)
        
        # Prepare summary rows (pillar scores)
        summary_rows: List[Dict[str, str]] = []
        
        # Map pillar IDs to names
        pillar_name_map = {
            'avoidance_of_risky_substances': 'Avoidance of Risky Substances',
            'movement': 'Movement',
            'nutrition': 'Nutrition',
            'sleep': 'Sleep',
            'social_connection': 'Social Connection',
            'stress_management': 'Stress Management',
        }
        
        for pillar_id, pillar_data in pillar_scores.items():
            if isinstance(pillar_data, dict) and 'score' in pillar_data:
                pillar_score = pillar_data['score']
                pillar_percentage = pillar_data.get('percentage', (pillar_score / 25) * 100)
            elif isinstance(pillar_data, (int, float)):
                pillar_score = pillar_data
                pillar_percentage = (pillar_score / 25) * 100
            else:
                continue
            
            pillar_name = pillar_name_map.get(pillar_id, pillar_id.replace('_', ' ').title())
            summary_rows.append({
                'Question': pillar_name,
                'Answer': '',
                'Score': f"{pillar_score} / 25 ({pillar_percentage:.1f}%)",
            })
        
        # Prepare detailed rows (questions with answers)
        detailed_rows: List[Dict[str, str]] = []
        
        # Group questions by pillar
        questions_by_pillar: Dict[str, List[Dict[str, Any]]] = {}
        for q in questions:
            pillar = q.get('pillar', '')
            if pillar not in questions_by_pillar:
                questions_by_pillar[pillar] = []
            questions_by_pillar[pillar].append(q)
        
        # Add questions grouped by pillar
        for pillar, pillar_questions in questions_by_pillar.items():
            for q in pillar_questions:
                question_id = q.get('id', '')
                question_text = q.get('question', '')
                answer_value = answers.get(question_id, '')
                
                # Truncate long question text (max 80 chars)
                truncated_question = question_text[:80] + '...' if len(question_text) > 80 else question_text
                
                # Map answer value to readable text (1-5 scale)
                answer_text = ''
                if answer_value:
                    try:
                        answer_num = int(answer_value)
                        answer_map = {1: 'Strongly Disagree', 2: 'Disagree', 3: 'Neutral', 4: 'Agree', 5: 'Strongly Agree'}
                        answer_text = answer_map.get(answer_num, str(answer_value))
                    except ValueError:
                        answer_text = str(answer_value)
                
                # Calculate score for this answer (1-5 scale, so score = answer value)
                score_text = f"{answer_value}/5" if answer_value else "N/A"
                
                detailed_rows.append({
                    'Question': truncated_question,
                    'Answer': answer_text,
                    'Score': score_text,
                })
        
        # Combine summary and detailed rows
        export_data = summary_rows + detailed_rows
        
        # Create report title with overall score
        report_date = datetime.now().strftime('%B %d, %Y')
        report_title = f"Wellness Assessment Report - {report_date}\nOverall Score: {total_score}/{max_score} ({percentage:.1f}%)"
        
        try:
            # Generate PDF using ExportService (same as frontend)
            pdf_buffer, filename = ExportService.export_to_pdf(
                data=export_data,
                headers=['Question', 'Answer', 'Score'],
                title=report_title
            )
            
            return StreamingResponse(
                pdf_buffer,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f"inline; filename={filename}"
                }
            )
        except ImportError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PDF generation is not available. ReportLab is not installed."
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate PDF: {str(e)}"
            )
    else:
        # For other assessment types, use the old HTML-based PDF generation
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
                assessment_type=assessment_type_str,
                results=results_data,
                user_name=user.full_name,
                user_email=user.email
            )
            
            # Nom du fichier
            filename = f"{assessment_type_str}_report_{assessment_id}.pdf"
            
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
