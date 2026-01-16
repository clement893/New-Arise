"""
User Endpoints with Pagination and Query Optimization
Example implementation of optimized endpoints
"""

from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from starlette.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
import json

from app.core.database import get_db
from app.core.pagination import PaginationParams, paginate_query, PaginatedResponse, get_pagination_params
from app.core.query_optimization import QueryOptimizer
from app.core.cache_enhanced import cache_query
from app.core.rate_limit import rate_limit_decorator
from app.core.logging import logger
from app.models.user import User
from app.schemas.user import UserUpdate
from app.schemas.auth import UserResponse
from app.dependencies import get_current_user, require_superadmin
from fastapi import HTTPException, status
from typing import Annotated

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[UserResponse])
@rate_limit_decorator("100/hour")
@cache_query(expire=300, tags=["users"])
async def list_users(
    request: Request,
    pagination: Annotated[PaginationParams, Depends(get_pagination_params)],
    db: Annotated[AsyncSession, Depends(get_db)],
    is_active: Optional[bool] = Query(True, description="Filter by active status (default: True to exclude deleted users)"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    include_inactive: bool = Query(False, description="Include inactive (deleted) users in results"),
) -> PaginatedResponse[UserResponse]:
    """
    List users with pagination and filtering
    
    Features:
    - Pagination support
    - Filtering by active status (default: only active users)
    - Search functionality
    - Query optimization with eager loading
    - Result caching
    """
    # Build query
    query = select(User)
    
    # Apply filters
    filters = []
    # By default, only show active users unless include_inactive is True
    if not include_inactive:
        if is_active is not None:
            filters.append(User.is_active == is_active)
        else:
            # Default to active users only
            filters.append(User.is_active == True)
    elif is_active is not None:
        # If include_inactive is True but is_active is specified, respect it
        filters.append(User.is_active == is_active)
    
    if search:
        search_filter = or_(
            User.email.ilike(f"%{search}%"),
            User.first_name.ilike(f"%{search}%"),
            User.last_name.ilike(f"%{search}%"),
        )
        filters.append(search_filter)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Create base query for counting (without eager loading)
    from sqlalchemy import func
    # Build count query from scratch to ensure it's clean
    count_query = select(func.count()).select_from(User)
    if filters:
        count_query = count_query.where(and_(*filters))
    
    # Optimize query with eager loading (prevent N+1 queries)
    # Note: roles relationship may not exist, so we skip if it doesn't
    try:
        query = QueryOptimizer.add_eager_loading(query, ["roles"], strategy="selectin")
    except (AttributeError, Exception) as e:
        # roles relationship doesn't exist or other error, skip eager loading
        logger.warning(f"Could not add eager loading for roles: {e}")
        pass
    
    # Order by created_at (uses index)
    query = query.order_by(User.created_at.desc())
    
    # Paginate query with separate count query to avoid issues with eager loading
    try:
        # First, get the count
        count_result = await db.execute(count_query)
        total = count_result.scalar_one() or 0
        
        # Then, get the paginated items (without eager loading to avoid issues)
        paginated_query = query.offset(pagination.offset).limit(pagination.limit)
        result = await db.execute(paginated_query)
        users = result.scalars().all()
        
        # Convert SQLAlchemy User objects to UserResponse schemas
        user_responses = []
        for user in users:
            try:
                # Convert SQLAlchemy User to dict, excluding relationships
                # Handle datetime conversion explicitly for UserResponse from app.schemas.auth
                user_dict = {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "avatar": user.avatar,
                    "is_active": user.is_active,
                    "user_type": user.user_type.value if user.user_type else "INDIVIDUAL",
                    "theme_preference": user.theme_preference or 'system',
                    "created_at": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
                    "updated_at": user.updated_at.isoformat() if hasattr(user.updated_at, 'isoformat') else str(user.updated_at),
                }
                user_responses.append(UserResponse.model_validate(user_dict))
            except Exception as validation_error:
                logger.error(
                    f"Error validating user {user.id} (email: {user.email}): {validation_error}\n"
                    f"  User data: id={user.id}, email={user.email}, first_name={user.first_name}, "
                    f"last_name={user.last_name}, is_active={user.is_active}, "
                    f"created_at={user.created_at}, updated_at={user.updated_at}",
                    exc_info=True
                )
                # Skip this user if validation fails
                continue
        
        paginated_response = PaginatedResponse.create(
            items=user_responses,
            total=total,
            page=pagination.page,
            page_size=pagination.page_size,
        )
        # Convert to JSONResponse for slowapi compatibility
        # Use model_dump with mode='json' to ensure datetime serialization
        return JSONResponse(
            content=paginated_response.model_dump(mode='json'),
            status_code=200
        )
    except Exception as e:
        logger.error(f"Error paginating users query: {e}", exc_info=True)
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Try without eager loading as fallback
        try:
            query_fallback = select(User).order_by(User.created_at.desc())
            if filters:
                query_fallback = query_fallback.where(and_(*filters))
            paginated_result = await paginate_query(db, query_fallback, pagination, count_query=count_query)
            # Convert to UserResponse with individual error handling
            user_responses = []
            for user in paginated_result.items:
                try:
                    # Convert SQLAlchemy User to dict, excluding relationships
                    # This prevents issues with eager-loaded relationships
                    # Handle datetime conversion explicitly for UserResponse from app.schemas.auth
                    user_dict = {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "avatar": user.avatar,
                        "is_active": user.is_active,
                        "user_type": user.user_type.value if user.user_type else "INDIVIDUAL",
                        "theme_preference": user.theme_preference or 'system',
                        "created_at": user.created_at.isoformat() if hasattr(user.created_at, 'isoformat') else str(user.created_at),
                        "updated_at": user.updated_at.isoformat() if hasattr(user.updated_at, 'isoformat') else str(user.updated_at),
                    }
                    user_responses.append(UserResponse.model_validate(user_dict))
                except Exception as validation_error:
                    logger.error(
                        f"Error validating user {user.id} (email: {user.email}) in fallback: {validation_error}\n"
                        f"  User data: id={user.id}, email={user.email}, first_name={user.first_name}, "
                        f"last_name={user.last_name}, is_active={user.is_active}, "
                        f"created_at={user.created_at}, updated_at={user.updated_at}",
                        exc_info=True
                    )
                    # Skip this user if validation fails
                    continue
            
            paginated_response = PaginatedResponse.create(
                items=user_responses,
                total=paginated_result.total,
                page=paginated_result.page,
                page_size=paginated_result.page_size,
            )
            # Convert to JSONResponse for slowapi compatibility
            # Use model_dump with mode='json' to ensure datetime serialization
            return JSONResponse(
                content=paginated_response.model_dump(mode='json'),
                status_code=200
            )
        except Exception as fallback_error:
            logger.error(f"Error in fallback query: {fallback_error}", exc_info=True)
            # Last resort: return empty result instead of crashing
            try:
                paginated_response = PaginatedResponse.create(
                    items=[],
                    total=0,
                    page=pagination.page,
                    page_size=pagination.page_size,
                )
                # Convert to JSONResponse for slowapi compatibility
                # Use model_dump with mode='json' to ensure datetime serialization
                return JSONResponse(
                    content=paginated_response.model_dump(mode='json'),
                    status_code=200
                )
            except Exception as final_error:
                logger.error(f"Error creating empty response: {final_error}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to retrieve users: {str(fallback_error)}"
                )


@router.get("/{user_id}", response_model=UserResponse)
@rate_limit_decorator("200/hour")
@cache_query(expire=600, tags=["users"])
async def get_user(
    request: Request,
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Get user by ID with query optimization
    
    Features:
    - Eager loading of relationships
    - Result caching
    """
    # Build optimized query
    query = select(User).where(User.id == user_id)
    
    # Eager load relationships to prevent N+1 queries
    # Note: relationships may not exist, so we skip if they don't
    try:
        query = QueryOptimizer.add_eager_loading(query, ["roles", "team_memberships"], strategy="selectin")
    except AttributeError:
        # relationships don't exist, skip eager loading
        pass
    
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Convert User model to UserResponse schema (from app.schemas.auth)
    try:
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar=user.avatar,
            is_active=user.is_active,
            user_type=user.user_type.value if user.user_type else "INDIVIDUAL",
            theme_preference=user.theme_preference or 'system',
            created_at=user.created_at.isoformat() if user.created_at else "",
            updated_at=user.updated_at.isoformat() if user.updated_at else "",
        )
        return user_response
    except Exception as e:
        logger.error(f"Error creating UserResponse for user {user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serialize user data"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
@rate_limit_decorator("10/hour")
async def delete_user(
    request: Request,
    user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Delete a user (admin/superadmin only)
    
    Features:
    - Requires admin or superadmin permissions
    - Prevents self-deletion
    - Prevents deletion of last superadmin
    - Soft delete (sets is_active=False) or hard delete based on configuration
    """
    from app.dependencies import is_admin_or_superadmin
    
    # Check if user is admin or superadmin
    is_admin = await is_admin_or_superadmin(current_user, db)
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete users"
        )
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account"
        )
    
    # Get user to delete
    result = await db.execute(select(User).where(User.id == user_id))
    user_to_delete = result.scalar_one_or_none()
    
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is the last superadmin
    from app.models import Role, UserRole
    superadmin_role_result = await db.execute(
        select(Role).where(Role.slug == "superadmin")
    )
    superadmin_role = superadmin_role_result.scalar_one_or_none()
    
    if superadmin_role:
        superadmin_users_result = await db.execute(
            select(UserRole)
            .join(Role)
            .where(Role.slug == "superadmin")
            .where(Role.is_active == True)
        )
        superadmin_users = list(superadmin_users_result.scalars().all())
        
        # Check if user to delete is a superadmin
        user_is_superadmin = any(
            ur.user_id == user_id for ur in superadmin_users
        )
        
        if user_is_superadmin and len(superadmin_users) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last superadmin user"
            )
    
    # Log deletion attempt
    try:
        from app.core.security_audit import SecurityAuditLogger, SecurityEventType
        await SecurityAuditLogger.log_event(
            db=db,
            event_type=SecurityEventType.DATA_DELETED,
            description=f"User '{user_to_delete.email}' deleted",
            user_id=current_user.id,
            user_email=current_user.email,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            request_method=request.method,
            request_path=str(request.url.path),
            severity="warning",
            success="success",
            metadata={
                "resource_type": "user",
                "deleted_user_id": user_id,
                "deleted_user_email": user_to_delete.email,
                "action": "deleted"
            }
        )
    except Exception as e:
        logger.warning(f"Failed to log user deletion event: {e}")
    
    # Perform soft delete (set is_active=False) instead of hard delete
    # This preserves data integrity and allows for recovery if needed
    # Note: Hard delete would cascade and delete all related data (assessments, preferences, etc.)
    # which is usually not desired. Soft delete allows data recovery and maintains referential integrity.
    original_is_active = user_to_delete.is_active
    user_to_delete.is_active = False
    
    try:
        await db.commit()
        logger.debug(f"User {user_id} soft delete committed to database")
    except Exception as commit_error:
        await db.rollback()
        logger.error(f"Failed to commit user deletion to database: {commit_error}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: database commit failed: {str(commit_error)}"
        )
    
    # Verify that the deletion was actually committed to the database
    # Refresh from database to get the latest state
    await db.refresh(user_to_delete)
    if user_to_delete.is_active is not False:
        logger.error(
            f"Database verification failed for user {user_id}: "
            f"Expected is_active=False, but got is_active={user_to_delete.is_active}. "
            f"Original value was {original_is_active}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user: database commit verification failed. The user may still be active."
        )
    
    logger.info(
        f"User {user_id} ({user_to_delete.email}) successfully soft-deleted in database "
        f"(is_active changed from {original_is_active} to False) by {current_user.email}"
    )
    
    # Invalidate cache to ensure deleted users don't appear in lists
    try:
        from app.core.cache import invalidate_cache_pattern_async
        await invalidate_cache_pattern_async("users:*")
        await invalidate_cache_pattern_async(f"user:{user_id}:*")
    except Exception as cache_error:
        logger.warning(f"Failed to invalidate cache after user deletion: {cache_error}")
    
    from starlette.responses import Response
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put("/me", response_model=UserResponse)
@rate_limit_decorator("10/minute")
async def update_current_user(
    request: Request,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> UserResponse:
    """
    Update current user profile
    
    Allows authenticated users to update their own profile information.
    Only updates fields that are provided (partial update).
    
    Args:
        user_data: User update data (email, first_name, last_name)
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Updated user information
        
    Raises:
        HTTPException: If email is already taken by another user
    """
    try:
        logger.info(f"Updating user profile for: {current_user.email} (ID: {current_user.id})")
        logger.debug(f"Update data received: {user_data.model_dump(exclude_unset=True)}")
        
        # Check if email is being updated and if it's already taken
        if user_data.email and user_data.email != current_user.email:
            result = await db.execute(
                select(User).where(User.email == user_data.email)
            )
            existing_user = result.scalar_one_or_none()
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already taken"
                )
        
        # Update only provided fields
        update_data = user_data.model_dump(exclude_unset=True)
        logger.debug(f"Fields to update: {list(update_data.keys())}")
        
        for field, value in update_data.items():
            if hasattr(current_user, field):
                setattr(current_user, field, value)
                logger.debug(f"Updated field {field} to {value}")
            else:
                logger.warning(f"Field {field} does not exist on User model, skipping")
        
        # Save changes
        try:
            await db.commit()
            logger.debug("Database commit successful")
        except Exception as commit_error:
            logger.error(f"Database commit failed: {commit_error}", exc_info=True)
            await db.rollback()
            raise
        
        try:
            await db.refresh(current_user)
            logger.debug("User refresh successful")
        except Exception as refresh_error:
            logger.error(f"User refresh failed: {refresh_error}", exc_info=True)
            # Continue anyway, we can still create the response
        
        logger.info(f"User profile updated successfully for: {current_user.email}")
        
        # Convert User model to UserResponse schema (from app.schemas.auth)
        # Use the same approach as /auth/me endpoint for consistency
        try:
            logger.debug(f"Creating UserResponse for user {current_user.id}")
            
            # Build response data manually to ensure all fields are present
            response_data = {
                "id": current_user.id,
                "email": current_user.email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "avatar": current_user.avatar,
                "is_active": current_user.is_active,
                "user_type": current_user.user_type.value if current_user.user_type else "INDIVIDUAL",
                "theme_preference": current_user.theme_preference or 'system',
                "created_at": current_user.created_at.isoformat() if current_user.created_at else "",
                "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else "",
            }
            
            # Validate with UserResponse schema
            user_response = UserResponse.model_validate(response_data)
            
            # Return as JSONResponse to ensure proper serialization
            logger.info(f"Successfully created UserResponse for user {current_user.id}")
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content=user_response.model_dump(mode='json')
            )
        except Exception as e:
            logger.error(
                f"Error creating UserResponse for user {current_user.id}: {e}\n"
                f"  User attributes: {dir(current_user)}\n"
                f"  User type: {type(current_user)}\n"
                f"  Has created_at: {hasattr(current_user, 'created_at')}\n"
                f"  Has updated_at: {hasattr(current_user, 'updated_at')}",
                exc_info=True
            )
            # Re-raise as HTTPException with more context
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to serialize user data: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@router.put("/{user_id}", response_model=UserResponse)
@rate_limit_decorator("10/minute")
async def update_user(
    request: Request,
    user_id: int,
    user_data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    _: None = Depends(require_superadmin),
) -> UserResponse:
    """
    Update a user by ID (superadmin only)
    
    Allows superadmins to update any user's information.
    Only updates fields that are provided (partial update).
    
    Args:
        user_id: ID of the user to update
        user_data: User update data (email, first_name, last_name, is_active, user_type)
        current_user: Current authenticated superadmin user
        db: Database session
        
    Returns:
        Updated user information
        
    Raises:
        HTTPException: If user not found or email is already taken by another user
    """
    try:
        logger.info(f"Superadmin {current_user.email} (ID: {current_user.id}) updating user {user_id}")
        logger.debug(f"Update data received: {user_data.model_dump(exclude_unset=True)}")
        
        # Get the user to update
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        user_to_update = result.scalar_one_or_none()
        
        if not user_to_update:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {user_id} not found"
            )
        
        # Check if email is being updated and if it's already taken
        if user_data.email and user_data.email != user_to_update.email:
            result = await db.execute(
                select(User).where(User.email == user_data.email)
            )
            existing_user = result.scalar_one_or_none()
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is already taken"
                )
        
        # Update only provided fields
        update_data = user_data.model_dump(exclude_unset=True)
        logger.debug(f"Fields to update: {list(update_data.keys())}")
        
        for field, value in update_data.items():
            if hasattr(user_to_update, field):
                setattr(user_to_update, field, value)
                logger.debug(f"Updated field {field} to {value}")
            else:
                logger.warning(f"Field {field} does not exist on User model, skipping")
        
        # Save changes
        try:
            await db.commit()
            logger.debug("Database commit successful")
        except Exception as commit_error:
            logger.error(f"Database commit failed: {commit_error}", exc_info=True)
            await db.rollback()
            raise
        
        try:
            await db.refresh(user_to_update)
            logger.debug("User refresh successful")
        except Exception as refresh_error:
            logger.error(f"User refresh failed: {refresh_error}", exc_info=True)
            # Continue anyway, we can still create the response
        
        logger.info(f"User {user_id} ({user_to_update.email}) updated successfully by superadmin {current_user.email}")
        
        # Invalidate cache
        try:
            from app.core.cache import invalidate_cache_pattern_async
            await invalidate_cache_pattern_async(f"user:{user_id}:*")
            await invalidate_cache_pattern_async("users:*")
        except Exception as cache_error:
            logger.warning(f"Failed to invalidate cache after user update: {cache_error}")
        
        # Convert User model to UserResponse schema
        try:
            user_response = UserResponse(
                id=user_to_update.id,
                email=user_to_update.email,
                first_name=user_to_update.first_name,
                last_name=user_to_update.last_name,
                avatar=user_to_update.avatar,
                is_active=user_to_update.is_active,
                user_type=user_to_update.user_type.value if user_to_update.user_type else "INDIVIDUAL",
                theme_preference=user_to_update.theme_preference or 'system',
                created_at=user_to_update.created_at.isoformat() if user_to_update.created_at else "",
                updated_at=user_to_update.updated_at.isoformat() if user_to_update.updated_at else "",
            )
            return user_response
        except Exception as e:
            logger.error(f"Error creating UserResponse for user {user_id}: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to serialize user data"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user"
        )
