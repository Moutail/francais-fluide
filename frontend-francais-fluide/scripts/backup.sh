#!/bin/bash

# Script de backup pour FrançaisFluide
# Sauvegarde de la base de données, Redis et fichiers de configuration

set -euo pipefail

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="/var/log/backup.log"

# Variables d'environnement
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-francais_fluide}"
POSTGRES_USER="${POSTGRES_USER:-francais_fluide}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"

REDIS_HOST="${REDIS_HOST:-redis}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_PASSWORD="${REDIS_PASSWORD}"

# S3 Configuration (optionnel)
S3_BUCKET="${BACKUP_S3_BUCKET:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"
AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

# Fonctions utilitaires
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

# Fonction de backup PostgreSQL
backup_postgres() {
    log "Début du backup PostgreSQL..."
    
    local backup_file="$BACKUP_DIR/postgres_backup_$DATE.sql"
    local compressed_file="$backup_file.gz"
    
    # Variables d'environnement pour pg_dump
    export PGPASSWORD="$POSTGRES_PASSWORD"
    
    # Backup de la base de données
    if pg_dump -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
        --verbose --no-password --format=plain > "$backup_file"; then
        
        # Compresser le backup
        gzip "$backup_file"
        
        log "Backup PostgreSQL terminé: $compressed_file"
        
        # Vérifier la taille du backup
        local size=$(du -h "$compressed_file" | cut -f1)
        log "Taille du backup PostgreSQL: $size"
        
        echo "$compressed_file"
    else
        error "Échec du backup PostgreSQL"
        return 1
    fi
}

# Fonction de backup Redis
backup_redis() {
    log "Début du backup Redis..."
    
    local backup_file="$BACKUP_DIR/redis_backup_$DATE.rdb"
    
    # Sauvegarder Redis
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" \
        --rdb "$backup_file"; then
        
        log "Backup Redis terminé: $backup_file"
        
        # Vérifier la taille du backup
        local size=$(du -h "$backup_file" | cut -f1)
        log "Taille du backup Redis: $size"
        
        echo "$backup_file"
    else
        error "Échec du backup Redis"
        return 1
    fi
}

# Fonction de backup des fichiers de configuration
backup_config() {
    log "Début du backup des fichiers de configuration..."
    
    local backup_file="$BACKUP_DIR/config_backup_$DATE.tar.gz"
    
    # Créer une archive des fichiers de configuration
    if tar -czf "$backup_file" \
        /app/nginx/ \
        /app/monitoring/ \
        /app/scripts/ \
        /app/.env* \
        /app/docker-compose.yml \
        /app/Dockerfile* 2>/dev/null; then
        
        log "Backup des configurations terminé: $backup_file"
        
        # Vérifier la taille du backup
        local size=$(du -h "$backup_file" | cut -f1)
        log "Taille du backup des configurations: $size"
        
        echo "$backup_file"
    else
        error "Échec du backup des configurations"
        return 1
    fi
}

# Fonction d'upload vers S3
upload_to_s3() {
    local file="$1"
    local s3_key="francais-fluide/backups/$(basename "$file")"
    
    if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
        log "Upload vers S3: s3://$S3_BUCKET/$s3_key"
        
        if aws s3 cp "$file" "s3://$S3_BUCKET/$s3_key" \
            --region "$AWS_DEFAULT_REGION"; then
            log "Upload S3 réussi"
            
            # Supprimer le fichier local après upload réussi
            rm -f "$file"
            log "Fichier local supprimé après upload S3"
        else
            error "Échec de l'upload S3"
            return 1
        fi
    fi
}

