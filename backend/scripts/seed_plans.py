"""
Seed Plans Script
Create default subscription plans
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.models.plan import Plan, PlanInterval, PlanStatus
from app.core.database import Base


async def seed_plans(force: bool = False):
    """Seed default plans
    
    Args:
        force: If True, delete existing plans and recreate them
    """
    engine = create_async_engine(str(settings.DATABASE_URL))
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if plans already exist
        from sqlalchemy import select, delete
        result = await session.execute(select(Plan))
        existing_plans = result.scalars().all()
        
        if existing_plans:
            if force:
                print("⚠️  Deleting existing plans...")
                await session.execute(delete(Plan))
                await session.commit()
                print("✅ Existing plans deleted")
            else:
                print("ℹ️  Plans already exist. Use force=True to recreate them.")
                print(f"   Found {len(existing_plans)} existing plans:")
                for plan in existing_plans:
                    print(f"   - {plan.name} ({plan.amount/100 if plan.amount else 0}€)")
                return

        # Create default plans
        # Note: amount is stored in cents (e.g., 4900 = 49.00 EUR)
        plans = [
            Plan(
                name="Basic",
                description="Parfait pour démarrer",
                amount=4900,  # 49€ in cents
                currency="eur",
                interval=PlanInterval.MONTH,
                interval_count=1,
                status=PlanStatus.ACTIVE,
                is_popular=False,
                features='{"all_4_assessments": true, "personal_profile": true, "basic_insights": true}',
            ),
            Plan(
                name="Professional",
                description="Pour les professionnels",
                amount=9900,  # 99€ in cents
                currency="eur",
                interval=PlanInterval.MONTH,
                interval_count=1,
                status=PlanStatus.ACTIVE,
                is_popular=True,  # Le plus populaire
                features='{"all_4_assessments": true, "advanced_analytics": true, "priority_support": true, "custom_reports": true}',
            ),
            Plan(
                name="Enterprise",
                description="Pour les entreprises",
                amount=0,  # Sur devis
                currency="eur",
                interval=PlanInterval.MONTH,
                interval_count=1,
                status=PlanStatus.ACTIVE,
                is_popular=False,
                features='{"unlimited_assessments": true, "team_management": true, "dedicated_support": true, "api_access": true}',
            ),
        ]

        for plan in plans:
            session.add(plan)

        await session.commit()
        print(f"✅ Created {len(plans)} default plans:")
        for plan in plans:
            price_str = f"{plan.amount/100}€/mois" if plan.amount > 0 else "Sur devis"
            popular_str = " (Le plus populaire)" if plan.is_popular else ""
            print(f"   - {plan.name}: {price_str}{popular_str}")
            print(f"     {plan.description}")

    await engine.dispose()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed subscription plans")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete existing plans and recreate them"
    )
    args = parser.parse_args()
    asyncio.run(seed_plans(force=args.force))

