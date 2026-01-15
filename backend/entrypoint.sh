#!/bin/sh
# Don't use set -e to allow graceful error handling

# CRITICAL: Force immediate output visibility
# Redirect stderr to stdout so Railway captures everything
exec 2>&1

# Force unbuffered output for immediate visibility
# Python unbuffered mode
export PYTHONUNBUFFERED=1

# Flush output immediately (for Alpine/busybox compatibility)
if command -v stdbuf >/dev/null 2>&1; then
    exec stdbuf -oL -eL "$0" "$@"
fi

# Print immediate startup message so we know the script is running
# Use multiple methods to ensure visibility
echo "=========================================="
echo "ENTRYPOINT SCRIPT STARTED - $(date)"
echo "=========================================="
echo "Working directory: $(pwd)"
echo "User: $(whoami)"
echo "Shell: $SHELL"
echo "PATH: $PATH"
echo "Python: $(which python 2>&1)"
echo "=========================================="
echo ""

# Also write directly to stderr as backup
echo "ENTRYPOINT SCRIPT STARTED - stderr backup" >&2

# Use PORT environment variable if set, otherwise default to 8000
# Railway automatically sets PORT to the port the service should listen on
PORT=${PORT:-8000}

# Ensure all output is visible (both stdout and stderr)
# Railway captures both, so we'll output to both for maximum visibility
echo "=========================================="
echo "Backend startup configuration:"
echo "PORT environment variable: ${PORT}"
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')"
echo "Environment: ${ENVIRONMENT:-development}"
echo "Python version: $(python --version 2>&1 || echo 'unknown')"
echo "Working directory: $(pwd)"
echo "=========================================="

# Verify Python and uvicorn are available
echo "Verifying Python installation..."
if ! command -v python >/dev/null 2>&1; then
    echo "ERROR: Python not found!" >&2
    exit 1
fi
echo "✓ Python found: $(which python)"

echo "Verifying uvicorn installation..."
if ! python -c "import uvicorn" 2>&1; then
    echo "ERROR: uvicorn not installed!" >&2
    exit 1
fi
echo "✓ uvicorn is installed"

