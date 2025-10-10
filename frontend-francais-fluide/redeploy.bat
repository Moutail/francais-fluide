@echo off
echo ========================================
echo   REDEPLOY VERCEL - Frontend
echo ========================================
echo.

echo Navigation vers le dossier racine...
cd ..

echo.
echo Verification du statut Git...
git status --short

echo.
echo Creation d'un commit vide pour forcer le rebuild...
git commit --allow-empty -m "chore: Force Vercel rebuild - %date% %time%"

echo.
echo Push vers GitHub...
git push origin main

echo.
echo ========================================
echo   TERMINE !
echo ========================================
echo.
echo Vercel va redeployer automatiquement.
echo.
echo PROCHAINES ETAPES:
echo 1. Attendez 2-3 minutes
echo 2. Allez sur https://vercel.com/dashboard
echo 3. Verifiez que le deploiement est en cours
echo 4. Videz le cache du navigateur (Ctrl+Shift+Delete)
echo 5. Testez en mode incognito (Ctrl+Shift+N)
echo.
pause
