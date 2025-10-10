# 🚀 Guide de Déploiement sur Vercel

## 📋 Problème : Vercel ne Charge Pas Correctement le Frontend

### Causes Possibles
1. ❌ Variables d'environnement manquantes
2. ❌ CORS non configuré
3. ❌ Backend URL incorrecte
4. ❌ Build qui échoue
5. ❌ Restrictions d'accès

## ✅ Solution Complète

### 1. Configuration `vercel.json`

Un fichier `vercel.json` a été créé avec :
- ✅ **Accès public** : `"public": true`
- ✅ **Headers CORS** : Autorise tous les domaines (`*`)
- ✅ **Rewrites API** : Redirige `/api/*` vers le backend
- ✅ **Variables d'environnement** pré-configurées

### 2. Variables d'Environnement sur Vercel

#### A. Aller dans les Paramètres du Projet
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet `francais-fluide`
3. Allez dans **Settings** → **Environment Variables**

#### B. Ajouter les Variables Suivantes

**Variables Requises** :

```bash
# URL de votre application (sera générée par Vercel)
NEXT_PUBLIC_APP_URL=https://francais-fluide.vercel.app

# URL de votre backend (Render, Railway, etc.)
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com

# Alternative (si vous utilisez NEXT_PUBLIC_BACKEND_URL)
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.onrender.com
```

**Important** : Cochez les 3 environnements :
- ✅ Production
- ✅ Preview
- ✅ Development

### 3. Modifier `vercel.json` avec Votre Backend

**Remplacez** `https://votre-backend.onrender.com` par l'URL réelle de votre backend :

```json
{
  "env": {
    "NEXT_PUBLIC_API_URL": "https://VOTRE-BACKEND-REEL.onrender.com"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://VOTRE-BACKEND-REEL.onrender.com/api/:path*"
    }
  ]
}
```

### 4. Configuration CORS sur le Backend

Le backend doit autoriser les requêtes depuis Vercel.

**Fichier** : `backend-francais-fluide/src/index.js` ou `server.js`

```javascript
const cors = require('cors');

// Configuration CORS
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

### 5. Redéployer sur Vercel

#### Option A : Via Git (Recommandé)
```bash
# Ajouter les fichiers
git add vercel.json
git commit -m "feat: Configuration Vercel avec CORS et accès public"
git push origin main

# Vercel redéploiera automatiquement
```

#### Option B : Via CLI Vercel
```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

#### Option C : Via Dashboard Vercel
1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Cliquez sur **Deployments**
4. Cliquez sur **Redeploy** sur le dernier déploiement

## 🔧 Résolution des Problèmes Courants

### Problème 1 : Page Blanche ou Erreur 404

**Cause** : Build échoué ou routes mal configurées

**Solution** :
1. Vérifiez les logs de build sur Vercel
2. Assurez-vous que `npm run build` fonctionne localement
3. Vérifiez que `package.json` a les bonnes commandes :
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```

### Problème 2 : Erreur CORS

**Symptômes** :
```
Access to fetch at 'https://backend.com/api/...' from origin 'https://francais-fluide.vercel.app' 
has been blocked by CORS policy
```

**Solution** :
1. Ajoutez les headers CORS dans `vercel.json` (déjà fait ✅)
2. Configurez CORS sur le backend (voir section 4)
3. Redéployez le backend

### Problème 3 : Variables d'Environnement Non Définies

**Symptômes** :
```
NEXT_PUBLIC_API_URL non configuré
```

**Solution** :
1. Allez dans **Settings** → **Environment Variables** sur Vercel
2. Ajoutez toutes les variables requises
3. Redéployez le projet

### Problème 4 : Backend Non Accessible

**Symptômes** :
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

**Solution** :
1. Vérifiez que le backend est en ligne (visitez l'URL dans le navigateur)
2. Vérifiez que l'URL dans `NEXT_PUBLIC_API_URL` est correcte
3. Vérifiez que le backend accepte les requêtes HTTPS

### Problème 5 : Authentification Ne Fonctionne Pas

**Cause** : Cookies ou localStorage non partagés entre domaines

**Solution** :
1. Utilisez des tokens JWT dans les headers (déjà implémenté ✅)
2. Configurez `credentials: true` dans CORS
3. Assurez-vous que le backend renvoie les bons headers :
   ```javascript
   res.header('Access-Control-Allow-Credentials', 'true');
   res.header('Access-Control-Allow-Origin', req.headers.origin);
   ```

## 📊 Vérification du Déploiement

### 1. Vérifier le Build
```bash
# Localement, testez le build de production
npm run build
npm run start

