"""
Authentication Endpoints
"""

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from urllib.parse import urlencode
import os

import httpx
import bcrypt
from fastapi import APIRouter, Body, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse, JSONResponse, HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limit import rate_limit_decorator
from app.core.logging import logger
from app.core.security import create_refresh_token, create_access_token
from app.core.security_audit import SecurityAuditLogger, SecurityEventType
from app.models.user import User
from app.schemas.auth import Token, TokenData, UserCreate, UserResponse, RefreshTokenRequest, TokenWithUser
from pydantic import BaseModel, EmailStr, Field

router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_token_from_request(
    request: Request,
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
) -> str | None:
    """
    Get access token from request.
    
    SECURITY: Accepts token from:
    1. httpOnly cookies (preferred, most secure)
    2. Authorization header (for backward compatibility)
    
    Args:
        request: FastAPI request object (to access cookies)
        token: Token from Authorization header (via oauth2_scheme)
    
    Returns:
        Access token string or None
    """
    # SECURITY: Prefer reading access token from httpOnly cookies (most secure)
    access_token = request.cookies.get("access_token")
    
    # Fallback to Authorization header for backward compatibility
    if not access_token and token:
        access_token = token
    
    return access_token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Try bcrypt directly first (for new hashes), fallback to passlib for compatibility
    try:
        password_bytes = plain_password.encode('utf-8')
        if len(password_bytes) > 72:
            password_bytes = password_bytes[:72]
            # Remove incomplete UTF-8 sequences
            while len(password_bytes) > 0:
                try:
                    password_bytes.decode('utf-8')
                    break
                except UnicodeDecodeError:
                    password_bytes = password_bytes[:-1]
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))
    except Exception:
        # Fallback to passlib for old hashes
        return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly (bypassing passlib to avoid 72-byte limit issues)"""
    # Bcrypt has a 72-byte limit, so truncate password to 72 bytes if needed
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Truncate to 72 bytes, ensuring we don't break UTF-8 characters
        password_bytes = password_bytes[:72]
        # Remove any incomplete UTF-8 sequences at the end
        while len(password_bytes) > 0:
            try:
                password_bytes.decode('utf-8')
                break
            except UnicodeDecodeError:
                password_bytes = password_bytes[:-1]
        # Use the truncated bytes directly
        password_bytes = password_bytes
    else:
        password_bytes = password.encode('utf-8')
    
    # Use bcrypt directly instead of passlib to avoid compatibility issues
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    token: Annotated[str | None, Depends(oauth2_scheme)] = None,
) -> User:
    """
    Get current authenticated user
    
    SECURITY: Accepts access token from:
    1. httpOnly cookies (preferred, most secure)
    2. Authorization header (for backward compatibility)
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Get token from cookies or Authorization header
    access_token = await get_token_from_request(request, token)
    
    # Handle case where token is not found
    if not access_token:
        raise credentials_exception
    
    try:
        # SECURITY: Do not log token content to prevent information disclosure
        payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        # Verify token type
        token_type = payload.get("type")
        if token_type != "access":
            logger.warning("Invalid token type, expected 'access'")
            # Log invalid token event
            try:
                await SecurityAuditLogger.log_event(
                    db=db,
                    event_type=SecurityEventType.INVALID_TOKEN,
                    description="Invalid token type in authentication attempt",
                    severity="warning",
                    success="failure",
                    metadata={"token_type": token_type, "expected": "access"}
                )
            except Exception:
                pass  # Don't fail auth if audit logging fails
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            logger.warning("No 'sub' claim in token payload")
            # Log invalid token event
            try:
                await SecurityAuditLogger.log_event(
                    db=db,
                    event_type=SecurityEventType.INVALID_TOKEN,
                    description="Token missing 'sub' claim",
                    severity="warning",
                    success="failure",
                    metadata={"reason": "missing_sub_claim"}
                )
            except Exception:
                pass  # Don't fail auth if audit logging fails
            raise credentials_exception
        token_data = TokenData(username=username)
        # SECURITY: Only log username (email), not token or payload
        logger.debug(f"Token validated for user: {username}")
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        # Log invalid token event
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.INVALID_TOKEN,
                description=f"JWT decode error: {str(e)}",
                severity="warning",
                success="failure",
                metadata={"error_type": type(e).__name__}
            )
        except Exception:
            pass  # Don't fail auth if audit logging fails
        raise credentials_exception

    # Get user from database
    try:
        result = await db.execute(
            select(User).where(User.email == token_data.username)
        )
        user = result.scalar_one_or_none()
        if user is None:
            logger.warning("User not found in database for authenticated token")
            raise credentials_exception
        # SECURITY: Only log user ID, not email or other sensitive data
        logger.debug(f"User authenticated: id={user.id}")
        return user
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error in get_current_user: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service unavailable",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as db_error:
        # Check if it's a database schema error (table doesn't exist)
        error_str = str(db_error).lower()
        if "does not exist" in error_str or "relation" in error_str or "table" in error_str:
            logger.error(f"Database schema error in get_current_user (migrations may not have run): {db_error}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database schema not initialized. Please wait for migrations to complete.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Keep generic Exception as last resort, but log with context
        logger.error(f"Database error in get_current_user: {db_error}", exc_info=True)
        raise credentials_exception


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@rate_limit_decorator("3/minute")
async def register(
    request: Request,
    user_data: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    response: Response,
) -> UserResponse:
    """
    Register a new user
    
    Args:
        user_data: User registration data
        db: Database session
        response: FastAPI response object (for rate limit headers)
        
    Returns:
        Created user
    """
    # Log registration attempt
    logger.info(f"Registration attempt for email: {user_data.email}")
    
    # Check if user already exists
    result = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    existing_user = result.scalar_one_or_none()
    if existing_user:
        logger.warning(f"Registration failed: Email already registered - {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Convert to response model - convert datetime to ISO string format
    user_dict = {
        "id": new_user.id,
        "email": new_user.email,
        "first_name": new_user.first_name,
        "last_name": new_user.last_name,
        "avatar": new_user.avatar,
        "is_active": new_user.is_active,
        "user_type": new_user.user_type.value if new_user.user_type else "INDIVIDUAL",
        "created_at": new_user.created_at.isoformat() if new_user.created_at else "",
        "updated_at": new_user.updated_at.isoformat() if new_user.updated_at else "",
    }
    user_response = UserResponse.model_validate(user_dict)
    return user_response


class LoginRequest(BaseModel):
    """Login request schema for JSON body"""
    email: EmailStr
    password: str


@router.post("/login", response_model=TokenWithUser)
@rate_limit_decorator("5/minute")
async def login(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TokenWithUser:
    """
    Login endpoint - accepts both form-data (OAuth2) and JSON
    
    Args:
        request: FastAPI request object
        db: Database session
        
    Returns:
        TokenWithUser: Access token and user data
    """
    # Determine if request is JSON or form-data
    content_type = request.headers.get("content-type", "")
    
    if "application/json" in content_type:
        # JSON request - parse body manually
        try:
            body = await request.json()
            login_data = LoginRequest(**body)
            email = login_data.email
            password = login_data.password
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid JSON data: {str(e)}",
            )
    else:
        # Form-data request (OAuth2 standard) - parse form manually
        try:
            form = await request.form()
            email = form.get("username")  # OAuth2 uses 'username' field for email
            password = form.get("password")
            if not email or not password:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Form data required with 'username' and 'password' fields",
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid form data: {str(e)}",
            )
    
    # Normalize email (lowercase and trim) for consistent lookup
    normalized_email = email.strip().lower() if email else None
    if not normalized_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Email is required",
        )
    
    # Get user from database
    result = await db.execute(
        select(User).where(User.email == normalized_email)
    )
    user = result.scalar_one_or_none()

    # Get client IP and user agent for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    if not user or not verify_password(password, user.hashed_password):
        # Log failed login attempt
        # Use separate session (db=None) to ensure log is saved even if exception is raised
        logger.info(f"Login failure detected for email: {email}")
        try:
            audit_log = await SecurityAuditLogger.log_authentication_event(
                db=None,  # Create separate session to ensure persistence
                event_type=SecurityEventType.LOGIN_FAILURE,
                description=f"Failed login attempt for email: {normalized_email}",
                user_email=normalized_email if user else None,
                user_id=user.id if user else None,
                ip_address=client_ip,
                user_agent=user_agent,
                request_method=request.method,
                request_path=str(request.url.path),
                success="failure",
                metadata={"reason": "invalid_credentials"}
            )
            if audit_log:
                logger.info(f"✅ Login failure audit log created successfully (ID: {audit_log.id})")
            else:
                logger.error("❌ Login failure audit log returned None - logging may have failed silently")
        except Exception as e:
            # Don't fail the request if audit logging fails, but log prominently
            error_msg = (
                f"❌ FAILED TO LOG LOGIN FAILURE EVENT: {e}\n"
                f"   Email: {normalized_email}\n"
                f"   IP: {client_ip}\n"
                f"   Error Type: {type(e).__name__}\n"
                f"   Error Details: {str(e)}"
            )
            logger.error(error_msg, exc_info=True)
            print(error_msg, flush=True)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user account is active
    if not user.is_active:
        # Log failed login attempt (account disabled)
        # Use separate session (db=None) to ensure log is saved even if exception is raised
        try:
            await SecurityAuditLogger.log_authentication_event(
                db=None,  # Create separate session to ensure persistence
                event_type=SecurityEventType.LOGIN_FAILURE,
                description=f"Login attempt for disabled account: {user.email}",
                user_email=user.email,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                request_method=request.method,
                request_path=str(request.url.path),
                success="failure",
                metadata={"reason": "account_disabled"}
            )
        except Exception as e:
            logger.error(f"Failed to log disabled account login attempt: {e}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled. Please contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "type": "access"},
        expires_delta=access_token_expires,
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id, "type": "refresh"}
    )

    # Log successful login
    # Note: log_authentication_event() commits internally, so we don't need to commit again
    try:
        await SecurityAuditLogger.log_authentication_event(
            db=db,
            event_type=SecurityEventType.LOGIN_SUCCESS,
            description=f"User logged in successfully: {user.email}",
            user_id=user.id,
            user_email=user.email,
            ip_address=client_ip,
            user_agent=user_agent,
            request_method=request.method,
            request_path=str(request.url.path),
            success="success",
            metadata={"login_method": "password"}
        )
    except Exception as e:
        # Don't fail the request if audit logging fails, but log the error prominently
        error_msg = (
            f"⚠️ SECURITY AUDIT LOGGING FAILED FOR LOGIN: {e}\n"
            f"   User: {user.email} (ID: {user.id})\n"
            f"   IP: {client_ip}\n"
            f"   This is a critical issue - audit logs are not being saved!"
        )
        logger.error(error_msg, exc_info=True)
        print(error_msg, flush=True)
        # Try to rollback any partial transaction
        try:
            await db.rollback()
        except Exception:
            pass

    # Convert user to UserResponse format
    # Use direct constructor for consistency with get_current_user_info endpoint
    try:
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            avatar=user.avatar,
            is_active=user.is_active,
            user_type=user.user_type.value if user.user_type else "INDIVIDUAL",
            theme_preference=user.theme_preference or 'system',  # Required field for API compatibility
            created_at=user.created_at.isoformat() if user.created_at else "",
            updated_at=user.updated_at.isoformat() if user.updated_at else "",
        )
    except Exception as e:
        logger.error(f"Error creating UserResponse for user {user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing user data: {str(e)}"
        )
    
    # Return JSONResponse explicitly to work with rate limiting middleware
    # SECURITY: Set tokens in httpOnly cookies for maximum security
    try:
        token_data = TokenWithUser(
            access_token=access_token,
            token_type="bearer",
            refresh_token=refresh_token,
            user=user_response
        )
        
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=token_data.model_dump()
        )
        
        # SECURITY: Set tokens in httpOnly cookies (server-side only)
        # This provides defense in depth - tokens in both response body and cookies
        # Note: samesite="lax" allows cookies to be sent with cross-origin requests
        # when withCredentials: true is set in axios, which is necessary for CORS
        is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=is_production,
            samesite="lax",  # Changed from "strict" to "lax" to allow cross-origin requests
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=is_production,
            samesite="lax",  # Changed from "strict" to "lax" to allow cross-origin requests
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/",
        )
        
        return response
    except Exception as e:
        logger.error(f"Error creating TokenWithUser response for user {user.id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating response: {str(e)}"
        )


