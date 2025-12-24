"""
Database Index Management
Creates and manages database indexes for optimal query performance
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import logger


async def create_recommended_indexes(session: AsyncSession) -> dict:
    """
    Create recommended indexes for optimal query performance
    
    Args:
        session: Database session
    
    Returns:
        Dict with creation results
    """
    results = {
        "created": [],
        "skipped": [],
        "errors": [],
    }
    
    # Indexes for users table
    user_indexes = [
        {
            "name": "idx_users_email_active",
            "table": "users",
            "columns": ["email", "is_active"],
            "description": "Composite index for email lookup with active filter",
        },
        {
            "name": "idx_users_created_at_desc",
            "table": "users",
            "columns": ["created_at DESC"],
            "description": "Index for sorting by creation date (descending)",
        },
        {
            "name": "idx_users_name_search",
            "table": "users",
            "columns": ["first_name", "last_name"],
            "description": "Composite index for name search",
        },
    ]
    
    # Indexes for projects table (if exists)
    project_indexes = [
        {
            "name": "idx_projects_user_created",
            "table": "projects",
            "columns": ["user_id", "created_at DESC"],
            "description": "Composite index for user's projects sorted by date",
        },
        {
            "name": "idx_projects_status",
            "table": "projects",
            "columns": ["status"],
            "description": "Index for filtering by status",
        },
    ]
    
    all_indexes = user_indexes + project_indexes
    
    for index_def in all_indexes:
        try:
            # Check if index exists
            check_sql = """
            SELECT COUNT(*) 
            FROM pg_indexes 
            WHERE indexname = :index_name
            """
            result = await session.execute(text(check_sql), {"index_name": index_def["name"]})
            exists = result.scalar() > 0
            
            if exists:
                results["skipped"].append(index_def["name"])
                logger.info(f"Index {index_def['name']} already exists, skipping")
                continue
            
            # Create index concurrently (non-blocking)
            columns_str = ", ".join(index_def["columns"])
            create_sql = f"""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS {index_def['name']}
            ON {index_def['table']} ({columns_str})
            """
            
            await session.execute(text(create_sql))
            await session.commit()
            
            results["created"].append(index_def["name"])
            logger.info(f"Created index: {index_def['name']} - {index_def['description']}")
        
        except Exception as e:
            results["errors"].append({"index": index_def["name"], "error": str(e)})
            logger.error(f"Failed to create index {index_def['name']}: {e}")
            await session.rollback()
    
    return results


async def analyze_tables(session: AsyncSession, table_names: Optional[list[str]] = None) -> bool:
    """
    Run ANALYZE on tables to update query planner statistics
    
    Args:
        session: Database session
        table_names: Optional list of table names (analyzes all if None)
    
    Returns:
        True if successful
    """
    try:
        if table_names:
            for table in table_names:
                await session.execute(text(f"ANALYZE {table}"))
        else:
            # Analyze all tables
            await session.execute(text("ANALYZE"))
        
        await session.commit()
        logger.info(f"Analyzed tables: {table_names or 'all'}")
        return True
    except Exception as e:
        logger.error(f"Failed to analyze tables: {e}")
        await session.rollback()
        return False


async def get_table_statistics(session: AsyncSession, table_name: str) -> dict:
    """
    Get table statistics for optimization
    
    Args:
        session: Database session
        table_name: Name of the table
    
    Returns:
        Dict with table statistics
    """
    sql = """
    SELECT
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation,
        most_common_vals
    FROM pg_stats
    WHERE tablename = :table_name
    LIMIT 100
    """
    
    result = await session.execute(text(sql), {"table_name": table_name})
    rows = result.fetchall()
    
    return {
        "table": table_name,
        "statistics": [
            {
                "column": row[2],
                "distinct_values": row[3],
                "correlation": row[4],
                "common_values": row[5],
            }
            for row in rows
        ]
    }

