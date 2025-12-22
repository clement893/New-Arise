"""
Stripe Webhooks
Handle Stripe webhook events
"""

from fastapi import APIRouter, Request, HTTPException, status, Header, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.core.database import get_db
from app.services.stripe_service import StripeService
from app.services.subscription_service import SubscriptionService
from app.utils.stripe_helpers import map_stripe_status, parse_timestamp
from app.core.logging import logger

router = APIRouter(prefix="/webhooks/stripe", tags=["webhooks"])


@router.post("")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    
    stripe_service = StripeService(db)
    subscription_service = SubscriptionService(db)
    
    try:
        event_data = await stripe_service.handle_webhook(payload, stripe_signature)
        event_type = event_data["type"]
        event_object = event_data["data"]["object"]
        
        logger.info(f"Stripe webhook received: {event_type}")
        
        # Handle different event types
        if event_type == "checkout.session.completed":
            await handle_checkout_completed(event_object, db, subscription_service)
        
        elif event_type == "customer.subscription.created":
            await handle_subscription_created(event_object, db, subscription_service)
        
        elif event_type == "customer.subscription.updated":
            await handle_subscription_updated(event_object, db, subscription_service)
        
        elif event_type == "customer.subscription.deleted":
            await handle_subscription_deleted(event_object, db, subscription_service)
        
        elif event_type == "invoice.paid":
            await handle_invoice_paid(event_object, db)
        
        elif event_type == "invoice.payment_failed":
            await handle_invoice_payment_failed(event_object, db)
        
        return {"status": "success"}
    
    except Exception as e:
        logger.error(f"Error handling Stripe webhook: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook error: {str(e)}"
        )


async def handle_checkout_completed(event_object: dict, db: AsyncSession, subscription_service: SubscriptionService):
    """Handle checkout.session.completed event"""
    customer_id = event_object.get("customer")
    subscription_id = event_object.get("subscription")
    metadata = event_object.get("metadata", {})
    
    user_id = int(metadata.get("user_id", 0))
    plan_id = int(metadata.get("plan_id", 0))
    
    if not user_id or not plan_id:
        logger.warning("Missing user_id or plan_id in checkout metadata")
        return
    
    # Create subscription
    await subscription_service.create_subscription(
        user_id=user_id,
        plan_id=plan_id,
        stripe_subscription_id=subscription_id,
        stripe_customer_id=customer_id,
    )


def _parse_subscription_periods(event_object: dict) -> tuple[datetime | None, datetime | None]:
    """Parse subscription period start and end from Stripe event"""
    period_start = None
    period_end = None
    
    if start_ts := parse_timestamp(event_object.get("current_period_start", 0)):
        period_start = datetime.fromtimestamp(start_ts)
    if end_ts := parse_timestamp(event_object.get("current_period_end", 0)):
        period_end = datetime.fromtimestamp(end_ts)
    
    return period_start, period_end


async def handle_subscription_created(
    event_object: dict, 
    db: AsyncSession, 
    subscription_service: SubscriptionService
):
    """Handle customer.subscription.created event"""
    subscription_id = event_object.get("id")
    status_str = event_object.get("status", "")
    
    status = map_stripe_status(status_str)
    period_start, period_end = _parse_subscription_periods(event_object)
    
    await subscription_service.update_subscription_status(
        stripe_subscription_id=subscription_id,
        status=status,
        current_period_start=period_start,
        current_period_end=period_end,
    )


async def handle_subscription_updated(
    event_object: dict, 
    db: AsyncSession, 
    subscription_service: SubscriptionService
):
    """Handle customer.subscription.updated event"""
    subscription_id = event_object.get("id")
    status_str = event_object.get("status", "")
    
    status = map_stripe_status(status_str)
    period_start, period_end = _parse_subscription_periods(event_object)
    
    await subscription_service.update_subscription_status(
        stripe_subscription_id=subscription_id,
        status=status,
        current_period_start=period_start,
        current_period_end=period_end,
    )


async def handle_subscription_deleted(
    event_object: dict, 
    db: AsyncSession, 
    subscription_service: SubscriptionService
):
    """Handle customer.subscription.deleted event"""
    from app.models.subscription import SubscriptionStatus
    
    subscription_id = event_object.get("id")
    
    await subscription_service.update_subscription_status(
        stripe_subscription_id=subscription_id,
        status=SubscriptionStatus.CANCELED,
    )


async def handle_invoice_paid(event_object: dict, db: AsyncSession):
    """Handle invoice.paid event"""
    # TODO: Implement invoice paid handler
    # - Update invoice status in database
    # - Send confirmation email
    # - Update subscription if needed
    logger.info(f"Invoice paid: {event_object.get('id')}")


async def handle_invoice_payment_failed(event_object: dict, db: AsyncSession):
    """Handle invoice.payment_failed event"""
    # TODO: Implement payment failed handler
    # - Update invoice status
    # - Send notification email
    # - Update subscription status if needed
    # - Log for monitoring
    logger.warning(f"Invoice payment failed: {event_object.get('id')}")

