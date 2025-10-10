@echo off
echo ========================================
echo   Nettoyage Cache Next.js
echo ========================================
echo.

echo [1/3] Suppression du dossier .next...
if exist .next (
    rmdir /s /q .next
    echo ✅ Cache .next supprime
) else (
    echo ℹ️  Dossier .next inexistant
)

echo.
echo [2/3] Suppression du cache node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✅ Cache node_modules supprime
) else (
    echo ℹ️  Cache node_modules inexistant
)

echo.
echo [3/3] Demarrage du serveur...
echo.

npm run dev