# SECURITY: Start server IMMEDIATELY, then run migrations in background
# This ensures health endpoint is available immediately for Railway healthchecks
# All migrations (Alembic + SQL + scripts) run in background
if [ -n "$DATABASE_URL" ]; then
    echo "=========================================="
    echo "Migrations will run in background"
    echo "Server starting immediately for healthcheck"
    echo "=========================================="
    
    # Run ALL migrations in background (non-blocking)
    (
        echo "=========================================="
        echo "Running database migrations (Alembic) in background..."
        echo "=========================================="
        
        # Note: Alembic env.py handles URL conversion automatically
        # No need to modify DATABASE_URL here
        
        # Check for multiple heads (migration overlap) and merge if needed
        echo "Checking for migration conflicts..."
        HEADS_OUTPUT=$(alembic heads 2>&1)
        # Count actual head revisions (lines that contain revision IDs)
        HEAD_COUNT=$(echo "$HEADS_OUTPUT" | grep -E "^[a-f0-9]+_[a-z_]+" | wc -l | tr -d ' ')
        
        # Check if merge migration 023 already exists in filesystem
        MERGE_FILE_EXISTS=$(ls alembic/versions/023_merge_migration_heads.py 2>/dev/null || echo "")
        # Also check if any merge migration file exists (pattern: *merge*.py)
        ANY_MERGE_EXISTS=$(ls alembic/versions/*merge*.py 2>/dev/null | head -1 || echo "")
        
        # If multiple heads detected and no merge exists, try to merge them
        if [ "$HEAD_COUNT" -gt 1 ] && [ -z "$MERGE_FILE_EXISTS" ] && [ -z "$ANY_MERGE_EXISTS" ]; then
            echo "⚠️  Multiple migration heads detected ($HEAD_COUNT heads). Attempting to merge..."
            # Get all head revisions
            HEADS=$(echo "$HEADS_OUTPUT" | grep -E "^[a-f0-9]+_[a-z_]+" | tr '\n' ' ')
            if [ -n "$HEADS" ]; then
                echo "Merging heads: $HEADS"
                # Create a merge migration
                MERGE_OUTPUT=$(alembic merge -m "Merge migration heads" $HEADS 2>&1)
                if echo "$MERGE_OUTPUT" | grep -qE "(Generating|Created)"; then
                    echo "✅ Merge migration created successfully"
                else
                    echo "⚠️  Could not create merge migration (may already exist or error occurred)"
                fi
            fi
        elif [ "$HEAD_COUNT" -gt 1 ]; then
            if [ -n "$MERGE_FILE_EXISTS" ]; then
                echo "ℹ️  Multiple heads detected but merge migration 023 already exists - will use existing merge"
            elif [ -n "$ANY_MERGE_EXISTS" ]; then
                echo "ℹ️  Multiple heads detected but merge migration already exists: $(basename $ANY_MERGE_EXISTS) - will use existing merge"
            fi
        fi
        
        # Run migrations with timeout (60 seconds max) - don't fail if migrations fail
        # Use timeout command if available, otherwise run directly
        if command -v timeout >/dev/null 2>&1; then
            MIGRATION_RESULT=$(timeout 60 alembic upgrade head 2>&1)
            MIGRATION_EXIT_CODE=$?
            echo "$MIGRATION_RESULT"
            if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
                MIGRATION_STATUS="success"
            elif echo "$MIGRATION_RESULT" | grep -q "overlaps with other requested revisions"; then
                echo "⚠️  Migration overlap detected. Attempting to resolve..."
                # Try to merge heads again
                HEADS=$(alembic heads 2>&1 | grep -oE "[a-f0-9]+_[a-z_]+" | tr '\n' ' ')
                if [ -n "$HEADS" ]; then
                    alembic merge -m "Auto-merge migration heads" $HEADS 2>&1 || true
                    # Retry upgrade after merge
                    timeout 60 alembic upgrade head 2>&1 && MIGRATION_STATUS="success" || MIGRATION_STATUS="timeout_or_failed"
                else
                    MIGRATION_STATUS="timeout_or_failed"
                fi
            else
                MIGRATION_STATUS="timeout_or_failed"
            fi
        else
            # Fallback: run without timeout if timeout command not available
            MIGRATION_RESULT=$(alembic upgrade head 2>&1)
            MIGRATION_EXIT_CODE=$?
            echo "$MIGRATION_RESULT"
            if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
                MIGRATION_STATUS="success"
            elif echo "$MIGRATION_RESULT" | grep -q "overlaps with other requested revisions"; then
                echo "⚠️  Migration overlap detected. Attempting to resolve..."
                # Try to merge heads again
                HEADS=$(alembic heads 2>&1 | grep -oE "[a-f0-9]+_[a-z_]+" | tr '\n' ' ')
                if [ -n "$HEADS" ]; then
                    alembic merge -m "Auto-merge migration heads" $HEADS 2>&1 || true
                    # Retry upgrade after merge
                    alembic upgrade head 2>&1 && MIGRATION_STATUS="success" || MIGRATION_STATUS="failed"
                else
                    MIGRATION_STATUS="failed"
                fi
            else
                MIGRATION_STATUS="failed"
            fi
        fi
        
        if [ "$MIGRATION_STATUS" = "success" ]; then
            echo "✅ Alembic migrations completed successfully"
            
            # Run SQL migrations from migrations/ directory
            echo "=========================================="
            echo "Running SQL migrations..."
            echo "=========================================="
            if [ -f "scripts/run_migrations.py" ]; then
                echo "Executing SQL migration scripts..."
                python scripts/run_migrations.py || {
                    echo "⚠️  Warning: SQL migrations failed, but continuing startup..."
                }
            else
                echo "⚠️  Warning: run_migrations.py not found, skipping SQL migrations"
            fi
            echo "=========================================="
            
            # Verify avatar column migration was applied
            echo "=========================================="
            echo "Verifying avatar column migration..."
            echo "=========================================="
            if command -v timeout >/dev/null 2>&1; then
                timeout 30 python scripts/ensure_avatar_migration.py 2>&1 || echo "⚠️  Avatar column verification skipped (will be created by auto-migration if needed)"
            else
                python scripts/ensure_avatar_migration.py 2>&1 || echo "⚠️  Avatar column verification skipped (will be created by auto-migration if needed)"
            fi
            
            # Import assessment questions after migration (with timeout)
            echo "=========================================="
            echo "Importing assessment questions..."
            echo "=========================================="
            if command -v timeout >/dev/null 2>&1; then
                timeout 60 python scripts/import_assessment_questions_auto.py 2>&1 || echo "⚠️  Could not import questions (will be imported on next startup or manually)"
            else
                python scripts/import_assessment_questions_auto.py 2>&1 || echo "⚠️  Could not import questions (will be imported on next startup or manually)"
            fi
            
            # Ensure default theme exists after migrations (with timeout)
            echo "=========================================="
            echo "Ensuring default theme exists..."
            echo "=========================================="
            if command -v timeout >/dev/null 2>&1; then
                timeout 30 python scripts/create_default_theme.py 2>&1 || echo "⚠️  Could not ensure default theme (will be created on first API call)"
            else
                python scripts/create_default_theme.py 2>&1 || echo "⚠️  Could not ensure default theme (will be created on first API call)"
            fi
        else
            echo "⚠️  Database migrations failed, timed out, or skipped!"
            echo "This may be due to:"
            echo "  - Database connection issues"
            echo "  - Migration conflicts"
            echo "  - Missing database permissions"
            echo "  - Migration timeout (taking too long)"
            echo ""
            echo "Continuing anyway - migrations will be retried on next startup or can be run manually."
        fi
    ) > /tmp/migration.log 2>&1 &
    MIGRATION_PID=$!
    echo "ℹ️  Migrations running in background (PID: $MIGRATION_PID)"
    echo "ℹ️  Migration logs: tail -f /tmp/migration.log"
    echo "ℹ️  Server starting NOW - health endpoint will be available immediately"
else
    echo "⚠️  Warning: DATABASE_URL not set, skipping migrations..."
    echo "The application will start but database operations may fail."
fi

# Start Uvicorn directly for FastAPI
# Railway will route traffic to this port
echo "=========================================="
echo "Starting Uvicorn on 0.0.0.0:$PORT..."
echo "=========================================="
echo "Application will be available at http://0.0.0.0:$PORT"
echo "Health check endpoint: http://0.0.0.0:$PORT/api/v1/health/"
echo "Root endpoint: http://0.0.0.0:$PORT/"
echo "=========================================="

# SECURITY: Start with proper error handling
# Use exec to replace shell process with uvicorn
# This ensures signals are properly handled
# Add --timeout-keep-alive to prevent connection issues
# Add --limit-concurrency to prevent resource exhaustion

# Test that the app can be imported before starting
echo "Testing application import..."
IMPORT_OUTPUT=$(python -c "from app.main import app; print('✓ Application imported successfully')" 2>&1)
IMPORT_EXIT=$?
if [ $IMPORT_EXIT -ne 0 ]; then
    echo "❌ ERROR: Failed to import application!"
    echo "Import error output:"
    echo "$IMPORT_OUTPUT"
    echo "This usually means there's a syntax error or import error in the code."
    exit 1
fi
echo "$IMPORT_OUTPUT"

echo "✓ Application import test passed"
echo ""
echo "=========================================="
echo "🚀 Starting Uvicorn server..."
echo "=========================================="
echo "Configuration:"
echo "  - Host: 0.0.0.0"
echo "  - Port: $PORT"
echo "  - Health endpoint: http://0.0.0.0:$PORT/api/v1/health/"
echo "  - Root endpoint: http://0.0.0.0:$PORT/"
echo ""
echo "The server will start now. All output will be visible below."
echo "If the healthcheck fails, check for errors in the logs below."
echo "=========================================="
echo ""

# Start server with error handling
# Use exec to replace shell process with uvicorn
# This ensures signals are properly handled
# Note: All uvicorn output will go to stdout/stderr and be captured by Railway

# Verify PORT is set and valid
if [ -z "$PORT" ]; then
    echo "ERROR: PORT environment variable is not set!"
    exit 1
fi

# Verify PORT is a number
if ! echo "$PORT" | grep -qE '^[0-9]+$'; then
    echo "ERROR: PORT must be a number, got: $PORT"
    exit 1
fi

echo "Final verification before starting server:"
echo "  - PORT: $PORT"
echo "  - Python: $(which python)"
echo "  - Uvicorn: $(python -c 'import uvicorn; print(uvicorn.__file__)' 2>&1)"
echo "  - App module: app.main:app"
echo "  - Working directory: $(pwd)"
echo "  - Files in app/: $(ls -la app/ 2>&1 | head -5)"
echo ""
echo "=========================================="
echo "Starting Uvicorn server NOW..."
echo "=========================================="
echo "All output below will be from Uvicorn/FastAPI"
echo "If you don't see 'Application startup complete' below,"
echo "the server may have failed to start."
echo "=========================================="
echo ""

# Start server - use exec to replace shell process
# This ensures signals are properly handled and Railway can manage the process
# All output from uvicorn will be visible in Railway logs
# Use --log-level debug temporarily to see more details
exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --log-level info \
    --access-log \
    --timeout-keep-alive 30 \
    --limit-concurrency 1000 \
    --backlog 2048 \
    --no-server-header
