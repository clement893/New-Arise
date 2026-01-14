# Healthcheck Fix - January 2026

**Date:** 2026-01-14  
**Issue:** Railway healthcheck failing with "service unavailable" after Docker build

---

## Problem Analysis

The healthcheck is attempting to reach `/api/v1/health/` but getting "service unavailable" errors. This indicates one of the following:

1. **Server not starting** - Application import error or crash during startup
2. **Server starting slowly** - Takes longer than healthcheck timeout to become ready
3. **Port binding issue** - Server not binding to the correct port
4. **Log visibility** - Startup errors not visible in Railway logs

---

## Fixes Applied

### 1. Fixed Output Redirection in entrypoint.sh ✅

**Problem:** The script had `exec 2>&1` which redirected stderr to stdout, but then all echo statements used `>&2`, creating confusion about where output goes.

**Solution:** Removed the confusing `exec 2>&1` and standardized all output to go to stdout (which Railway captures). Error messages still go to stderr for proper error handling.

**Files Modified:**
- `backend/entrypoint.sh` - Fixed all echo statements to output to stdout

### 2. Improved Startup Logging ✅

**Changes:**
- All startup messages now go to stdout for Railway to capture
- Added clearer startup messages indicating when server is ready
- Better error visibility for import failures

---

## Current Configuration

### Railway Configuration (`backend/railway.json`)

```json
{
  "healthcheckPath": "/api/v1/health/",
  "healthcheckTimeout": 180,
  "healthcheckInterval": 20
}
```

- **Timeout:** 180 seconds (3 minutes) - should be enough for server startup
- **Interval:** 20 seconds between retries
- **Path:** `/api/v1/health/` with trailing slash

### Health Endpoint

The health endpoint is registered at:
- `/api/v1/health/` - Simple health check (always returns success)
- `/` - Root endpoint (also returns health status)

Both endpoints:
- Are public (no authentication required)
- Don't depend on database/cache
- Return immediately without blocking

---

## Next Steps for Diagnosis

### 1. Check Railway Logs

After the next deployment, check the Railway logs for:

**Look for these messages:**
```
✓ Python found: ...
✓ uvicorn is installed
✓ Application imported successfully
Starting Uvicorn server...
```

**If you see import errors:**
```
❌ ERROR: Failed to import application!
Import error output: ...
```

This will show the exact error preventing startup.

### 2. Verify Server Startup

The logs should show:
```
Starting Uvicorn on 0.0.0.0:PORT...
Application will be available at http://0.0.0.0:PORT
Health check endpoint: http://0.0.0.0:PORT/api/v1/health/
```

If you don't see "Starting Uvicorn", the server isn't starting.

### 3. Check for Common Issues

**Missing Environment Variables:**
- `SECRET_KEY` - Required for application startup
- `DATABASE_URL` - Required for database operations (but server should start without it)
- `PORT` - Set automatically by Railway

**Import Errors:**
- Check if all Python dependencies are installed
- Verify `requirements.txt` is up to date
- Check for syntax errors in Python code

**Port Binding:**
- Verify `PORT` environment variable is set correctly
- Check if port is already in use (unlikely in Railway)

### 4. Test Locally

To reproduce the issue locally:

```bash
cd backend
# Set environment variables
export PORT=8000
export SECRET_KEY=test-secret-key
export DATABASE_URL=postgresql://...  # Optional for health check

# Run entrypoint
sh entrypoint.sh
```

In another terminal:
```bash
curl http://localhost:8000/api/v1/health/
curl http://localhost:8000/
```

Both should return JSON with `"status": "ok"` or `"status": "healthy"`.

---

## Expected Behavior

### Successful Startup Sequence

1. **Build completes** (Docker build logs)
2. **Healthcheck starts** (Railway healthcheck logs)
3. **Server startup logs appear:**
   ```
   Backend startup configuration:
   PORT environment variable: 8000
   ✓ Python found: ...
   ✓ uvicorn is installed
   Testing application import...
   ✓ Application imported successfully
   Starting Uvicorn server...
   ```
4. **Uvicorn starts:**
   ```
   INFO:     Started server process [PID]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8000
   ```
5. **Healthcheck succeeds** (should happen within 20-40 seconds)

### If Healthcheck Still Fails

If after these fixes the healthcheck still fails:

1. **Check Railway logs** for the actual error message
2. **Verify SECRET_KEY is set** in Railway environment variables
3. **Check if DATABASE_URL is causing issues** - server should start even if DB is unavailable
4. **Look for Python import errors** in the logs
5. **Verify all dependencies** are installed correctly

---

## Files Modified

- ✅ `backend/entrypoint.sh` - Fixed output redirection and improved logging

---

## Additional Notes

- The health endpoint is designed to be lightweight and always return success
- Migrations run in the background and don't block server startup
- The server should start even if database is unavailable (health endpoint doesn't need DB)
- All startup logs are now visible in Railway's log output

---

## Contact

If the issue persists after checking the logs, please share:
1. The complete Railway logs from the deployment
2. Any error messages from the startup sequence
3. Confirmation that SECRET_KEY is set in Railway environment variables
