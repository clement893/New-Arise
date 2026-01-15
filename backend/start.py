#!/usr/bin/env python3
"""
Simple Python entrypoint for Railway
Starts Uvicorn directly with proper logging
"""
import os
import sys
import subprocess

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None
sys.stderr.reconfigure(line_buffering=True) if hasattr(sys.stderr, 'reconfigure') else None

# Set Python unbuffered
os.environ['PYTHONUNBUFFERED'] = '1'

print("=" * 50)
print("Python Entrypoint Started")
print(f"PORT: {os.getenv('PORT', '8000')}")
print(f"Working directory: {os.getcwd()}")
print(f"Python: {sys.executable}")
print("=" * 50)

# Get port
port = os.getenv('PORT', '8000')

# Start Uvicorn
print(f"Starting Uvicorn on port {port}...")
print("=" * 50)

# Use subprocess to start uvicorn
# This ensures proper signal handling
subprocess.run([
    sys.executable, '-m', 'uvicorn',
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', port,
    '--log-level', 'info',
    '--access-log',
    '--timeout-keep-alive', '30',
    '--limit-concurrency', '1000',
    '--backlog', '2048',
])
