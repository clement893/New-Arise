#!/bin/sh
# Minimal entrypoint for testing
# This script is a simplified version to diagnose the healthcheck issue

# Force immediate output
exec 2>&1
export PYTHONUNBUFFERED=1

echo "=========================================="
echo "MINIMAL ENTRYPOINT STARTED"
echo "Timestamp: $(date)"
echo "Working directory: $(pwd)"
echo "User: $(whoami)"
echo "PORT: ${PORT:-8000}"
echo "=========================================="

# Test Python
echo "Testing Python..."
python --version || exit 1

# Test import
echo "Testing app import..."
python -c "from app.main import app; print('App imported successfully')" || exit 1

# Start server directly
echo "Starting Uvicorn..."
exec python -m uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --log-level info