@router.post("/refresh", response_model=Token)
@rate_limit_decorator("10/minute")  # Rate limit: 10 requests per minute
async def refresh_token(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    refresh_data: Optional[RefreshTokenRequest] = None,
) -> Token:
    """
    Refresh access token
    
    SECURITY: Accepts refresh token from:
    1. httpOnly cookies (preferred, most secure)
    2. Request body (for backward compatibility)
    
    Args:
        request: FastAPI request object (to access cookies)
        refresh_data: Optional request body with refresh_token (for backward compatibility)
        db: Database session
        
    Returns:
        New access token and refresh token
    """
    # SECURITY: Prefer reading refresh token from httpOnly cookies (most secure)
    refresh_token = request.cookies.get("refresh_token")
    
    # Fallback to request body for backward compatibility
    if not refresh_token and refresh_data:
        refresh_token = refresh_data.token or refresh_data.refresh_token
    
    if not refresh_token:
        # Log security event
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.INVALID_TOKEN,
                description="Refresh token missing in refresh attempt",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                request_method=request.method,
                request_path=str(request.url.path),
                severity="warning",
                success="failure",
            )
        except Exception:
            pass  # Don't fail if audit logging fails
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required (in cookie or request body)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # SECURITY: Decode refresh token (must be type "refresh")
        # Use verify_exp=False to read expired tokens for validation
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM], options={"verify_exp": False})
        
        # SECURITY: Verify token type - must be "refresh" for refresh endpoint
        token_type = payload.get("type")
        if token_type != "refresh":
            # Log security event for invalid token type
            try:
                await SecurityAuditLogger.log_event(
                    db=db,
                    event_type=SecurityEventType.INVALID_TOKEN,
                    description=f"Invalid token type in refresh attempt: {token_type}",
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent"),
                    request_method=request.method,
                    request_path=str(request.url.path),
                    severity="warning",
                    success="failure",
                    metadata={"token_type": token_type, "expected": "refresh"}
                )
            except Exception:
                pass
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Refresh token required.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user email from token
        username = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify user still exists and is active
        result = await db.execute(
            select(User).where(User.email == username)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is not active",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # SECURITY: Create new access token and refresh token (token rotation)
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "type": "access"},
            expires_delta=access_token_expires,
        )
        
        # SECURITY: Generate new refresh token (token rotation for security)
        new_refresh_token = create_refresh_token(data={"sub": user.email})
        
        # Log successful refresh
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.TOKEN_REFRESHED,
                description="Access token refreshed successfully",
                user_id=user.id,
                user_email=user.email,
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                request_method=request.method,
                request_path=str(request.url.path),
                severity="info",
                success="success",
            )
        except Exception:
            pass
        
        logger.info(f"Token refreshed for user {user.email}")
        
        # Return JSONResponse with both tokens
        # SECURITY: Frontend should store new tokens in httpOnly cookies
        token_data = Token(
            access_token=access_token,
            refresh_token=new_refresh_token,  # Include new refresh token for rotation
            token_type="bearer"
        )
        
        response = JSONResponse(
            status_code=status.HTTP_200_OK,
            content=token_data.model_dump()
        )
        
        # SECURITY: Optionally set tokens in httpOnly cookies server-side
        # This provides defense in depth - tokens in both response body and cookies
        # Note: samesite="lax" allows cookies to be sent with cross-origin requests
        # when withCredentials: true is set in axios, which is necessary for CORS
        is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=is_production,
            samesite="lax",  # Changed from "strict" to "lax" to allow cross-origin requests
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            path="/",
        )
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=is_production,
            samesite="lax",  # Changed from "strict" to "lax" to allow cross-origin requests
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/",
        )
        
        return response
        
    except jwt.ExpiredSignatureError:
        # SECURITY: Refresh token is expired - log and reject
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.INVALID_TOKEN,
                description="Expired refresh token used in refresh attempt",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                request_method=request.method,
                request_path=str(request.url.path),
                severity="warning",
                success="failure",
            )
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError as e:
        # SECURITY: Invalid JWT token - log and reject
        logger.warning(f"JWT error during refresh: {e}")
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.INVALID_TOKEN,
                description=f"Invalid refresh token: {str(e)}",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                request_method=request.method,
                request_path=str(request.url.path),
                severity="warning",
                success="failure",
                metadata={"error": str(e)}
            )
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        # SECURITY: Unexpected error - log and reject
        logger.error(f"Unexpected error during token refresh: {e}", exc_info=True)
        try:
            await SecurityAuditLogger.log_event(
                db=db,
                event_type=SecurityEventType.INVALID_TOKEN,
                description=f"Unexpected error during refresh: {str(e)}",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                request_method=request.method,
                request_path=str(request.url.path),
                severity="error",
                success="failure",
                metadata={"error": str(e), "error_type": type(e).__name__}
            )
        except Exception:
            pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during token refresh",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/logout")
