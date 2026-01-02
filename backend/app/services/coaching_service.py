"""
Coaching Service
Service for handling coaching session and package operations
"""

from typing import Optional, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.logging import logger
from app.models import User, CoachingSession, CoachingPackage, SessionStatus


class CoachingService:
    """Service for coaching operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_package(self, package_id: int) -> Optional[CoachingPackage]:
        """Get coaching package by ID"""
        result = await self.db.execute(
            select(CoachingPackage)
            .where(CoachingPackage.id == package_id)
        )
        return result.scalar_one_or_none()

    async def get_all_packages(self, active_only: bool = True) -> List[CoachingPackage]:
        """Get all coaching packages"""
        query = select(CoachingPackage)
        if active_only:
            query = query.where(CoachingPackage.is_active == True)
        query = query.order_by(CoachingPackage.is_popular.desc(), CoachingPackage.price.asc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_coach(self, coach_id: int) -> Optional[User]:
        """Get coach user by ID"""
        result = await self.db.execute(
            select(User)
            .where(User.id == coach_id)
            .where(User.user_type == "COACH")
        )
        return result.scalar_one_or_none()

    async def get_all_coaches(self) -> List[User]:
        """Get all active coaches"""
        result = await self.db.execute(
            select(User)
            .where(User.user_type == "COACH")
            .where(User.is_active == True)
            .order_by(User.first_name, User.last_name)
        )
        return list(result.scalars().all())

    async def create_session(
        self,
        user_id: int,
        coach_id: int,
        scheduled_at: datetime,
        duration_minutes: int,
        package_id: Optional[int] = None,
        notes: Optional[str] = None,
        amount: Optional[float] = None
    ) -> CoachingSession:
        """Create a new coaching session"""
        # Get package if provided to determine amount
        if package_id:
            package = await self.get_package(package_id)
            if not package:
                raise ValueError(f"Package {package_id} not found")
            if not amount:
                amount = float(package.price)
        elif not amount:
            raise ValueError("Either package_id or amount must be provided")

        # Check if coach exists and is a coach
        coach = await self.get_coach(coach_id)
        if not coach:
            raise ValueError(f"Coach {coach_id} not found or not a coach")

        # Check for conflicts (sessions overlapping)
        await self._check_schedule_conflict(coach_id, scheduled_at, duration_minutes)

        session = CoachingSession(
            user_id=user_id,
            coach_id=coach_id,
            package_id=package_id,
            scheduled_at=scheduled_at,
            duration_minutes=duration_minutes,
            amount=amount,
            notes=notes,
            status=SessionStatus.PENDING,
        )

        self.db.add(session)
        await self.db.commit()
        await self.db.refresh(session)
        
        logger.info(f"Created coaching session {session.id} for user {user_id} with coach {coach_id}")
        return session

    async def _check_schedule_conflict(
        self,
        coach_id: int,
        scheduled_at: datetime,
        duration_minutes: int
    ) -> None:
        """Check if there's a scheduling conflict"""
        session_end = scheduled_at + timedelta(minutes=duration_minutes)
        
        # Get all existing sessions for this coach
        result = await self.db.execute(
            select(CoachingSession)
            .where(CoachingSession.coach_id == coach_id)
            .where(
                CoachingSession.status.in_([
                    SessionStatus.PENDING,
                    SessionStatus.CONFIRMED
                ])
            )
        )
        
        existing_sessions = result.scalars().all()
        
        # Check for overlaps
        for existing in existing_sessions:
            existing_end = existing.scheduled_at + timedelta(minutes=existing.duration_minutes)
            
            # Check if sessions overlap
            if not (session_end <= existing.scheduled_at or scheduled_at >= existing_end):
                raise ValueError(
                    f"Coach has a conflicting session scheduled at {existing.scheduled_at}"
                )

    async def get_session(self, session_id: int, user_id: Optional[int] = None) -> Optional[CoachingSession]:
        """Get coaching session by ID"""
        query = select(CoachingSession).where(CoachingSession.id == session_id)
        
        if user_id:
            query = query.where(
                or_(
                    CoachingSession.user_id == user_id,
                    CoachingSession.coach_id == user_id
                )
            )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def update_session_payment(
        self,
        session_id: int,
        stripe_checkout_session_id: str,
        payment_status: str
    ) -> Optional[CoachingSession]:
        """Update session with payment information"""
        session = await self.get_session(session_id)
        if not session:
            return None

        session.stripe_checkout_session_id = stripe_checkout_session_id
        session.payment_status = payment_status
        
        if payment_status == "paid":
            session.status = SessionStatus.CONFIRMED

        await self.db.commit()
        await self.db.refresh(session)
        
        return session

    async def get_user_sessions(
        self,
        user_id: int,
        as_coach: bool = False,
        status: Optional[SessionStatus] = None
    ) -> List[CoachingSession]:
        """Get all sessions for a user"""
        query = select(CoachingSession)
        
        if as_coach:
            query = query.where(CoachingSession.coach_id == user_id)
        else:
            query = query.where(CoachingSession.user_id == user_id)
        
        if status:
            query = query.where(CoachingSession.status == status)
        
        query = query.order_by(CoachingSession.scheduled_at.desc())
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_coach_availability(
        self,
        coach_id: int,
        start_date: datetime,
        end_date: datetime
    ) -> List[datetime]:
        """Get available time slots for a coach"""
        # Get all confirmed/pending sessions in the date range
        result = await self.db.execute(
            select(CoachingSession)
            .where(CoachingSession.coach_id == coach_id)
            .where(CoachingSession.scheduled_at >= start_date)
            .where(CoachingSession.scheduled_at <= end_date)
            .where(
                CoachingSession.status.in_([
                    SessionStatus.PENDING,
                    SessionStatus.CONFIRMED
                ])
            )
            .order_by(CoachingSession.scheduled_at)
        )
        
        booked_sessions = result.scalars().all()
        
        # Generate available slots (every 30 minutes, 9am-6pm)
        available_slots = []
        current = start_date.replace(hour=9, minute=0, second=0, microsecond=0)
        end = end_date.replace(hour=18, minute=0, second=0, microsecond=0)
        
        while current <= end:
            # Check if this slot conflicts with booked sessions
            slot_end = current + timedelta(minutes=60)
            has_conflict = False
            
            for session in booked_sessions:
                session_end = session.scheduled_at + timedelta(minutes=session.duration_minutes)
                if current < session_end and slot_end > session.scheduled_at:
                    has_conflict = True
                    break
            
            if not has_conflict:
                available_slots.append(current)
            
            current += timedelta(minutes=30)
        
        return available_slots
