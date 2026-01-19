"""
Fix Plan Price Script
Corrects the price of the Test plan from 2490000 to 24900 cents ($249)
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select, update
from app.core.config import settings
from app.models.plan import Plan


async def fix_plan_price():
    """Fix the Test plan price"""
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find the Test plan
        result = await session.execute(
            select(Plan).where(Plan.name == "Test")
        )
        test_plan = result.scalar_one_or_none()
        
        if not test_plan:
            print("❌ Plan 'Test' not found in database")
            return
        
        old_amount = test_plan.amount
        old_price = old_amount / 100 if old_amount else 0
        
        # Update the price to 24900 cents ($249.00)
        new_amount = 24900
        new_price = new_amount / 100
        
        test_plan.amount = new_amount
        
        await session.commit()
        
        print(f"✅ Plan 'Test' price updated:")
        print(f"   Old price: ${old_price:.2f}")
        print(f"   New price: ${new_price:.2f}")
        print(f"   Amount in cents: {new_amount}")

    await engine.dispose()


async def list_all_plans():
    """List all plans with their prices"""
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(select(Plan))
        plans = result.scalars().all()
        
        if not plans:
            print("❌ No plans found in database")
            return
        
        print(f"\n📋 Found {len(plans)} plan(s):")
        for plan in plans:
            price = plan.amount / 100 if plan.amount else 0
            print(f"\n   Plan: {plan.name}")
            print(f"   Price: ${price:.2f} (amount: {plan.amount} cents)")
            print(f"   Interval: {plan.interval_count} {plan.interval.lower()}(s)")
            print(f"   Description: {plan.description or 'N/A'}")

    await engine.dispose()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Fix plan prices")
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all plans instead of fixing"
    )
    args = parser.parse_args()
    
    if args.list:
        asyncio.run(list_all_plans())
    else:
        asyncio.run(fix_plan_price())
