"""
Assessment Models

Modèles de base de données pour le système d'assessments ARISE.

Tables:
- assessments: Assessments créés par les utilisateurs
- assessment_responses: Réponses aux questions d'assessment
- assessment_results: Résultats calculés des assessments
- evaluators: Évaluateurs pour le 360° Feedback (Phase 3)
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum, JSON, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.base import Base


# ============================================================================
# ENUMS
# ============================================================================

class AssessmentType(str, enum.Enum):
    """Types d'assessments disponibles"""
    TKI = "TKI"  # Thomas-Kilmann Conflict Mode Instrument
    WELLNESS = "WELLNESS"  # Wellness Assessment
    THREE_SIXTY_SELF = "THREE_SIXTY_SELF"  # 360° Feedback (Self-assessment)
    THREE_SIXTY_EVALUATOR = "THREE_SIXTY_EVALUATOR"  # 360° Feedback (Evaluator)
    MBTI = "MBTI"  # Myers-Briggs Type Indicator (Phase 3)


class AssessmentStatus(str, enum.Enum):
    """Statuts possibles d'un assessment"""
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"


class EvaluatorRole(str, enum.Enum):
    """Rôles des évaluateurs pour le 360° (Phase 3)"""
    MANAGER = "MANAGER"
    PEER = "PEER"
    DIRECT_REPORT = "DIRECT_REPORT"
    OTHER = "OTHER"


class EvaluatorStatus(str, enum.Enum):
    """Statuts des évaluateurs (Phase 3)"""
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    EXPIRED = "EXPIRED"


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
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(SQLEnum(AssessmentType), nullable=False, index=True)
    status = Column(SQLEnum(AssessmentStatus), default=AssessmentStatus.NOT_STARTED, nullable=False)
    
    # Métadonnées
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Données additionnelles (JSON flexible)
    metadata = Column(JSON, default={})
    
    # Relations
    responses = relationship("AssessmentResponse", back_populates="assessment", cascade="all, delete-orphan")
    result = relationship("AssessmentResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")
    evaluators = relationship("Evaluator", back_populates="assessment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Assessment(id={self.id}, type={self.type}, status={self.status}, user_id={self.user_id})>"


class AssessmentResponse(Base):
    """
    Modèle pour les réponses aux questions d'assessment.
    
    Chaque réponse est liée à un assessment et contient les données
    de la réponse dans un format JSON flexible.
    """
    __tablename__ = "assessment_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    question_id = Column(String(50), nullable=False)  # ID de la question (ex: "q1", "q2")
    
    # Données de la réponse (JSON flexible pour différents types de questions)
    # Exemples:
    # TKI: {"selected_mode": "competing"}
    # Wellness: {"pillar": "sleep", "score": 4}
    # 360°: {"capability": "communication", "score": 5}
    # MBTI: {"dimension": "EI", "score": 4, "direction": "positive"}
    response_data = Column(JSON, nullable=False)
    
    # Métadonnées
    answered_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relations
    assessment = relationship("Assessment", back_populates="responses")
    
    def __repr__(self):
        return f"<AssessmentResponse(id={self.id}, assessment_id={self.assessment_id}, question_id={self.question_id})>"


class AssessmentResult(Base):
    """
    Modèle pour les résultats calculés des assessments.
    
    Stocke les scores, interprétations, et recommandations générées
    par les services d'analyse.
    """
    __tablename__ = "assessment_results"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, unique=True, index=True)
    
    # Scores calculés (JSON)
    # Exemples:
    # TKI: {"scores": {"competing": 8, "collaborating": 10, ...}, "dominant_mode": "collaborating"}
    # Wellness: {"scores": {"sleep": 20, "nutrition": 18, ...}, "total": 115, "percentage": 76.7}
    # 360°: {"scores": {"communication": 20, "team_culture": 18, ...}, "total": 117}
    # MBTI: {"type": "INTJ", "dimensions": {"EI": 15, "SN": -10, ...}}
    scores = Column(JSON, nullable=False)
    
    # Interprétations détaillées (JSON)
    # Contient les textes d'interprétation pour chaque dimension/mode/pillar
    insights = Column(JSON, default={})
    
    # Recommandations personnalisées (JSON)
    # Liste de recommandations avec actions concrètes
    recommendations = Column(JSON, default=[])
    
    # Comparaison self vs others pour 360° (Phase 3)
    comparison = Column(JSON, default={})
    
    # Métadonnées
    calculated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relations
    assessment = relationship("Assessment", back_populates="result")
    
    def __repr__(self):
        return f"<AssessmentResult(id={self.id}, assessment_id={self.assessment_id})>"


