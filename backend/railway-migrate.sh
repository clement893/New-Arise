#!/bin/bash
# Railway migration script
# Can be run as a pre-deploy hook or manually via Railway CLI

set -e

echo "📦 Running database migrations..."

# Change to backend directory (if not already there)
if [ -d "backend" ]; then
    cd backend
fi

# Run migrations
python scripts/run_migrations.py

echo "✅ Migrations completed"
