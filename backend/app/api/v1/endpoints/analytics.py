"""
Analytics API Endpoints
Dashboard analytics metrics
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.models.user import User
from app.dependencies import get_current_user, get_db
from app.core.security_audit import SecurityAuditLogger, SecurityEventType
from fastapi import Request

router = APIRouter()


class AnalyticsMetric(BaseModel):
    label: str
    value: float
    change: Optional[float] = None
    changeType: Optional[str] = None  # 'increase' or 'decrease'
    format: Optional[str] = None  # 'number', 'currency', 'percentage'


class AnalyticsResponse(BaseModel):
    metrics: List[AnalyticsMetric]


@router.get("/analytics/metrics", response_model=AnalyticsResponse, tags=["analytics"])
async def get_analytics_metrics(
    request: Request,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analytics metrics for the dashboard
    
    Note: This endpoint previously used the Project model which has been removed.
    It now returns empty/default metrics until new metrics are implemented.
    """
    
    # Placeholder metrics - to be replaced with actual ARISE metrics
    metrics = [
        AnalyticsMetric(
            label="Total Users",
            value=0.0,
            change=None,
            changeType=None,
            format="number"
        ),
        AnalyticsMetric(
            label="Active Assessments",
            value=0.0,
            change=None,
            changeType=None,
            format="number"
        ),
        AnalyticsMetric(
            label="Growth Rate",
            value=0.0,
            change=None,
            changeType=None,
            format="percentage"
        ),
    ]
    
    # Log data access
    try:
        await SecurityAuditLogger.log_event(
            db=db,
            event_type=SecurityEventType.DATA_ACCESSED,
            description=f"Accessed analytics metrics from {start_date} to {end_date}",
            user_id=current_user.id,
            ip_address=request.client.host if request.client else None,
        )
    except Exception:
        pass
    
    return AnalyticsResponse(metrics=metrics)
