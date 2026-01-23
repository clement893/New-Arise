"""
Database Configuration
SQLAlchemy async setup with connection pooling
"""

import sys
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine, AsyncEngine
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Global engine variable - will be initialized lazily
_engine: Optional[AsyncEngine] = None
_AsyncSessionLocal: Optional[async_sessionmaker] = None

# Base class for models
Base = declarative_base()


def get_engine() -> Optional[AsyncEngine]:
    """Get or create the database engine (lazy initialization)
    
    Returns None if engine creation fails, allowing app to start without database.
    """
    global _engine
    if _engine is None:
        try:
            _engine = create_async_engine(
                str(settings.DATABASE_URL),
                echo=settings.DEBUG,
                future=True,
                # Connection pool optimization
                pool_pre_ping=True,  # Verify connections before use (prevents stale connections)
                pool_size=settings.DB_POOL_SIZE,  # Base pool size
                max_overflow=settings.DB_MAX_OVERFLOW,  # Maximum overflow connections
                pool_recycle=3600,  # Recycle connections after 1 hour (prevents stale connections)
                pool_reset_on_return='commit',  # Reset connection state on return to pool
                # Additional optimizations
                pool_timeout=30,  # Timeout for getting connection from pool (seconds)
                connect_args={
                    "server_settings": {
                        "application_name": "modele_backend",
                        "jit": "off",  # Disable JIT for faster query planning on small queries
                    },
                    "command_timeout": 60,  # Query timeout (seconds)
                },
                # Query optimization
                execution_options={
                    "autocommit": False,
                    "isolation_level": "READ COMMITTED",  # Balance between consistency and performance
                },
            )
        except Exception as e:
            # Log error but don't crash - app can start without database
            print(f"WARNING: Failed to create database engine: {e}", file=sys.stderr)
            print("The application will start, but database operations will fail until connection is established.", file=sys.stderr)
            return None
    return _engine


def get_async_session_local() -> Optional[async_sessionmaker]:
    """Get or create the async session factory (lazy initialization)
    
    Returns None if engine is not available.
    """
    global _AsyncSessionLocal
    if _AsyncSessionLocal is None:
        engine = get_engine()
        if engine is None:
            return None
        _AsyncSessionLocal = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return _AsyncSessionLocal


# For backward compatibility - create engine and session factory on first access
# This allows the app to start even if DATABASE_URL is invalid
try:
    engine = get_engine()
    AsyncSessionLocal = get_async_session_local()
    async_session_maker = AsyncSessionLocal
except Exception as e:
    # If engine creation fails, set to None - will be retried on first use
    print(f"WARNING: Database engine initialization deferred due to error: {e}", file=sys.stderr)
    engine = None
    AsyncSessionLocal = None
    async_session_maker = None


async def get_db() -> AsyncSession:
    """Dependency for getting database session"""
    # Ensure engine and session factory are initialized
    if AsyncSessionLocal is None:
        get_async_session_local()
    
    if AsyncSessionLocal is None:
        raise RuntimeError("Database not initialized. Please check DATABASE_URL configuration.")
    
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database (create tables)"""
    # Ensure engine is initialized
    db_engine = get_engine()
    if db_engine is None:
        raise RuntimeError("Database engine not available. Please check DATABASE_URL configuration.")
    async with db_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connections"""
    global _engine, _AsyncSessionLocal
    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _AsyncSessionLocal = None


