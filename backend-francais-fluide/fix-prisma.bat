@echo off
echo ========================================
echo   Fix Prisma Client - Francais Fluide
echo ========================================
echo.

echo [1/3] Regeneration du client Prisma...
call npx prisma generate

echo.
echo [2/3] Synchronisation de la base de donnees...
call npx prisma db push

echo.
echo [3/3] Demarrage du serveur...
call npm run dev
