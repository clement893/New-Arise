# Script de diagnostic pour la page Reports
# Vérifie l'état du code, des commits et suggère des actions

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic - Page Reports Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier le fichier source
Write-Host "1. Vérification du code source..." -ForegroundColor Yellow
$reportsFile = "apps/web/src/app/[locale]/dashboard/reports/page.tsx"
if (Test-Path $reportsFile) {
    $content = Get-Content $reportsFile -Raw
    if ($content -match "#D5DEE0") {
        Write-Host "   ✅ Background color #D5DEE0 trouvé dans le fichier" -ForegroundColor Green
        $lineNumber = (Get-Content $reportsFile | Select-String -Pattern "#D5DEE0").LineNumber
        Write-Host "   📍 Ligne: $lineNumber" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Background color #D5DEE0 NON trouvé!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier non trouvé: $reportsFile" -ForegroundColor Red
}

Write-Host ""

# 2. Vérifier l'état Git
Write-Host "2. Vérification Git..." -ForegroundColor Yellow
$status = git status --short
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "   ✅ Working tree clean (tous les changements sont commités)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Changements non commités:" -ForegroundColor Yellow
    Write-Host $status
}

# Dernier commit
$lastCommit = git log -1 --oneline
Write-Host "   📝 Dernier commit local: $lastCommit" -ForegroundColor Gray

Write-Host ""

# 3. Vérifier la synchronisation avec origin/main
Write-Host "3. Vérification synchronisation avec origin/main..." -ForegroundColor Yellow
git fetch origin 2>&1 | Out-Null
$localCommit = git rev-parse HEAD
$remoteCommit = git rev-parse origin/main

if ($localCommit -eq $remoteCommit) {
    Write-Host "   ✅ Code local synchronisé avec origin/main" -ForegroundColor Green
    Write-Host "   📝 Commit: $localCommit" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Code local diffère de origin/main" -ForegroundColor Yellow
    Write-Host "   📝 Local:  $localCommit" -ForegroundColor Gray
    Write-Host "   📝 Remote: $remoteCommit" -ForegroundColor Gray
    
    $commitsAhead = git rev-list --count HEAD..origin/main
    $commitsBehind = git rev-list --count origin/main..HEAD
    
    if ($commitsAhead -gt 0) {
        Write-Host "   ⚠️  Local est $commitsAhead commit(s) en retard sur origin/main" -ForegroundColor Yellow
        Write-Host "   💡 Action: git pull origin main" -ForegroundColor Cyan
    }
    
    if ($commitsBehind -gt 0) {
        Write-Host "   ⚠️  Local a $commitsBehind commit(s) non poussés vers origin/main" -ForegroundColor Yellow
        Write-Host "   💡 Action: git push origin main" -ForegroundColor Cyan
    }
}

Write-Host ""

# 4. Vérifier les commits récents sur la page reports
Write-Host "4. Commits récents sur reports/page.tsx..." -ForegroundColor Yellow
$recentCommits = git log --oneline --all --since="2 weeks ago" -- "apps/web/src/app/[locale]/dashboard/reports/page.tsx" | Select-Object -First 5
if ($recentCommits) {
    Write-Host "   📝 5 derniers commits:" -ForegroundColor Gray
    foreach ($commit in $recentCommits) {
        Write-Host "      $commit" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  Aucun commit récent trouvé" -ForegroundColor Yellow
}

Write-Host ""

# 5. Résumé et recommandations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECOMMANDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Vérifier Railway Dashboard:" -ForegroundColor Yellow
Write-Host "   → Allez sur railway.app → Votre projet → Service Frontend" -ForegroundColor White
Write-Host "   → Onglet 'Deployments'" -ForegroundColor White
Write-Host "   → Vérifiez si le commit '$localCommit' est déployé" -ForegroundColor White
Write-Host ""

Write-Host "2. Si le commit n'est pas déployé:" -ForegroundColor Yellow
Write-Host "   → Cliquez sur 'Redeploy' dans Railway" -ForegroundColor White
Write-Host "   → OU créez un commit vide pour déclencher un déploiement:" -ForegroundColor White
Write-Host "      git commit --allow-empty -m 'chore: trigger Railway redeploy'" -ForegroundColor Cyan
Write-Host "      git push origin main" -ForegroundColor Cyan
Write-Host ""

Write-Host "3. Si le déploiement est récent mais les changements ne sont pas visibles:" -ForegroundColor Yellow
Write-Host "   → Videz le cache de build Railway (Settings → Build → Clear Build Cache)" -ForegroundColor White
Write-Host "   → Videz le cache de votre navigateur (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   → Hard refresh la page (Ctrl+F5)" -ForegroundColor White
Write-Host ""

Write-Host "4. Vérifier les logs de build Railway:" -ForegroundColor Yellow
Write-Host "   → Ouvrez le dernier déploiement" -ForegroundColor White
Write-Host "   → Vérifiez les logs pour des erreurs ou avertissements" -ForegroundColor White
Write-Host ""

Write-Host "URL de test: https://modeleweb-production-136b.up.railway.app/fr/dashboard/reports" -ForegroundColor Cyan
Write-Host ""
