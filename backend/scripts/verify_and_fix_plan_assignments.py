"""
Script pour vérifier et corriger les abonnements avec des plans incorrects
Vérifie que le plan_id dans la souscription correspond bien au plan attendu
"""

import asyncio
import sys
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import async_session_maker
from app.models import Plan, Subscription, User
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime


async def verify_and_fix_plan_assignments():
    """Vérifier et corriger les abonnements avec des plans incorrects"""
    async with async_session_maker() as db:
        print("=" * 80)
        print("VÉRIFICATION ET CORRECTION DES ABONNEMENTS")
        print("=" * 80)
        print()
        
        # 1. Récupérer tous les plans actifs
        print("1. PLANS ACTIFS:")
        print("-" * 80)
        result = await db.execute(
            select(Plan).where(Plan.status == 'active').order_by(Plan.amount)
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
        expected_plans_by_price = {
            9900: 'LIFESTYLE & WELLNESS',      # $99 (formerly WELLNESS)
            24900: 'SELF EXPLORATION',  # $249
            25000: 'SELF EXPLORATION',  # $250 (alternative)
            29900: 'REVELATION',    # $299
        }
        
        # 3. Trouver les bons plan_ids
        correct_plan_ids = {}
        for plan in all_plans:
            plan_price_cents = int(plan.amount) if plan.amount else 0
            plan_name_normalized = plan.name.strip().upper()
            
            # Support both new name "LIFESTYLE & WELLNESS" and old name "WELLNESS" for backward compatibility
            if (plan_name_normalized == 'LIFESTYLE & WELLNESS' or plan_name_normalized == 'LIFESTYLE AND WELLNESS' or plan_name_normalized == 'WELLNESS') and plan_price_cents == 9900:
                correct_plan_ids['LIFESTYLE & WELLNESS'] = plan.id
                # Also map old name for backward compatibility
                correct_plan_ids['WELLNESS'] = plan.id
            elif plan_name_normalized == 'SELF EXPLORATION' and (plan_price_cents == 24900 or plan_price_cents == 25000):
                correct_plan_ids['SELF EXPLORATION'] = plan.id
            elif plan_name_normalized == 'REVELATION' and plan_price_cents == 29900:
                correct_plan_ids['REVELATION'] = plan.id
        
        print("2. PLANS CORRECTS IDENTIFIÉS:")
        print("-" * 80)
        for plan_name, plan_id in correct_plan_ids.items():
            plan_info = plan_map[plan_id]
            print(f"  {plan_name:20s} → ID {plan_id:3d} (${plan_info['price']:6.2f})")
        print()
        
        # 4. Récupérer toutes les souscriptions actives
        print("3. VÉRIFICATION DES ABONNEMENTS:")
        print("-" * 80)
        result = await db.execute(
            select(Subscription)
            .options(selectinload(Subscription.plan))
            .where(Subscription.status.in_(['ACTIVE', 'TRIALING']))
            .order_by(Subscription.created_at.desc())
        )
        subscriptions = result.scalars().all()
        
        issues = []
        for sub in subscriptions:
            plan = sub.plan
            if not plan:
                issues.append({
                    'subscription_id': sub.id,
                    'user_id': sub.user_id,
                    'current_plan_id': sub.plan_id,
                    'current_plan_name': 'N/A',
                    'current_plan_amount': 0,
                    'issue': 'Plan not found in database'
                })
                continue
            
            plan_price_cents = int(plan.amount) if plan.amount else 0
            plan_name_normalized = plan.name.strip().upper()
            
            # Vérifier si le plan correspond à un plan attendu
            expected_plan_name = None
            if plan_price_cents == 29900:
                expected_plan_name = 'REVELATION'
            elif plan_price_cents in [24900, 25000]:
                expected_plan_name = 'SELF EXPLORATION'
            elif plan_price_cents == 9900:
                expected_plan_name = 'LIFESTYLE & WELLNESS'  # formerly WELLNESS
            
            if expected_plan_name and plan_name_normalized != expected_plan_name:
                # Le prix correspond mais le nom ne correspond pas
                correct_plan_id = correct_plan_ids.get(expected_plan_name)
                if correct_plan_id and correct_plan_id != sub.plan_id:
                    issues.append({
                        'subscription_id': sub.id,
                        'user_id': sub.user_id,
                        'current_plan_id': sub.plan_id,
                        'current_plan_name': plan.name,
                        'current_plan_amount': plan_price_cents,
                        'expected_plan_name': expected_plan_name,
                        'correct_plan_id': correct_plan_id,
                        'issue': f'Plan name mismatch: has "{plan.name}" but should be "{expected_plan_name}"'
                    })
        
        # 5. Afficher les problèmes trouvés
        if issues:
            print(f"⚠️  {len(issues)} ABONNEMENT(S) AVEC PROBLÈME(S):")
            print("-" * 80)
            for issue in issues:
                print(f"\n  Abonnement ID: {issue['subscription_id']}")
                print(f"  Utilisateur ID: {issue['user_id']}")
                print(f"  Plan actuel: ID {issue['current_plan_id']} - {issue['current_plan_name']} (${issue['current_plan_amount']/100:.2f})")
                if 'expected_plan_name' in issue:
                    print(f"  Plan attendu: {issue['expected_plan_name']} (ID {issue['correct_plan_id']})")
                print(f"  Problème: {issue['issue']}")
            
            print("\n" + "=" * 80)
            print("CORRECTION:")
            print("=" * 80)
            print("⚠️  ATTENTION: Cette opération va modifier les abonnements dans la base de données!")
            print("   Voulez-vous continuer? (oui/non): ", end='')
            
            # Pour l'instant, on ne fait que lister les corrections nécessaires
            # Décommentez le code ci-dessous pour appliquer les corrections
            response = input().strip().lower()
            if response != 'oui':
                print("Opération annulée.")
                return
            
            corrections_applied = 0
            for issue in issues:
                if 'correct_plan_id' in issue:
                    try:
                        result = await db.execute(
                            select(Subscription).where(Subscription.id == issue['subscription_id'])
                        )
                        subscription = result.scalar_one_or_none()
                        if subscription:
                            old_plan_id = subscription.plan_id
                            subscription.plan_id = issue['correct_plan_id']
                            await db.commit()
                            print(f"✓ Corrigé abonnement {issue['subscription_id']}: plan_id {old_plan_id} → {issue['correct_plan_id']}")
                            corrections_applied += 1
                    except Exception as e:
                        print(f"✗ Erreur lors de la correction de l'abonnement {issue['subscription_id']}: {e}")
                        await db.rollback()
            
            print(f"\n✓ {corrections_applied} abonnement(s) corrigé(s)")
        else:
            print("✓ Aucun problème détecté. Tous les abonnements ont le bon plan_id.")
        
        print()


if __name__ == "__main__":
    asyncio.run(verify_and_fix_plan_assignments())
