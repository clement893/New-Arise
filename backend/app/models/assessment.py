"""
Assessment Model
SQLAlchemy model for ARISE assessments
"""

from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, JSON, String, Text, func, Index
from sqlalchemy.orm import relationship

from app.core.database import Base


class AssessmentType(str, PyEnum):
    """Assessment type enum"""
    MBTI = "mbti"
    TKI = "tki"
    WELLNESS = "wellness"
    THREE_SIXTY_SELF = "360_self"
    THREE_SIXTY_EVALUATOR = "360_evaluator"


class AssessmentStatus(str, PyEnum):
    """Assessment status enum"""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class EvaluatorRole(str, PyEnum):
    """360 Evaluator role enum"""
    PEER = "peer"
    MANAGER = "manager"
    DIRECT_REPORT = "direct_report"
    STAKEHOLDER = "stakeholder"


class Assessment(Base):
    """Assessment model"""
    __tablename__ = "assessments"
    __table_args__ = (
        Index("idx_assessments_user_id", "user_id"),
        Index("idx_assessments_type", "assessment_type"),
        Index("idx_assessments_status", "status"),
        Index("idx_assessments_user_type", "user_id", "assessment_type"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assessment_type = Column(Enum(AssessmentType), nullable=False)
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.NOT_STARTED, nullable=False)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Scores and results (JSON structure depends on assessment type)
    raw_score = Column(JSON, nullable=True)  # Raw scores before processing
    processed_score = Column(JSON, nullable=True)  # Processed scores with calculations
    
    # Relationships
    user = relationship("User", backref="assessments")
    answers = relationship("AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan")
    evaluators = relationship("Assessment360Evaluator", back_populates="assessment", cascade="all, delete-orphan")
    result = relationship("AssessmentResult", back_populates="assessment", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Assessment(id={self.id}, user_id={self.user_id}, type={self.assessment_type}, status={self.status})>"


class AssessmentAnswer(Base):
    """Assessment answer model"""
    __tablename__ = "assessment_answers"
    __table_args__ = (
        Index("idx_assessment_answers_assessment_id", "assessment_id"),
        Index("idx_assessment_answers_question_id", "question_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(String(100), nullable=False)  # e.g., "wellness_q1", "tki_q1"
    answer_value = Column(String(500), nullable=False)  # Can be integer (1-5) or string ("A"/"B")
    answered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="answers")

    def __repr__(self) -> str:
        return f"<AssessmentAnswer(id={self.id}, assessment_id={self.assessment_id}, question_id={self.question_id})>"


class Assessment360Evaluator(Base):
    """360 Assessment evaluator model"""
    __tablename__ = "assessment_360_evaluators"
    __table_args__ = (
        Index("idx_360_evaluators_assessment_id", "assessment_id"),
        Index("idx_360_evaluators_email", "evaluator_email"),
        Index("idx_360_evaluators_token", "invitation_token"),
    )

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    
    # Evaluator information
    evaluator_name = Column(String(200), nullable=False)
    evaluator_email = Column(String(255), nullable=False)
    evaluator_role = Column(Enum(EvaluatorRole), nullable=False)
    
    # Invitation and completion tracking
    invitation_token = Column(String(100), unique=True, nullable=False, index=True)
    invitation_sent_at = Column(DateTime(timezone=True), nullable=True)
    invitation_opened_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(AssessmentStatus), default=AssessmentStatus.NOT_STARTED, nullable=False)
    
    # Their assessment (when they complete it)
    evaluator_assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="evaluators", foreign_keys=[assessment_id])
    evaluator_assessment = relationship("Assessment", foreign_keys=[evaluator_assessment_id])

    def __repr__(self) -> str:
        return f"<Assessment360Evaluator(id={self.id}, email={self.evaluator_email}, role={self.evaluator_role})>"


class AssessmentResult(Base):
    """Assessment result model with insights and recommendations"""
    __tablename__ = "assessment_results"
    __table_args__ = (
        Index("idx_assessment_results_assessment_id", "assessment_id"),
        Index("idx_assessment_results_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Detailed scores and analysis
    scores = Column(JSON, nullable=False)  # Detailed score breakdown
    insights = Column(JSON, nullable=True)  # AI-generated insights
    recommendations = Column(JSON, nullable=True)  # Personalized recommendations
    
    # For 360 assessments: comparison data
    comparison_data = Column(JSON, nullable=True)  # Self vs Evaluators comparison
    
    # Report generation
    report_generated = Column(Boolean, default=False, nullable=False)
    report_url = Column(String(500), nullable=True)  # S3 URL to PDF report
    
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    assessment = relationship("Assessment", back_populates="result")
    user = relationship("User", backref="assessment_results")

    def __repr__(self) -> str:
        return f"<AssessmentResult(id={self.id}, assessment_id={self.assessment_id})>"
