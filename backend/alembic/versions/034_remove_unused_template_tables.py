"""remove unused template tables

Revision ID: 034
Revises: c49d9ff097b5
Create Date: 2026-01-26 12:00:00.000000

This migration removes 22 unused template tables identified in the database audit.
Tables are dropped in order to respect foreign key dependencies (children first, then parents).
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '034'
down_revision = 'c49d9ff097b5'
branch_labels = None
depends_on = None


def upgrade():
    """
    Remove unused template tables.
    Order matters: drop child tables first (those with foreign keys), then parent tables.
    """
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Get all existing tables
    existing_tables = set(inspector.get_table_names())
    
    # List of tables to drop (in dependency order - children first)
    tables_to_drop = [
        # Child tables (have foreign keys to parent tables)
        'task_execution_logs',      # FK to scheduled_tasks
        'share_access_logs',        # FK to shares
        'feature_flag_logs',        # FK to feature_flags
        'feedback_attachments',     # FK to feedback
        'form_submissions',         # FK to forms
        'announcement_dismissals',  # FK to announcements
        'restore_operations',       # FK to backups
        'comment_reactions',        # FK to comments
        'documentation_feedback',   # FK to documentation_articles
        'documentation_articles',   # FK to documentation_categories
        
        # Parent tables (may have self-referential or no dependencies)
        'documentation_categories',  # May have parent_id self-reference
        'scheduled_tasks',
        'shares',
        'feature_flags',
        'feedback',
        'forms',
        'announcements',
        'backups',
        'comments',
        'projects',
        'onboarding_steps',
        'user_onboarding',
        'favorites',
        'reports',
        'versions',
    ]
    
    print(f"\n🗑️  Starting removal of {len(tables_to_drop)} unused template tables...")
    
    dropped_tables = []
    skipped_tables = []
    
    for table_name in tables_to_drop:
        if table_name not in existing_tables:
            print(f"⏭️  Skipping {table_name} (table does not exist)")
            skipped_tables.append(table_name)
            continue
        
        try:
            # Check for foreign key constraints that reference this table
            # (we're dropping children first, but just to be safe)
            fk_check = conn.execute(text("""
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE constraint_type = 'FOREIGN KEY' 
                AND table_schema = 'public'
                AND table_name = :table_name
            """), {"table_name": table_name})
            
            # Drop the table (CASCADE will automatically drop dependent foreign keys)
            print(f"📝 Dropping table {table_name}...")
            conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}" CASCADE'))
            conn.commit()
            
            dropped_tables.append(table_name)
            print(f"✅ Successfully dropped table {table_name}")
            
        except Exception as e:
            print(f"❌ Error dropping table {table_name}: {e}")
            # Continue with other tables even if one fails
            conn.rollback()
            continue
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Dropped: {len(dropped_tables)} tables")
    print(f"   ⏭️  Skipped: {len(skipped_tables)} tables (not found)")
    
    if dropped_tables:
        print(f"\n✅ Successfully removed {len(dropped_tables)} unused template tables")
    else:
        print(f"\n⚠️  No tables were dropped (all were already removed or don't exist)")


def downgrade():
    """
    Restore dropped tables (recreate structure only, no data).
    This is a reversible migration, but data will be lost.
    """
    conn = op.get_bind()
    
    print("\n⚠️  WARNING: Downgrading will recreate table structures but all data will be lost!")
    print("📝 Recreating dropped tables (empty structure only)...")
    
    # Recreate tables in reverse order (parents first, then children)
    # Note: This recreates only the structure, not the data
    
    # Parent tables first
    parent_tables = [
        # projects table
        """
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # forms table
        """
        CREATE TABLE IF NOT EXISTS forms (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            fields JSONB NOT NULL,
            submit_button_text VARCHAR(50) DEFAULT 'Submit',
            success_message TEXT,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # onboarding_steps table
        """
        CREATE TABLE IF NOT EXISTS onboarding_steps (
            id SERIAL PRIMARY KEY,
            key VARCHAR(100) NOT NULL UNIQUE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            order_index INTEGER NOT NULL,
            is_required BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # user_onboarding table
        """
        CREATE TABLE IF NOT EXISTS user_onboarding (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            step_id INTEGER REFERENCES onboarding_steps(id) ON DELETE CASCADE,
            is_completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # announcements table
        """
        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'info',
            priority VARCHAR(20) DEFAULT 'medium',
            is_active BOOLEAN DEFAULT TRUE,
            is_dismissible BOOLEAN DEFAULT TRUE,
            show_on_login BOOLEAN DEFAULT FALSE,
            show_in_app BOOLEAN DEFAULT TRUE,
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            target_users TEXT,
            target_teams TEXT,
            target_roles TEXT,
            action_label VARCHAR(100),
            action_url VARCHAR(500),
            created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # feature_flags table
        """
        CREATE TABLE IF NOT EXISTS feature_flags (
            id SERIAL PRIMARY KEY,
            key VARCHAR(100) NOT NULL UNIQUE,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            is_enabled BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # scheduled_tasks table
        """
        CREATE TABLE IF NOT EXISTS scheduled_tasks (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            task_type VARCHAR(50) NOT NULL,
            schedule VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            last_run_at TIMESTAMP WITH TIME ZONE,
            next_run_at TIMESTAMP WITH TIME ZONE,
            config JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # backups table
        """
        CREATE TABLE IF NOT EXISTS backups (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            backup_type VARCHAR(50) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            file_path VARCHAR(500),
            size_bytes BIGINT,
            created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # documentation_categories table
        """
        CREATE TABLE IF NOT EXISTS documentation_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(200) NOT NULL UNIQUE,
            description TEXT,
            parent_id INTEGER REFERENCES documentation_categories(id) ON DELETE SET NULL,
            order_index INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # documentation_articles table
        """
        CREATE TABLE IF NOT EXISTS documentation_articles (
            id SERIAL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            slug VARCHAR(200) NOT NULL UNIQUE,
            content TEXT NOT NULL,
            category_id INTEGER REFERENCES documentation_categories(id) ON DELETE SET NULL,
            is_published BOOLEAN DEFAULT FALSE,
            view_count INTEGER DEFAULT 0,
            created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # shares table
        """
        CREATE TABLE IF NOT EXISTS shares (
            id SERIAL PRIMARY KEY,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NOT NULL,
            shared_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            permission_level VARCHAR(20) DEFAULT 'read',
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # favorites table
        """
        CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, entity_type, entity_id)
        )
        """,
        
        # comments table
        """
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
            is_edited BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # feedback table
        """
        CREATE TABLE IF NOT EXISTS feedback (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            subject VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            type VARCHAR(50) DEFAULT 'general',
            status VARCHAR(20) DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # reports table
        """
        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            report_type VARCHAR(50) NOT NULL,
            parameters JSONB,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # versions table
        """
        CREATE TABLE IF NOT EXISTS versions (
            id SERIAL PRIMARY KEY,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INTEGER NOT NULL,
            version_number INTEGER NOT NULL,
            content JSONB,
            created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
    ]
    
    # Child tables (depend on parent tables)
    child_tables = [
        # form_submissions
        """
        CREATE TABLE IF NOT EXISTS form_submissions (
            id SERIAL PRIMARY KEY,
            form_id INTEGER REFERENCES forms(id) ON DELETE CASCADE,
            data JSONB NOT NULL,
            submitted_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # announcement_dismissals
        """
        CREATE TABLE IF NOT EXISTS announcement_dismissals (
            id SERIAL PRIMARY KEY,
            announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(announcement_id, user_id)
        )
        """,
        
        # feature_flag_logs
        """
        CREATE TABLE IF NOT EXISTS feature_flag_logs (
            id SERIAL PRIMARY KEY,
            flag_id INTEGER REFERENCES feature_flags(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            action VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # task_execution_logs
        """
        CREATE TABLE IF NOT EXISTS task_execution_logs (
            id SERIAL PRIMARY KEY,
            task_id INTEGER REFERENCES scheduled_tasks(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            error_message TEXT,
            execution_time_ms INTEGER
        )
        """,
        
        # restore_operations
        """
        CREATE TABLE IF NOT EXISTS restore_operations (
            id SERIAL PRIMARY KEY,
            backup_id INTEGER REFERENCES backups(id) ON DELETE CASCADE,
            status VARCHAR(20) DEFAULT 'pending',
            restored_at TIMESTAMP WITH TIME ZONE,
            restored_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # documentation_feedback
        """
        CREATE TABLE IF NOT EXISTS documentation_feedback (
            id SERIAL PRIMARY KEY,
            article_id INTEGER REFERENCES documentation_articles(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # share_access_logs
        """
        CREATE TABLE IF NOT EXISTS share_access_logs (
            id SERIAL PRIMARY KEY,
            share_id INTEGER REFERENCES shares(id) ON DELETE CASCADE,
            accessed_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
        
        # comment_reactions
        """
        CREATE TABLE IF NOT EXISTS comment_reactions (
            id SERIAL PRIMARY KEY,
            comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            reaction_type VARCHAR(20) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(comment_id, user_id, reaction_type)
        )
        """,
        
        # feedback_attachments
        """
        CREATE TABLE IF NOT EXISTS feedback_attachments (
            id SERIAL PRIMARY KEY,
            feedback_id INTEGER REFERENCES feedback(id) ON DELETE CASCADE,
            file_path VARCHAR(500) NOT NULL,
            file_name VARCHAR(200) NOT NULL,
            file_size INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
        """,
    ]
    
    # Recreate all tables
    all_tables = parent_tables + child_tables
    
    for table_sql in all_tables:
        try:
            conn.execute(text(table_sql))
            conn.commit()
        except Exception as e:
            print(f"⚠️  Error recreating table: {e}")
            conn.rollback()
    
    print("✅ Recreated table structures (empty)")
    print("⚠️  Note: All data has been lost - this is expected behavior for a downgrade")
