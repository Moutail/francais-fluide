@echo off
echo ========================================
echo   Setup Base Locale - Francais Fluide
echo ========================================
echo.

REM Definir DATABASE_URL pour PostgreSQL local
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/francais_fluide

echo [INFO] Connexion a PostgreSQL Local...
echo [INFO] Base de donnees : francais_fluide
echo.

echo [1/2] Creation des comptes de test...
node create-test-accounts.js

echo.
echo [2/2] Verification...
echo.

echo ========================================
echo   Setup termine !
echo ========================================
echo.
echo Comptes crees dans la base locale :
echo - Admin : admin@francais-fluide.com / Admin123!
echo - Etudiants : etudiant1-5@francais-fluide.com / Etudiant123!
echo - Premium : premium1-2@francais-fluide.com / Premium123!
echo - Professeurs : professeur1-2@francais-fluide.com / Prof123!
echo - Etablissements : etablissement1-2@francais-fluide.com / Etablissement123!
echo.

pause