async def logout(
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Logout endpoint
    
    Logs the logout event in the audit trail.
    Note: Token invalidation is handled client-side by removing the token.
    
    Args:
        request: FastAPI request object
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    # Get client IP and user agent for audit logging
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Log logout event
    # Use separate session (db=None) to ensure log is saved independently
    logger.info(f"Logout endpoint called for user {current_user.email} (ID: {current_user.id})")
    try:
        audit_log = await SecurityAuditLogger.log_authentication_event(
            db=None,  # Create separate session to ensure persistence
            event_type=SecurityEventType.LOGOUT,
            description=f"User logged out: {current_user.email}",
            user_id=current_user.id,
            user_email=current_user.email,
            ip_address=client_ip,
            user_agent=user_agent,
            request_method=request.method,
            request_path=str(request.url.path),
            success="success"
        )
        if audit_log:
            logger.info(f"✅ Logout audit log created successfully (ID: {audit_log.id})")
        else:
            logger.error("❌ Logout audit log returned None - logging may have failed silently")
    except Exception as e:
        # Don't fail the request if audit logging fails, but log prominently
        error_msg = (
            f"❌ FAILED TO LOG LOGOUT EVENT: {e}\n"
            f"   User: {current_user.email} (ID: {current_user.id})\n"
            f"   IP: {client_ip}\n"
            f"   Error Type: {type(e).__name__}\n"
            f"   Error Details: {str(e)}"
        )
        logger.error(error_msg, exc_info=True)
        print(error_msg, flush=True)
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """
    Get current user information
    
    Args:
        current_user: Current authenticated user
    
    Returns:
        User information
    """
    try:
        logger.info(f"Getting user info for: {current_user.email}")
        # Convert User model to UserResponse schema
        # This ensures relations are not loaded unnecessarily
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            avatar=current_user.avatar,
            is_active=current_user.is_active,
            user_type=current_user.user_type.value if current_user.user_type else "INDIVIDUAL",
            # theme_preference is deprecated but kept for API compatibility
            theme_preference=current_user.theme_preference or 'system',
            created_at=current_user.created_at.isoformat() if current_user.created_at else "",
            updated_at=current_user.updated_at.isoformat() if current_user.updated_at else "",
        )
    except Exception as e:
        logger.error(f"Error in get_current_user_info: {e}", exc_info=True)
        raise


