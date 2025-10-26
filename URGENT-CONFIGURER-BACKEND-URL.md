# 🚨 URGENT : Configurer l'URL du Backend

## ❌ Problème Actuel

```
Erreur: Failed to fetch
Source: https://votre-backend.onrender.com/api/auth/login
```

**Le frontend essaie de se connecter à `https://votre-backend.onrender.com`** qui est une **URL d'exemple** et n'existe pas !

## ✅ Solution Immédiate (5 minutes)

### Étape 1 : Trouver l'URL de Votre Backend

**Où est déployé votre backend ?**

#### Option A : Render
- Allez sur [render.com/dashboard](https://render.com/dashboard)
- Trouvez votre service backend
- Copiez l'URL (ex: `https://francais-fluide-backend.onrender.com`)

#### Option B : Railway
- Allez sur [railway.app](https://railway.app)
- Trouvez votre projet backend
- Copiez l'URL (ex: `https://francais-fluide-backend.up.railway.app`)

#### Option C : Heroku
- Allez sur [heroku.com/apps](https://heroku.com/apps)
- Trouvez votre app backend
- Copiez l'URL (ex: `https://francais-fluide-backend.herokuapp.com`)

#### Option D : Backend Local (Pour Tests)
- Si vous testez en local : `http://localhost:3001`

### Étape 2 : Configurer sur Vercel Dashboard

**IMPORTANT : Ne modifiez PAS `vercel.json` !**  
Les variables d'environnement doivent être configurées sur le Dashboard Vercel.

1. **Allez sur** [vercel.com/dashboard](https://vercel.com/dashboard)

2. **Sélectionnez votre projet** `francais-fluide`

3. **Settings** (en haut)

4. **Environment Variables** (menu gauche)

5. **Ajoutez ou Modifiez** :

   **Variable 1** :
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://VOTRE-BACKEND-REEL.onrender.com
   ```
   
   **Variable 2** (alternative) :
   ```
   Name: NEXT_PUBLIC_BACKEND_URL
   Value: https://VOTRE-BACKEND-REEL.onrender.com
   ```

6. **Cochez les 3 environnements** :
   - ✅ Production
   - ✅ Preview
   - ✅ Development

7. **Cliquez sur "Save"**

### Étape 3 : Redéployer

**Après avoir ajouté les variables, vous DEVEZ redéployer** :

1. **Allez dans "Deployments"**

2. **Cliquez sur les 3 points** (⋮) du dernier déploiement

3. **Sélectionnez "Redeploy"**

4. **Attendez 2-3 minutes**

### Étape 4 : Vérifier

1. **Ouvrez la console du navigateur** (F12)

2. **Tapez** :
   ```javascript
   console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL);
   ```

3. **Vérifiez** que l'URL affichée est la bonne (pas `votre-backend.onrender.com`)

## 🔍 Exemple Complet

### Si Votre Backend est sur Render

**URL Backend** : `https://francais-fluide-api.onrender.com`

**Sur Vercel Dashboard** :
```
NEXT_PUBLIC_API_URL = https://francais-fluide-api.onrender.com
NEXT_PUBLIC_BACKEND_URL = https://francais-fluide-api.onrender.com
```

### Si Votre Backend est Local (Tests)

**URL Backend** : `http://localhost:3001`

**Sur Vercel Dashboard** :
```
NEXT_PUBLIC_API_URL = http://localhost:3001
```

⚠️ **Note** : Pour le local, vous devez aussi configurer CORS sur le backend pour accepter les requêtes depuis Vercel.

## 🔧 Configuration CORS Backend

Une fois l'URL configurée, assurez-vous que votre backend accepte les requêtes depuis Vercel.

**Fichier Backend** : `src/index.js` ou `server.js`

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://francais-fluide.vercel.app',
    'https://*.vercel.app', // Tous les domaines Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## 📋 Checklist

### Configuration
- [ ] URL backend trouvée (Render/Railway/Heroku)
- [ ] Variable `NEXT_PUBLIC_API_URL` ajoutée sur Vercel
- [ ] Variable activée pour Production
- [ ] Redéploiement lancé
- [ ] Attendre 2-3 minutes

### Vérification
- [ ] Console : `process.env.NEXT_PUBLIC_API_URL` affiche la bonne URL
- [ ] Pas d'erreur "Failed to fetch"
- [ ] Connexion fonctionne

### Backend
- [ ] CORS configuré pour accepter Vercel
- [ ] Backend accessible depuis le navigateur
- [ ] Backend retourne des réponses JSON

## 🆘 Si Vous N'Avez Pas de Backend Déployé

### Option 1 : Déployer sur Render (Gratuit)

1. **Allez sur** [render.com](https://render.com)
2. **Créez un compte** (gratuit)
3. **New** → **Web Service**
4. **Connectez votre repo GitHub** `francais-fluide`
5. **Configurez** :
   - Name: `francais-fluide-backend`
   - Root Directory: `backend-francais-fluide`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. **Ajoutez les variables d'environnement** (DATABASE_URL, JWT_SECRET, etc.)
7. **Créez le service**
8. **Copiez l'URL** générée (ex: `https://francais-fluide-backend.onrender.com`)
9. **Utilisez cette URL** dans Vercel

### Option 2 : Utiliser le Backend Local

Si vous voulez juste tester :

1. **Démarrez le backend localement** :
   ```bash
   cd backend-francais-fluide
   npm run dev
   ```

2. **Configurez sur Vercel** :
   ```
   NEXT_PUBLIC_API_URL = http://localhost:3001
   ```

3. **Configurez CORS** pour accepter Vercel

⚠️ **Limitation** : Le backend local ne sera accessible que depuis votre machine.

## 🎯 Actions Immédiates

### 1️⃣ Trouvez l'URL de Votre Backend (2 min)
- Render Dashboard / Railway / Heroku
- Copiez l'URL complète

### 2️⃣ Configurez sur Vercel (2 min)
- Settings → Environment Variables
- Ajoutez `NEXT_PUBLIC_API_URL`
- Save

### 3️⃣ Redéployez (3 min)
- Deployments → Redeploy
- Attendez le build

### 4️⃣ Testez (1 min)
- Ouvrez votre site Vercel
- Essayez de vous connecter
- Vérifiez qu'il n'y a plus d'erreur "Failed to fetch"

---

## 📝 Résumé

**Le problème** : Frontend essaie de se connecter à une URL d'exemple qui n'existe pas

**La solution** : Configurer la vraie URL backend dans les variables d'environnement Vercel

**Temps estimé** : 5-10 minutes

**Après cette configuration, votre application fonctionnera complètement !** 🎉

---

**Date** : 10 octobre 2025  
**Priorité** : 🚨 URGENT  
**Statut** : ⏳ Action requise
