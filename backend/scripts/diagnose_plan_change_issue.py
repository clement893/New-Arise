"""
Script pour diagnostiquer pourquoi le plan ne change pas après un achat
Vérifie les métadonnées Stripe, le webhook, et l'état de la base de données

IMPORTANT: Ce script doit être exécuté via Railway CLI pour avoir accès à la base de données:
    railway run python backend/scripts/diagnose_plan_change_issue.py --email votre@email.com
"""

import asyncio
import sys
import os
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import settings first - it will load DATABASE_URL from Railway service variables if available
try:
    from app.core.config import settings
    # Check if DATABASE_URL is available in settings
    database_url = getattr(settings, 'DATABASE_URL', None)
    if not database_url:
        # Try environment variable as fallback
        database_url = os.getenv('DATABASE_URL')
except Exception as e:
    print(f"⚠️  Erreur lors du chargement des settings: {e}")
    database_url = os.getenv('DATABASE_URL')

# Only warn if not found, but don't exit - let the connection attempt fail with a better error
if not database_url:
    print("⚠️  AVERTISSEMENT: DATABASE_URL n'est pas défini")
    print("   Le script va essayer de se connecter quand même...")
    print("   Si la connexion échoue, assurez-vous d'utiliser 'railway run' pour exécuter ce script.")
    print()

from app.core.database import AsyncSessionLocal
from app.models import Plan, Subscription, User
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime
import stripe


async def diagnose_plan_change_issue(email: str = None, user_id: int = None):
    """Diagnostiquer pourquoi le plan ne change pas"""
    # Debug: Check if DATABASE_URL is available
    try:
        from app.core.config import settings
        db_url = getattr(settings, 'DATABASE_URL', None)
        if db_url:
            # Mask password in URL for security
            masked_url = str(db_url).split('@')[-1] if '@' in str(db_url) else '***'
            print(f"🔍 DEBUG: DATABASE_URL trouvé (host: {masked_url})")
            # Check URL format
            if not str(db_url).startswith('postgresql'):
                print(f"⚠️  DEBUG: Format d'URL suspect: {str(db_url)[:50]}...")
        else:
            print("⚠️  DEBUG: DATABASE_URL non trouvé dans settings")
    except Exception as e:
        print(f"⚠️  DEBUG: Erreur lors du chargement des settings: {e}")
        import traceback
        traceback.print_exc()
    
    print("🔍 DEBUG: Tentative de connexion à la base de données...")
    try:
        # Test connection first with a simple query
        from app.core.database import engine
        print("🔍 DEBUG: Test de connexion avec l'engine...")
        try:
            async with engine.begin() as conn:
                # Simple test query
                from sqlalchemy import text
                result = await conn.execute(text("SELECT 1"))
                result.scalar()
                print("✅ DEBUG: Connexion réussie!")
        except Exception as conn_err:
            print(f"❌ DEBUG: Erreur lors du test de connexion: {type(conn_err).__name__}: {conn_err}")
            print(f"   Détails: {str(conn_err)}")
            # Re-raise to be caught by outer exception handler
            raise
        
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
    except Exception as e:
        error_type = type(e).__name__
        error_message = str(e)
        
        # Check what environment variables are available
        print("\n" + "=" * 80)
        print("🔍 DEBUG: Variables d'environnement disponibles")
        print("=" * 80)
        railway_vars = {k: v for k, v in os.environ.items() if 'RAILWAY' in k or 'DATABASE' in k}
        if railway_vars:
            for k, v in railway_vars.items():
                # Mask sensitive values
                if 'PASSWORD' in k or 'SECRET' in k or 'KEY' in k:
                    print(f"   {k}: ***")
                elif 'URL' in k and '@' in str(v):
                    # Mask password in URL
                    masked = str(v).split('@')[-1] if '@' in str(v) else '***'
                    print(f"   {k}: ...@{masked}")
                else:
                    print(f"   {k}: {v}")
        else:
            print("   Aucune variable Railway/Database trouvée")
        print()
        
        # Print full error details
        print(f"Type d'erreur: {error_type}")
        print(f"Message complet: {error_message}")
        print()
        
        # Show more context about the error
        if hasattr(e, '__cause__') and e.__cause__:
            print(f"Cause de l'erreur: {type(e.__cause__).__name__}: {str(e.__cause__)}")
            print()
        
        if "getaddrinfo failed" in error_message or "11001" in error_message or "Name resolution" in error_message or "postgres.railway.internal" in error_message:
            print("=" * 80)
            print("❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES")
            print("=" * 80)
            print()
            print("Le script ne peut pas se connecter à la base de données.")
            print()
            print("VÉRIFICATIONS:")
            print("  1. ✅ Railway CLI installé")
            print("  2. ✅ Projet lié au backend (@modele/backend)")
            print("  3. ❌ Connexion à la base de données échouée")
            print()
            print("SOLUTIONS POSSIBLES:")
            print()
            print("  A. Vérifier que DATABASE_URL est défini dans Railway:")
            print("     - Allez sur https://railway.app")
            print("     - Ouvrez votre projet 'New-Arise'")
            print("     - Ouvrez le service '@modele/backend'")
            print("     - Vérifiez l'onglet 'Variables'")
            print("     - Cherchez 'DATABASE_URL' ou 'POSTGRES_URL'")
            print()
            print("  B. Si DATABASE_URL n'existe pas, Railway peut utiliser POSTGRES_URL:")
            print("     - Railway crée automatiquement POSTGRES_URL pour les services PostgreSQL")
            print("     - Le backend devrait mapper POSTGRES_URL vers DATABASE_URL")
            print()
            print("  C. Essayer avec la variable Railway directement:")
            print("     railway run --service @modele/backend python backend/scripts/diagnose_plan_change_issue.py --email timmm@gmail.com")
            print()
        else:
            print("=" * 80)
            print(f"❌ ERREUR: {error_type}")
            print("=" * 80)
            print(f"Message: {error_message}")
            print()
            import traceback
            traceback.print_exc()
        
        sys.exit(1)


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
