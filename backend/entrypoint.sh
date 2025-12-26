#!/bin/sh
# Don't use set -e to allow graceful error handling

# Use PORT environment variable if set, otherwise default to 8000
# Railway automatically sets PORT to the port the service should listen on
PORT=${PORT:-8000}

echo "=========================================="
echo "Backend startup configuration:"
echo "PORT environment variable: ${PORT}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo "Environment: ${ENVIRONMENT:-development}"
echo "=========================================="

# Run database migrations before starting the server (non-blocking)
if [ -n "$DATABASE_URL" ]; then
    echo "=========================================="
    echo "Running database migrations..."
    echo "=========================================="
    
    # Note: Alembic env.py handles URL conversion automatically
    # No need to modify DATABASE_URL here
    
    # Run migrations with error handling - don't fail if migrations fail
    alembic upgrade head || {
        echo "⚠️  Database migrations failed or skipped!"
        echo "This may be due to:"
        echo "  - Database connection issues"
        echo "  - Migration conflicts"
        echo "  - Missing database permissions"
        echo ""
        echo "Continuing startup anyway - the application will attempt to start."
        echo "Database operations may fail until migrations are resolved."
    }
else
    echo "⚠️  Warning: DATABASE_URL not set, skipping migrations..."
    echo "The application will start but database operations may fail."
fi

# Start Uvicorn directly for FastAPI
# Railway will route traffic to this port
echo "=========================================="
echo "Starting Uvicorn on 0.0.0.0:$PORT..."
echo "=========================================="
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --log-level info

