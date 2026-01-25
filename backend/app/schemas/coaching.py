"""
Coaching Schemas
Pydantic schemas for coaching session and package operations
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CoachingPackageBase(BaseModel):
    """Base coaching package schema"""
    name: str = Field(..., description="Package name")
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price amount")
    currency: str = Field(default="cad", description="Currency code")
    duration_months: Optional[int] = Field(None, ge=1, description="Duration in months")
    sessions_count: int = Field(default=1, ge=1, description="Number of sessions")
    features: Optional[str] = None  # JSON string
    is_active: bool = True
    is_popular: bool = False
    stripe_price_id: Optional[str] = None
    stripe_product_id: Optional[str] = None


class CoachingPackageCreate(CoachingPackageBase):
    """Schema for creating a coaching package"""
    pass


class CoachingPackageResponse(CoachingPackageBase):
    """Schema for coaching package response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CoachingPackageListResponse(BaseModel):
    """Schema for list of coaching packages"""
    packages: List[CoachingPackageResponse]
    total: int


class CoachingSessionBase(BaseModel):
    """Base coaching session schema"""
    coach_id: int = Field(..., description="Coach user ID")
    package_id: Optional[int] = None
    scheduled_at: datetime = Field(..., description="Scheduled session datetime")
    duration_minutes: int = Field(default=60, ge=15, le=240, description="Duration in minutes")
    notes: Optional[str] = None


class CoachingSessionCreate(CoachingSessionBase):
    """Schema for creating a coaching session"""
    pass


class CoachingSessionResponse(CoachingSessionBase):
    """Schema for coaching session response"""
    id: int
    user_id: int
    status: str
    amount: float
    currency: str
    stripe_checkout_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    payment_status: Optional[str] = None
    coach_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CoachingSessionListResponse(BaseModel):
    """Schema for list of coaching sessions"""
    sessions: List[CoachingSessionResponse]
    total: int


class CheckoutSessionCreate(BaseModel):
    """Schema for creating a Stripe checkout session for coaching"""
    session_id: int = Field(..., description="Coaching session ID")
    success_url: str = Field(..., description="URL to redirect after successful payment")
    cancel_url: str = Field(..., description="URL to redirect after cancelled payment")


class CheckoutSessionResponse(BaseModel):
    """Schema for Stripe checkout session response"""
    session_id: str = Field(..., description="Stripe checkout session ID")
    url: str = Field(..., description="Checkout URL")


class CoachAvailabilityRequest(BaseModel):
    """Schema for checking coach availability"""
    coach_id: int
    start_date: datetime
    end_date: datetime


class TimeSlot(BaseModel):
    """Schema for available time slot"""
    start: datetime
    end: datetime
    available: bool


class CoachAvailabilityResponse(BaseModel):
    """Schema for coach availability response"""
    coach_id: int
    slots: List[TimeSlot]
