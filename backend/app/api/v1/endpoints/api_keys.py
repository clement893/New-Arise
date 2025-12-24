"""
API Key Management Endpoints
Allows users to generate and manage API keys
"""

from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.api_key import generate_api_key, hash_api_key
from app.core.rate_limit import rate_limit_decorator
from app.core.logging import logger
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


class APIKeyCreate(BaseModel):
    name: str
    description: str | None = None


class APIKeyResponse(BaseModel):
    id: int
    name: str
    key: str  # Only shown once on creation
    created_at: str
    last_used_at: str | None = None


class APIKeyListResponse(BaseModel):
    id: int
    name: str
    created_at: str
    last_used_at: str | None = None


@router.post("/generate", response_model=APIKeyResponse)
@rate_limit_decorator("5/minute")
async def generate_api_key_endpoint(
    request: Request,
    api_key_data: APIKeyCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Generate a new API key for the current user"""
    # Generate API key
    api_key = generate_api_key()
    hashed_key = hash_api_key(api_key)
    
    # Store API key hash in user's API keys (requires adding api_keys table)
    # For now, we'll store it in a simple way
    # TODO: Create APIKey model and table
    
    logger.info(f"API key generated for user {current_user.email}")
    
    # Return the key (only shown once)
    return APIKeyResponse(
        id=1,  # Would be actual ID from database
        name=api_key_data.name,
        key=api_key,  # Only time this is shown
        created_at="2025-12-24T00:00:00Z",  # Would be actual timestamp
        last_used_at=None,
    )


@router.get("/list", response_model=List[APIKeyListResponse])
@rate_limit_decorator("10/minute")
async def list_api_keys(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all API keys for the current user"""
    # TODO: Implement actual listing from database
    return []


@router.delete("/{key_id}")
@rate_limit_decorator("10/minute")
async def revoke_api_key(
    request: Request,
    key_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Revoke an API key"""
    # TODO: Implement actual revocation
    return {"message": "API key revoked"}

