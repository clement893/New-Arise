"""FastAPI dependencies."""

from typing import Optional

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import User
from app.core.security import decode_token
from app.services.subscription_service import SubscriptionService
from app.services.stripe_service import StripeService

security = HTTPBearer(auto_error=False)


async def get_subscription_service(
    db: AsyncSession = Depends(get_db),
) -> SubscriptionService:
    """Dependency to get SubscriptionService instance"""
    return SubscriptionService(db)


def get_stripe_service(
    db: AsyncSession = Depends(get_db),
) -> StripeService:
    """Dependency to get StripeService instance"""
    return StripeService(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user."""
    token = credentials.credentials

    payload = decode_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # The 'sub' claim in the token contains the user's email (not ID)
    # This matches the implementation in app/api/v1/endpoints/auth.py
    email: Optional[str] = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch user from database by email
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
        )

    return user




async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get optional authenticated user."""
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def is_superadmin(
    user: User,
    db: AsyncSession,
) -> bool:
    """
    Check if a user has the superadmin role.
    Returns True if user has superadmin role, False otherwise.
    """
    from app.models import Role, UserRole
    
    result = await db.execute(
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == user.id,
            Role.slug == "superadmin",
            Role.is_active == True
        )
    )
    user_role = result.scalar_one_or_none()
    return user_role is not None


async def require_superadmin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Dependency to require superadmin role."""
    from app.models import Role, UserRole
    
    # Check if user has superadmin role via UserRole
    result = await db.execute(
        select(Role)
        .join(UserRole, Role.id == UserRole.role_id)
        .where(
            UserRole.user_id == current_user.id,
            Role.slug == "superadmin",
            Role.is_active == True
        )
    )
    superadmin_role = result.scalar_one_or_none()
    
    if not superadmin_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required"
        )
    return None


