#!/usr/bin/env python3
"""
Migration runner script
Executes SQL migration files in the migrations directory
"""
import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

MIGRATIONS_DIR = Path(__file__).parent.parent / "migrations"


def run_migrations():
    """Execute all migration files in order"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL environment variable not set", file=sys.stderr)
            return 1
        
        # Convert asyncpg URL to psycopg2 for sync SQLAlchemy
        if "postgresql+asyncpg://" in database_url:
            database_url = database_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://")
        elif "postgresql://" in database_url and "+" not in database_url:
            # If it's plain postgresql://, add psycopg2 driver
            database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")
        
        # Create database engine
        engine = create_engine(database_url)
        
        # Get all SQL files in migrations directory
        migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))
        
        print(f"Found {len(migration_files)} migration files")
        
        with Session(engine) as session:
            for migration_file in migration_files:
                # Skip the main assessment_tables.sql as it's likely already executed
                if migration_file.name == "assessment_tables.sql":
                    print(f"Skipping {migration_file.name} (initial migration)")
                    continue
                    
                print(f"Executing migration: {migration_file.name}")
                
                try:
                    # Read SQL file
                    with open(migration_file, 'r', encoding='utf-8') as f:
                        sql_content = f.read()
                    
                    # Execute SQL - split into individual statements if needed
                    # PostgreSQL DO blocks should be executed as single statements
                    statements = []
                    current_statement = []
                    in_block = False
                    
                    for line in sql_content.split('\n'):
                        line = line.strip()
                        if not line or line.startswith('--'):
                            continue
                        
                        current_statement.append(line)
                        
                        # Check if we're starting or ending a DO block
                        if 'DO $$' in line or 'DO $$' in ' '.join(current_statement):
                            in_block = True
                        
                        if in_block and 'END $$;' in line:
                            statements.append('\n'.join(current_statement))
                            current_statement = []
                            in_block = False
                        elif not in_block and line.endswith(';'):
                            statements.append('\n'.join(current_statement))
                            current_statement = []
                    
                    # If we have leftover statements
                    if current_statement:
                        statements.append('\n'.join(current_statement))
                    
                    # Execute each statement
                    for stmt in statements:
                        if stmt.strip():
                            session.execute(text(stmt))
                    
                    session.commit()
                    
                    print(f"[SUCCESS] Successfully executed {migration_file.name}")
                    
                except Exception as e:
                    print(f"[ERROR] Error executing {migration_file.name}: {e}", file=sys.stderr)
                    session.rollback()
                    # Continue with other migrations
                    continue
        
        print("Migration execution completed")
        return 0
        
    except Exception as e:
        print(f"❌ Migration runner error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(run_migrations())
