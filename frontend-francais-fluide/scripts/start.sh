#!/bin/bash

# Script de démarrage pour FrançaisFluide en production
# Gestion des erreurs, logging et monitoring

set -euo pipefail

# Configuration
APP_NAME="FrançaisFluide"
LOG_DIR="/app/logs"
PID_FILE="/app/tmp/app.pid"

# Fonctions utilitaires
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$APP_NAME] $1" | tee -a "$LOG_DIR/app.log"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$APP_NAME] ERROR: $1" | tee -a "$LOG_DIR/error.log" >&2
}

cleanup() {
    log "Arrêt de l'application..."
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill -TERM "$PID"
            wait "$PID"
        fi
        rm -f "$PID_FILE"
    fi
    log "Application arrêtée"
    exit 0
}

# Configuration des signaux
trap cleanup SIGTERM SIGINT

# Créer les répertoires nécessaires
mkdir -p "$LOG_DIR" "/app/tmp"

# Vérifier les variables d'environnement critiques
required_vars=(
    "NODE_ENV"
    "PORT"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
        error "Variable d'environnement manquante: $var"
        exit 1
    fi
done

log "Démarrage de $APP_NAME en mode $NODE_ENV"

# Vérifier la connectivité de la base de données
if [ -n "${DATABASE_URL:-}" ]; then
    log "Vérification de la connexion à la base de données..."
    # Attendre que la base de données soit disponible
    timeout 30 bash -c 'until pg_isready -d "$DATABASE_URL"; do sleep 1; done' || {
        error "Impossible de se connecter à la base de données"
        exit 1
    }
    log "Base de données accessible"
fi

# Vérifier Redis
if [ -n "${REDIS_URL:-}" ]; then
    log "Vérification de la connexion Redis..."
    timeout 10 bash -c 'until redis-cli -u "$REDIS_URL" ping; do sleep 1; done' || {
        error "Impossible de se connecter à Redis"
        exit 1
    }
    log "Redis accessible"
fi

# Vérifier l'état de l'application
log "Vérification de l'état de l'application..."
if [ ! -f "/app/package.json" ]; then
    error "Fichier package.json manquant"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "/app/node_modules" ]; then
    log "Installation des dépendances..."
    npm ci --only=production --silent
fi

# Migration de la base de données (si applicable)
if [ -f "/app/scripts/migrate.sh" ]; then
    log "Exécution des migrations de base de données..."
    /app/scripts/migrate.sh
fi

# Générer le sitemap
if [ -f "/app/scripts/generate-sitemap.sh" ]; then
    log "Génération du sitemap..."
    /app/scripts/generate-sitemap.sh
fi

# Health check initial
log "Health check initial..."
if ! curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    log "L'application n'est pas encore prête, démarrage en cours..."
fi

# Démarrer l'application
log "Démarrage de l'application sur le port $PORT..."

# Utiliser PM2 pour la gestion des processus en production
if command -v pm2 >/dev/null 2>&1; then
    log "Utilisation de PM2 pour la gestion des processus"
    
    # Créer la configuration PM2
    cat > /app/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $PORT
    },
    error_file: '$LOG_DIR/pm2-error.log',
    out_file: '$LOG_DIR/pm2-out.log',
    log_file: '$LOG_DIR/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    pm2 start /app/ecosystem.config.js
    pm2 save
    
    # Attendre que l'application soit prête
    log "Attente de la disponibilité de l'application..."
    for i in {1..30}; do
        if curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
            log "Application prête et accessible"
            break
        fi
        sleep 2
    done
    
    # Monitoring PM2
    pm2 monit &
    
else
    # Démarrage simple avec Node.js
    log "Démarrage avec Node.js"
    
    # Démarrer l'application en arrière-plan
    node server.js > "$LOG_DIR/app.log" 2> "$LOG_DIR/error.log" &
    APP_PID=$!
    echo $APP_PID > "$PID_FILE"
    
    # Attendre que l'application soit prête
    log "Attente de la disponibilité de l'application..."
    for i in {1..30}; do
        if kill -0 $APP_PID 2>/dev/null && curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
            log "Application prête et accessible"
            break
        fi
        sleep 2
    done
fi

# Health check final
log "Health check final..."
if curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    log "✅ Application démarrée avec succès"
    
    # Envoyer une notification de démarrage
    if [ -n "${SLACK_WEBHOOK:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 $APP_NAME démarré avec succès sur le port $PORT\"}" \
            "$SLACK_WEBHOOK" || true
    fi
else
    error "❌ Échec du démarrage de l'application"
    exit 1
fi

# Monitoring continu
log "Démarrage du monitoring continu..."
while true; do
    # Health check périodique
    if ! curl -f "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
        error "Health check échoué, redémarrage de l'application..."
        
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            kill -TERM "$PID" 2>/dev/null || true
            rm -f "$PID_FILE"
        fi
        
        # Redémarrer l'application
        sleep 5
        exec "$0" "$@"
    fi
    
    # Vérifier l'utilisation de la mémoire
    if command -v pm2 >/dev/null 2>&1; then
        MEMORY_USAGE=$(pm2 jlist | jq -r '.[0].monit.memory / 1024 / 1024' 2>/dev/null || echo "0")
        if (( $(echo "$MEMORY_USAGE > 800" | bc -l) )); then
            log "Utilisation mémoire élevée: ${MEMORY_USAGE}MB"
        fi
    fi
    
    sleep 30
done