@router.get("/google", response_model=dict)
async def get_google_auth_url(
    request: Request,
    redirect: Annotated[str | None, Query(description="Frontend redirect URL after authentication")] = None,
):
    """
    Get Google OAuth authorization URL
    
    Args:
        request: FastAPI request object
        redirect: Optional frontend URL to redirect to after authentication
    
    Returns:
        Authorization URL for Google OAuth
    """
    try:
        logger.info(f"Google OAuth request received, redirect: {redirect}")
        logger.info(f"Request headers: {dict(request.headers)}")
        logger.info(f"Request URL: {request.url}")
        
        if not settings.GOOGLE_CLIENT_ID:
            logger.warning("Google OAuth not configured: GOOGLE_CLIENT_ID missing")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth is not configured"
            )
        
        # Build redirect URI - use the configured one or construct from request
        callback_uri = settings.GOOGLE_REDIRECT_URI
        if not callback_uri:
            # Use BASE_URL from settings if available, otherwise construct from request
            if settings.BASE_URL:
                backend_base_url = settings.BASE_URL.rstrip("/")
                logger.info(f"Using BASE_URL from settings: {backend_base_url}")
            else:
                try:
                    backend_base_url = str(request.base_url).rstrip("/")
                    logger.info(f"Using request.base_url: {backend_base_url}")
                except Exception as e:
                    logger.error(f"Error getting base_url from request: {e}")
                    # Fallback to BASE_URL from settings or environment variable
                    import os
                    backend_base_url = os.getenv("BASE_URL", "http://localhost:8000")
                    logger.warning(f"Using fallback base_url from environment: {backend_base_url}")
            callback_uri = f"{backend_base_url}{settings.API_V1_STR}/auth/google/callback"
        
        # Ensure callback_uri doesn't have trailing slash (Google is strict about exact match)
        callback_uri = callback_uri.rstrip("/")
        
        logger.info(f"Google OAuth callback URI: {callback_uri}")
        logger.info(f"GOOGLE_REDIRECT_URI from settings: {settings.GOOGLE_REDIRECT_URI}")
        logger.info(f"BASE_URL from settings: {settings.BASE_URL}")
        
        # Google OAuth 2.0 authorization endpoint
        google_auth_base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": callback_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        
        # Add state parameter if frontend redirect URL is provided
        if redirect:
            params["state"] = redirect
        
        auth_url = f"{google_auth_base_url}?{urlencode(params)}"
        
        logger.info(f"Generated Google OAuth URL (length: {len(auth_url)})")
        logger.info(f"Returning response with auth_url")
        
        response_data = {"auth_url": auth_url}
        logger.info(f"Response data prepared: {response_data}")
        
        return response_data
    except HTTPException as e:
        logger.error(f"HTTPException in get_google_auth_url: {e.status_code} - {e.detail}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error generating Google OAuth URL: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Google OAuth URL: {str(e)}"
        )


