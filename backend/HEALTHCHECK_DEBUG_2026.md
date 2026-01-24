# Healthcheck Debugging - January 2026

## Problem
Railway healthcheck is failing with "service unavailable" after successful Docker build. No startup logs are visible, suggesting the application isn't starting.

## Changes Made

### 1. Added Explicit Start Command in railway.json
- Added `startCommand: "sh entrypoint.sh"` to ensure Railway uses the entrypoint script
- This bypasses any potential ENTRYPOINT issues

### 2. Improved Entrypoint Script Output
- Moved initial output to the very beginning of the script
- Ensures Railway sees output immediately when script starts
- Added import test before starting uvicorn

### 3. Created Minimal Startup Fallback
- Added `start_minimal.py` as a fallback if shell script fails
- This Python script will definitely output logs even if app import fails

## Next Steps for Diagnosis

### 1. Check Railway Logs
After deploying, check if you now see:
- "ENTRYPOINT: Script starting at..." messages
- Any Python import errors
- Uvicorn startup messages

### 2. If Still No Logs
The issue might be:
- Railway not executing the start command
- Container crashing before any output
- Working directory issues

### 3. Alternative: Use Python Directly
If shell script still doesn't work, update `railway.json`:
```json
"startCommand": "python start_minimal.py"
```

### 4. Check Environment Variables
Ensure these are set in Railway:
- `PORT` (Railway sets this automatically)
- `DATABASE_URL` (if using database)
- Any other required env vars

### 5. Test Locally
Test the entrypoint locally:
```bash
docker build -t test-backend .
docker run -p 8000:8000 -e PORT=8000 test-backend
```

## Expected Behavior

When working correctly, you should see:
1. "ENTRYPOINT: Script starting..." immediately
2. "Testing app import..." message
3. "Starting Uvicorn..." message
4. Uvicorn startup logs
5. "Application startup complete" from FastAPI

## Health Endpoint

The health endpoint at `/api/v1/health/` should:
- Return immediately (no database dependency)
- Return `{"status": "ok", "service": "backend", "timestamp": "..."}`
- Be available as soon as Uvicorn starts (before database init)

## If Healthcheck Still Fails

1. Check if the app is actually listening on the PORT
2. Verify the health endpoint is registered (check router.py)
3. Try accessing `/` endpoint instead of `/api/v1/health/`
4. Check Railway service logs for any error messages
5. Verify the container is running: `railway logs --tail 100`
