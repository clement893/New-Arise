"""
Script pour corriger les abonnements avec des plans incorrects
Ce script identifie les utilisateurs qui ont un plan différent de celui qu'ils ont sélectionné
"""

import asyncio
import sys
import re
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import async_session_maker
from app.models import Plan, Subscription, User
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime


async def fix_wrong_plan_assignments():
    """Identifier et corriger les abonnements avec des plans incorrects"""
    async with async_session_maker() as db:
        print("=" * 80)
        print("CORRECTION DES ABONNEMENTS AVEC PLANS INCORRECTS")
        print("=" * 80)
        print()
        
        # 1. Récupérer tous les plans
        print("1. PLANS DISPONIBLES:")
        print("-" * 80)
        result = await db.execute(
            select(Plan).order_by(Plan.id)
        )
        all_plans = result.scalars().all()
        
        plan_map = {}
        for plan in all_plans:
            price_dollars = float(plan.amount) / 100 if plan.amount else 0
            plan_map[plan.id] = {
                'name': plan.name,
                'amount': plan.amount,
                'price': price_dollars
            }
            print(f"  ID: {plan.id:3d} | Nom: {plan.name:30s} | Prix: ${price_dollars:6.2f}")
        print()
        
        # 2. Identifier les plans attendus par prix
        expected_plans = {
            9900: 'WELLNESS',      # $99
            25000: 'SELF EXPLORATION',  # $250 (mais dans la DB c'est $249)
            24900: 'SELF EXPLORATION',  # $249 (valeur alternative)
            29900: 'REVELATION',    # $299
        }
        
        # 3. Trouver les abonnements avec des plans potentiellement incorrects
        print("2. ABONNEMENTS À VÉRIFIER:")
        print("-" * 80)
        result = await db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan), selectinload(Subscription.user))
            .order_by(Subscription.created_at.desc())
            .limit(50)
        )
        subscriptions = result.scalars().all()
        
        issues = []
        for sub in subscriptions:
            if not sub.plan:
                continue
                
            plan_price = float(sub.plan.amount) / 100 if sub.plan.amount else 0
            plan_price_cents = int(sub.plan.amount) if sub.plan.amount else 0
            
            # Normaliser le nom du plan (enlever le prix)
            plan_name_normalized = re.sub(r'\s*\$\d+.*$', '', sub.plan.name, flags=re.IGNORECASE).strip().upper()
            
            # Vérifier si le prix correspond au nom du plan
            expected_name_by_price = expected_plans.get(plan_price_cents) or expected_plans.get(int(plan_price_cents))
            
            if expected_name_by_price and plan_name_normalized != expected_name_by_price:
                user = sub.user
                user_email = user.email if user else f"User {sub.user_id}"
                issues.append({
                    'subscription_id': sub.id,
                    'user_id': sub.user_id,
                    'user_email': user_email,
                    'current_plan_id': sub.plan_id,
                    'current_plan_name': sub.plan.name,
                    'current_plan_price': plan_price,
                    'expected_plan_name': expected_name_by_price,
                    'created_at': sub.created_at
                })
                print(f"  ⚠️  User: {user_email:40s} | Plan actuel: {sub.plan.name:20s} (ID: {sub.plan_id:3d}, ${plan_price:.2f}) | Attendu: {expected_name_by_price}")
        
        print()
        
        if not issues:
            print("✓ Aucun problème détecté")
            return
        
        # 4. Proposer des corrections
        print("3. CORRECTIONS PROPOSÉES:")
        print("-" * 80)
        
        # Trouver les bons plan_ids
        correct_plan_ids = {}
        for plan in all_plans:
            plan_name_normalized = re.sub(r'\s*\$\d+.*$', '', plan.name, flags=re.IGNORECASE).strip().upper()
            plan_price_cents = int(plan.amount) if plan.amount else 0
            
            if plan_name_normalized == 'WELLNESS' and plan_price_cents == 9900:
                correct_plan_ids['WELLNESS'] = plan.id
            elif plan_name_normalized == 'SELF EXPLORATION' and (plan_price_cents == 25000 or plan_price_cents == 24900):
                correct_plan_ids['SELF EXPLORATION'] = plan.id
            elif plan_name_normalized == 'REVELATION' and plan_price_cents == 29900:
                correct_plan_ids['REVELATION'] = plan.id
        
        print("Plans corrects identifiés:")
        for plan_name, plan_id in correct_plan_ids.items():
            print(f"  {plan_name}: ID {plan_id}")
        print()
        
        # 5. Corriger les abonnements
        print("4. CORRECTION DES ABONNEMENTS:")
        print("-" * 80)
        print("⚠️  ATTENTION: Cette opération va modifier les abonnements dans la base de données!")
        print("   Voulez-vous continuer? (oui/non): ", end='')
        
        # Pour l'instant, on ne fait que lister les corrections nécessaires
        # Décommentez le code ci-dessous pour appliquer les corrections
        """
        response = input().strip().lower()
        if response != 'oui':
            print("Opération annulée.")
            return
        """
        
        corrections_applied = 0
        for issue in issues:
            expected_plan_name = issue['expected_plan_name']
            correct_plan_id = correct_plan_ids.get(expected_plan_name)
            
            if not correct_plan_id:
                print(f"  ❌ Impossible de trouver le plan correct pour {expected_plan_name}")
                continue
            
            if issue['current_plan_id'] == correct_plan_id:
                print(f"  ✓ Abonnement {issue['subscription_id']} déjà correct")
                continue
            
            print(f"  📝 User {issue['user_email']}:")
            print(f"     - Plan actuel: {issue['current_plan_name']} (ID: {issue['current_plan_id']})")
            print(f"     - Plan correct: {expected_plan_name} (ID: {correct_plan_id})")
            
            # Décommentez pour appliquer la correction
            """
            result = await db.execute(
                select(Subscription).where(Subscription.id == issue['subscription_id'])
            )
            subscription = result.scalar_one_or_none()
            if subscription:
                subscription.plan_id = correct_plan_id
                await db.commit()
                corrections_applied += 1
                print(f"     ✓ Corrigé!")
            """
            print(f"     [Correction non appliquée - décommentez le code pour appliquer]")
        
        print()
        print(f"✓ {corrections_applied} abonnement(s) corrigé(s)")
        print()
        print("=" * 80)
        print("FIN DE LA CORRECTION")
        print("=" * 80)


if __name__ == "__main__":
    asyncio.run(fix_wrong_plan_assignments())
