@echo off
echo ========================================
echo   FORCE REDEPLOY - Vercel
echo ========================================
echo.

echo 1. Creation d'un commit vide...
git commit --allow-empty -m "chore: Force redeploy - Clear Vercel cache [%date% %time%]"

echo.
echo 2. Push vers GitHub...
git push origin main

echo.
echo ========================================
echo   TERMINE !
echo ========================================
echo.
echo Vercel va detecter le nouveau commit et redeployer automatiquement.
echo.
echo Attendez 2-3 minutes, puis :
echo 1. Allez sur https://vercel.com/dashboard
echo 2. Verifiez que le deploiement est en cours
echo 3. Une fois termine, videz le cache du navigateur (Ctrl+Shift+Delete)
echo 4. Testez en mode incognito
echo.
pause
