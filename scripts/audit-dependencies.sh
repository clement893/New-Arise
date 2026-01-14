#!/bin/bash
# Security Audit Script for Dependencies
# Scans for known vulnerabilities in npm and pip dependencies

set -e

echo "🔍 Starting Security Audit of Dependencies..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check frontend dependencies
echo "📦 Checking Frontend Dependencies (npm)..."
if [ -d "apps/web" ]; then
    cd apps/web
    if [ -f "package.json" ]; then
        if command_exists npm; then
            echo "Running npm audit..."
            if npm audit --audit-level=moderate; then
                echo -e "${GREEN}✓ Frontend dependencies audit passed${NC}"
            else
                echo -e "${YELLOW}⚠ Frontend dependencies have vulnerabilities${NC}"
                echo "Run 'npm audit fix' to attempt automatic fixes"
            fi
        else
            echo -e "${YELLOW}⚠ npm not found, skipping frontend audit${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ package.json not found${NC}"
    fi
    cd ../..
else
    echo -e "${YELLOW}⚠ apps/web directory not found${NC}"
fi

echo ""

# Check backend dependencies
echo "🐍 Checking Backend Dependencies (pip)..."
if [ -d "backend" ]; then
    cd backend
    if [ -f "requirements.txt" ]; then
        if command_exists pip-audit; then
            echo "Running pip-audit..."
            if pip-audit --desc; then
                echo -e "${GREEN}✓ Backend dependencies audit passed${NC}"
            else
                echo -e "${YELLOW}⚠ Backend dependencies have vulnerabilities${NC}"
                echo "Review the output above and update vulnerable packages"
            fi
        elif command_exists safety; then
            echo "Running safety check..."
            if safety check; then
                echo -e "${GREEN}✓ Backend dependencies audit passed${NC}"
            else
                echo -e "${YELLOW}⚠ Backend dependencies have vulnerabilities${NC}"
                echo "Review the output above and update vulnerable packages"
            fi
        else
            echo -e "${YELLOW}⚠ pip-audit or safety not found${NC}"
            echo "Install with: pip install pip-audit (or pip install safety)"
        fi
    else
        echo -e "${YELLOW}⚠ requirements.txt not found${NC}"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ backend directory not found${NC}"
fi

echo ""
echo "✅ Security audit complete!"
echo ""
echo "📝 Recommendations:"
echo "  - Review and fix any vulnerabilities found above"
echo "  - Update dependencies regularly"
echo "  - Consider using Dependabot or Renovate for automated updates"
echo "  - Run this script before each deployment"
