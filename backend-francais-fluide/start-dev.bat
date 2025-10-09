@echo off
echo ========================================
echo   Demarrage Backend - Francais Fluide
echo ========================================
echo.

REM Definir DATABASE_URL pour PostgreSQL local
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/francais_fluide

echo [INFO] Demarrage du serveur...
echo [INFO] Base de donnees : PostgreSQL Local
echo.

npm run dev
