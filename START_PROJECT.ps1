# Quick Start Script for New-Arise Project
# This script helps you start your project locally

Write-Host "🚀 Starting New-Arise Project..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend" -PathType Container)) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Setup Checklist:" -ForegroundColor Cyan
Write-Host ""

# Check if .env files exist
if (Test-Path "backend\.env") {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env file missing - copying from .env.example" -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "⚠️  Please edit backend\.env with your database settings" -ForegroundColor Yellow
}

if (Test-Path "apps\web\.env.local") {
    Write-Host "✅ Frontend .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env.local file missing - copying from .env.example" -ForegroundColor Yellow
    Copy-Item "apps\web\.env.example" "apps\web\.env.local"
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. DATABASE SETUP (Choose one):" -ForegroundColor Yellow
Write-Host "   Option A - Install Docker Desktop:" -ForegroundColor White
Write-Host "     1. Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
Write-Host "     2. Install and start Docker Desktop" -ForegroundColor Gray
Write-Host "     3. Run: docker-compose up -d postgres redis" -ForegroundColor Gray
Write-Host ""
Write-Host "   Option B - Install PostgreSQL locally:" -ForegroundColor White
Write-Host "     1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
Write-Host "     2. Install with default settings" -ForegroundColor Gray
Write-Host "     3. Create database: psql -U postgres -c 'CREATE DATABASE modele_db;'" -ForegroundColor Gray
Write-Host ""

Write-Host "2. INSTALL BACKEND DEPENDENCIES:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python -m venv venv" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   pip install -r requirements.txt" -ForegroundColor Gray
Write-Host ""

Write-Host "3. RUN DATABASE MIGRATIONS:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   alembic upgrade head" -ForegroundColor Gray
Write-Host ""

Write-Host "4. START THE SERVERS:" -ForegroundColor Yellow
Write-Host "   Terminal 1 - Backend:" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor Gray
Write-Host "     .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "     python -m uvicorn app.main:app --reload" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 - Frontend:" -ForegroundColor White
Write-Host "     pnpm dev" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Once running:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Green
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""

Write-Host "📚 For detailed instructions, see: LOCAL_SETUP_GUIDE.md" -ForegroundColor Cyan
