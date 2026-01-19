# Script PowerShell pour corriger les prix des plans via Railway
# Exécutez ce script pour corriger immédiatement les données

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Plan Prices via Railway" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Railway CLI est installé
Write-Host "1. Vérification de Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installation de Railway CLI:" -ForegroundColor Yellow
    Write-Host "  npm install -g @railway/cli" -ForegroundColor White
    Write-Host "  OU" -ForegroundColor White
    Write-Host "  Téléchargez depuis: https://railway.app/cli" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Railway CLI est installé: $railwayVersion" -ForegroundColor Green
Write-Host ""

# Connexion à Railway
Write-Host "2. Connexion à Railway..." -ForegroundColor Yellow
Write-Host "   Assurez-vous d'être connecté à Railway" -ForegroundColor Gray
railway whoami

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Non connecté à Railway" -ForegroundColor Red
    Write-Host "   Exécutez: railway login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Créer un fichier SQL temporaire
$sqlFile = "temp_fix_prices.sql"
$sqlContent = @"
-- Vérifier les prix actuels
\echo '=== Prix Actuels ==='
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;

-- Corriger REVELATION à 299 dollars (29900 cents)
\echo ''
\echo '=== Correction de REVELATION à 299 dollars ==='
UPDATE plans 
SET amount = 29900, 
    name = 'REVELATION',
    description = 'Complete leadership assessment with 360 feedback',
    updated_at = NOW()
WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';

-- Vérifier après correction
\echo ''
\echo '=== Prix Après Correction ==='
SELECT id, name, amount, (amount::numeric / 100) as price_dollars, interval, status
FROM plans 
WHERE status = 'active'
ORDER BY amount DESC;

\echo ''
\echo '=== ✓ Correction Terminée ==='
"@

Set-Content -Path $sqlFile -Value $sqlContent -Encoding UTF8

Write-Host "3. Correction des prix dans la base de données..." -ForegroundColor Yellow
Write-Host ""

# Exécuter le SQL via Railway
$env:PGPASSWORD = ""
railway run psql `$DATABASE_URL -f $sqlFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Prix corrigés avec succès!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vérification:" -ForegroundColor Yellow
    Write-Host "  1. Allez sur: https://modeleweb-production-136b.up.railway.app/register" -ForegroundColor White
    Write-Host "  2. Faites CTRL+F5 pour rafraîchir" -ForegroundColor White
    Write-Host "  3. Le prix devrait être 299.00/month ✓" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors de la correction" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution alternative:" -ForegroundColor Yellow
    Write-Host "  1. Allez sur https://railway.app" -ForegroundColor White
    Write-Host "  2. Ouvrez votre projet 'modelebackend-production'" -ForegroundColor White
    Write-Host "  3. Cliquez sur PostgreSQL > Query" -ForegroundColor White
    Write-Host "  4. Exécutez:" -ForegroundColor White
    Write-Host ""
    Write-Host "  UPDATE plans SET amount = 29900, name = 'REVELATION', updated_at = NOW()" -ForegroundColor Cyan
    Write-Host "  WHERE name LIKE '%Test%' OR name LIKE '%REVELATION%';" -ForegroundColor Cyan
}

# Nettoyer le fichier temporaire
Remove-Item $sqlFile -ErrorAction SilentlyContinue

Write-Host ""
Read-Host "Appuyez sur Entrée pour fermer"
"@