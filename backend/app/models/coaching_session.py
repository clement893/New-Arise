"""
Coaching Session Model
SQLAlchemy model for coaching session bookings
"""

from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, Text, func, Index, Enum as SQLEnum, Numeric
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class SessionStatus(str, enum.Enum):
    """Coaching session status"""
    PENDING = "pending"  # Session booked, payment pending
    CONFIRMED = "confirmed"  # Payment confirmed, session scheduled
    COMPLETED = "completed"  # Session completed
    CANCELLED = "cancelled"  # Session cancelled
    NO_SHOW = "no_show"  # Client didn't show up


class CoachingSession(Base):
    """Coaching session booking model"""
    __tablename__ = "coaching_sessions"
    __table_args__ = (
        Index("idx_coaching_sessions_user_id", "user_id"),
        Index("idx_coaching_sessions_coach_id", "coach_id"),
        Index("idx_coaching_sessions_status", "status"),
        Index("idx_coaching_sessions_scheduled_at", "scheduled_at"),
        Index("idx_coaching_sessions_stripe_session_id", "stripe_checkout_session_id"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    coach_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    package_id = Column(Integer, ForeignKey("coaching_packages.id", ondelete="SET NULL"), nullable=True)
    
    # Session details
    scheduled_at = Column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes = Column(Integer, default=60, nullable=False)  # Duration in minutes
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.PENDING, nullable=False, index=True)
    
    # Payment
    amount = Column(Numeric(10, 2), nullable=False)  # Price amount
    currency = Column(String(3), default="cad", nullable=False)
    stripe_checkout_session_id = Column(String(255), nullable=True, index=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    payment_status = Column(String(50), nullable=True)  # paid, pending, failed, refunded
    
    # Session notes
    notes = Column(Text, nullable=True)  # Client notes/preferences
    coach_notes = Column(Text, nullable=True)  # Coach's private notes
    
    # Metadata
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="coaching_sessions_as_client")
    coach = relationship("User", foreign_keys=[coach_id], backref="coaching_sessions_as_coach")
    package = relationship("CoachingPackage", back_populates="sessions")
    
    def __repr__(self) -> str:
        return f"<CoachingSession(id={self.id}, user_id={self.user_id}, coach_id={self.coach_id}, scheduled_at={self.scheduled_at})>"


class CoachingPackage(Base):
    """Coaching package model"""
    __tablename__ = "coaching_packages"
    __table_args__ = (
        Index("idx_coaching_packages_stripe_price_id", "stripe_price_id"),
        Index("idx_coaching_packages_active", "is_active"),
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Pricing
    price = Column(Numeric(10, 2), nullable=False)  # Price amount
    currency = Column(String(3), default="cad", nullable=False)
    duration_months = Column(Integer, nullable=True)  # Duration in months (null for single session)
    sessions_count = Column(Integer, default=1, nullable=False)  # Number of sessions included
    
    # Stripe integration
    stripe_price_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_product_id = Column(String(255), nullable=True)
    
    # Features (stored as JSON)
    features = Column(Text, nullable=True)  # JSON string of features
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_popular = Column(Boolean, default=False, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    
    # Relationships
    sessions = relationship("CoachingSession", back_populates="package")
    
    def __repr__(self) -> str:
        return f"<CoachingPackage(id={self.id}, name={self.name}, price={self.price})>"
