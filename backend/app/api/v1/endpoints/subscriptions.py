"""
Subscription Endpoints
API endpoints for subscription management
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.cache import cached
from app.dependencies import (
    get_current_user,
    get_subscription_service,
    get_stripe_service,
    is_superadmin,
)
from app.models import User
from app.models.plan import PlanStatus
from app.services.subscription_service import SubscriptionService
from app.services.stripe_service import StripeService
from app.schemas.subscription import (
    PlanResponse,
    PlanListResponse,
    PlanCreate,
    PlanUpdate,
    SubscriptionResponse,
    CheckoutSessionCreate,
    CheckoutSessionResponse,
    PortalSessionResponse,
    SubscriptionWithPaymentMethodCreate,
    InvoiceResponse,
)
from app.models.invoice import Invoice, InvoiceStatus
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("/plans", response_model=PlanListResponse)
@cached(expire=3600, key_prefix="plans")  # Cache 1h car plans changent rarement
async def list_plans(
    active_only: bool = Query(True, description="Only return active plans"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """List all available subscription plans with pagination"""
    plans = await subscription_service.get_all_plans(
        active_only=active_only,
        skip=skip,
        limit=limit
    )
    
    return PlanListResponse(
        plans=[PlanResponse.model_validate(plan) for plan in plans],
        total=len(plans)
    )


@router.post("/plans", response_model=PlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_create: PlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Create a new plan (admin only)"""
    # Check if user is superadmin
    if not await is_superadmin(current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create plans"
        )
    
    plan = await subscription_service.create_plan(
        name=plan_create.name,
        description=plan_create.description,
        amount=float(plan_create.amount),
        currency=plan_create.currency,
        interval=plan_create.interval,
        interval_count=plan_create.interval_count,
        status=PlanStatus.ACTIVE,  # New plans are active by default
        is_popular=plan_create.is_popular,
        features=plan_create.features,
        stripe_price_id=plan_create.stripe_price_id,
        stripe_product_id=plan_create.stripe_product_id,
    )
    
    return PlanResponse.model_validate(plan)


@router.get("/plans/{plan_id}", response_model=PlanResponse)
async def get_plan(
    plan_id: int,
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Get plan by ID"""
    plan = await subscription_service.get_plan(plan_id)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    return PlanResponse.model_validate(plan)


@router.put("/plans/{plan_id}", response_model=PlanResponse)
async def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Update plan (admin only)"""
    # Check if user is superadmin
    if not await is_superadmin(current_user, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update plans"
        )
    
    plan = await subscription_service.update_plan(
        plan_id=plan_id,
        name=plan_update.name,
        description=plan_update.description,
        amount=float(plan_update.amount) if plan_update.amount is not None else None,
        status=plan_update.status,
        is_popular=plan_update.is_popular,
        features=plan_update.features,
        stripe_price_id=plan_update.stripe_price_id,
        stripe_product_id=plan_update.stripe_product_id,
    )
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    return PlanResponse.model_validate(plan)


@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Get current user's subscription (most recent, prioritizing active subscriptions)"""
    subscription = await subscription_service.get_user_subscription(
        current_user.id, 
        include_plan=True,
        active_only=False  # Return most recent subscription, prioritizing ACTIVE/TRIALING
    )
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No subscription found"
        )
    
    return SubscriptionResponse.model_validate(subscription)


@router.post("/checkout", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    checkout_data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
    stripe_service: StripeService = Depends(get_stripe_service),
):
    """Create Stripe checkout session"""
    plan = await subscription_service.get_plan(checkout_data.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    if not plan.stripe_price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plan is not configured for Stripe"
        )
    
    session = await stripe_service.create_checkout_session(
        user=current_user,
        plan=plan,
        success_url=checkout_data.success_url,
        cancel_url=checkout_data.cancel_url,
        trial_days=checkout_data.trial_days,
    )
    
    return CheckoutSessionResponse(**session)


@router.post("/portal", response_model=PortalSessionResponse)
async def create_portal_session(
    return_url: str = Query(..., description="URL to return to after portal"),
    current_user: User = Depends(get_current_user),
    stripe_service: StripeService = Depends(get_stripe_service),
):
    """Create Stripe customer portal session"""
    session = await stripe_service.create_portal_session(
        user=current_user,
        return_url=return_url,
    )
    
    return PortalSessionResponse(**session)


@router.post("/cancel", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Cancel current user's subscription"""
    subscription = await subscription_service.get_user_subscription(
        current_user.id,
        active_only=True  # Only cancel active subscriptions
    )
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    success = await subscription_service.cancel_subscription(subscription.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )
    
    return None


@router.post("/create-with-payment-method", response_model=SubscriptionResponse)
async def create_subscription_with_payment_method(
    subscription_data: SubscriptionWithPaymentMethodCreate,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
    stripe_service: StripeService = Depends(get_stripe_service),
):
    """Create subscription with payment method"""
    from datetime import datetime, timedelta
    
    plan = await subscription_service.get_plan(subscription_data.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    if not plan.stripe_price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plan is not configured for Stripe"
        )
    
    # Create subscription in Stripe
    stripe_result = await stripe_service.create_subscription_with_payment_method(
        user=current_user,
        plan=plan,
        payment_method_id=subscription_data.payment_method_id,
        trial_days=subscription_data.trial_days,
    )
    
    # Calculate trial_end if trial_days is provided
    trial_end = None
    if subscription_data.trial_days:
        trial_end = datetime.utcnow() + timedelta(days=subscription_data.trial_days)
    
    # Create subscription in database
    subscription = await subscription_service.create_subscription(
        user_id=current_user.id,
        plan_id=plan.id,
        stripe_subscription_id=stripe_result['subscription_id'],
        stripe_customer_id=stripe_result['customer_id'],
        trial_end=trial_end,
    )
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create subscription"
        )
    
    # Reload with plan relationship
    subscription = await subscription_service.get_user_subscription(
        current_user.id,
        include_plan=True,
        active_only=True  # Get active subscription after creation
    )
    
    return SubscriptionResponse.model_validate(subscription)


@router.post("/upgrade/{plan_id}", response_model=SubscriptionResponse)
async def upgrade_subscription(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    subscription_service: SubscriptionService = Depends(get_subscription_service),
):
    """Upgrade subscription to new plan"""
    subscription = await subscription_service.get_user_subscription(
        current_user.id,
        active_only=True  # Only upgrade active subscriptions
    )
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    # Check if trying to upgrade to same plan
    if subscription.plan_id == plan_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this plan"
        )
    
    # Verify plan exists
    plan = await subscription_service.get_plan(plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    updated_subscription = await subscription_service.upgrade_plan(
        subscription.id,
        plan_id
    )
    
    if not updated_subscription:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upgrade subscription"
        )
    
    # Reload with plan relationship
    updated_subscription = await subscription_service.get_user_subscription(
        current_user.id,
        include_plan=True,
        active_only=True  # Get active subscription after upgrade
    )
    
    return SubscriptionResponse.model_validate(updated_subscription)


@router.get("/payments", response_model=List[InvoiceResponse])
async def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records"),
):
    """Get current user's payment history (invoices) related to subscriptions"""
    # Get all invoices for the user that are related to subscriptions
    query = (
        select(Invoice)
        .where(Invoice.user_id == current_user.id)
        .where(Invoice.subscription_id.isnot(None))  # Only subscription-related invoices
        .order_by(Invoice.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    result = await db.execute(query)
    invoices = result.scalars().all()
    
    return [InvoiceResponse.model_validate(invoice) for invoice in invoices]

