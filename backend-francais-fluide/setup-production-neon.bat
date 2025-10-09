@echo off
echo ========================================
echo   Setup Production - Francais Fluide
echo ========================================
echo.

REM Definir DATABASE_URL pour Neon (Production)
set DATABASE_URL=postgresql://neondb_owner:npg_FGB42DEVwSTf@ep-soft-wind-ad7qthbt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require^&channel_binding=require

echo [INFO] Connexion a Neon DB (Production)...
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
echo Comptes crees :
echo - Admin : admin@francais-fluide.com / Admin123!
echo - Etudiants : etudiant1-5@francais-fluide.com / Etudiant123!
echo - Professeurs : professeur1-2@francais-fluide.com / Prof123!
echo - Etablissements : etablissement1-2@francais-fluide.com / Etablissement123!
echo.

pause
