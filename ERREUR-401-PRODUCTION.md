# 🔴 Erreur 401 en Production

Date : 9 octobre 2025  
Erreur : HTTP 401 sur `/api/auth/login` en production

---

## 🎯 Causes Possibles

### 1. Admin n'existe pas dans la base Neon de production

**Solution** : Créer l'admin sur Render

```bash
# Se connecter à Render Shell
# Aller dans votre service backend
# Shell → Connect

# Puis exécuter :
node create-admin-auto.js
```

### 2. Identifiants incorrects

**Vérifier** :
- Email : `admin@francais-fluide.com`
- Mot de passe : `Admin123!`

### 3. JWT_SECRET différent

**Vérifier sur Render** :
1. Aller dans votre service backend
2. Environment → Variables
3. Vérifier que `JWT_SECRET` est défini

### 4. CORS mal configuré

**Vérifier dans `server.js`** :
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://francais-fluide.vercel.app', // ✅ Doit être présent
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN
].filter(Boolean);
```

---

## ✅ Solution 1 : Créer l'Admin en Production

### Option A : Via Render Shell

```bash
# 1. Aller sur https://dashboard.render.com
# 2. Sélectionner votre service backend
# 3. Shell → Connect
# 4. Exécuter :
node create-admin-auto.js

# 5. Vérifier :
# Devrait afficher "Admin créé avec succès"
```

### Option B : Via Script de Migration

Créez un fichier `setup-production.js` :

```javascript
// setup-production.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupProduction() {
  try {
    console.log('🔧 Configuration de la production...\n');

    // Créer l'admin
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@francais-fluide.com' },
      update: {},
      create: {
        name: 'Admin FrançaisFluide',
        email: 'admin@francais-fluide.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true
      }
    });

    console.log('✅ Admin créé/mis à jour:', admin.email);

    // Créer la progression
    await prisma.userProgress.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        wordsWritten: 0,
        accuracy: 0,
        timeSpent: 0,
        exercisesCompleted: 0,
        currentStreak: 0,
        level: 1,
        xp: 0
      }
    });

    console.log('✅ Progression créée');

    // Créer l'abonnement
    await prisma.subscription.upsert({
      where: { userId: admin.id },
      update: {},
      create: {
        userId: admin.id,
        plan: 'etablissement',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
      }
    });

    console.log('✅ Abonnement créé');
    console.log('\n🎉 Production configurée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProduction();
```

Puis sur Render Shell :
```bash
node setup-production.js
```

---

## ✅ Solution 2 : Vérifier les Variables d'Environnement

### Sur Render

1. Aller dans votre service backend
2. Environment → Variables
3. Vérifier que ces variables existent :

```env
DATABASE_URL=postgresql://neondb_owner:...@ep-soft-wind-ad7qthbt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=votre-secret-jwt-super-securise-ici-changez-moi
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://francais-fluide.vercel.app
ALLOWED_ORIGIN=https://francais-fluide.vercel.app
```

### Sur Vercel

1. Aller dans votre projet frontend
2. Settings → Environment Variables
3. Vérifier :

```env
NEXT_PUBLIC_API_URL=https://francais-fluide.onrender.com
```

---

## ✅ Solution 3 : Vérifier CORS

Dans `backend-francais-fluide/src/server.js` :

```javascript
// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://francais-fluide.vercel.app', // ✅ Production frontend
  process.env.FRONTEND_URL,
  process.env.ALLOWED_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origine
    if (!origin) return callback(null, true);

    // Autoriser les origins configurés
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Autoriser les domaines Vercel
    try {
      const url = new URL(origin);
      if (url.hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch (_) {}

    console.warn(`[CORS BLOCKED] Origin: ${origin}`);
    return callback(new Error('Non autorisé par CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
}));
```

---

## ✅ Solution 4 : Tester l'API Directement

### Test avec curl

```bash
# Tester la connexion
curl -X POST https://francais-fluide.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@francais-fluide.com","password":"Admin123!"}'
```

**Résultat attendu** :
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@francais-fluide.com",
    "role": "super_admin"
  }
}
```

**Si erreur 401** :
```json
{
  "success": false,
  "error": "Email ou mot de passe incorrect"
}
```
→ L'admin n'existe pas ou le mot de passe est incorrect

---

## 🔍 Diagnostic Complet

### Étape 1 : Vérifier les Logs Render

1. Aller sur https://dashboard.render.com
2. Sélectionner votre service backend
3. Logs
4. Chercher les erreurs lors du login

**Logs attendus** :
```
info: Requête entrante {"method":"POST","url":"/api/auth/login"}
info: Réponse envoyée {"statusCode":200}
```

**Si erreur** :
```
Erreur de connexion: User not found
```
→ L'admin n'existe pas

### Étape 2 : Vérifier la Base Neon

1. Aller sur https://neon.tech
2. Ouvrir votre projet
3. SQL Editor
4. Exécuter :

```sql
SELECT * FROM users WHERE email = 'admin@francais-fluide.com';
```

**Si vide** → L'admin n'existe pas  
**Si présent** → Vérifier le mot de passe

### Étape 3 : Vérifier le Frontend

Dans la console du navigateur (F12) :

```javascript
// Vérifier l'URL de l'API
console.log(process.env.NEXT_PUBLIC_API_URL);
// Devrait afficher : https://francais-fluide.onrender.com
```

---

## 🎯 Solution Rapide (Recommandée)

### 1. Créer l'Admin sur Render

```bash
# Render Shell
node create-admin-auto.js
```

### 2. Vérifier les Variables d'Environnement

**Render** :
- `DATABASE_URL` ✅
- `JWT_SECRET` ✅
- `FRONTEND_URL=https://francais-fluide.vercel.app` ✅

**Vercel** :
- `NEXT_PUBLIC_API_URL=https://francais-fluide.onrender.com` ✅

### 3. Redéployer

**Render** : Redéploiement automatique  
**Vercel** : Redéploiement automatique

### 4. Tester

Aller sur https://francais-fluide.vercel.app et se connecter :
```
Email : admin@francais-fluide.com
Mot de passe : Admin123!
```

---

## 📋 Checklist de Vérification

- [ ] Admin existe dans la base Neon de production
- [ ] JWT_SECRET défini sur Render
- [ ] FRONTEND_URL défini sur Render
- [ ] NEXT_PUBLIC_API_URL défini sur Vercel
- [ ] CORS configuré pour Vercel
- [ ] Logs Render sans erreur
- [ ] Test curl réussi
- [ ] Connexion frontend réussie

---

**La cause la plus probable : L'admin n'existe pas dans la base Neon de production. Créez-le via Render Shell !** 🚀