# Fonction de nettoyage des anciens backups
cleanup_old_backups() {
    log "Nettoyage des anciens backups (plus de $RETENTION_DAYS jours)..."
    
    # Nettoyer les backups locaux
    find "$BACKUP_DIR" -type f -name "*_backup_*" -mtime +$RETENTION_DAYS -delete
    
    # Nettoyer les backups S3
    if [ -n "$S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ]; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
        
        aws s3 ls "s3://$S3_BUCKET/francais-fluide/backups/" --region "$AWS_DEFAULT_REGION" | \
        awk '$1 < "'$cutoff_date'" {print $4}' | \
        while read -r file; do
            if [ -n "$file" ]; then
                aws s3 rm "s3://$S3_BUCKET/francais-fluide/backups/$file" --region "$AWS_DEFAULT_REGION"
                log "Ancien backup S3 supprimé: $file"
            fi
        done
    fi
    
    log "Nettoyage terminé"
}

# Fonction de vérification de l'intégrité
verify_backup() {
    local file="$1"
    
    log "Vérification de l'intégrité du backup: $file"
    
    if [[ "$file" == *.gz ]]; then
        # Vérifier l'archive gzip
        if gzip -t "$file" 2>/dev/null; then
            log "Backup PostgreSQL valide"
        else
            error "Backup PostgreSQL corrompu"
            return 1
        fi
    elif [[ "$file" == *.rdb ]]; then
        # Vérifier le fichier RDB Redis
        if file "$file" | grep -q "Redis"; then
            log "Backup Redis valide"
        else
            error "Backup Redis corrompu"
            return 1
        fi
    elif [[ "$file" == *.tar.gz ]]; then
        # Vérifier l'archive tar
        if tar -tzf "$file" >/dev/null 2>&1; then
            log "Backup des configurations valide"
        else
            error "Backup des configurations corrompu"
            return 1
        fi
    fi
}

# Fonction de restauration (pour usage manuel)
restore_postgres() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        error "Fichier de backup introuvable: $backup_file"
        return 1
    fi
    
    log "Restauration de la base de données depuis: $backup_file"
    
    # Variables d'environnement pour psql
    export PGPASSWORD="$POSTGRES_PASSWORD"
    
    # Décompresser si nécessaire
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB"
    else
        psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$backup_file"
    fi
    
    log "Restauration terminée"
}

# Fonction principale
main() {
    log "=== Début du backup FrançaisFluide ==="
    
    local backup_files=()
    local success_count=0
    local total_count=0
    
    # Backup PostgreSQL
    if postgres_backup=$(backup_postgres); then
        backup_files+=("$postgres_backup")
        verify_backup "$postgres_backup" && ((success_count++))
        ((total_count++))
    fi
    
    # Backup Redis
    if redis_backup=$(backup_redis); then
        backup_files+=("$redis_backup")
        verify_backup "$redis_backup" && ((success_count++))
        ((total_count++))
    fi
    
    # Backup des configurations
    if config_backup=$(backup_config); then
        backup_files+=("$config_backup")
        verify_backup "$config_backup" && ((success_count++))
        ((total_count++))
    fi
    
    # Upload vers S3 si configuré
    if [ ${#backup_files[@]} -gt 0 ]; then
        for backup_file in "${backup_files[@]}"; do
            upload_to_s3 "$backup_file"
        done
    fi
    
    # Nettoyage des anciens backups
    cleanup_old_backups
    
    # Résumé
    log "=== Résumé du backup ==="
    log "Backups créés: ${#backup_files[@]}"
    log "Backups réussis: $success_count/$total_count"
    
    if [ $success_count -eq $total_count ] && [ $total_count -gt 0 ]; then
        log "✅ Backup terminé avec succès"
        
        # Envoyer une notification de succès
        if [ -n "${SLACK_WEBHOOK:-}" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"✅ Backup FrançaisFluide réussi: $success_count/$total_count\"}" \
                "$SLACK_WEBHOOK" || true
        fi
        
        exit 0
    else
        error "❌ Échec du backup"
        
        # Envoyer une notification d'erreur
        if [ -n "${SLACK_WEBHOOK:-}" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"❌ Échec du backup FrançaisFluide: $success_count/$total_count\"}" \
                "$SLACK_WEBHOOK" || true
        fi
        
        exit 1
    fi
}

# Gestion des arguments
case "${1:-backup}" in
    backup)
        main
        ;;
    restore)
        if [ -z "${2:-}" ]; then
            error "Usage: $0 restore <backup_file>"
            exit 1
        fi
        restore_postgres "$2"
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|restore|cleanup}"
        exit 1
        ;;
esac
