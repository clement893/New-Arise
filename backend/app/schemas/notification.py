"""
Notification Schemas
Pydantic v2 models for notification management
"""

from datetime import datetime
from typing import Optional, Dict, Any, List

from pydantic import BaseModel, Field, ConfigDict, field_validator

from app.models.notification import NotificationType


class NotificationBase(BaseModel):
    """Base notification schema"""
    title: str = Field(..., max_length=200, description="Notification title")
    message: str = Field(..., description="Notification message")
    notification_type: NotificationType = Field(
        default=NotificationType.INFO,
        description="Notification type"
    )
    action_url: Optional[str] = Field(None, max_length=500, description="Optional action URL")
    action_label: Optional[str] = Field(None, max_length=100, description="Optional action button label")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata (JSON)")


class NotificationCreate(NotificationBase):
    """Notification creation schema"""
    user_id: int = Field(..., description="User ID to send notification to")
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title"""
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()
    
    @field_validator('message')
    @classmethod
    def validate_message(cls, v: str) -> str:
        """Validate message"""
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class NotificationUpdate(BaseModel):
    """Notification update schema"""
    read: Optional[bool] = Field(None, description="Read status")
    action_url: Optional[str] = Field(None, max_length=500, description="Action URL")
    action_label: Optional[str] = Field(None, max_length=100, description="Action label")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Metadata")


class NotificationResponse(NotificationBase):
    """Notification response schema"""
    id: int
    user_id: int
    read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    """Notification list response schema"""
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    skip: int = 0
    limit: int = 100


class NotificationUnreadCountResponse(BaseModel):
    """Unread count response schema"""
    unread_count: int
    user_id: int

