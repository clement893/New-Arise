"""
Script to fix incorrect plan amounts in the database.

The amounts should be in cents (e.g., 29900 for $299.00), 
not in a larger incorrect value.
"""

import sys
import os
from decimal import Decimal

# Add the backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

def fix_plan_amounts():
    """Fix incorrect plan amounts in the database."""
    
    # Create database connection
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Get all plans
        result = db.execute(text("""
            SELECT id, name, amount, currency, interval, interval_count
            FROM subscription_plans
            WHERE status = 'active'
        """))
        
        plans = result.fetchall()
        
        print("Current plans in database:")
        print("-" * 80)
        for plan in plans:
            print(f"ID: {plan[0]}, Name: {plan[1]}, Amount: {plan[2]}, Interval: {plan[4]}")
        
        print("\n" + "=" * 80)
        print("Proposed fixes:")
        print("=" * 80)
        
        # Define the correct amounts (in cents)
        correct_amounts = {
            'REVELATION': 29900,  # $299.00
            'SELF EXPLORATION': 25000,  # $250.00
            'WELLNESS': 9900,  # $99.00
            'Test': 29900,  # Assuming "Test" should be REVELATION at $299
        }
        
        updates = []
        for plan in plans:
            plan_id, name, current_amount, currency, interval, interval_count = plan
            name_clean = name.strip()
            
            # Try to find the correct amount
            correct_amount = None
            for key, amount in correct_amounts.items():
                if key.upper() in name_clean.upper():
                    correct_amount = amount
                    break
            
            if correct_amount is None:
                # If we can't determine, check if amount looks wrong (too large)
                current_decimal = Decimal(str(current_amount))
                if current_decimal > 100000:  # If amount is over $1000, it's likely wrong
                    # Try to fix by dividing by 100
                    correct_amount = int(current_decimal / 100)
                    print(f"\n⚠️  Plan '{name_clean}' (ID: {plan_id}): Amount seems too large")
                    print(f"   Current: {current_decimal} ({current_decimal/100:.2f} dollars)")
                    print(f"   Suggested fix: {correct_amount} cents (${correct_amount/100:.2f})")
                else:
                    print(f"\n✓  Plan '{name_clean}' (ID: {plan_id}): Amount looks OK ({current_amount} cents = ${float(current_amount)/100:.2f})")
                    continue
            else:
                current_decimal = Decimal(str(current_amount))
                if int(current_decimal) != correct_amount:
                    print(f"\n✗  Plan '{name_clean}' (ID: {plan_id}): Amount is incorrect")
                    print(f"   Current: {current_decimal} cents (${float(current_amount)/100:.2f})")
                    print(f"   Should be: {correct_amount} cents (${correct_amount/100:.2f})")
                else:
                    print(f"\n✓  Plan '{name_clean}' (ID: {plan_id}): Amount is correct ({correct_amount} cents = ${correct_amount/100:.2f})")
                    continue
            
            updates.append((plan_id, name_clean, current_amount, correct_amount))
        
        if not updates:
            print("\n" + "=" * 80)
            print("No updates needed! All plan amounts are correct.")
            print("=" * 80)
            db.close()
            return
        
        # Ask for confirmation
        print("\n" + "=" * 80)
        response = input(f"\nDo you want to update {len(updates)} plan(s)? (yes/no): ").strip().lower()
        
        if response != 'yes':
            print("Update cancelled.")
            db.close()
            return
        
        # Apply updates
        print("\nApplying updates...")
        for plan_id, name, old_amount, new_amount in updates:
            db.execute(text("""
                UPDATE subscription_plans
                SET amount = :amount,
                    updated_at = NOW()
                WHERE id = :id
            """), {"amount": new_amount, "id": plan_id})
            print(f"✓ Updated '{name}' (ID: {plan_id}): {old_amount} -> {new_amount} cents")
        
        db.commit()
        
        print("\n" + "=" * 80)
        print("✓ All updates applied successfully!")
        print("=" * 80)
        
        # Show updated plans
        result = db.execute(text("""
            SELECT id, name, amount, currency, interval, interval_count
            FROM subscription_plans
            WHERE status = 'active'
        """))
        
        plans = result.fetchall()
        
        print("\nUpdated plans:")
        print("-" * 80)
        for plan in plans:
            amount_dollars = float(plan[2]) / 100
            print(f"ID: {plan[0]}, Name: {plan[1]}, Amount: ${amount_dollars:.2f}/{plan[4]}")
        print("-" * 80)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 80)
    print("Subscription Plan Amount Fixer")
    print("=" * 80)
    print()
    fix_plan_amounts()
