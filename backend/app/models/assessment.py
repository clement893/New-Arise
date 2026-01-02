"""
Assessment Models

Modèles de base de données pour le système d'assessments ARISE.
Adaptés à la structure de la migration 029.

Tables:
- assessments: Assessments créés par les utilisateurs
- assessment_answers: Réponses aux questions d'assessment
- assessment_results: Résultats calculés des assessments
- assessment_360_evaluators: Évaluateurs pour le 360° Feedback
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Boolean
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class AssessmentType(str, enum.Enum):
    """Types d'assessments disponibles"""
    MBTI = "mbti"
    TKI = "tki"
    WELLNESS = "wellness"
    THREE_SIXTY_SELF = "360_self"
    THREE_SIXTY_EVALUATOR = "360_evaluator"


class AssessmentStatus(str, enum.Enum):
    """Statuts possibles d'un assessment"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class EvaluatorRole(str, enum.Enum):
    """Rôles des évaluateurs pour le 360°"""
    PEER = "peer"
    MANAGER = "manager"
    DIRECT_REPORT = "direct_report"
    STAKEHOLDER = "stakeholder"


# ============================================================================
# MODELS
# ============================================================================

class Assessment(Base):
    """
    Modèle pour les assessments.

    Un assessment représente une instance d'évaluation pour un utilisateur.
    Chaque assessment a un type (TKI, Wellness, 360°, MBTI) et un statut.
    """
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type = Column(SQLEnum(AssessmentType, name='assessmenttype'), nullable=False, index=True)
    status = Column(SQLEnum(AssessmentStatus, name='assessmentstatus'), default=AssessmentStatus.NOT_STARTED, nullable=False, server_default='not_started')

    # Métadonnées temporelles
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')

    # Scores bruts et traités (pour compatibilité)
    raw_score = Column(JSON, nullable=True)
    processed_score = Column(JSON, nullable=True)

    # Relations
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")
    result = relationship("AssessmentResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    evaluators = relationship("Assessment360Evaluator", back_populates="assessment", cascade="all, delete-orphan", foreign_keys="Assessment360Evaluator.assessment_id")

    def __repr__(self):
        return f"<Assessment(id={self.id}, type={self.assessment_type}, status={self.status}, user_id={self.user_id})>"


class AssessmentAnswer(Base):
    """
    Modèle pour les réponses aux questions d'assessment.

    Chaque réponse est liée à un assessment et contient la valeur
    de la réponse (peut être JSON pour des réponses complexes).
    """
    __tablename__ = "assessment_answers"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(100), nullable=False, index=True)
    answer_value = Column(String(500), nullable=False)  # Peut contenir du JSON stringifié
    answered_at = Column(DateTime(timezone=True), nullable=True, server_default='now()')  # Made nullable to handle asyncpg schema cache issues

    # Relations
    assessment = relationship("Assessment", back_populates="answers")

    def __repr__(self):
        return f"<AssessmentAnswer(id={self.id}, assessment_id={self.assessment_id}, question_id={self.question_id})>"


class AssessmentResult(Base):
    """
    Modèle pour les résultats calculés des assessments.

    Stocke les scores, interprétations, et recommandations générées
    par les services d'analyse.
    """
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Scores calculés (JSON)
    # Format:
    # {
    #   "total_score": 115,
    #   "max_score": 150,
    #   "percentage": 76.7,
    #   "mode_scores": {"competing": 8, "collaborating": 10, ...},  # TKI
    #   "pillar_scores": {"sleep": 20, "nutrition": 18, ...},  # Wellness
    #   "capability_scores": {"communication": 20, ...}  # 360°
    # }
    scores = Column(JSON, nullable=False)

    # Interprétations détaillées (JSON)
    # Contient les textes d'interprétation pour chaque dimension/mode/pillar
    insights = Column(JSON, nullable=True)

    # Recommandations personnalisées (JSON)
    # Liste de recommandations avec actions concrètes
    recommendations = Column(JSON, nullable=True)

    # Comparaison self vs others pour 360°
    comparison_data = Column(JSON, nullable=True)

    # Rapport PDF
    report_generated = Column(Boolean, nullable=False, server_default='false')
    report_url = Column(String(500), nullable=True)

    # Métadonnées
    generated_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')

    # Relations
    assessment = relationship("Assessment", back_populates="result")

    def __repr__(self):
        return f"<AssessmentResult(id={self.id}, assessment_id={self.assessment_id})>"


class Assessment360Evaluator(Base):
    """
    Modèle pour les évaluateurs du 360° Feedback.

    Permet d'inviter des évaluateurs externes (managers, pairs, direct reports)
    à évaluer un utilisateur dans le cadre d'un 360° Feedback.
    """
    __tablename__ = "assessment_360_evaluators"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)

    # Informations de l'évaluateur
    evaluator_name = Column(String(200), nullable=False)
    evaluator_email = Column(String(255), nullable=False, index=True)
    evaluator_role = Column(SQLEnum(EvaluatorRole, name='evaluatorrole'), nullable=False)

    # Token unique pour l'accès à l'évaluation
    invitation_token = Column(String(100), unique=True, nullable=False, index=True)

    # Suivi de l'invitation
    invitation_sent_at = Column(DateTime(timezone=True), nullable=True)
    invitation_opened_at = Column(DateTime(timezone=True), nullable=True)

    # Suivi de la complétion
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(AssessmentStatus, name='assessmentstatus'), default=AssessmentStatus.NOT_STARTED, nullable=False, server_default='not_started')

    # ID de l'assessment de l'évaluateur (créé quand il répond)
    evaluator_assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)

    # Métadonnées
    created_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default='now()')

    # Relations
    assessment = relationship("Assessment", back_populates="evaluators", foreign_keys=[assessment_id])

    def __repr__(self):
        return f"<Assessment360Evaluator(id={self.id}, email={self.evaluator_email}, role={self.evaluator_role}, status={self.status})>"


# ============================================================================
# NOTES POUR CURSOR
# ============================================================================

"""
NOTES POUR CURSOR - MODÈLES D'ASSESSMENT

