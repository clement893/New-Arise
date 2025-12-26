"""
Dependencies for FastAPI endpoints
Provides authentication and authorization dependencies
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.models.role import Role, UserRole
from app.api.v1.endpoints.auth import get_current_user as auth_get_current_user


def get_current_user(
    current_user: Annotated[User, Depends(auth_get_current_user)]
) -> User:
    """Get current authenticated user"""
    return current_user


async def is_superadmin(
    user: User,
    db: AsyncSession
) -> bool:
    """
    Check if a user has the superadmin role.
    Returns True if user has superadmin role, False otherwise.
    
    Args:
        user: User object to check
        db: Database session
    
    Returns:
        True if user is superadmin, False otherwise
    """
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


async def is_admin(
    user: User,
    db: AsyncSession
) -> bool:
    """
    Check if a user has the admin role (not superadmin).
    Returns True if user has admin role, False otherwise.
    
    Note: Superadmins are automatically considered admins,
    but this function specifically checks for the "admin" role.
    
    Args:
        user: User object to check
        db: Database session
    
    Returns:
        True if user has admin role, False otherwise
    """
    result = await db.execute(
        select(UserRole)
        .join(Role)
        .where(
            UserRole.user_id == user.id,
            Role.slug == "admin",
            Role.is_active == True
        )
    )
    admin_role = result.scalar_one_or_none()
    return admin_role is not None


async def is_admin_or_superadmin(
    user: User,
    db: AsyncSession
) -> bool:
    """
    Check if a user has admin OR superadmin role.
    Superadmins are automatically considered admins.
    
    Args:
        user: User object to check
        db: Database session
    
    Returns:
        True if user is admin or superadmin, False otherwise
    """
    # Check superadmin first (superadmins are automatically admins)
    if await is_superadmin(user, db):
        return True
    
    # Check admin role
    return await is_admin(user, db)


async def require_superadmin(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> None:
    """
    Dependency to require superadmin role.
    Raises HTTPException if user is not a superadmin.
    """
    is_super = await is_superadmin(current_user, db)
    
    if not is_super:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required"
        )
    
    return None


async def require_admin_or_superadmin(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
) -> None:
    """
    Dependency to require admin OR superadmin role.
    Superadmins are automatically considered admins.
    Raises HTTPException if user is neither admin nor superadmin.
    """
    if not await is_admin_or_superadmin(current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or superadmin access required"
        )
    return None


async def get_optional_user(
    token: str = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None
) -> User | None:
    """
    Get current user if authenticated, otherwise return None.
    Useful for endpoints that work for both authenticated and anonymous users.
    """
    if not token:
        return None
    
    try:
        from app.core.config import settings
        from jose import jwt, JWTError
        
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        if not username:
            return None
        
        result = await db.execute(select(User).where(User.email == username))
        user = result.scalar_one_or_none()
        return user if user and user.is_active else None
    except (JWTError, Exception):
        return None


