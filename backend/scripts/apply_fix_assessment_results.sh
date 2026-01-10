#!/bin/sh
# Script to apply fix_assessment_results_schema.sql migration
# This can be run via Railway CLI: railway run --service backend sh scripts/apply_fix_assessment_results.sh

set -e

MIGRATION_FILE="migrations/fix_assessment_results_schema.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "Applying migration: fix_assessment_results_schema.sql"
echo "=========================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

# Execute migration using psql
# Convert asyncpg URL to psycopg2 if needed for psql
DB_URL=$(echo "$DATABASE_URL" | sed 's/postgresql+asyncpg:\/\//postgresql:\/\//' | sed 's/postgresql:\/\/\(.*\)/postgresql:\/\/\1/')

echo "Connecting to database..."
psql "$DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "=========================================="
    echo "SUCCESS: Migration applied successfully!"
    echo "=========================================="
    exit 0
else
    echo "=========================================="
    echo "ERROR: Migration failed!"
    echo "=========================================="
    exit 1
fi
