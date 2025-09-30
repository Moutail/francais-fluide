# 🔄 Guide de Migration - Architecture Séparée

## 🎯 **Pourquoi Migrer ?**

### **Problèmes Actuels**

- ❌ **Sécurité** : Clés API exposées côté client
- ❌ **Performance** : Bundle JavaScript trop lourd
- ❌ **Scalabilité** : Architecture monolithique
- ❌ **Maintenance** : Code mélangé frontend/backend

### **Avantages de la Migration**

- ✅ **Sécurité** : Clés API protégées côté serveur
- ✅ **Performance** : Code splitting et cache
- ✅ **Scalabilité** : Architecture microservices
- ✅ **Maintenance** : Séparation des responsabilités

## 🚀 **Plan de Migration**

### **Phase 1 : Backend API (1 semaine)**

```bash
# 1. Créer le backend
cd backend-api
npm install

# 2. Configurer l'environnement
cp env.example .env
# Éditer .env avec vos vraies valeurs

# 3. Démarrer le backend
npm run dev
```

### **Phase 2 : Migration Frontend (1 semaine)**

```typescript
// Avant (API routes Next.js)
const response = await fetch('/api/auth/login', {
  body: JSON.stringify({ email, password }),
});

// Après (Backend séparé)
const response = await fetch('http://localhost:3001/api/auth/login', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### **Phase 3 : Déploiement (3 jours)**

- **Backend** : Railway ou Heroku
- **Frontend** : Vercel
- **Base de données** : Supabase ou Railway

## 📁 **Structure du Projet**

```
francais-fluide/
├── frontend-francais-fluide/     # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── backend-api/                  # Backend Express
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   └── package.json
└── prisma/                       # Schéma base de données
    └── schema.prisma
```

## 🔧 **Configuration Backend**

### **1. Installation**

```bash
cd backend-api
npm install
```

### **2. Variables d'environnement**

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://user:password@localhost:5432/francais_fluide"
JWT_SECRET="votre-secret-jwt-super-securise"
OPENAI_API_KEY="sk-..."
```

### **3. Démarrage**

```bash
npm run dev
# Serveur sur http://localhost:3001
```

## 🔄 **Migration des Appels API**

### **Authentification**

```typescript
// Avant
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

// Après
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### **Configuration Frontend**

```typescript
// src/lib/config/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      ME: '/api/auth/me',
    },
    PROGRESS: {
      GET: '/api/progress',
      UPDATE: '/api/progress',
    },
  },
};
```

## 🚀 **Déploiement**

### **Backend (Railway)**

```bash
# 1. Créer compte Railway
# 2. Connecter repository GitHub
# 3. Configurer variables d'environnement
# 4. Déployer automatiquement
```

### **Frontend (Vercel)**

```bash
# 1. Créer compte Vercel
# 2. Connecter repository GitHub
# 3. Configurer variables d'environnement
# 4. Déployer automatiquement
```

### **Base de Données (Supabase)**

```bash
# 1. Créer projet Supabase
# 2. Configurer PostgreSQL
# 3. Exécuter migrations Prisma
# 4. Connecter aux applications
```

## 📊 **Monitoring et Logs**

### **Backend**

- **Logs** : Winston ou Pino
- **Monitoring** : Sentry
- **Métriques** : Prometheus + Grafana

### **Frontend**

- **Analytics** : Google Analytics
- **Erreurs** : Sentry
- **Performance** : Web Vitals

## 💰 **Coûts Estimés**

### **Développement**

- **Temps** : 2-3 semaines
- **Effort** : Moyen à élevé
- **Complexité** : Architecture distribuée

### **Hébergement Mensuel**

- **Frontend** : Vercel (gratuit)
- **Backend** : Railway ($5-20)
- **Base de données** : Supabase (gratuit jusqu'à 500MB)
- **Total** : ~$5-20/mois

## 🎯 **Recommandation**

**Pour la production, migrer vers une architecture séparée est fortement recommandé** pour :

- 🔒 Sécurité renforcée
- 🚀 Performance optimisée
- 📊 Scalabilité améliorée
- 🛠️ Maintenance simplifiée

**Commencez par le backend API, puis migrez progressivement le frontend** 🚀
