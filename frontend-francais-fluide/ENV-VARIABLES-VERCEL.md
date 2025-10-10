# Variables d'Environnement pour Vercel

## 📋 Variables à Configurer sur Vercel Dashboard

Allez dans **Settings** → **Environment Variables** et ajoutez :

### 1. URL de l'Application
```
NEXT_PUBLIC_APP_URL=https://francais-fluide.vercel.app
```
- Environnements : ✅ Production, ✅ Preview, ✅ Development

### 2. URL du Backend (Option 1)
```
NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
```
- Environnements : ✅ Production, ✅ Preview, ✅ Development
- **Remplacez** `votre-backend.onrender.com` par l'URL réelle de votre backend

### 3. URL du Backend (Option 2 - Alternative)
```
NEXT_PUBLIC_BACKEND_URL=https://votre-backend.onrender.com
```
- Environnements : ✅ Production, ✅ Preview, ✅ Development
- Utilisez cette variable si votre code utilise `NEXT_PUBLIC_BACKEND_URL`

## 🔧 Comment Ajouter les Variables

### Étape 1 : Accéder aux Paramètres
1. Connectez-vous sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet `francais-fluide`
3. Cliquez sur **Settings** (en haut)
4. Cliquez sur **Environment Variables** (menu gauche)

### Étape 2 : Ajouter Chaque Variable
1. Cliquez sur **Add New**
2. **Name** : `NEXT_PUBLIC_APP_URL`
3. **Value** : `https://francais-fluide.vercel.app`
4. **Environments** : Cochez les 3 cases
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Cliquez sur **Save**

### Étape 3 : Répéter pour Toutes les Variables
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_BACKEND_URL` (si nécessaire)

### Étape 4 : Redéployer
1. Allez dans **Deployments**
2. Cliquez sur les **3 points** du dernier déploiement
3. Cliquez sur **Redeploy**
4. Attendez que le build se termine

## ⚠️ Important

### Variables Publiques vs Privées

**Variables `NEXT_PUBLIC_*`** :
- ✅ Accessibles côté client (navigateur)
- ✅ Incluses dans le bundle JavaScript
- ⚠️ **Visibles par tous** - Ne jamais mettre de secrets

**Variables sans `NEXT_PUBLIC_`** :
- ✅ Accessibles uniquement côté serveur
- ✅ Sécurisées
- ✅ Utilisez-les pour les clés API secrètes

### Exemple de Variables Secrètes (Backend)

Si vous avez des variables secrètes, ajoutez-les **sans** le préfixe `NEXT_PUBLIC_` :

```
DATABASE_URL=postgresql://...
JWT_SECRET=votre-secret-jwt
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_live_...
```

## 🧪 Vérifier les Variables

### Dans la Console du Navigateur (F12)
```javascript
// Vérifier que les variables sont chargées
console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
```

### Dans les Logs Vercel
1. Allez dans **Deployments**
2. Cliquez sur le dernier déploiement
3. Onglet **Build Logs**
4. Cherchez les messages liés aux variables d'environnement

## 📝 Checklist

- [ ] `NEXT_PUBLIC_APP_URL` ajoutée
- [ ] `NEXT_PUBLIC_API_URL` ajoutée avec la bonne URL backend
- [ ] Variables activées pour les 3 environnements
- [ ] Redéploiement lancé
- [ ] Build réussi
- [ ] Variables vérifiées dans la console du navigateur

## 🔗 URL Backend Possibles

Selon où vous avez déployé votre backend :

### Render
```
https://francais-fluide-backend.onrender.com
```

### Railway
```
https://francais-fluide-backend.up.railway.app
```

### Heroku
```
https://francais-fluide-backend.herokuapp.com
```

### Backend Local (Pour Tests)
```
http://localhost:3001
```

---

**Important** : Après avoir ajouté ou modifié des variables d'environnement, vous **devez redéployer** pour que les changements prennent effet !