class Evaluator(Base):
    """
    Modèle pour les évaluateurs du 360° Feedback (Phase 3).
    
    Permet d'inviter des évaluateurs externes (managers, pairs, direct reports)
    à évaluer un utilisateur dans le cadre d'un 360° Feedback.
    """
    __tablename__ = "evaluators"
    
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False, index=True)
    
    # Informations de l'évaluateur
    email = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(SQLEnum(EvaluatorRole), nullable=False)
    
    # Token unique pour l'accès à l'évaluation
    token = Column(String(255), unique=True, nullable=False, index=True)
    
    # Statut
    status = Column(SQLEnum(EvaluatorStatus), default=EvaluatorStatus.PENDING, nullable=False)
    
    # Métadonnées
    invited_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Expiration du token (ex: 30 jours)
    
    # ID de l'assessment de l'évaluateur (créé quand il répond)
    evaluator_assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=True)
    
    # Relations
    assessment = relationship("Assessment", back_populates="evaluators", foreign_keys=[assessment_id])
    
    def __repr__(self):
        return f"<Evaluator(id={self.id}, email={self.email}, role={self.role}, status={self.status})>"


# ============================================================================
# NOTES POUR CURSOR
# ============================================================================

"""
NOTES POUR CURSOR - MODÈLES D'ASSESSMENT

1. STRUCTURE DES DONNÉES:
   - assessments: Table principale, un record par assessment
   - assessment_responses: Réponses aux questions, format JSON flexible
   - assessment_results: Résultats calculés, scores et interprétations
   - evaluators: Évaluateurs pour le 360° (Phase 3)

2. ENUMS:
   - AssessmentType: TKI, WELLNESS, THREE_SIXTY_SELF, THREE_SIXTY_EVALUATOR, MBTI
   - AssessmentStatus: NOT_STARTED, IN_PROGRESS, COMPLETED, ARCHIVED
   - EvaluatorRole: MANAGER, PEER, DIRECT_REPORT, OTHER
   - EvaluatorStatus: PENDING, COMPLETED, EXPIRED

3. FORMAT JSON DES RÉPONSES (response_data):
   TKI:
   {
       "selected_mode": "competing" | "collaborating" | "compromising" | "avoiding" | "accommodating"
   }
   
   Wellness:
   {
       "pillar": "sleep" | "nutrition" | "hydration" | "movement" | "stress_management" | "social_connection",
       "score": 1-5
   }
   
   360° Feedback:
   {
       "capability": "communication" | "team_culture" | "accountability" | "talent_development" | "execution" | "strategic_thinking",
       "score": 1-5
   }
   
   MBTI (Phase 3):
   {
       "dimension": "EI" | "SN" | "TF" | "JP",
       "score": 1-5,
       "direction": "positive" | "negative"
   }

4. FORMAT JSON DES SCORES (scores):
   TKI:
   {
       "scores": {
           "competing": 8,
           "collaborating": 10,
           "compromising": 6,
           "avoiding": 3,
           "accommodating": 3
       },
       "dominant_mode": "collaborating",
       "total": 30
   }
   
   Wellness:
   {
       "scores": {
           "sleep": 20,
           "nutrition": 18,
           "hydration": 22,
           "movement": 15,
           "stress_management": 19,
           "social_connection": 21
       },
       "total": 115,
       "average": 19.2,
       "percentage": 76.7
   }
   
   360° Feedback:
   {
       "scores": {
           "communication": 20,
           "team_culture": 18,
           "accountability": 22,
           "talent_development": 15,
           "execution": 23,
           "strategic_thinking": 19
       },
       "total": 117,
       "average": 19.5,
       "percentage": 78.0
   }

5. MIGRATIONS:
   Pour créer les tables, exécuter:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Add assessment models"
   alembic upgrade head
   ```

6. UTILISATION DANS LES SERVICES:
   ```python
   from app.models.assessment import Assessment, AssessmentResponse, AssessmentResult
   from app.services.tki_service import analyze_tki_assessment
   
   # Analyser un assessment TKI
   result = analyze_tki_assessment(assessment_id=1, db=db)
   ```

7. PROCHAINES ÉTAPES:
   - Créer les endpoints API (assessments.py)
   - Créer les schémas Pydantic (schemas/assessment.py)
   - Créer les pages frontend de résultats
   - Implémenter le système d'évaluateurs (Phase 3)
"""
