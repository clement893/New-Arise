# Multi-stage build for production
FROM node:22-alpine AS base

# Install pnpm and system dependencies for sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev \
    && npm install -g pnpm@9.15.9

# Install dependencies (including devDependencies for build)
FROM base AS deps
WORKDIR /app

# Set environment variables for sharp installation (increase timeout and retry)
ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1
ENV npm_config_sharp_binary_host="https://github.com/lovell/sharp-libvips/releases/download"
ENV npm_config_sharp_libvips_binary_host="https://github.com/lovell/sharp-libvips/releases/download"

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/

# Install with retry logic for sharp
RUN pnpm install --no-frozen-lockfile || \
    (echo "Retrying installation..." && sleep 5 && pnpm install --no-frozen-lockfile) || \
    (echo "Second retry..." && sleep 10 && pnpm install --no-frozen-lockfile)

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=deps /app/apps/web/package.json ./apps/web/package.json
COPY --from=deps /app/packages/types/package.json ./packages/types/package.json
# Reinstall to recreate symlinks for binaries (offline mode to use cached packages)
RUN pnpm install --offline --no-frozen-lockfile || pnpm install --no-frozen-lockfile
COPY . .
ENV PATH="/app/node_modules/.bin:$PATH"
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# Copy start script for Railway compatibility
COPY --from=builder /app/apps/web/scripts/start.sh ./apps/web/scripts/start.sh
RUN chmod +x ./apps/web/scripts/start.sh

# Create entrypoint script for Railway compatibility (before USER switch)
# Railway may try to run pnpm start, so we ensure the entrypoint handles it
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo 'cd /app' >> /entrypoint.sh && \
    echo 'if [ -f server.js ]; then' >> /entrypoint.sh && \
    echo '  exec node server.js "$@"' >> /entrypoint.sh && \
    echo 'else' >> /entrypoint.sh && \
    echo '  echo "Error: server.js not found in /app"' >> /entrypoint.sh && \
    echo '  ls -la /app' >> /entrypoint.sh && \
    echo '  exit 1' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    chown nextjs:nodejs /entrypoint.sh

USER nextjs

# Railway provides PORT via environment variable, default to 3000 for local development
EXPOSE 3000

# Use PORT from Railway environment, fallback to 3000
ENV PORT=${PORT:-3000}
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD []

