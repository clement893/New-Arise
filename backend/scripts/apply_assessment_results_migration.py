#!/usr/bin/env python3
"""
Apply assessment_results schema fix migration
This script applies the fix_assessment_results_schema.sql migration
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

def apply_migration():
    """Apply the assessment_results schema fix migration"""
    try:
        # Try to get DATABASE_URL from environment
        database_url = os.getenv("DATABASE_URL")
        
        # If not in environment, try to load from app config
        if not database_url:
            try:
                from app.core.config import settings
                database_url = str(settings.DATABASE_URL)
                print("[INFO] Using DATABASE_URL from app config")
            except Exception as e:
                print(f"[ERROR] Could not load DATABASE_URL from config: {e}")
                print("[INFO] Please set DATABASE_URL environment variable or ensure app config is accessible")
                return 1
        
        if not database_url:
            print("[ERROR] DATABASE_URL not found", file=sys.stderr)
            return 1
        
        # Convert asyncpg URL to psycopg2 for sync SQLAlchemy
        if "postgresql+asyncpg://" in database_url:
            database_url = database_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        elif "postgresql://" in database_url and "+" not in database_url:
            database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")
        
        print("[INFO] Connecting to database...")
        db_info = database_url.split('@')[1] if '@' in database_url else '***'
        print(f"[INFO] Database URL: {db_info}")
        
        # Create database engine
        engine = create_engine(database_url)
        
        # Path to migration file
        migrations_dir = Path(__file__).parent.parent / "migrations"
        migration_file = migrations_dir / "fix_assessment_results_schema.sql"
        
        if not migration_file.exists():
            print(f"[ERROR] Migration file not found: {migration_file}", file=sys.stderr)
            return 1
        
        print(f"[INFO] Reading migration file: {migration_file.name}")
        
        # Read SQL file
        with open(migration_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print("[INFO] Executing migration...")
        
        # Execute migration
        with Session(engine) as session:
            try:
                session.execute(text(sql_content))
                session.commit()
                print("[SUCCESS] Migration applied successfully!")
                print("[INFO] Fixed: assessment_results table schema")
                return 0
            except Exception as e:
                session.rollback()
                print(f"[ERROR] Error executing migration: {e}", file=sys.stderr)
                import traceback
                traceback.print_exc()
                return 1
        
    except Exception as e:
        print(f"[ERROR] Migration runner error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(apply_migration())
