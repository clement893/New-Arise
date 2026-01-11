"""
Insights API Endpoints
Dashboard insights and analytics
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


class ChartDataPoint(BaseModel):
    label: str
    value: float


class AnalyticsMetric(BaseModel):
    label: str
    value: float
    change: Optional[float] = None
    changeType: Optional[str] = None  # 'increase' or 'decrease'
    format: Optional[str] = None  # 'number', 'currency', 'percentage'


class InsightsResponse(BaseModel):
    metrics: List[AnalyticsMetric]
    trends: List[ChartDataPoint]
    userGrowth: List[ChartDataPoint]


@router.get("/insights", response_model=InsightsResponse, tags=["insights"])
async def get_insights(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get dashboard insights including metrics, trends, and user growth
    
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
    
    # Generate empty trend data (last 6 months)
    trend_data = []
    for i in range(6):
        month_start = datetime.utcnow() - timedelta(days=30 * (6 - i))
        trend_data.append(ChartDataPoint(
            label=month_start.strftime('%b'),
            value=0.0
        ))
    
    # Generate empty user growth data
    user_growth_data = []
    for i in range(6):
        month_start = datetime.utcnow() - timedelta(days=30 * (6 - i))
        user_growth_data.append(ChartDataPoint(
            label=month_start.strftime('%b'),
            value=0.0
        ))
    
    # Log data access
    try:
        await SecurityAuditLogger.log_event(
            db=db,
            event_type=SecurityEventType.DATA_ACCESSED,
            description="Accessed dashboard insights",
            user_id=current_user.id,
            ip_address=request.client.host if request.client else None,
        )
    except Exception:
        pass
    
    return InsightsResponse(
        metrics=metrics,
        trends=trend_data,
        userGrowth=user_growth_data
    )
