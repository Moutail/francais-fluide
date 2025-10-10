# Script PowerShell pour forcer le redéploiement complet sur Vercel
# Exécuter avec : powershell -ExecutionPolicy Bypass -File fix-vercel-complet.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FIX VERCEL COMPLET" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path ".git")) {
    Write-Host "ERREUR: Ce script doit être exécuté depuis la racine du projet Git" -ForegroundColor Red
    Write-Host "Naviguez vers le dossier francais-fluide et réessayez" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "1. Vérification du statut Git..." -ForegroundColor Yellow
git status --short

Write-Host ""
$hasChanges = git status --short
if ($hasChanges) {
    Write-Host "Modifications détectées. Voulez-vous les commiter ? (O/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "O" -or $response -eq "o") {
        Write-Host ""
        Write-Host "2. Ajout de tous les fichiers modifiés..." -ForegroundColor Yellow
        git add .
        
        Write-Host ""
        $commitMessage = Read-Host "Message du commit (ou appuyez sur Entrée pour un message par défaut)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "fix: Force complete rebuild - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        Write-Host ""
        Write-Host "3. Création du commit..." -ForegroundColor Yellow
        git commit -m $commitMessage
    }
}

Write-Host ""
Write-Host "4. Création d'un commit vide pour forcer le rebuild..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit --allow-empty -m "chore: Force Vercel rebuild - $timestamp"

Write-Host ""
Write-Host "5. Push vers GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  PUSH RÉUSSI !" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Vercel va maintenant redéployer automatiquement." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "PROCHAINES ÉTAPES:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Attendez 2-3 minutes que Vercel construise et déploie" -ForegroundColor White
    Write-Host "   Vérifiez sur: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Pendant ce temps, videz le cache de votre navigateur:" -ForegroundColor White
    Write-Host "   - Appuyez sur Ctrl + Shift + Delete" -ForegroundColor Gray
    Write-Host "   - Cochez 'Cookies' et 'Cache'" -ForegroundColor Gray
    Write-Host "   - Période: Toutes les périodes" -ForegroundColor Gray
    Write-Host "   - Cliquez sur 'Effacer les données'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Désinscrire les Service Workers:" -ForegroundColor White
    Write-Host "   - Ouvrez votre site Vercel" -ForegroundColor Gray
    Write-Host "   - Appuyez sur F12 (DevTools)" -ForegroundColor Gray
    Write-Host "   - Allez dans l'onglet 'Console'" -ForegroundColor Gray
    Write-Host "   - Copiez-collez ce code:" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()));" -ForegroundColor DarkGray
    Write-Host "   caches.keys().then(k => k.forEach(name => caches.delete(name)));" -ForegroundColor DarkGray
    Write-Host "   localStorage.clear(); sessionStorage.clear();" -ForegroundColor DarkGray
    Write-Host "   location.reload(true);" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "4. Testez en mode incognito:" -ForegroundColor White
    Write-Host "   - Ctrl + Shift + N (Chrome/Edge)" -ForegroundColor Gray
    Write-Host "   - Visitez votre site Vercel" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Vérifiez l'accès public sur Vercel:" -ForegroundColor White
    Write-Host "   - Dashboard → Settings → Deployment Protection" -ForegroundColor Gray
    Write-Host "   - Désactivez toutes les protections" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Ouvrir automatiquement le dashboard Vercel
    Write-Host "Voulez-vous ouvrir le dashboard Vercel maintenant ? (O/N)" -ForegroundColor Yellow
    $openDashboard = Read-Host
    if ($openDashboard -eq "O" -or $openDashboard -eq "o") {
        Start-Process "https://vercel.com/dashboard"
    }
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Vérifiez:" -ForegroundColor Yellow
    Write-Host "1. Que vous êtes bien connecté à GitHub" -ForegroundColor White
    Write-Host "2. Que vous avez les droits d'écriture sur le repo" -ForegroundColor White
    Write-Host "3. Que la branche 'main' existe" -ForegroundColor White
    Write-Host ""
    Write-Host "Essayez manuellement:" -ForegroundColor Yellow
    Write-Host "git push origin main --force" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
pause
