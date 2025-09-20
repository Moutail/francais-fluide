# Guide de Déploiement - FrançaisFluide

Ce guide explique comment déployer FrançaisFluide dans différents environnements, de la configuration locale au déploiement en production.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Environnements](#environnements)
- [Prérequis](#prérequis)
- [Configuration](#configuration)
- [Déploiement local](#déploiement-local)
- [Déploiement staging](#déploiement-staging)
- [Déploiement production](#déploiement-production)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Sauvegarde et récupération](#sauvegarde-et-récupération)
- [Sécurité](#sécurité)
- [Optimisation des performances](#optimisation-des-performances)
- [Dépannage](#dépannage)

## Vue d'ensemble

FrançaisFluide est une application Next.js qui peut être déployée dans plusieurs environnements :

- **Local** : Développement et tests
- **Staging** : Tests d'intégration et validation
- **Production** : Environnement live

### Architecture de déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Static    │    │   Redis Cache   │    │   File Storage  │
│   (Vercel/Netlify)│    │                 │    │   (AWS S3)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Environnements

### Local (Development)
- **URL** : http://localhost:3000
- **Base de données** : PostgreSQL local ou Docker
- **Cache** : Redis local ou mock
- **Logs** : Console
- **SSL** : Non

### Staging
- **URL** : https://staging.francais-fluide.com
- **Base de données** : PostgreSQL staging
- **Cache** : Redis staging
- **Logs** : Centralisés
- **SSL** : Oui (Let's Encrypt)

### Production
- **URL** : https://francais-fluide.com
- **Base de données** : PostgreSQL production (HA)
- **Cache** : Redis cluster
- **Logs** : Centralisés + alertes
- **SSL** : Oui (certificat commercial)

## Prérequis

### Système
- Node.js 18+ 
- npm ou yarn
- Docker (optionnel)
- Git

### Services externes
- Base de données PostgreSQL
- Cache Redis
- Stockage de fichiers (AWS S3, Cloudinary)
- CDN (Cloudflare, AWS CloudFront)
- Monitoring (Sentry, DataDog)

### Variables d'environnement requises

```bash
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/francais_fluide

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=3600

# API Keys
GRAMMAR_API_KEY=your-grammar-api-key
AI_API_KEY=your-ai-api-key

# Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## Configuration

### 1. Cloner le repository

```bash
git clone https://github.com/francais-fluide/francais-fluide.git
cd francais-fluide
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer avec vos valeurs
nano .env.local
```

### 4. Configuration de la base de données

```bash
# Créer la base de données
createdb francais_fluide

# Exécuter les migrations
npm run db:migrate

# Seeder les données de base
npm run db:seed
```

## Déploiement local

### Méthode 1 : Développement standard

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, démarrer les tests
npm run test:watch
```

### Méthode 2 : Avec Docker

```bash
# Construire l'image
docker build -t francais-fluide .

# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### Méthode 3 : Avec Docker Compose complet

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/francais_fluide
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: francais_fluide
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter les services
docker-compose down
```

## Déploiement staging

### 1. Préparation

```bash
# Créer la branche staging
git checkout -b staging
git push origin staging

# Configurer les variables d'environnement staging
# sur votre plateforme de déploiement
```

### 2. Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --env staging

# Configurer les variables d'environnement
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add JWT_SECRET
```

### 3. Déploiement sur Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Créer un nouveau projet
railway init

# Ajouter les services
railway add postgresql
railway add redis

# Déployer
railway up
```

### 4. Déploiement sur DigitalOcean App Platform

```yaml
# .do/app.yaml
name: francais-fluide-staging
services:
- name: web
  source_dir: /
  github:
    repo: francais-fluide/francais-fluide
    branch: staging
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: staging
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: REDIS_URL
    value: ${redis.REDIS_URL}

databases:
- name: db
  engine: PG
  version: "13"
- name: redis
  engine: REDIS
  version: "6"
```

## Déploiement production

### 1. Préparation

```bash
# Créer la branche production
git checkout -b production
git push origin production

# Tagger la version
git tag v1.0.0
git push origin v1.0.0
```

### 2. Déploiement sur AWS

#### Infrastructure avec Terraform

```hcl
# infrastructure/main.tf
provider "aws" {
  region = "eu-west-1"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "francais-fluide-vpc"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count = 2
  vpc_id = aws_vpc.main.id
  cidr_block = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "francais-fluide-public-${count.index + 1}"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "francais-fluide-db"
  engine = "postgres"
  engine_version = "13.7"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name = "francais_fluide"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  
  tags = {
    Name = "francais-fluide-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id = "francais-fluide-redis"
  engine = "redis"
  node_type = "cache.t3.micro"
  num_cache_nodes = 1
  parameter_group_name = "default.redis6.x"
  port = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  tags = {
    Name = "francais-fluide-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "francais-fluide"
}

# Application Load Balancer
resource "aws_lb" "main" {
  name = "francais-fluide-alb"
  internal = false
  load_balancer_type = "application"
  security_groups = [aws_security_group.alb.id]
  subnets = aws_subnet.public[*].id
  
  tags = {
    Name = "francais-fluide-alb"
  }
}
```

#### Déploiement avec ECS

```json
{
  "family": "francais-fluide",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "francais-fluide",
      "image": "123456789012.dkr.ecr.eu-west-1.amazonaws.com/francais-fluide:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:eu-west-1:123456789012:parameter/francais-fluide/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/francais-fluide",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 3. Déploiement sur Google Cloud Platform

#### App Engine

```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  DATABASE_URL: postgresql://user:password@/db?host=/cloudsql/project:region:instance

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

handlers:
- url: /.*
  script: auto
  secure: always
```

#### Cloud Run

```yaml
# cloudbuild.yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args: ['build', '-t', 'gcr.io/$PROJECT_ID/francais-fluide:$COMMIT_SHA', '.']
- name: 'gcr.io/cloud-builders/docker'
  args: ['push', 'gcr.io/$PROJECT_ID/francais-fluide:$COMMIT_SHA']
- name: 'gcr.io/cloud-builders/gcloud'
  args:
  - 'run'
  - 'deploy'
  - 'francais-fluide'
  - '--image'
  - 'gcr.io/$PROJECT_ID/francais-fluide:$COMMIT_SHA'
  - '--region'
  - 'europe-west1'
  - '--platform'
  - 'managed'
  - '--allow-unauthenticated'
```

### 4. Déploiement sur Azure

#### Container Instances

```yaml
# azure-pipelines.yml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
  displayName: 'Install Node.js'

- script: |
    npm install
    npm run build
    npm run test
  displayName: 'Install dependencies and build'

- task: Docker@2
  displayName: 'Build and push image'
  inputs:
    command: buildAndPush
    repository: francais-fluide
    dockerfile: '**/Dockerfile'
    containerRegistry: 'Azure Container Registry'

- task: AzureContainerInstances@1
  displayName: 'Deploy to Azure Container Instances'
  inputs:
    azureSubscription: 'Azure Subscription'
    resourceGroupName: 'francais-fluide-rg'
    location: 'West Europe'
    imageName: 'francais-fluide:latest'
    containerName: 'francais-fluide'
    ports: '3000'
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Build
      run: npm run build

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/staging'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Staging
      run: |
        # Déploiement vers staging
        echo "Deploying to staging..."
    
  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      run: |
        # Déploiement vers production
        echo "Deploying to production..."
```

### GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test:coverage
    - npm run test:e2e
    - npm run build
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
    - staging

deploy-staging:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST $STAGING_WEBHOOK_URL
  only:
    - staging

deploy-production:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST $PRODUCTION_WEBHOOK_URL
  only:
    - main
  when: manual
```

## Monitoring

### 1. Logs centralisés

#### Winston + ELK Stack

```typescript
// src/lib/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export default logger;
```

### 2. Monitoring des performances

#### New Relic

```javascript
// newrelic.js
'use strict';

exports.config = {
  app_name: ['FrançaisFluide'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true
  },
  logging: {
    level: 'info'
  },
  application_logging: {
    forwarding: {
      enabled: true,
      max_samples_stored: 10000
    }
  }
};
```

#### DataDog

```typescript
// src/lib/metrics.ts
import StatsD from 'node-statsd';

const client = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'francais_fluide.'
});

export const metrics = {
  increment: (name: string, value: number = 1) => {
    client.increment(name, value);
  },
  
  gauge: (name: string, value: number) => {
    client.gauge(name, value);
  },
  
  timing: (name: string, value: number) => {
    client.timing(name, value);
  }
};
```

### 3. Alertes

#### PagerDuty

```typescript
// src/lib/alerts.ts
import axios from 'axios';

export const sendAlert = async (message: string, severity: 'low' | 'medium' | 'high' | 'critical') => {
  try {
    await axios.post(process.env.PAGERDUTY_WEBHOOK_URL, {
      routing_key: process.env.PAGERDUTY_ROUTING_KEY,
      event_action: 'trigger',
      dedup_key: `francais-fluide-${Date.now()}`,
      payload: {
        summary: message,
        severity: severity,
        source: 'FrançaisFluide',
        component: 'API',
        group: 'francais-fluide',
        class: 'error'
      }
    });
  } catch (error) {
    console.error('Failed to send alert:', error);
  }
};
```

## Sauvegarde et récupération

### 1. Sauvegarde de la base de données

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="francais_fluide"

# Créer la sauvegarde
pg_dump $DATABASE_URL > $BACKUP_DIR/backup_$DATE.sql

# Compresser
gzip $BACKUP_DIR/backup_$DATE.sql

# Supprimer les anciennes sauvegardes (plus de 30 jours)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Upload vers S3
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://francais-fluide-backups/database/
```

### 2. Récupération de la base de données

```bash
#!/bin/bash
# restore-db.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Télécharger depuis S3 si nécessaire
if [[ $BACKUP_FILE == s3://* ]]; then
  aws s3 cp $BACKUP_FILE /tmp/restore.sql.gz
  BACKUP_FILE="/tmp/restore.sql.gz"
fi

# Décompresser et restaurer
gunzip -c $BACKUP_FILE | psql $DATABASE_URL

echo "Database restored successfully"
```

### 3. Sauvegarde des fichiers

```bash
#!/bin/bash
# backup-files.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/files"

# Créer l'archive
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /app/uploads

# Upload vers S3
aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://francais-fluide-backups/files/

# Supprimer les anciennes sauvegardes
find $BACKUP_DIR -name "files_*.tar.gz" -mtime +30 -delete
```

## Sécurité

### 1. Configuration SSL/TLS

#### Nginx

```nginx
# /etc/nginx/sites-available/francais-fluide
server {
    listen 80;
    server_name francais-fluide.com www.francais-fluide.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name francais-fluide.com www.francais-fluide.com;
    
    ssl_certificate /etc/letsencrypt/live/francais-fluide.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/francais-fluide.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Sécurité des headers

```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};
```

### 3. Rate limiting

```typescript
// src/lib/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Trop de requêtes, veuillez réessayer plus tard.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Appliquer aux routes
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 tentatives par 15 minutes
export const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requêtes par 15 minutes
```

## Optimisation des performances

### 1. Cache Redis

```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  },
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  },
  
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
  
  async flush(): Promise<void> {
    await redis.flushall();
  }
};
```

### 2. Optimisation des images

```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'cdn.francais-fluide.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },
  compress: true,
  poweredByHeader: false,
};
```

### 3. Compression et minification

```typescript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  compress: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
  },
});
```

## Dépannage

### 1. Logs et debugging

```bash
# Vérifier les logs de l'application
docker logs francais-fluide-app

# Vérifier les logs de la base de données
docker logs francais-fluide-db

# Vérifier les logs Redis
docker logs francais-fluide-redis

# Logs en temps réel
docker-compose logs -f
```

### 2. Vérification de la santé

```bash
# Vérifier la santé de l'application
curl http://localhost:3000/api/health

# Vérifier la connexion à la base de données
psql $DATABASE_URL -c "SELECT 1;"

# Vérifier Redis
redis-cli ping
```

### 3. Problèmes courants

#### Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL est en cours d'exécution
sudo systemctl status postgresql

# Vérifier les connexions actives
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Redémarrer PostgreSQL
sudo systemctl restart postgresql
```

#### Erreur de mémoire

```bash
# Vérifier l'utilisation de la mémoire
free -h
top -p $(pgrep -f "node.*francais-fluide")

# Augmenter la limite de mémoire Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### Erreur de disque plein

```bash
# Vérifier l'espace disque
df -h

# Nettoyer les logs
sudo journalctl --vacuum-time=7d

# Nettoyer les packages npm
npm cache clean --force
```

### 4. Scripts de maintenance

```bash
#!/bin/bash
# maintenance.sh

echo "Starting maintenance..."

# Nettoyer les logs anciens
find /var/log -name "*.log" -mtime +30 -delete

# Nettoyer les caches
npm cache clean --force

# Optimiser la base de données
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Redémarrer les services
docker-compose restart

echo "Maintenance completed"
```

---

*Ce guide est mis à jour régulièrement. Dernière mise à jour : 2024-01-01*
