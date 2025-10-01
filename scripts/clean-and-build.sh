#!/bin/bash
# Script de nettoyage et build complet
# Usage: ./scripts/clean-and-build.sh [backend|frontend|all]

set -e  # Arrêter en cas d'erreur

COLOR_GREEN='\033[0;32m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
COLOR_RED='\033[0;31m'
COLOR_RESET='\033[0m'

log_info() {
    echo -e "${COLOR_BLUE}[INFO]${COLOR_RESET} $1"
}

log_success() {
    echo -e "${COLOR_GREEN}[SUCCESS]${COLOR_RESET} $1"
}

log_warning() {
    echo -e "${COLOR_YELLOW}[WARNING]${COLOR_RESET} $1"
}

log_error() {
    echo -e "${COLOR_RED}[ERROR]${COLOR_RESET} $1"
}

# Fonction pour nettoyer le backend
clean_backend() {
    log_info "Nettoyage du backend..."
    cd backend-francais-fluide
    
    # Supprimer node_modules et caches
    log_info "Suppression des dépendances et caches..."
    rm -rf node_modules
    rm -rf .npm
    rm -rf logs/*.log
    rm -rf prisma/dev.db*
    
    # Nettoyer le cache npm
    npm cache clean --force
    
    # Réinstaller les dépendances
    log_info "Réinstallation des dépendances..."
    npm install
    
    # Générer le client Prisma
    log_info "Génération du client Prisma..."
    npm run db:generate
    
    log_success "Backend nettoyé avec succès!"
    cd ..
}

# Fonction pour nettoyer le frontend
clean_frontend() {
    log_info "Nettoyage du frontend..."
    cd frontend-francais-fluide
    
    # Supprimer node_modules et caches
    log_info "Suppression des dépendances et caches..."
    rm -rf node_modules
    rm -rf .next
    rm -rf .turbo
    rm -rf out
    rm -rf coverage
    rm -rf .npm
    
    # Nettoyer le cache npm
    npm cache clean --force
    
    # Réinstaller les dépendances
    log_info "Réinstallation des dépendances..."
    npm install
    
    log_success "Frontend nettoyé avec succès!"
    cd ..
}

# Fonction pour build le backend
build_backend() {
    log_info "Build du backend..."
    cd backend-francais-fluide
    
    npm run build
    
    log_success "Backend build avec succès!"
    cd ..
}

# Fonction pour build le frontend
build_frontend() {
    log_info "Build du frontend..."
    cd frontend-francais-fluide
    
    # Nettoyer le dossier .next avant le build
    rm -rf .next
    
    npm run build
    
    log_success "Frontend build avec succès!"
    cd ..
}

# Menu principal
case "$1" in
    backend)
        clean_backend
        build_backend
        ;;
    frontend)
        clean_frontend
        build_frontend
        ;;
    all|"")
        log_info "Nettoyage complet du projet..."
        clean_backend
        clean_frontend
        log_info "Build du projet..."
        build_backend
        build_frontend
        log_success "Projet nettoyé et build avec succès!"
        ;;
    *)
        log_error "Usage: $0 [backend|frontend|all]"
        exit 1
        ;;
esac

log_success "✅ Terminé!"


