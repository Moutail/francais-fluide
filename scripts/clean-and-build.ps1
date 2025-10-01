# Script PowerShell pour nettoyer et builder le projet
# Usage: .\scripts\clean-and-build.ps1 [-Target backend|frontend|all]

param(
    [string]$Target = "all"
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Info" { Write-Host "[INFO] $Message" -ForegroundColor Blue }
        "Success" { Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
        "Warning" { Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
    }
}

function Clean-Backend {
    Write-ColorOutput "Nettoyage du backend..." "Info"
    Push-Location backend-francais-fluide
    
    try {
        # Supprimer node_modules et caches
        Write-ColorOutput "Suppression des dépendances et caches..." "Info"
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force .npm -ErrorAction SilentlyContinue
        Remove-Item -Force logs\*.log -ErrorAction SilentlyContinue
        Remove-Item -Force prisma\dev.db* -ErrorAction SilentlyContinue
        
        # Nettoyer le cache npm
        npm cache clean --force
        
        # Réinstaller les dépendances
        Write-ColorOutput "Réinstallation des dépendances..." "Info"
        npm install
        
        # Générer le client Prisma
        Write-ColorOutput "Génération du client Prisma..." "Info"
        npm run db:generate
        
        Write-ColorOutput "Backend nettoyé avec succès!" "Success"
    }
    finally {
        Pop-Location
    }
}

function Clean-Frontend {
    Write-ColorOutput "Nettoyage du frontend..." "Info"
    Push-Location frontend-francais-fluide
    
    try {
        # Supprimer node_modules et caches
        Write-ColorOutput "Suppression des dépendances et caches..." "Info"
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force out -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force coverage -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force .npm -ErrorAction SilentlyContinue
        
        # Nettoyer le cache npm
        npm cache clean --force
        
        # Réinstaller les dépendances
        Write-ColorOutput "Réinstallation des dépendances..." "Info"
        npm install
        
        Write-ColorOutput "Frontend nettoyé avec succès!" "Success"
    }
    finally {
        Pop-Location
    }
}

function Build-Backend {
    Write-ColorOutput "Build du backend..." "Info"
    Push-Location backend-francais-fluide
    
    try {
        npm run build
        Write-ColorOutput "Backend build avec succès!" "Success"
    }
    finally {
        Pop-Location
    }
}

function Build-Frontend {
    Write-ColorOutput "Build du frontend..." "Info"
    Push-Location frontend-francais-fluide
    
    try {
        # Nettoyer le dossier .next avant le build
        Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
        
        npm run build
        Write-ColorOutput "Frontend build avec succès!" "Success"
    }
    finally {
        Pop-Location
    }
}

# Execution principale
switch ($Target.ToLower()) {
    "backend" {
        Clean-Backend
        Build-Backend
    }
    "frontend" {
        Clean-Frontend
        Build-Frontend
    }
    "all" {
        Write-ColorOutput "Nettoyage complet du projet..." "Info"
        Clean-Backend
        Clean-Frontend
        Write-ColorOutput "Build du projet..." "Info"
        Build-Backend
        Build-Frontend
        Write-ColorOutput "Projet nettoyé et build avec succès!" "Success"
    }
    default {
        Write-ColorOutput "Usage: .\scripts\clean-and-build.ps1 [-Target backend|frontend|all]" "Error"
        exit 1
    }
}

Write-ColorOutput "✅ Terminé!" "Success"