# Visitez http://localhost:3000
```

### 2. Vérifier les Variables d'Environnement
Sur Vercel Dashboard :
- Settings → Environment Variables
- Vérifiez que toutes les variables sont présentes
- Vérifiez qu'elles sont activées pour Production

### 3. Vérifier les Logs
Sur Vercel Dashboard :
- Deployments → Cliquez sur le dernier déploiement
- Onglet **Build Logs** : Vérifiez qu'il n'y a pas d'erreurs
- Onglet **Function Logs** : Vérifiez les erreurs runtime

### 4. Tester l'Application
```bash
# Ouvrez votre application Vercel
https://francais-fluide.vercel.app

# Testez :
1. Page d'accueil charge ✅
2. Connexion fonctionne ✅
3. API répond ✅
4. Pas d'erreurs CORS ✅
```

## 🔐 Sécurité en Production

### 1. Restreindre CORS (Après Tests)

Une fois que tout fonctionne, remplacez `"*"` par vos domaines spécifiques :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://francais-fluide.vercel.app"
        }
      ]
    }
  ]
}
```

### 2. Variables d'Environnement Sensibles

**NE JAMAIS** mettre dans `vercel.json` :
- ❌ Clés API secrètes
- ❌ Tokens d'authentification
- ❌ Mots de passe de base de données

**Toujours** les mettre dans **Environment Variables** sur le dashboard Vercel.

### 3. Activer HTTPS Uniquement

Vercel active HTTPS par défaut, mais assurez-vous que :
- Le backend utilise HTTPS (Render le fait automatiquement)
- Pas de requêtes HTTP mixtes

## 📝 Checklist de Déploiement

### Avant le Déploiement
- [ ] `npm run build` fonctionne localement
- [ ] Toutes les variables d'environnement sont notées
- [ ] Le backend est déployé et accessible
- [ ] CORS est configuré sur le backend

### Configuration Vercel
- [ ] `vercel.json` créé avec la bonne URL backend
- [ ] Variables d'environnement ajoutées sur Vercel
- [ ] Variables activées pour Production, Preview, Development

### Après le Déploiement
- [ ] Build réussi (vérifier les logs)
- [ ] Page d'accueil charge
- [ ] Connexion fonctionne
- [ ] API répond correctement
- [ ] Pas d'erreurs CORS dans la console

## 🆘 Support

### Logs Utiles

**Console du Navigateur (F12)** :
```javascript
// Vérifier l'URL de l'API
console.log(process.env.NEXT_PUBLIC_API_URL);

// Tester une requête
fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
}).then(r => r.json()).then(console.log);
```

**Logs Vercel** :
- Dashboard → Deployments → Cliquez sur le déploiement
- Onglet **Build Logs** pour les erreurs de build
- Onglet **Function Logs** pour les erreurs runtime

### Commandes Utiles

```bash
# Vérifier la configuration locale
npm run build

# Tester en mode production localement
npm run start

# Déployer sur Vercel
vercel --prod

# Voir les logs en temps réel
vercel logs
```

## 🎯 Résumé

### Fichiers Créés/Modifiés
1. ✅ `vercel.json` - Configuration Vercel avec CORS
2. ✅ Variables d'environnement à ajouter sur Vercel Dashboard

### Actions Requises
1. **Modifier `vercel.json`** : Remplacer l'URL du backend
2. **Ajouter les variables d'environnement** sur Vercel Dashboard
3. **Configurer CORS** sur le backend
4. **Redéployer** via Git push ou Vercel CLI

### Résultat Attendu
- ✅ Application accessible publiquement
- ✅ Pas d'erreurs CORS
- ✅ Authentification fonctionne
- ✅ API répond correctement

---

**Date de création** : 10 octobre 2025  
**Statut** : ✅ Configuration prête pour déploiement  
**Prochaine étape** : Modifier `vercel.json` avec votre URL backend réelle
