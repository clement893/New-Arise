"""
Script pour diagnostiquer pourquoi le plan ne change pas après un achat
Vérifie les métadonnées Stripe, le webhook, et l'état de la base de données
"""

import asyncio
import sys
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import AsyncSessionLocal
from app.models import Plan, Subscription, User
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
import stripe
from app.core.config import settings


async def diagnose_plan_change_issue(email: str = None, user_id: int = None):
    """Diagnostiquer pourquoi le plan ne change pas"""
    async with AsyncSessionLocal() as db:
        print("=" * 80)
        print("DIAGNOSTIC DU PROBLÈME DE CHANGEMENT DE PLAN")
        print("=" * 80)
        print()
        
        # Find user
        if email:
            result = await db.execute(
                select(User).where(User.email == email)
            )
            user = result.scalar_one_or_none()
        elif user_id:
            result = await db.execute(
                select(User).where(User.id == user_id)
            )
            user = result.scalar_one_or_none()
        else:
            print("❌ Veuillez fournir un email ou un user_id")
            return
        
        if not user:
            print(f"❌ Utilisateur non trouvé (email: {email}, user_id: {user_id})")
            return
        
        print(f"👤 Utilisateur trouvé:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Nom: {user.first_name} {user.last_name}")
        print()
        
        # Get all subscriptions for this user
        result = await db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .where(Subscription.user_id == user.id)
            .order_by(Subscription.created_at.desc())
        )
        subscriptions = result.scalars().all()
        
        if not subscriptions:
            print("❌ Aucune souscription trouvée pour cet utilisateur")
            return
        
        print(f"📋 Souscriptions trouvées: {len(subscriptions)}")
        print("-" * 80)
        
        for i, sub in enumerate(subscriptions, 1):
            print(f"\n{i}. Souscription ID: {sub.id}")
            print(f"   Statut: {sub.status}")
            print(f"   Créée le: {sub.created_at}")
            print(f"   Période actuelle: {sub.current_period_start} → {sub.current_period_end}")
            
            if sub.plan:
                plan_price = float(sub.plan.amount) / 100 if sub.plan.amount else 0
                print(f"   Plan ID: {sub.plan_id}")
                print(f"   Plan Nom: {sub.plan.name}")
                print(f"   Plan Prix: ${plan_price:.2f}")
                print(f"   Plan Stripe Price ID: {sub.plan.stripe_price_id}")
            else:
                print(f"   ⚠️  Plan ID {sub.plan_id} non trouvé dans la base de données!")
            
            if sub.stripe_subscription_id:
                print(f"   Stripe Subscription ID: {sub.stripe_subscription_id}")
                
                # Check Stripe subscription
                try:
                    if not stripe.api_key and hasattr(settings, 'STRIPE_SECRET_KEY') and settings.STRIPE_SECRET_KEY:
                        stripe.api_key = settings.STRIPE_SECRET_KEY
                    
                    stripe_sub = stripe.Subscription.retrieve(sub.stripe_subscription_id)
                    
                    if stripe_sub.items and stripe_sub.items.data:
                        stripe_price_id = stripe_sub.items.data[0].price.id
                        print(f"   Stripe Price ID (actuel): {stripe_price_id}")
                        
                        # Find plan by stripe_price_id
                        plan_result = await db.execute(
                            select(Plan).where(Plan.stripe_price_id == stripe_price_id)
                        )
                        stripe_plan = plan_result.scalar_one_or_none()
                        
                        if stripe_plan:
                            print(f"   Plan dans Stripe: {stripe_plan.name} (ID: {stripe_plan.id})")
                            if stripe_plan.id != sub.plan_id:
                                print(f"   ⚠️  INCOHÉRENCE: Plan dans DB ({sub.plan_id}) != Plan dans Stripe ({stripe_plan.id})")
                        else:
                            print(f"   ⚠️  Plan avec stripe_price_id {stripe_price_id} non trouvé dans la DB")
                except Exception as e:
                    print(f"   ⚠️  Erreur lors de la récupération depuis Stripe: {e}")
            
            if sub.stripe_customer_id:
                print(f"   Stripe Customer ID: {sub.stripe_customer_id}")
        
        # Get active subscription
        active_sub = None
        for sub in subscriptions:
            if sub.status in ['ACTIVE', 'TRIALING']:
                active_sub = sub
                break
        
        if active_sub:
            print("\n" + "=" * 80)
            print("✅ SOUSCRIPTION ACTIVE:")
            print("=" * 80)
            print(f"   ID: {active_sub.id}")
            print(f"   Statut: {active_sub.status}")
            if active_sub.plan:
                plan_price = float(active_sub.plan.amount) / 100 if active_sub.plan.amount else 0
                print(f"   Plan: {active_sub.plan.name} (ID: {active_sub.plan_id}, ${plan_price:.2f})")
            print()
        
        # List all plans
        print("=" * 80)
        print("📦 PLANS DISPONIBLES:")
        print("=" * 80)
        result = await db.execute(
            select(Plan).where(Plan.status == 'active').order_by(Plan.amount)
        )
        plans = result.scalars().all()
        
        for plan in plans:
            plan_price = float(plan.amount) / 100 if plan.amount else 0
            print(f"   ID: {plan.id} | Nom: {plan.name} | Prix: ${plan_price:.2f} | Stripe Price ID: {plan.stripe_price_id}")
        
        print()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Diagnostiquer le problème de changement de plan')
    parser.add_argument('--email', type=str, help='Email de l\'utilisateur')
    parser.add_argument('--user-id', type=int, help='ID de l\'utilisateur')
    
    args = parser.parse_args()
    
    if not args.email and not args.user_id:
        print("❌ Veuillez fournir --email ou --user-id")
        sys.exit(1)
    
    asyncio.run(diagnose_plan_change_issue(email=args.email, user_id=args.user_id))
