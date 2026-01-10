# Script pour forcer un redéploiement Railway avec un commit vide
# Usage: .\scripts\trigger-railway-redeploy.ps1 [message]

param(
    [string]$Message = "chore: trigger Railway redeploy for reports page updates"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Déclenchement d'un redéploiement Railway..." -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans un repo Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet Git" -ForegroundColor Red
    exit 1
}

# Vérifier le statut Git
Write-Host "📋 Vérification du statut Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Attention: Des modifications non commitées sont présentes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
        exit 1
    }
}

# Vérifier qu'on est sur la branche main
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  Attention: Vous êtes sur la branche '$currentBranch' et non sur 'main'" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous continuer quand même? (o/n)"
    if ($response -ne "o" -and $response -ne "O") {
        Write-Host "❌ Annulé par l'utilisateur" -ForegroundColor Red
        exit 1
    }
}

# Afficher les derniers commits
Write-Host ""
Write-Host "📜 Derniers commits:" -ForegroundColor Cyan
git log --oneline -5
Write-Host ""

# Créer un commit vide
Write-Host "📝 Création d'un commit vide..." -ForegroundColor Yellow
try {
    git commit --allow-empty -m $Message
    Write-Host "✅ Commit vide créé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création du commit: $_" -ForegroundColor Red
    exit 1
}

# Afficher le nouveau commit
Write-Host ""
Write-Host "📜 Nouveau commit créé:" -ForegroundColor Cyan
git log --oneline -1
Write-Host ""

# Demander confirmation avant de pousser
Write-Host "⚠️  Vous allez maintenant pousser ce commit sur origin/main" -ForegroundColor Yellow
$response = Read-Host "Continuer? (o/n)"
if ($response -ne "o" -and $response -ne "O") {
    Write-Host "❌ Annulé par l'utilisateur. Le commit a été créé localement mais n'a pas été poussé." -ForegroundColor Yellow
    Write-Host "   Vous pouvez le pousser manuellement plus tard avec: git push origin main" -ForegroundColor Yellow
    exit 0
}

# Pousser sur origin/main
Write-Host ""
Write-Host "📤 Poussage du commit sur origin/main..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✅ Commit poussé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Railway devrait détecter le nouveau commit et déclencher un déploiement automatique" -ForegroundColor Cyan
    Write-Host "   Vérifiez le statut sur: https://railway.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Pour vérifier le déploiement:" -ForegroundColor Yellow
    Write-Host "   1. Allez sur Railway Dashboard" -ForegroundColor White
    Write-Host "   2. Sélectionnez le service Frontend" -ForegroundColor White
    Write-Host "   3. Onglet 'Deployments' pour voir le nouveau déploiement" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 URL de production: https://modeleweb-production-136b.up.railway.app/fr/dashboard/reports" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors du push: $_" -ForegroundColor Red
    Write-Host "   Le commit a été créé localement. Poussez-le manuellement avec: git push origin main" -ForegroundColor Yellow
    exit 1
}
