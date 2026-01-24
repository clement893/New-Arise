#!/usr/bin/env python3
"""
Minimal startup script that ensures we see output even if app fails
This is a fallback if entrypoint.sh doesn't work
"""
import os
import sys

# CRITICAL: Output immediately
print("=" * 60, flush=True)
print("MINIMAL STARTUP SCRIPT", flush=True)
print("=" * 60, flush=True)
print(f"Python: {sys.executable}", flush=True)
print(f"Working dir: {os.getcwd()}", flush=True)
print(f"PORT: {os.getenv('PORT', '8000')}", flush=True)
print("=" * 60, flush=True)

# Try to start the app
try:
    print("Attempting to import app...", flush=True)
    from app.main import app
    print("✓ App imported successfully", flush=True)
    
    import uvicorn
    port = int(os.getenv('PORT', '8000'))
    print(f"Starting Uvicorn on 0.0.0.0:{port}...", flush=True)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
    )
except Exception as e:
    print(f"ERROR: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)
