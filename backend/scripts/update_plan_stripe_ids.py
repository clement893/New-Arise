#!/usr/bin/env python3
"""
Script to update Stripe Price IDs and Product IDs for existing plans.

Usage:
    python scripts/update_plan_stripe_ids.py

This script will prompt you to enter Stripe IDs for each plan.
You can also edit this script directly to hardcode your Stripe IDs.

Make sure you have created products and prices in Stripe Dashboard first:
1. Go to https://dashboard.stripe.com/products
2. Create products for each plan
3. Create prices for each product
4. Copy the Price ID (starts with price_) and Product ID (starts with prod_)
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.database import AsyncSessionLocal
from app.models.plan import Plan
from sqlalchemy import select


async def update_plan_stripe_ids():
    """Update Stripe IDs for plans"""
    print("=" * 70)
    print("Update Stripe Price IDs and Product IDs for Plans")
    print("=" * 70)
    print()
    
    try:
        async with AsyncSessionLocal() as db:
            # Get all plans
            result = await db.execute(select(Plan).order_by(Plan.id))
            plans = result.scalars().all()
            
            if not plans:
                print("❌ No plans found in database.")
                print("   Please run 'python scripts/seed_plans.py' first to create plans.")
                return
            
            print(f"Found {len(plans)} plan(s):\n")
            for plan in plans:
                print(f"  {plan.id}. {plan.name} - {plan.amount/100:.2f} {plan.currency.upper()}/{plan.interval}")
                if plan.stripe_price_id:
                    print(f"     Current Stripe Price ID: {plan.stripe_price_id}")
                else:
                    print(f"     Current Stripe Price ID: (not set)")
                if plan.stripe_product_id:
                    print(f"     Current Stripe Product ID: {plan.stripe_product_id}")
                else:
                    print(f"     Current Stripe Product ID: (not set)")
            print()
            
            # Option 1: Interactive mode
            print("Choose an option:")
            print("  1. Interactive mode (enter IDs for each plan)")
            print("  2. Edit this script directly to hardcode IDs (recommended for production)")
            print()
            choice = input("Enter choice (1 or 2, or press Enter to exit): ").strip()
            
            if choice == "1":
                # Interactive mode
                for plan in plans:
                    print(f"\n{'='*70}")
                    print(f"Plan: {plan.name} (ID: {plan.id})")
                    print(f"{'='*70}")
                    
                    price_id = input(f"Enter Stripe Price ID (or press Enter to skip) [{plan.stripe_price_id or ''}]: ").strip()
                    if price_id:
                        plan.stripe_price_id = price_id
                    
                    product_id = input(f"Enter Stripe Product ID (or press Enter to skip) [{plan.stripe_product_id or ''}]: ").strip()
                    if product_id:
                        plan.stripe_product_id = product_id
                
                await db.commit()
                print("\n✅ Plans updated successfully!")
                
            elif choice == "2":
                print("\nTo hardcode Stripe IDs, edit this script and modify the STRIPE_IDS dictionary:")
                print("Then run this script again and choose option 2.")
                print("\nExample:")
                print('STRIPE_IDS = {')
                print('    1: {"price_id": "price_xxxxxxxxxxxxx", "product_id": "prod_xxxxxxxxxxxxx"},')
                print('    2: {"price_id": "price_yyyyyyyyyyyyy", "product_id": "prod_yyyyyyyyyyyyy"},')
                print('}')
                return
            else:
                print("Exiting without changes.")
                return
            
            # Show updated plans
            print("\n" + "=" * 70)
            print("Updated Plans:")
            print("=" * 70)
            await db.refresh(plans[0])  # Refresh to get updated data
            result = await db.execute(select(Plan).order_by(Plan.id))
            updated_plans = result.scalars().all()
            
            for plan in updated_plans:
                print(f"\n{plan.name} (ID: {plan.id}):")
                print(f"  Stripe Price ID: {plan.stripe_price_id or '(not set)'}")
                print(f"  Stripe Product ID: {plan.stripe_product_id or '(not set)'}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(update_plan_stripe_ids())
