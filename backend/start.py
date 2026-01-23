#!/usr/bin/env python3
"""
Simple Python entrypoint for Railway
Starts Uvicorn directly with proper logging
CRITICAL: This script MUST produce immediate output for Railway logs
"""
import os
import sys

# CRITICAL: Force immediate output - write to both stdout and stderr
# Railway captures both, so we output to both for maximum visibility
print("=" * 50, file=sys.stderr, flush=True)
print("=" * 50, flush=True)
print("PYTHON ENTRYPOINT STARTED", file=sys.stderr, flush=True)
print("PYTHON ENTRYPOINT STARTED", flush=True)
print("=" * 50, file=sys.stderr, flush=True)
print("=" * 50, flush=True)

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None
sys.stderr.reconfigure(line_buffering=True) if hasattr(sys.stderr, 'reconfigure') else None

# Set Python unbuffered
os.environ['PYTHONUNBUFFERED'] = '1'

# Print environment info
port = os.getenv('PORT', '8000')
print(f"PORT: {port}", file=sys.stderr, flush=True)
print(f"PORT: {port}", flush=True)
print(f"Working directory: {os.getcwd()}", file=sys.stderr, flush=True)
print(f"Working directory: {os.getcwd()}", flush=True)
print(f"Python: {sys.executable}", file=sys.stderr, flush=True)
print(f"Python: {sys.executable}", flush=True)
print(f"Python version: {sys.version}", file=sys.stderr, flush=True)
print(f"Python version: {sys.version}", flush=True)

# Test import before starting
print("Testing application import...", file=sys.stderr, flush=True)
print("Testing application import...", flush=True)
try:
    from app.main import app
    print("✓ Application imported successfully", file=sys.stderr, flush=True)
    print("✓ Application imported successfully", flush=True)
except Exception as e:
    print(f"❌ ERROR: Failed to import application: {e}", file=sys.stderr, flush=True)
    print(f"❌ ERROR: Failed to import application: {e}", flush=True)
    import traceback
    traceback.print_exc(file=sys.stderr)
    traceback.print_exc()
    sys.exit(1)

print("=" * 50, file=sys.stderr, flush=True)
print("=" * 50, flush=True)
print("Starting Uvicorn server...", file=sys.stderr, flush=True)
print("Starting Uvicorn server...", flush=True)
print(f"Host: 0.0.0.0", file=sys.stderr, flush=True)
print(f"Host: 0.0.0.0", flush=True)
print(f"Port: {port}", file=sys.stderr, flush=True)
print(f"Port: {port}", flush=True)
print("=" * 50, file=sys.stderr, flush=True)
print("=" * 50, flush=True)

# Import uvicorn and run directly (not via subprocess)
# This ensures Railway can see all output
import uvicorn

# Start server - this will block and handle signals properly
uvicorn.run(
    app,
    host="0.0.0.0",
    port=int(port),
    log_level="info",
    access_log=True,
    timeout_keep_alive=30,
    limit_concurrency=1000,
    backlog=2048,
)
