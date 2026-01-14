#!/bin/sh
# Don't use set -e to allow graceful error handling

# Redirect all output to stderr so Railway can see it
exec 2>&1

# Use PORT environment variable if set, otherwise default to 8000
# Railway automatically sets PORT to the port the service should listen on
PORT=${PORT:-8000}

echo "==========================================" >&2
echo "Backend startup configuration:" >&2
echo "PORT environment variable: ${PORT}" >&2
echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo 'yes' || echo 'no')" >&2
echo "Environment: ${ENVIRONMENT:-development}" >&2
echo "Python version: $(python --version 2>&1 || echo 'unknown')" >&2
echo "Working directory: $(pwd)" >&2
echo "==========================================" >&2

# Verify Python and uvicorn are available
echo "Verifying Python installation..." >&2
if ! command -v python >/dev/null 2>&1; then
    echo "ERROR: Python not found!" >&2
    exit 1
fi
echo "✓ Python found: $(which python)" >&2

echo "Verifying uvicorn installation..." >&2
if ! python -c "import uvicorn" 2>&1; then
    echo "ERROR: uvicorn not installed!" >&2
    exit 1
fi
echo "✓ uvicorn is installed" >&2

# SECURITY: Start server IMMEDIATELY, then run migrations in background
# This ensures health endpoint is available immediately for Railway healthchecks
# All migrations (Alembic + SQL + scripts) run in background
if [ -n "$DATABASE_URL" ]; then
    echo "==========================================" >&2
    echo "Migrations will run in background" >&2
    echo "Server starting immediately for healthcheck" >&2
    echo "==========================================" >&2
    
    # Run ALL migrations in background (non-blocking)
    (
        echo "==========================================" >&2
        echo "Running database migrations (Alembic) in background..." >&2
        echo "==========================================" >&2
        
        # Note: Alembic env.py handles URL conversion automatically
        # No need to modify DATABASE_URL here
        
        # Check for multiple heads (migration overlap) and merge if needed
        echo "Checking for migration conflicts..." >&2
        HEADS_OUTPUT=$(alembic heads 2>&1)
        # Count actual head revisions (lines that contain revision IDs)
        HEAD_COUNT=$(echo "$HEADS_OUTPUT" | grep -E "^[a-f0-9]+_[a-z_]+" | wc -l | tr -d ' ')
        
        # Check if merge migration 023 already exists in filesystem
        MERGE_FILE_EXISTS=$(ls alembic/versions/023_merge_migration_heads.py 2>/dev/null || echo "")
        # Also check if any merge migration file exists (pattern: *merge*.py)
        ANY_MERGE_EXISTS=$(ls alembic/versions/*merge*.py 2>/dev/null | head -1 || echo "")
        
        # If multiple heads detected and no merge exists, try to merge them
        if [ "$HEAD_COUNT" -gt 1 ] && [ -z "$MERGE_FILE_EXISTS" ] && [ -z "$ANY_MERGE_EXISTS" ]; then
            echo "⚠️  Multiple migration heads detected ($HEAD_COUNT heads). Attempting to merge..." >&2
            # Get all head revisions
            HEADS=$(echo "$HEADS_OUTPUT" | grep -E "^[a-f0-9]+_[a-z_]+" | tr '\n' ' ')
            if [ -n "$HEADS" ]; then
                echo "Merging heads: $HEADS" >&2
                # Create a merge migration
                MERGE_OUTPUT=$(alembic merge -m "Merge migration heads" $HEADS 2>&1)
                if echo "$MERGE_OUTPUT" | grep -qE "(Generating|Created)"; then
                    echo "✅ Merge migration created successfully" >&2
                else
                    echo "⚠️  Could not create merge migration (may already exist or error occurred)" >&2
                fi
            fi
        elif [ "$HEAD_COUNT" -gt 1 ]; then
            if [ -n "$MERGE_FILE_EXISTS" ]; then
                echo "ℹ️  Multiple heads detected but merge migration 023 already exists - will use existing merge" >&2
            elif [ -n "$ANY_MERGE_EXISTS" ]; then
                echo "ℹ️  Multiple heads detected but merge migration already exists: $(basename $ANY_MERGE_EXISTS) - will use existing merge" >&2
            fi
        fi
        
        # Run migrations with timeout (60 seconds max) - don't fail if migrations fail
        # Use timeout command if available, otherwise run directly
        if command -v timeout >/dev/null 2>&1; then
            MIGRATION_RESULT=$(timeout 60 alembic upgrade head 2>&1)
            MIGRATION_EXIT_CODE=$?
            echo "$MIGRATION_RESULT" >&2
            if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
                MIGRATION_STATUS="success"
            elif echo "$MIGRATION_RESULT" | grep -q "overlaps with other requested revisions"; then
                echo "⚠️  Migration overlap detected. Attempting to resolve..." >&2
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
            echo "$MIGRATION_RESULT" >&2
            if [ $MIGRATION_EXIT_CODE -eq 0 ]; then
                MIGRATION_STATUS="success"
            elif echo "$MIGRATION_RESULT" | grep -q "overlaps with other requested revisions"; then
                echo "⚠️  Migration overlap detected. Attempting to resolve..." >&2
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
            echo "✅ Alembic migrations completed successfully" >&2
            
            # Run SQL migrations from migrations/ directory
            echo "==========================================" >&2
            echo "Running SQL migrations..." >&2
            echo "==========================================" >&2
            if [ -f "scripts/run_migrations.py" ]; then
                echo "Executing SQL migration scripts..." >&2
                python scripts/run_migrations.py || {
                    echo "⚠️  Warning: SQL migrations failed, but continuing startup..." >&2
                }
            else
                echo "⚠️  Warning: run_migrations.py not found, skipping SQL migrations" >&2
            fi
            echo "==========================================" >&2
            
            # Verify avatar column migration was applied
            echo "==========================================" >&2
            echo "Verifying avatar column migration..." >&2
            echo "==========================================" >&2
            if command -v timeout >/dev/null 2>&1; then
                timeout 30 python scripts/ensure_avatar_migration.py 2>&1 || echo "⚠️  Avatar column verification skipped (will be created by auto-migration if needed)" >&2
            else
                python scripts/ensure_avatar_migration.py 2>&1 || echo "⚠️  Avatar column verification skipped (will be created by auto-migration if needed)" >&2
            fi
            
            # Import assessment questions after migration (with timeout)
            echo "==========================================" >&2
            echo "Importing assessment questions..." >&2
            echo "==========================================" >&2
            if command -v timeout >/dev/null 2>&1; then
                timeout 60 python scripts/import_assessment_questions_auto.py 2>&1 || echo "⚠️  Could not import questions (will be imported on next startup or manually)" >&2
            else
                python scripts/import_assessment_questions_auto.py 2>&1 || echo "⚠️  Could not import questions (will be imported on next startup or manually)" >&2
            fi
            
            # Ensure default theme exists after migrations (with timeout)
            echo "==========================================" >&2
            echo "Ensuring default theme exists..." >&2
            echo "==========================================" >&2
            if command -v timeout >/dev/null 2>&1; then
                timeout 30 python scripts/create_default_theme.py 2>&1 || echo "⚠️  Could not ensure default theme (will be created on first API call)" >&2
            else
                python scripts/create_default_theme.py 2>&1 || echo "⚠️  Could not ensure default theme (will be created on first API call)" >&2
            fi
        else
            echo "⚠️  Database migrations failed, timed out, or skipped!" >&2
            echo "This may be due to:" >&2
            echo "  - Database connection issues" >&2
            echo "  - Migration conflicts" >&2
            echo "  - Missing database permissions" >&2
            echo "  - Migration timeout (taking too long)" >&2
            echo "" >&2
            echo "Continuing anyway - migrations will be retried on next startup or can be run manually." >&2
        fi
    ) > /tmp/migration.log 2>&1 &
    MIGRATION_PID=$!
    echo "ℹ️  Migrations running in background (PID: $MIGRATION_PID)" >&2
    echo "ℹ️  Migration logs: tail -f /tmp/migration.log" >&2
    echo "ℹ️  Server starting NOW - health endpoint will be available immediately" >&2
else
    echo "⚠️  Warning: DATABASE_URL not set, skipping migrations..." >&2
    echo "The application will start but database operations may fail." >&2
fi

# Start Uvicorn directly for FastAPI
# Railway will route traffic to this port
echo "==========================================" >&2
echo "Starting Uvicorn on 0.0.0.0:$PORT..." >&2
echo "==========================================" >&2
echo "Application will be available at http://0.0.0.0:$PORT" >&2
echo "Health check endpoint: http://0.0.0.0:$PORT/api/v1/health/" >&2
echo "Root endpoint: http://0.0.0.0:$PORT/" >&2
echo "==========================================" >&2

# SECURITY: Start with proper error handling
# Use exec to replace shell process with uvicorn
# This ensures signals are properly handled
# Add --timeout-keep-alive to prevent connection issues
# Add --limit-concurrency to prevent resource exhaustion

# Test that the app can be imported before starting
echo "Testing application import..." >&2
IMPORT_OUTPUT=$(python -c "from app.main import app; print('✓ Application imported successfully')" 2>&1)
IMPORT_EXIT=$?
if [ $IMPORT_EXIT -ne 0 ]; then
    echo "❌ ERROR: Failed to import application!" >&2
    echo "Import error output:" >&2
    echo "$IMPORT_OUTPUT" >&2
    echo "This usually means there's a syntax error or import error in the code." >&2
    exit 1
fi
echo "$IMPORT_OUTPUT" >&2

echo "✓ Application import test passed" >&2
echo "Starting Uvicorn server..." >&2
echo "==========================================" >&2

# Start server with error handling
# Use exec to replace shell process with uvicorn
# This ensures signals are properly handled
exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "$PORT" \
    --log-level info \
    --access-log \
    --timeout-keep-alive 30 \
    --limit-concurrency 1000 \
    --backlog 2048
