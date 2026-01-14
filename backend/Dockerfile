# Multi-stage build for FastAPI backend
FROM python:3.11-slim AS base

# Set working directory
WORKDIR /app

# Install system dependencies including Node.js for API connection check scripts
# and dependencies for Playwright
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    curl \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
FROM base AS deps
COPY requirements.txt* ./
RUN pip install --no-cache-dir --upgrade pip && \
    if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi && \
    playwright install chromium && \
    playwright install-deps chromium

# Production image
FROM base AS runner
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create non-root user
RUN groupadd --system --gid 1001 appuser && \
    useradd --system --uid 1001 --gid appuser appuser

# Copy dependencies and application
COPY --from=deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin
COPY . .

# Ensure scripts directory exists and make scripts executable
RUN mkdir -p /app/scripts && \
    chmod +x /app/scripts/*.js 2>/dev/null || true

# Change ownership
RUN chown -R appuser:appuser /app

# Ensure entrypoint.sh is executable
RUN chmod +x entrypoint.sh && \
    chown appuser:appuser entrypoint.sh

USER appuser

EXPOSE 8000

# Health check - uses PORT env var or defaults to 8000
# Note: HEALTHCHECK runs inside container, so it uses the same PORT as the app
# Use Python's urllib instead of requests for better reliability
# SECURITY: Health check endpoint is lightweight and doesn't require authentication
# Try both with and without trailing slash for compatibility
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD sh -c 'PORT=${PORT:-8000}; python -c "import urllib.request; import sys; import socket; socket.setdefaulttimeout(5); url=f\"http://localhost:{PORT}/api/v1/health/\"; r=urllib.request.urlopen(url, timeout=5); sys.exit(0 if r.getcode()==200 else 1)"' || exit 1

# Use entrypoint.sh from the repo
ENTRYPOINT ["./entrypoint.sh"]

