#!/bin/bash
# Startup script that runs migrations before starting the server

set -e

echo "🚀 Starting backend application..."

# Change to backend directory
cd "$(dirname "$0")/.." || exit 1

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "📦 Running database migrations..."
    python scripts/run_migrations.py || {
        echo "⚠️ Migration failed, but continuing..."
    }
else
    echo "⚠️ DATABASE_URL not set, skipping migrations"
fi

# Start the application
echo "🎯 Starting uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
