"""
Coaching Endpoints
API endpoints for coaching session and package management
"""

from typing import List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies import get_current_user, get_stripe_service
from app.models import User
from app.services.coaching_service import CoachingService
from app.services.stripe_service import StripeService
from app.schemas.coaching import (
    CoachingPackageResponse,
    CoachingPackageListResponse,
    CoachingSessionCreate,
    CoachingSessionResponse,
    CoachingSessionListResponse,
    CheckoutSessionCreate,
    CheckoutSessionResponse,
    CoachAvailabilityRequest,
    CoachAvailabilityResponse,
    TimeSlot,
)

router = APIRouter(prefix="/coaching", tags=["coaching"])


def get_coaching_service(db: AsyncSession = Depends(get_db)) -> CoachingService:
    """Dependency to get coaching service"""
    return CoachingService(db)


@router.get("/packages", response_model=CoachingPackageListResponse)
async def list_packages(
    active_only: bool = Query(True, description="Only return active packages"),
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """List all available coaching packages"""
    packages = await coaching_service.get_all_packages(active_only=active_only)
    
    return CoachingPackageListResponse(
        packages=[CoachingPackageResponse.model_validate(pkg) for pkg in packages],
        total=len(packages)
    )


@router.get("/packages/{package_id}", response_model=CoachingPackageResponse)
async def get_package(
    package_id: int,
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Get coaching package by ID"""
    package = await coaching_service.get_package(package_id)
    
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    
    return CoachingPackageResponse.model_validate(package)


@router.get("/coaches", response_model=List[dict])
async def list_coaches(
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """List all available coaches"""
    coaches = await coaching_service.get_all_coaches()
    
    return [
        {
            "id": coach.id,
            "name": f"{coach.first_name} {coach.last_name}".strip() or coach.email,
            "email": coach.email,
            "first_name": coach.first_name,
            "last_name": coach.last_name,
            "avatar": coach.avatar,
        }
        for coach in coaches
    ]


@router.get("/coaches/{coach_id}", response_model=dict)
async def get_coach(
    coach_id: int,
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Get coach by ID"""
    coach = await coaching_service.get_coach(coach_id)
    
    if not coach:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coach not found"
        )
    
    return {
        "id": coach.id,
        "name": f"{coach.first_name} {coach.last_name}".strip() or coach.email,
        "email": coach.email,
        "first_name": coach.first_name,
        "last_name": coach.last_name,
        "avatar": coach.avatar,
    }


@router.post("/sessions", response_model=CoachingSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: CoachingSessionCreate,
    current_user: User = Depends(get_current_user),
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Create a new coaching session"""
    try:
        session = await coaching_service.create_session(
            user_id=current_user.id,
            coach_id=session_data.coach_id,
            scheduled_at=session_data.scheduled_at,
            duration_minutes=session_data.duration_minutes,
            package_id=session_data.package_id,
            notes=session_data.notes,
        )
        
        return CoachingSessionResponse.model_validate(session)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/sessions/me", response_model=CoachingSessionListResponse)
async def get_my_sessions(
    as_coach: bool = Query(False, description="Get sessions as coach"),
    status_filter: str = Query(None, description="Filter by status"),
    current_user: User = Depends(get_current_user),
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Get current user's coaching sessions"""
    from app.models.coaching_session import SessionStatus
    
    status_enum = None
    if status_filter:
        try:
            status_enum = SessionStatus(status_filter)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )
    
    sessions = await coaching_service.get_user_sessions(
        user_id=current_user.id,
        as_coach=as_coach,
        status=status_enum
    )
    
    return CoachingSessionListResponse(
        sessions=[CoachingSessionResponse.model_validate(s) for s in sessions],
        total=len(sessions)
    )


@router.get("/sessions/{session_id}", response_model=CoachingSessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Get coaching session by ID"""
    session = await coaching_service.get_session(session_id, user_id=current_user.id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return CoachingSessionResponse.model_validate(session)


@router.post("/sessions/{session_id}/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    session_id: int,
    checkout_data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    coaching_service: CoachingService = Depends(get_coaching_service),
    stripe_service: StripeService = Depends(get_stripe_service),
):
    """Create Stripe checkout session for a coaching session"""
    # Verify session belongs to user
    session = await coaching_service.get_session(session_id, user_id=current_user.id)
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this session"
        )
    
    from app.models.coaching_session import SessionStatus
    if session.status != SessionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not in pending status"
        )
    
    # Create Stripe checkout session
    stripe_session = await stripe_service.create_coaching_checkout_session(
        user=current_user,
        amount=float(session.amount),
        currency=session.currency or "cad",
        session_id=session_id,
        success_url=checkout_data.success_url,
        cancel_url=checkout_data.cancel_url,
        metadata={
            "coach_id": str(session.coach_id),
            "scheduled_at": session.scheduled_at.isoformat(),
        }
    )
    
    # Update session with Stripe checkout session ID
    await coaching_service.update_session_payment(
        session_id=session_id,
        stripe_checkout_session_id=stripe_session["session_id"],
        payment_status="pending"
    )
    
    return CheckoutSessionResponse(**stripe_session)


@router.post("/coaches/{coach_id}/availability", response_model=CoachAvailabilityResponse)
async def get_coach_availability(
    coach_id: int,
    request: CoachAvailabilityRequest,
    coaching_service: CoachingService = Depends(get_coaching_service),
):
    """Get available time slots for a coach"""
    if request.coach_id != coach_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coach ID mismatch"
        )
    
    slots = await coaching_service.get_coach_availability(
        coach_id=coach_id,
        start_date=request.start_date,
        end_date=request.end_date
    )
    
    return CoachAvailabilityResponse(
        coach_id=coach_id,
        slots=[
            TimeSlot(
                start=slot,
                end=slot + timedelta(minutes=60),
                available=True
            )
            for slot in slots
        ]
    )