@router.get("/google/callback")
async def google_oauth_callback(
    request: Request,
    code: Annotated[str, Query(description="Authorization code from Google")],
    db: Annotated[AsyncSession, Depends(get_db)],
    state: Annotated[str | None, Query(description="State parameter (frontend redirect URL)")] = None,
):
    """
    Handle Google OAuth callback
    
    Args:
        request: FastAPI request object
        code: Authorization code from Google
        state: Optional state parameter (frontend redirect URL)
        db: Database session
    
    Returns:
        Redirect to frontend with token
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured"
        )
    
    # Build redirect URI - must match EXACTLY the one used in /google endpoint
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    if not redirect_uri:
        # Use BASE_URL from settings if available, otherwise construct from request
        if settings.BASE_URL:
            backend_base_url = settings.BASE_URL.rstrip("/")
            logger.info(f"Using BASE_URL from settings for redirect_uri: {backend_base_url}")
        else:
            backend_base_url = str(request.base_url).rstrip("/")
            logger.info(f"Using request.base_url for redirect_uri: {backend_base_url}")
        redirect_uri = f"{backend_base_url}{settings.API_V1_STR}/auth/google/callback"
    
    # Ensure redirect_uri doesn't have trailing slash (Google is strict about exact match)
    redirect_uri = redirect_uri.rstrip("/")
    
    logger.info(f"Google OAuth callback - redirect_uri: {redirect_uri}")
    logger.info(f"Google OAuth callback - code received: {code[:20]}... (truncated)")
    logger.info(f"Google OAuth callback - state: {state}")
    
    try:
        # Exchange authorization code for tokens
        async with httpx.AsyncClient(timeout=30.0) as client:
            token_request_data = {
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            }
            logger.info(f"Google token exchange request - redirect_uri: {redirect_uri}")
            logger.info(f"Google token exchange request - client_id: {settings.GOOGLE_CLIENT_ID[:10]}... (truncated)")
            
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data=token_request_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            
            logger.info(f"Google token exchange response status: {token_response.status_code}")
            
            if token_response.status_code != 200:
                error_text = token_response.text
                logger.error(f"Google token exchange failed - Status: {token_response.status_code}")
                logger.error(f"Google token exchange failed - Response: {error_text}")
                logger.error(f"Google token exchange failed - Request redirect_uri: {redirect_uri}")
                
                # Try to parse error details if available
                try:
                    error_json = token_response.json()
                    error_detail = error_json.get("error_description", error_json.get("error", "Unknown error"))
                    logger.error(f"Google token exchange error details: {error_detail}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Failed to exchange authorization code: {error_detail}"
                    )
                except Exception:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Failed to exchange authorization code: {error_text}"
                    )
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            
            if not access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No access token received from Google"
                )
            
            # Get user info from Google
            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            
            if userinfo_response.status_code != 200:
                logger.error(f"Google userinfo failed: {userinfo_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user information from Google"
                )
            
            google_user = userinfo_response.json()
            email = google_user.get("email")
            name = google_user.get("name", "")
            picture = google_user.get("picture")
            
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email not provided by Google"
                )
            
            # Split name into first_name and last_name
            name_parts = name.split(" ", 1) if name else ["", ""]
            first_name = name_parts[0] if len(name_parts) > 0 else ""
            last_name = name_parts[1] if len(name_parts) > 1 else ""
            
            # Check if user exists
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
            is_new_user = user is None
            
            # Create or update user
            if user:
                # Update existing user
                user.first_name = first_name or user.first_name
                user.last_name = last_name or user.last_name
                # Mark as active if not already
                if not user.is_active:
                    user.is_active = True
            else:
                # Create new user
                # Generate a random password since Google OAuth users don't have passwords
                # Bcrypt has a 72-byte limit, so we use token_hex(32) which generates 64 hex characters (64 bytes)
                # This is safely under the 72-byte limit
                import secrets
                random_password = secrets.token_hex(32)  # 32 bytes * 2 = 64 hex characters = 64 bytes (safe)
                logger.debug(f"Generated password for Google OAuth user: {len(random_password)} chars, {len(random_password.encode('utf-8'))} bytes")
                hashed_password = get_password_hash(random_password)
                
                user = User(
                    email=email,
                    hashed_password=hashed_password,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=True,
                )
                db.add(user)
            
            await db.commit()
            await db.refresh(user)
            
            # Create JWT token (use email as subject, consistent with login endpoint)
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            jwt_token = create_access_token(
                data={"sub": user.email, "type": "access"},
                expires_delta=access_token_expires,
            )
            
            # Log successful Google OAuth login
            try:
                client_ip = request.client.host if request.client else None
                user_agent = request.headers.get("user-agent")
                await SecurityAuditLogger.log_authentication_event(
                    db=db,
                    event_type=SecurityEventType.LOGIN_SUCCESS,
                    description=f"User logged in via Google OAuth: {user.email}",
                    user_id=user.id,
                    user_email=user.email,
                    ip_address=client_ip,
                    user_agent=user_agent,
                    request_method=request.method,
                    request_path=str(request.url.path),
                    success="success",
                    metadata={"login_method": "google_oauth", "is_new_user": is_new_user}
                )
            except Exception as e:
                # Don't fail the request if audit logging fails
                logger.error(f"Failed to log Google OAuth authentication event: {e}", exc_info=True)
            
            # Determine frontend redirect URL
            # If state is already a full URL (starts with http), use it directly
            # Otherwise, construct the URL from state or use FRONTEND_URL from settings
            import os
            # Get frontend URL from settings (CORS_ORIGINS first item) or environment variable
            frontend_base = None
            if settings.CORS_ORIGINS and isinstance(settings.CORS_ORIGINS, list) and len(settings.CORS_ORIGINS) > 0:
                frontend_base = settings.CORS_ORIGINS[0].rstrip("/")
                logger.info(f"Using frontend base from CORS_ORIGINS list: {frontend_base}")
            elif isinstance(settings.CORS_ORIGINS, str) and settings.CORS_ORIGINS.strip():
                frontend_base = settings.CORS_ORIGINS.strip().rstrip("/")
                logger.info(f"Using frontend base from CORS_ORIGINS string: {frontend_base}")
            
            if not frontend_base:
                frontend_base = os.getenv("FRONTEND_URL") or os.getenv("NEXT_PUBLIC_APP_URL")
                if frontend_base:
                    frontend_base = frontend_base.rstrip("/")
                    logger.info(f"Using frontend base from environment variable: {frontend_base}")
                else:
                    frontend_base = "http://localhost:3000"
                    logger.warning(f"Frontend base not configured, using fallback: {frontend_base}")
            
            logger.info(f"Final frontend base URL: {frontend_base}, state: {state}")
            
            # Default locale for next-intl (usually 'en' or 'fr')
            # This ensures the redirect goes to the correct localized route
            default_locale = os.getenv("DEFAULT_LOCALE", "fr")
            
            if state and state.startswith(("http://", "https://")):
                # State is already a full URL, use it directly
                frontend_url = state.rstrip("/")
                redirect_url = f"{frontend_url}?token={jwt_token}&type=google"
            elif state:
                # State is a relative path (e.g., "/auth/callback")
                # Ensure it starts with / and doesn't end with /
                state_path = state if state.startswith("/") else f"/{state}"
                state_path = state_path.rstrip("/")
                
                # If state doesn't include locale, add it for next-intl compatibility
                if not state_path.startswith(f"/{default_locale}/"):
                    redirect_url = f"{frontend_base}/{default_locale}{state_path}?token={jwt_token}&type=google"
                else:
                    redirect_url = f"{frontend_base}{state_path}?token={jwt_token}&type=google"
            else:
                # No state provided, use default callback URL with locale
                redirect_url = f"{frontend_base}/{default_locale}/auth/callback?token={jwt_token}&type=google"
            
            logger.info(f"Google OAuth successful for user {email}, redirecting to {redirect_url}")
            
            # Use HTTP 302 redirect (standard OAuth redirect)
            # This is the most reliable method for OAuth callbacks
            logger.info(f"Returning HTTP 302 redirect to: {redirect_url}")
            return RedirectResponse(url=redirect_url, status_code=302)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google OAuth callback error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema"""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema"""
    token: str
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@rate_limit_decorator("3/minute")
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Request password reset
    
    SECURITY: Always returns 200 OK, even if user doesn't exist.
    This prevents email enumeration attacks.
    
    Args:
        request: FastAPI request object
        forgot_data: Email address
        db: Database session
        
    Returns:
        Success message (always 200 OK)
    """
    logger.info(f"📧 FORGOT PASSWORD ENDPOINT CALLED")
    logger.info(f"📧 Request data received - Email present: {bool(forgot_data.email)}")
    
    try:
        logger.info(f"📧 Forgot password request received for email: {forgot_data.email}")
        
        # Normalize email (lowercase and trim) for consistent lookup
        normalized_email = forgot_data.email.strip().lower()
        
        # Get client IP and user agent for audit logging
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        # Try to find user (but don't reveal if they exist)
        result = await db.execute(
            select(User).where(User.email == normalized_email)
        )
        user = result.scalar_one_or_none()
        
        # Log password reset request attempt (use separate session to avoid conflicts)
        try:
            await SecurityAuditLogger.log_event(
                db=None,  # Create separate session to ensure persistence
                event_type=SecurityEventType.PASSWORD_RESET_REQUEST,
                description=f"Password reset requested for email: {normalized_email}",
                user_id=user.id if user else None,
                user_email=normalized_email if user else None,
                ip_address=client_ip,
                user_agent=user_agent,
                request_method=request.method,
                request_path=str(request.url.path),
                severity="info",
                success="success" if user else "failure",
                metadata={"user_exists": user is not None}
            )
        except Exception as e:
            # Don't fail the request if audit logging fails
            logger.warning(f"⚠️ Failed to log password reset request (non-critical): {e}")
        
        # Only send email if user exists
        if user:
            try:
                # Generate password reset token (JWT with 1 hour expiration)
                reset_token_expires = timedelta(hours=1)
                reset_token = jwt.encode(
                    {
                        "sub": user.email,
                        "type": "password_reset",
                        "exp": datetime.now(timezone.utc) + reset_token_expires,
                        "iat": datetime.now(timezone.utc),
                    },
                    settings.SECRET_KEY,
                    algorithm=settings.ALGORITHM,
                )
                
                # Build reset URL
                frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
                reset_url = f"{frontend_url}/auth/reset-password?token={reset_token}"
                
                # Get user name for email
                user_name = f"{user.first_name} {user.last_name}".strip() if user.first_name or user.last_name else user.email.split("@")[0]
                
                # Send password reset email - try direct send first (more reliable than Celery)
                # Since user confirmed SendGrid keys are on Railway, use direct send
                email_sent = False
                email_error = None
                
                try:
                    from app.services.email_service import EmailService
                    email_service = EmailService()
                    
                    # Check SendGrid configuration with detailed logging
                    sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "")
                    sendgrid_from_email = os.getenv("SENDGRID_FROM_EMAIL", "")
                    sendgrid_from_name = os.getenv("SENDGRID_FROM_NAME", "")
                    
                    logger.info(f"🔍 SendGrid config check - API_KEY: {'✅ Set' if sendgrid_api_key else '❌ Missing'}, FROM_EMAIL: {sendgrid_from_email or 'Not set'}, FROM_NAME: {sendgrid_from_name or 'Not set'}")
                    
                    sendgrid_configured = email_service.is_configured()
                    
                    if not sendgrid_configured:
                        error_msg = f"❌ SendGrid not configured - SENDGRID_API_KEY is {'empty' if not sendgrid_api_key else 'invalid'}. Cannot send password reset email to {user.email}"
                        logger.error(error_msg)
                        email_error = "SendGrid not configured"
                        print(error_msg, flush=True)
                    else:
                        # Send email directly via SendGrid
                        try:
                            logger.info(f"📧 Attempting to send password reset email to {user.email} via SendGrid...")
                            logger.info(f"📧 Reset URL: {reset_url[:50]}... (truncated)")
                            
                            result = email_service.send_password_reset_email(
                                to_email=user.email,
                                name=user_name,
                                reset_token=reset_token,
                                reset_url=reset_url
                            )
                            status = result.get('status', 'unknown')
                            message_id = result.get('message_id', 'N/A')
                            status_code = result.get('status_code', 'N/A')
                            
                            logger.info(f"✅ Password reset email sent via SendGrid for user: {user.email}")
                            logger.info(f"   Status: {status}, Status Code: {status_code}, Message ID: {message_id}")
                            email_sent = True
                        except ValueError as e:
                            error_msg = f"❌ SendGrid configuration error: {str(e)}"
                            logger.error(error_msg, exc_info=True)
                            email_error = str(e)
                            print(error_msg, flush=True)
                        except RuntimeError as e:
                            error_msg = f"❌ SendGrid API error sending to {user.email}: {str(e)}"
                            logger.error(error_msg, exc_info=True)
                            email_error = str(e)
                            print(error_msg, flush=True)
                        except Exception as e:
                            error_msg = f"❌ Unexpected error sending password reset email via SendGrid to {user.email}: {str(e)}"
                            logger.error(error_msg, exc_info=True)
                            email_error = str(e)
                            print(error_msg, flush=True)
                            
                            # Try Celery as fallback if direct send fails
                            try:
                                logger.info(f"🔄 Attempting Celery fallback for {user.email}...")
                                from app.tasks.email_tasks import send_password_reset_email_task
                                send_password_reset_email_task.delay(
                                    email=user.email,
                                    name=user_name,
                                    reset_token=reset_token,
                                    reset_url=reset_url
                                )
                                logger.info(f"✅ Password reset email queued via Celery (fallback) for user: {user.email}")
                                email_sent = True
                            except Exception as celery_error:
                                logger.warning(f"⚠️ Celery fallback also failed: {celery_error}")
                                
                except ImportError as e:
                    error_msg = f"❌ Failed to import EmailService: {str(e)}"
                    logger.error(error_msg, exc_info=True)
                    email_error = str(e)
                    print(error_msg, flush=True)
                except Exception as e:
                    error_msg = f"❌ Unexpected error sending password reset email to {user.email}: {str(e)}"
                    logger.error(error_msg, exc_info=True)
                    email_error = str(e)
                    print(error_msg, flush=True)
                
                # Log final status
                if email_sent:
                    logger.info(f"✅ Password reset email successfully sent for user: {user.email}")
                else:
                    logger.error(f"❌ Password reset email FAILED for user: {user.email}. Error: {email_error}")
                    print(f"❌ CRITICAL: Password reset email could not be sent to {user.email}. Error: {email_error}", flush=True)
                    
            except Exception as e:
                # Log error but don't fail the request (security: don't reveal if email was sent)
                error_msg = f"❌ Failed to generate password reset token for {normalized_email}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                print(error_msg, flush=True)
        
    except Exception as e:
        # Catch any unexpected errors and still return 200 OK (security best practice)
        error_type = type(e).__name__
        error_msg = str(e)
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"❌ Unexpected error in forgot_password endpoint: {error_type}: {error_msg}", exc_info=True)
        logger.error(f"❌ Full traceback:\n{error_traceback}")
        print(f"❌ CRITICAL: Unexpected error in forgot_password - Type: {error_type}, Message: {error_msg}", flush=True)
        print(f"❌ Full traceback:\n{error_traceback}", flush=True)
        # Still return 200 OK to prevent email enumeration
    
    # Always return 200 OK (security best practice - don't reveal if user exists)
    # IMPORTANT: Return JSONResponse explicitly for slowapi compatibility
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "If an account with that email exists, we've sent you a password reset link."}
    )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@rate_limit_decorator("5/minute")
