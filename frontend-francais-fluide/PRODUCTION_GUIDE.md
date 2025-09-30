# 🚀 Guide de Production - FrançaisFluide

## 📋 Vue d'ensemble

Ce guide couvre le déploiement complet de FrançaisFluide en production sur **Vercel** (frontend) et **Railway** (backend), avec monitoring, sécurité et scaling.

## 🏗️ Architecture de Production

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │────│  Frontend Next.js│────│   Railway API   │
│   (Global)      │    │   (Serverless)   │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Cloudflare     │    │  Vercel Edge    │    │  Railway DB     │
│  (Security)     │    │  (Functions)    │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Sentry         │    │  Google Analytics│    │  Monitoring     │
│  (Error Track.) │    │  (Analytics)    │    │  (Health)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration Pré-Production

### 1. Variables d'Environnement

#### **Frontend (Vercel)**

```bash
# APIs IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LANGUAGETOOL_API_KEY=...

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=francais-fluide.com

# Configuration
NEXT_PUBLIC_API_URL=https://francais-fluide-api.railway.app
NEXT_PUBLIC_APP_URL=https://francais-fluide.vercel.app

# Sécurité
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://francais-fluide.vercel.app
```

#### **Backend (Railway)**

```bash
# Base de données
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# APIs IA
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Sécurité
JWT_SECRET=...
ENCRYPTION_KEY=...

# Monitoring
SENTRY_DSN=https://...
```

### 2. Configuration Vercel

#### **vercel.json**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 3. Configuration Railway

#### **railway.json**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300
  },
  "environments": {
    "production": {
      "variables": {
        "NODE_ENV": "production",
        "PORT": "8000"
      }
    }
  }
}
```

## 🚀 Déploiement

### 1. **Frontend sur Vercel**

```bash
# Installation de Vercel CLI
npm i -g vercel

# Connexion à Vercel
vercel login

# Configuration du projet
vercel

# Déploiement
vercel --prod
```

#### **Configuration GitHub Actions**

```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    vercel-args: '--prod'
```

### 2. **Backend sur Railway**

```bash
# Installation de Railway CLI
npm install -g @railway/cli

# Connexion à Railway
railway login

# Initialisation du projet
railway init

# Déploiement
railway up
```

#### **Configuration GitHub Actions**

```yaml
- name: Deploy to Railway
  uses: railwayapp/railway-deploy@v1
  with:
    railway-token: ${{ secrets.RAILWAY_TOKEN }}
    service: backend
```

### 3. **Base de Données**

#### **PostgreSQL sur Railway**

- Service PostgreSQL automatique
- Sauvegarde quotidienne
- Scaling automatique

#### **Redis sur Railway**

- Cache haute performance
- Persistance configurée
- Monitoring intégré

## 📊 Monitoring et Observabilité

### 1. **Sentry (Error Tracking)**

```typescript
// Configuration automatique
import { initializeMonitoring } from '@/lib/monitoring';
initializeMonitoring();

// Tracking personnalisé
import { errorTracker } from '@/lib/monitoring/error-tracking';
errorTracker.captureError(error, {
  tags: { component: 'SmartEditor' },
  extra: { userId: user.id },
});
```

### 2. **Google Analytics**

```typescript
// Tracking automatique des événements
import { analyticsTracker } from '@/lib/monitoring/analytics';

analyticsTracker.trackGrammarCheck(150, 3, 'intermediate');
analyticsTracker.trackExerciseComplete('conjugation', 85, 120);
analyticsTracker.trackAICorrection('openai', 1200, 0.95);
```

### 3. **Web Vitals**

```typescript
// Monitoring automatique des performances
import { performanceMonitor } from '@/lib/monitoring/performance-monitoring';

