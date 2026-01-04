#!/bin/bash
# Railway pre-deploy script to run migrations
# This script can be used as a pre-deploy hook or run manually via Railway CLI

set -e

echo "📦 Running database migrations..."

# Run migrations
cd backend
python scripts/run_migrations.py

echo "✅ Migrations completed"