async def reset_password(
    request: Request,
    reset_data: ResetPasswordRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Reset password using token
    
    Args:
        request: FastAPI request object
        reset_data: Reset token and new password
        db: Database session
        
    Returns:
        Success message
    """
    logger.info(f"🔐 RESET PASSWORD ENDPOINT CALLED")
    logger.info(f"🔐 Request data received - Token present: {bool(reset_data.token)}, Password present: {bool(reset_data.new_password)}")
    print(f"🔐 [DEBUG] Password reset endpoint called - Token: {bool(reset_data.token)}, Password: {bool(reset_data.new_password)}", flush=True)
    
    try:
        # Get client IP and user agent for audit logging
        try:
            client_ip = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            logger.info(f"🔐 Password reset request received - IP: {client_ip}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to get client info: {e}")
            client_ip = None
            user_agent = None
        
        # Validate request data
        try:
            logger.info(f"🔐 Request data validation:")
            logger.info(f"   - Token present: {bool(reset_data.token)}")
            logger.info(f"   - Token length: {len(reset_data.token) if reset_data.token else 0}")
            logger.info(f"   - Password present: {bool(reset_data.new_password)}")
            logger.info(f"   - Password length: {len(reset_data.new_password) if reset_data.new_password else 0}")
            
            if not reset_data.token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reset token is required"
                )
            
            if not reset_data.new_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="New password is required"
                )
            
            if len(reset_data.new_password) < 8:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password must be at least 8 characters long"
                )
        except HTTPException:
            raise
        except Exception as validation_error:
            logger.error(f"❌ Request validation error: {type(validation_error).__name__}: {str(validation_error)}", exc_info=True)
            print(f"❌ [ERROR] Validation error: {type(validation_error).__name__}: {str(validation_error)}", flush=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid request data: {str(validation_error)}"
            )
        
        try:
            logger.info(f"🔐 Password reset attempt - Token length: {len(reset_data.token)}, Password length: {len(reset_data.new_password)}")
            
            # Verify settings are loaded correctly
            try:
                has_secret = bool(settings.SECRET_KEY)
                secret_len = len(settings.SECRET_KEY) if settings.SECRET_KEY else 0
                logger.info(f"🔐 SECRET_KEY configured: {has_secret}, length: {secret_len}")
                logger.info(f"🔐 ALGORITHM: {settings.ALGORITHM}")
                print(f"🔐 [DEBUG] SECRET_KEY present: {has_secret}, length: {secret_len}, algorithm: {settings.ALGORITHM}", flush=True)
                
                if not settings.SECRET_KEY:
                    logger.error("❌ SECRET_KEY is not configured!")
                    print("❌ [CRITICAL] SECRET_KEY is not configured in settings!", flush=True)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Server configuration error. Please contact support."
                    )
            except Exception as settings_error:
                logger.error(f"❌ Error accessing settings: {type(settings_error).__name__}: {str(settings_error)}", exc_info=True)
                print(f"❌ [ERROR] Settings access error: {type(settings_error).__name__}: {str(settings_error)}", flush=True)
                raise
            
            # Decode and verify reset token
            try:
                print(f"🔐 [DEBUG] Attempting to decode JWT token...", flush=True)
                payload = jwt.decode(
                    reset_data.token,
                    settings.SECRET_KEY,
                    algorithms=[settings.ALGORITHM]
                )
                logger.info(f"✅ Token decoded successfully - Type: {payload.get('type')}, Email: {payload.get('sub')}")
                print(f"✅ [DEBUG] Token decoded - Type: {payload.get('type')}, Email: {payload.get('sub')}", flush=True)
            except jwt.ExpiredSignatureError as e:
                logger.warning(f"⚠️ Password reset token expired: {str(e)}")
                print(f"⚠️ [DEBUG] Token expired: {str(e)}", flush=True)
                raise
            except jwt.JWTError as e:
                logger.warning(f"⚠️ Invalid JWT token: {type(e).__name__}: {str(e)}")
                print(f"⚠️ [DEBUG] JWT error: {type(e).__name__}: {str(e)}", flush=True)
                raise
            except Exception as e:
                logger.error(f"❌ Unexpected error decoding token: {type(e).__name__}: {str(e)}", exc_info=True)
                print(f"❌ [ERROR] Unexpected JWT decode error: {type(e).__name__}: {str(e)}", flush=True)
                raise
            
            # Verify token type
            token_type = payload.get("type")
            if token_type != "password_reset":
                logger.warning(f"⚠️ Invalid token type: {token_type} (expected: password_reset)")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token type"
                )
            
            # Get user email from token
            user_email = payload.get("sub")
            if not user_email:
                logger.warning("⚠️ Token missing 'sub' claim")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token payload"
                )
            
            # Normalize email
            try:
                normalized_email = user_email.strip().lower()
                logger.info(f"🔍 Looking up user with email: {normalized_email}")
                print(f"🔍 [DEBUG] Looking up user: {normalized_email}", flush=True)
            except Exception as e:
                logger.error(f"❌ Error normalizing email: {type(e).__name__}: {str(e)}", exc_info=True)
                print(f"❌ [ERROR] Email normalization error: {type(e).__name__}: {str(e)}", flush=True)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format"
                )
            
            # Find user
            try:
                print(f"🔍 [DEBUG] Executing database query...", flush=True)
                result = await db.execute(
                    select(User).where(User.email == normalized_email)
                )
                user = result.scalar_one_or_none()
                print(f"🔍 [DEBUG] Database query complete - User found: {bool(user)}", flush=True)
            except Exception as db_error:
                logger.error(f"❌ Database error looking up user: {type(db_error).__name__}: {str(db_error)}", exc_info=True)
                print(f"❌ [ERROR] Database query error: {type(db_error).__name__}: {str(db_error)}", flush=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Database error. Please try again later."
                )
            
            if not user:
                logger.warning(f"⚠️ User not found for email: {normalized_email}")
                print(f"⚠️ [DEBUG] User not found for: {normalized_email}", flush=True)
                # TODO: Re-enable audit logging after debugging
                
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired reset token"
                )
            
            logger.info(f"✅ User found: {user.email} (ID: {user.id}, Active: {user.is_active})")
            
            # Check if user is active
            if not user.is_active:
                logger.warning(f"⚠️ Account disabled for user: {user.email}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Account is disabled"
                )
            
            # Update password
            try:
                logger.info(f"🔐 Hashing new password for user: {user.email}")
                logger.info(f"🔐 Password to hash length: {len(reset_data.new_password)} characters")
                print(f"🔐 [DEBUG] Starting password hash for user: {user.email}", flush=True)
                
                # Hash the password
                try:
                    print(f"🔐 [DEBUG] Calling get_password_hash...", flush=True)
                    hashed_password = get_password_hash(reset_data.new_password)
                    logger.info(f"✅ Password hashed successfully (length: {len(hashed_password)} characters)")
                    print(f"✅ [DEBUG] Password hashed successfully", flush=True)
                except Exception as hash_error:
                    logger.error(f"❌ Error hashing password: {type(hash_error).__name__}: {str(hash_error)}", exc_info=True)
                    print(f"❌ [ERROR] Password hashing failed: {type(hash_error).__name__}: {str(hash_error)}", flush=True)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Error processing password. Please try again."
                    )
                
                # Update user password
                try:
                    print(f"🔐 [DEBUG] Assigning password to user object...", flush=True)
                    user.hashed_password = hashed_password
                    logger.info(f"✅ Password assigned to user object")
                    print(f"✅ [DEBUG] Password assigned to user", flush=True)
                except Exception as assign_error:
                    logger.error(f"❌ Error assigning password to user: {type(assign_error).__name__}: {str(assign_error)}", exc_info=True)
                    print(f"❌ [ERROR] Password assignment failed: {type(assign_error).__name__}: {str(assign_error)}", flush=True)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Error updating user. Please try again."
                    )
                
                # Commit to database
                try:
                    logger.info(f"💾 Committing password update to database...")
                    print(f"💾 [DEBUG] Starting database commit...", flush=True)
                    await db.commit()
                    logger.info(f"✅ Database commit successful")
                    print(f"✅ [DEBUG] Database commit successful", flush=True)
                except Exception as commit_error:
                    logger.error(f"❌ Error committing to database: {type(commit_error).__name__}: {str(commit_error)}", exc_info=True)
                    print(f"❌ [ERROR] Database commit failed: {type(commit_error).__name__}: {str(commit_error)}", flush=True)
                    try:
                        await db.rollback()
                        print(f"↩️ [DEBUG] Database rollback successful", flush=True)
                    except Exception as rollback_error:
                        print(f"❌ [ERROR] Rollback failed: {type(rollback_error).__name__}: {str(rollback_error)}", flush=True)
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Database error. Please try again later."
                    )
                
                # Refresh user from database
                try:
                    await db.refresh(user)
                    logger.info(f"✅ User refreshed from database")
                    print(f"✅ [DEBUG] User refreshed from database", flush=True)
                except Exception as refresh_error:
                    logger.warning(f"⚠️ Error refreshing user (non-critical): {type(refresh_error).__name__}: {str(refresh_error)}")
                    print(f"⚠️ [DEBUG] User refresh failed (non-critical): {str(refresh_error)}", flush=True)
                    # Don't fail if refresh fails, password is already updated
                
                logger.info(f"✅ Password updated successfully in database for user: {user.email}")
                print(f"✅ [DEBUG] Password reset completed successfully for: {user.email}", flush=True)
            except HTTPException:
                raise
            except Exception as e:
                error_type = type(e).__name__
                error_msg = str(e)
                logger.error(f"❌ Error updating password: {error_type}: {error_msg}", exc_info=True)
                print(f"❌ CRITICAL: Password update failed - Type: {error_type}, Message: {error_msg}", flush=True)
                try:
                    await db.rollback()
                except Exception:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="An error occurred while updating your password. Please try again."
                )
            
            logger.info(f"Password reset successful for user: {user.email}")
            print(f"✅ [SUCCESS] Password reset completed successfully for user: {user.email}", flush=True)
            
            # TODO: Re-enable audit logging after debugging
            # Temporarily disabled to isolate 500 error issue
            # audit_result = await SecurityAuditLogger.log_event(...)
            
            # IMPORTANT: Return JSONResponse explicitly for slowapi compatibility
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={"message": "Password has been reset successfully"}
            )
            
        except jwt.ExpiredSignatureError:
            # TODO: Re-enable audit logging after debugging
            logger.warning("⚠️ Password reset token expired")
            print(f"⚠️ [DEBUG] Token expired", flush=True)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired. Please request a new one."
            )
        except jwt.JWTError as e:
            # TODO: Re-enable audit logging after debugging
            logger.warning(f"⚠️ Invalid JWT token: {type(e).__name__}: {str(e)}")
            print(f"⚠️ [DEBUG] JWT error: {type(e).__name__}: {str(e)}", flush=True)
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        except HTTPException:
            # Re-raise HTTP exceptions (already properly formatted)
            raise
        except Exception as inner_error:
            # Catch any other exception in the password reset flow
            error_type = type(inner_error).__name__
            error_msg = str(inner_error)
            logger.error(f"❌ Unexpected error in password reset flow: {error_type}: {error_msg}", exc_info=True)
            print(f"❌ [ERROR] Unexpected inner exception: {error_type}: {error_msg}", flush=True)
            
            # Return a clean HTTP exception instead of letting it bubble up as 500
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while resetting your password. Please try again."
            )
    except HTTPException:
        # Re-raise HTTP exceptions (already properly formatted)
        raise
    except Exception as e:
        error_type = type(e).__name__
        error_msg = str(e)
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f"❌ Unexpected error during password reset: {error_type}: {error_msg}", exc_info=True)
        logger.error(f"❌ Full traceback:\n{error_traceback}")
        print(f"❌ CRITICAL: Password reset error - Type: {error_type}, Message: {error_msg}", flush=True)
        print(f"❌ Full traceback:\n{error_traceback}", flush=True)
        
        # Return more detailed error in development, generic in production
        import os
        env = os.getenv("ENVIRONMENT", "development")
        if env == "development":
            detail = f"An error occurred while resetting your password: {error_type}: {error_msg}"
        else:
            # In production, provide a helpful error message
            detail = "An error occurred while resetting your password. Please try again or request a new reset link."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )

