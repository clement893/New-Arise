"""
Script de diagnostic pour identifier le problème d'attribution de plan
Ce script vérifie les plans dans la base de données et identifie les incohérences
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import async_session_maker
from app.models import Plan, Subscription, User
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime


async def diagnose_plans():
    """Diagnostiquer les plans dans la base de données"""
    async with async_session_maker() as db:
        print("=" * 80)
        print("DIAGNOSTIC DES PLANS")
        print("=" * 80)
        print()
        
        # 1. Afficher tous les plans
        print("1. TOUS LES PLANS DANS LA BASE DE DONNÉES:")
        print("-" * 80)
        result = await db.execute(
            select(Plan).order_by(Plan.id)
        )
        plans = result.scalars().all()
        
        if not plans:
            print("❌ Aucun plan trouvé dans la base de données!")
            return
        
        for plan in plans:
            price_dollars = float(plan.amount) / 100 if plan.amount else 0
            print(f"  ID: {plan.id:3d} | Nom: {plan.name:20s} | Prix: ${price_dollars:6.2f} | Status: {plan.status.value}")
        print()
        
        # 2. Vérifier les plans attendus
        print("2. VÉRIFICATION DES PLANS ATTENDUS:")
        print("-" * 80)
        expected_plans = {
            'WELLNESS': 9900,  # $99
            'SELF EXPLORATION': 25000,  # $250
            'REVELATION': 29900,  # $299
        }
        
        for plan_name, expected_amount in expected_plans.items():
            result = await db.execute(
                select(Plan).where(Plan.name == plan_name)
            )
            plan = result.scalar_one_or_none()
            
            if not plan:
                print(f"  ❌ {plan_name}: PLAN MANQUANT!")
            else:
                actual_amount = int(plan.amount) if plan.amount else 0
                if actual_amount == expected_amount:
                    print(f"  ✓ {plan_name}: ID={plan.id}, Prix=${actual_amount/100:.2f} (correct)")
                else:
                    print(f"  ⚠️ {plan_name}: ID={plan.id}, Prix=${actual_amount/100:.2f} (attendu: ${expected_amount/100:.2f})")
        print()
        
        # 3. Vérifier les abonnements récents
        print("3. ABONNEMENTS RÉCENTS (20 derniers):")
        print("-" * 80)
        result = await db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .order_by(Subscription.created_at.desc())
            .limit(20)
        )
        subscriptions = result.scalars().all()
        
        if not subscriptions:
            print("  Aucun abonnement trouvé")
        else:
            for sub in subscriptions:
                plan = sub.plan
                plan_price = float(plan.amount) / 100 if plan and plan.amount else 0
                user_result = await db.execute(
                    select(User).where(User.id == sub.user_id)
                )
                user = user_result.scalar_one_or_none()
                user_email = user.email if user else f"User {sub.user_id}"
                
                print(f"  User: {user_email:40s} | Plan: {plan.name if plan else 'N/A':20s} (ID: {sub.plan_id:3d}, ${plan_price:.2f}) | Status: {sub.status.value} | Créé: {sub.created_at}")
        print()
        
        # 4. Statistiques par plan
        print("4. STATISTIQUES PAR PLAN:")
        print("-" * 80)
        result = await db.execute(
            select(
                Plan.id,
                Plan.name,
                Plan.amount,
                func.count(Subscription.id).label('subscription_count')
            )
            .outerjoin(Subscription, Plan.id == Subscription.plan_id)
            .group_by(Plan.id, Plan.name, Plan.amount)
            .order_by(Plan.id)
        )
        stats = result.all()
        
        for stat in stats:
            price_dollars = float(stat.amount) / 100 if stat.amount else 0
            print(f"  Plan ID {stat.id:3d} ({stat.name:20s}): {stat.subscription_count:3d} abonnements | Prix: ${price_dollars:.2f}")
        print()
        
        # 5. Identifier les problèmes potentiels
        print("5. PROBLÈMES POTENTIELS IDENTIFIÉS:")
        print("-" * 80)
        issues = []
        
        # Vérifier si WELLNESS a le bon prix
        result = await db.execute(
            select(Plan).where(Plan.name == 'WELLNESS')
        )
        wellness_plan = result.scalar_one_or_none()
        if wellness_plan:
            wellness_amount = int(wellness_plan.amount) if wellness_plan.amount else 0
            if wellness_amount != 9900:
                issues.append(f"⚠️ Plan WELLNESS (ID: {wellness_plan.id}) a un prix de ${wellness_amount/100:.2f} au lieu de $99.00")
        
        # Vérifier si SELF EXPLORATION a le bon prix
        result = await db.execute(
            select(Plan).where(Plan.name == 'SELF EXPLORATION')
        )
        self_exploration_plan = result.scalar_one_or_none()
        if self_exploration_plan:
            se_amount = int(self_exploration_plan.amount) if self_exploration_plan.amount else 0
            if se_amount != 25000:
                issues.append(f"⚠️ Plan SELF EXPLORATION (ID: {self_exploration_plan.id}) a un prix de ${se_amount/100:.2f} au lieu de $250.00")
        
        # Vérifier les abonnements avec des plans incorrects
        if wellness_plan and self_exploration_plan:
            result = await db.execute(
                select(Subscription)
                .where(Subscription.plan_id == wellness_plan.id)
                .options(selectinload(Subscription.plan))
            )
            wellness_subs = result.scalars().all()
            
            for sub in wellness_subs:
                # Vérifier si le prix payé correspond au plan
                if sub.plan and sub.plan.name == 'WELLNESS':
                    plan_price = float(sub.plan.amount) / 100 if sub.plan.amount else 0
                    if plan_price != 99.00:
                        user_result = await db.execute(
                            select(User).where(User.id == sub.user_id)
                        )
                        user = user_result.scalar_one_or_none()
                        user_email = user.email if user else f"User {sub.user_id}"
                        issues.append(f"⚠️ User {user_email} a un abonnement WELLNESS (ID: {sub.plan_id}) mais le plan a un prix de ${plan_price:.2f}")
        
        if issues:
            for issue in issues:
                print(f"  {issue}")
        else:
            print("  ✓ Aucun problème évident détecté")
        print()
        
        print("=" * 80)
        print("FIN DU DIAGNOSTIC")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(diagnose_plans())
