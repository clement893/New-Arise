"""seed_arise_plans

Revision ID: c49d9ff097b5
Revises: 033
Create Date: 2026-01-03 14:01:40.300602

"""
from typing import Sequence, Union
from datetime import datetime

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = 'c49d9ff097b5'
down_revision: Union[str, None] = '033'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed ARISE subscription plans"""
    conn = op.get_bind()
    
    # Check if plans table exists
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'plans' not in tables:
        print("⚠️  Plans table does not exist, skipping seed")
        return
    
    # Check if plans already exist
    result = conn.execute(text("SELECT COUNT(*) FROM plans"))
    plan_count = result.scalar()
    
    if plan_count > 0:
        print(f"ℹ️  {plan_count} plans already exist. Skipping seed.")
        return
    
    # Insert ARISE plans
    # Note: amount is stored in cents (e.g., 4900 = 49.00 EUR)
    plans_data = [
        {
            'name': 'Basic',
            'description': 'Parfait pour démarrer',
            'amount': 4900,  # 49€ in cents
            'currency': 'eur',
            'interval': 'MONTH',
            'interval_count': 1,
            'status': 'ACTIVE',
            'is_popular': False,
            'features': '{"all_4_assessments": true, "personal_profile": true, "basic_insights": true}',
        },
        {
            'name': 'Professional',
            'description': 'Pour les professionnels',
            'amount': 9900,  # 99€ in cents
            'currency': 'eur',
            'interval': 'MONTH',
            'interval_count': 1,
            'status': 'ACTIVE',
            'is_popular': True,  # Le plus populaire
            'features': '{"all_4_assessments": true, "advanced_analytics": true, "priority_support": true, "custom_reports": true}',
        },
        {
            'name': 'Enterprise',
            'description': 'Pour les entreprises',
            'amount': 0,  # Sur devis
            'currency': 'eur',
            'interval': 'MONTH',
            'interval_count': 1,
            'status': 'ACTIVE',
            'is_popular': False,
            'features': '{"unlimited_assessments": true, "team_management": true, "dedicated_support": true, "api_access": true}',
        },
    ]
    
    now = datetime.utcnow()
    
    for plan in plans_data:
        conn.execute(
            text("""
                INSERT INTO plans (
                    name, description, amount, currency, interval, interval_count,
                    status, is_popular, features, created_at, updated_at
                ) VALUES (
                    :name, :description, :amount, :currency, :interval, :interval_count,
                    :status, :is_popular, :features, :created_at, :updated_at
                )
            """),
            {
                'name': plan['name'],
                'description': plan['description'],
                'amount': plan['amount'],
                'currency': plan['currency'],
                'interval': plan['interval'],
                'interval_count': plan['interval_count'],
                'status': plan['status'],
                'is_popular': plan['is_popular'],
                'features': plan['features'],
                'created_at': now,
                'updated_at': now,
            }
        )
    
    print(f"✅ Created {len(plans_data)} ARISE subscription plans:")
    for plan in plans_data:
        price_str = f"{plan['amount']/100}€/mois" if plan['amount'] > 0 else "Sur devis"
        popular_str = " (Le plus populaire)" if plan['is_popular'] else ""
        print(f"   - {plan['name']}: {price_str}{popular_str}")


def downgrade() -> None:
    """Remove ARISE plans"""
    conn = op.get_bind()
    
    # Check if plans table exists
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()
    
    if 'plans' not in tables:
        return
    
    # Delete ARISE plans by name
    conn.execute(
        text("DELETE FROM plans WHERE name IN ('Basic', 'Professional', 'Enterprise')")
    )
    
    print("✅ Removed ARISE subscription plans")