// Métriques automatiques
// - CLS (Cumulative Layout Shift)
// - FID (First Input Delay)
// - LCP (Largest Contentful Paint)
// - FCP (First Contentful Paint)
```

## 🔒 Sécurité

### 1. **Headers de Sécurité**

```typescript
// Configuration Next.js
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline'"
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload'
        }
      ]
    }
  ];
}
```

### 2. **Rate Limiting**

```typescript
// Configuration IA Security
const securityConfig = {
  rateLimiting: {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 100,
    maxRequestsPerDay: 500,
  },
  costMonitoring: {
    dailyBudget: 10, // $10/jour
    monthlyBudget: 200, // $200/mois
  },
};
```

### 3. **Validation des Données**

```typescript
// Validation côté serveur
import { z } from 'zod';

const grammarCheckSchema = z.object({
  text: z.string().max(4000),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  focus: z.array(z.string()).optional(),
});
```

## 📈 Scaling et Performance

### 1. **Optimisations Frontend**

```typescript
// Code splitting automatique
const SmartEditor = dynamic(() => import('@/components/SmartEditor'), {
  loading: () => <LoadingSpinner />
});

// Optimisation des images
<Image
  src="/images/logo.png"
  width={200}
  height={100}
  priority
  placeholder="blur"
/>
```

### 2. **Caching Stratégique**

```typescript
// Cache des corrections IA
const cacheConfig = {
  corrections: 30 * 60 * 1000, // 30 minutes
  exercises: 60 * 60 * 1000, // 1 heure
  explanations: 24 * 60 * 60 * 1000, // 24 heures
};
```

### 3. **CDN et Edge Functions**

```typescript
// Edge Functions Vercel
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'lhr1'],
};
```

## 🔄 CI/CD et Automatisation

### 1. **Pipeline GitHub Actions**

```yaml
# Workflow complet
name: Deploy FrançaisFluide
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        uses: railwayapp/railway-deploy@v1
```

### 2. **Health Checks**

```typescript
// API Health Check
export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ai: await checkAIServices(),
    },
  };

  return Response.json(health);
}
```

## 📋 Checklist de Déploiement

### ✅ **Pré-Déploiement**

- [ ] Variables d'environnement configurées
- [ ] Tests unitaires et d'intégration passent
- [ ] Build de production réussi
- [ ] Sécurité validée (OWASP)
- [ ] Performance optimisée (Lighthouse > 90)
- [ ] Monitoring configuré

### ✅ **Déploiement**

- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Railway
- [ ] Base de données migrée
- [ ] DNS configuré
- [ ] SSL/TLS activé
- [ ] Health checks opérationnels

### ✅ **Post-Déploiement**

- [ ] Tests de smoke passent
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Backup automatique activé
- [ ] Documentation mise à jour
- [ ] Équipe formée

## 🚨 Plan de Scaling

### **Phase 1: MVP (0-1K utilisateurs)**

- Vercel + Railway
- PostgreSQL + Redis
- Monitoring basique

### **Phase 2: Growth (1K-10K utilisateurs)**

- CDN global (Cloudflare)
- Database scaling (Railway Pro)
- Monitoring avancé (Sentry Pro)

### **Phase 3: Scale (10K+ utilisateurs)**

- Multi-région (Vercel Edge)
- Database clustering
- Microservices (Railway)

## 📞 Support et Maintenance

### **Monitoring 24/7**

- **Sentry**: Erreurs en temps réel
- **Vercel Analytics**: Performance
- **Railway Metrics**: Infrastructure

### **Alertes Automatiques**

- Slack notifications
- Email alerts
- SMS pour incidents critiques

### **SLA**

- **Uptime**: 99.9%
- **Response Time**: < 2s
- **Recovery Time**: < 15min

---

## 🎉 Résultat Final

**FrançaisFluide est maintenant prêt pour la production avec :**

- ✅ **Déploiement automatisé** sur Vercel + Railway
- ✅ **Monitoring complet** (Sentry, Analytics, Web Vitals)
- ✅ **Sécurité enterprise-grade**
- ✅ **Scaling automatique**
- ✅ **CI/CD robuste**
- ✅ **Documentation complète**

**L'application est prête à accueillir des milliers d'utilisateurs !** 🚀
