# Security Audit Script for Dependencies (PowerShell)
# Scans for known vulnerabilities in npm and pip dependencies

Write-Host "🔍 Starting Security Audit of Dependencies..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Check frontend dependencies
Write-Host "📦 Checking Frontend Dependencies (npm)..." -ForegroundColor Yellow
if (Test-Path "apps\web") {
    Push-Location "apps\web"
    if (Test-Path "package.json") {
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            Write-Host "Running npm audit..."
            $npmAudit = npm audit --audit-level=moderate 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Frontend dependencies audit passed" -ForegroundColor Green
            } else {
                Write-Host "⚠ Frontend dependencies have vulnerabilities" -ForegroundColor Yellow
                Write-Host "Run 'npm audit fix' to attempt automatic fixes"
            }
        } else {
            Write-Host "⚠ npm not found, skipping frontend audit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠ package.json not found" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "⚠ apps\web directory not found" -ForegroundColor Yellow
}

Write-Host ""

# Check backend dependencies
Write-Host "🐍 Checking Backend Dependencies (pip)..." -ForegroundColor Yellow
if (Test-Path "backend") {
    Push-Location "backend"
    if (Test-Path "requirements.txt") {
        if (Get-Command pip-audit -ErrorAction SilentlyContinue) {
            Write-Host "Running pip-audit..."
            $pipAudit = pip-audit --desc 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Backend dependencies audit passed" -ForegroundColor Green
            } else {
                Write-Host "⚠ Backend dependencies have vulnerabilities" -ForegroundColor Yellow
                Write-Host "Review the output above and update vulnerable packages"
            }
        } elseif (Get-Command safety -ErrorAction SilentlyContinue) {
            Write-Host "Running safety check..."
            $safety = safety check 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Backend dependencies audit passed" -ForegroundColor Green
            } else {
                Write-Host "⚠ Backend dependencies have vulnerabilities" -ForegroundColor Yellow
                Write-Host "Review the output above and update vulnerable packages"
            }
        } else {
            Write-Host "⚠ pip-audit or safety not found" -ForegroundColor Yellow
            Write-Host "Install with: pip install pip-audit (or pip install safety)"
        }
    } else {
        Write-Host "⚠ requirements.txt not found" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "⚠ backend directory not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Security audit complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Recommendations:" -ForegroundColor Cyan
Write-Host "  - Review and fix any vulnerabilities found above"
Write-Host "  - Update dependencies regularly"
Write-Host "  - Consider using Dependabot or Renovate for automated updates"
Write-Host "  - Run this script before each deployment"