1. STRUCTURE DES DONNÉES:
   - assessments: Table principale, un record par assessment
   - assessment_answers: Réponses aux questions, format string (peut contenir JSON)
   - assessment_results: Résultats calculés, scores et interprétations
   - assessment_360_evaluators: Évaluateurs pour le 360°

2. ENUMS (valeurs en minuscules avec underscores):
   - AssessmentType: "mbti", "tki", "wellness", "360_self", "360_evaluator"
   - AssessmentStatus: "not_started", "in_progress", "completed"
   - EvaluatorRole: "peer", "manager", "direct_report", "stakeholder"

3. FORMAT DES RÉPONSES (answer_value):
   Peut être une string simple ou du JSON stringifié:

   TKI (simple):
   "competing"

   Wellness (JSON):
   '{"pillar": "sleep", "score": 4}'

   360° Feedback (JSON):
   '{"capability": "communication", "score": 5}'

4. FORMAT JSON DES SCORES (scores):
   TKI:
   {
       "total_score": 30,
       "mode_scores": {
           "competing": 8,
           "collaborating": 10,
           "compromising": 6,
           "avoiding": 3,
           "accommodating": 3
       },
       "dominant_mode": "collaborating"
   }

   Wellness:
   {
       "total_score": 115,
       "max_score": 150,
       "percentage": 76.7,
       "pillar_scores": {
           "sleep": 20,
           "nutrition": 18,
           "hydration": 22,
           "movement": 15,
           "stress_management": 19,
           "social_connection": 21
       }
   }

5. UTILISATION DANS LES SERVICES:
   ```python
   from app.models.assessment import Assessment, AssessmentAnswer, AssessmentResult
   from app.services.tki_service import analyze_tki_assessment

   # Analyser un assessment TKI
   result = analyze_tki_assessment(assessment_id=1, db=db)
   ```

6. COMPATIBILITÉ:
   - Les modèles sont maintenant alignés avec la migration 029
   - Les noms de colonnes correspondent exactement à la base de données
   - Les enums utilisent les mêmes valeurs que dans PostgreSQL
"""



