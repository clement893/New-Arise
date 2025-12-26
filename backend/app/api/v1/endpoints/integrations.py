"""
Integrations API Endpoints
Manage third-party integrations for users
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.core.rate_limit import rate_limit_decorator
from app.models.user import User
from app.models.integration import Integration
from app.dependencies import get_current_user

router = APIRouter()


class IntegrationCreate(BaseModel):
    """Schema for creating an integration"""
    type: str = Field(..., min_length=1, max_length=100, description="Integration type (e.g., 'slack', 'github')")
    name: str = Field(..., min_length=1, max_length=200, description="Display name")
    description: Optional[str] = Field(None, description="Integration description")
    config: Optional[Dict[str, Any]] = Field(None, description="Integration-specific configuration")
    credentials: Optional[Dict[str, Any]] = Field(None, description="Encrypted credentials")


class IntegrationUpdate(BaseModel):
    """Schema for updating an integration"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    enabled: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    credentials: Optional[Dict[str, Any]] = None


class IntegrationResponse(BaseModel):
    """Schema for integration response"""
    id: int
    type: str
    name: str
    description: Optional[str]
    enabled: bool
    config: Optional[Dict[str, Any]]
    last_sync_at: Optional[str]
    last_error: Optional[str]
    error_count: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[IntegrationResponse], tags=["integrations"])
@rate_limit_decorator("30/minute")
async def list_integrations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all integrations for the current user"""
    result = await db.execute(
        select(Integration)
        .where(Integration.user_id == current_user.id)
        .order_by(Integration.created_at.desc())
    )
    integrations = result.scalars().all()
    return integrations


@router.get("/{integration_id}", response_model=IntegrationResponse, tags=["integrations"])
@rate_limit_decorator("30/minute")
async def get_integration(
    integration_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific integration by ID"""
    result = await db.execute(
        select(Integration)
        .where(Integration.id == integration_id)
        .where(Integration.user_id == current_user.id)
    )
    integration = result.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    return integration


@router.post("/", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED, tags=["integrations"])
@rate_limit_decorator("10/minute")
async def create_integration(
    integration_data: IntegrationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new integration"""
    # Check if integration type already exists for this user
    result = await db.execute(
        select(Integration)
        .where(Integration.user_id == current_user.id)
        .where(Integration.type == integration_data.type)
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Integration of type '{integration_data.type}' already exists"
        )
    
    # Create new integration
    integration = Integration(
        user_id=current_user.id,
        type=integration_data.type,
        name=integration_data.name,
        description=integration_data.description,
        enabled=False,  # Start disabled by default
        config=integration_data.config,
        credentials=integration_data.credentials,
    )
    
    db.add(integration)
    await db.commit()
    await db.refresh(integration)
    
    return integration


@router.put("/{integration_id}", response_model=IntegrationResponse, tags=["integrations"])
@rate_limit_decorator("20/minute")
async def update_integration(
    integration_id: int,
    integration_data: IntegrationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an integration"""
    result = await db.execute(
        select(Integration)
        .where(Integration.id == integration_id)
        .where(Integration.user_id == current_user.id)
    )
    integration = result.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    # Update fields
    if integration_data.name is not None:
        integration.name = integration_data.name
    if integration_data.description is not None:
        integration.description = integration_data.description
    if integration_data.enabled is not None:
        integration.enabled = integration_data.enabled
    if integration_data.config is not None:
        integration.config = integration_data.config
    if integration_data.credentials is not None:
        integration.credentials = integration_data.credentials
    
    await db.commit()
    await db.refresh(integration)
    
    return integration


@router.patch("/{integration_id}/toggle", response_model=IntegrationResponse, tags=["integrations"])
@rate_limit_decorator("20/minute")
async def toggle_integration(
    integration_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle integration enabled/disabled status"""
    result = await db.execute(
        select(Integration)
        .where(Integration.id == integration_id)
        .where(Integration.user_id == current_user.id)
    )
    integration = result.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    integration.enabled = not integration.enabled
    await db.commit()
    await db.refresh(integration)
    
    return integration


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["integrations"])
@rate_limit_decorator("10/minute")
async def delete_integration(
    integration_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete an integration"""
    result = await db.execute(
        select(Integration)
        .where(Integration.id == integration_id)
        .where(Integration.user_id == current_user.id)
    )
    integration = result.scalar_one_or_none()
    
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Integration not found"
        )
    
    await db.delete(integration)
    await db.commit()
    
    return None

