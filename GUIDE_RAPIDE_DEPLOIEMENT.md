# 🚀 Guide Rapide de Déploiement

## ⚡ Pour Commencer MAINTENANT

### 1. Nettoyer et Tester (5 minutes)

**Windows PowerShell:**
```powershell
# Nettoyer les caches et rebuilder
.\scripts\clean-and-build.ps1 -Target all

# Ou séparément
.\scripts\clean-and-build.ps1 -Target backend
.\scripts\clean-and-build.ps1 -Target frontend
```

**Linux/Mac:**
```bash
# Rendre le script exécutable
chmod +x scripts/clean-and-build.sh

# Nettoyer et rebuilder
./scripts/clean-and-build.sh all

# Ou séparément
./scripts/clean-and-build.sh backend
./scripts/clean-and-build.sh frontend
```

### 2. Corriger les Warnings Tailwind (2 minutes)

```bash
cd frontend-francais-fluide

# Installer glob si nécessaire
npm install glob --save-dev

# Exécuter le script de correction
node ../scripts/fix-tailwind-warnings.js

# Corriger les autres warnings automatiquement
npm run lint -- --fix
```

### 3. Configurer la Base de Données (10 minutes)

**Option Recommandée: Neon (Gratuit)**

1. Aller sur https://neon.tech
2. Créer un compte
3. Créer un nouveau projet
4. Copier la connection string
5. Dans `backend-francais-fluide/.env`:
   ```bash
   DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
   ```

**Appliquer les migrations:**
```bash
cd backend-francais-fluide
npx prisma migrate deploy
npx prisma generate
```

### 4. Générer les Secrets (1 minute)

```bash
# Générer JWT_SECRET
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Copier la valeur dans backend-francais-fluide/.env
```

### 5. Configurer Stripe (15 minutes)

1. Créer un compte sur https://stripe.com
2. Mode Test (pour commencer)
3. Obtenir les clés:
   - **Clé secrète**: `sk_test_...`
   - **Clé publique**: `pk_test_...`
4. Créer les produits:
   - Démo Gratuite: 0 CAD
   - Étudiant: 14.99 CAD/mois
   - Premium: 29.99 CAD/mois
5. Ajouter dans `.env`:
   ```bash
   # Backend
   STRIPE_SECRET_KEY=sk_test_...
   
   # Frontend
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### 6. Déployer le Backend sur Render (10 minutes)

1. **Créer un compte**: https://render.com
2. **Nouveau Web Service**:
   - Blueprint: Web Service
   - Repository: Votre repo GitHub
   - Branch: `main`
   - Root Directory: `backend-francais-fluide`
   - Environment: `Node`
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
   - Plan: **Starter** ($7/mois)

3. **Variables d'environnement** (dans Render):
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=<votre secret généré>
   STRIPE_SECRET_KEY=sk_test_...
   FRONTEND_URL=https://votre-app.vercel.app
   NODE_ENV=production
   PORT=3001
   ```

4. **Déployer** → Attendre ~5 minutes

5. **Tester**: 
   ```bash
   curl https://votre-backend.onrender.com/api/health
   ```

### 7. Déployer le Frontend sur Vercel (5 minutes)

1. **Créer un compte**: https://vercel.com
2. **Import Project**:
   - Repository: Votre repo GitHub
   - Root Directory: `frontend-francais-fluide`
   - Framework: Next.js (auto-détecté)

3. **Variables d'environnement**:
   ```
   NEXT_PUBLIC_API_URL=https://votre-backend.onrender.com
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Deploy** → Attendre ~2 minutes

5. **Tester**: Ouvrir l'URL Vercel dans le navigateur

---

## ✅ Vérification Finale

### Tests Backend
```bash
curl https://votre-backend.onrender.com/api/health
# Devrait retourner: {"status":"ok"}
```

### Tests Frontend
```bash
# Ouvrir dans le navigateur:
https://votre-app.vercel.app

# Tester:
✓ Page d'accueil charge
✓ Inscription fonctionne
✓ Connexion fonctionne
✓ Tableau de bord accessible
```

### Tests Intégration
1. S'inscrire sur le frontend
2. Se connecter
3. Vérifier que les données apparaissent dans la base Neon

---

## 🔧 Commandes Utiles

### Développement Local

**Backend:**
```bash
cd backend-francais-fluide
npm run dev          # Démarrer en dev
npm run db:studio    # Ouvrir Prisma Studio
npm run logs         # Voir les logs
```

**Frontend:**
```bash
cd frontend-francais-fluide
npm run dev          # Démarrer en dev
npm run build        # Builder pour production
npm run start        # Démarrer après build
```

### Base de Données

```bash
# Créer une migration
npx prisma migrate dev --name ma_migration

# Appliquer les migrations
npx prisma migrate deploy

# Reset la DB (ATTENTION: efface tout)
npx prisma migrate reset

# Seeder la DB
npm run db:seed
```

### Tests

```bash
# Backend
cd backend-francais-fluide
npm test                    # Tous les tests
npm run test:auth          # Tests auth
npm run test:db            # Tests DB

# Frontend
cd frontend-francais-fluide
npm test                   # Tests unitaires
npm run test:coverage      # Avec couverture
npm run cypress:open       # Tests E2E (interface)
npm run cypress:run        # Tests E2E (CLI)
```

### Maintenance

```bash
# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour (avec précaution)
npm update

# Vérifier la sécurité
npm audit
npm audit fix

# Nettoyer complètement
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Problèmes Courants

### "prisma: command not found"
```bash
npm install prisma --save-dev
npx prisma generate
```

### "Port 3001 already in use"
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### "Module not found"
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### "Database connection failed"
```bash
# Vérifier la connection string
echo $DATABASE_URL

# Tester la connexion
npx prisma db pull
```

### Build Frontend échoue
```bash
# Nettoyer le cache
rm -rf .next
rm -rf node_modules/.cache

# Rebuilder
npm run build
```

---

## 📊 Monitoring

### Logs Backend (Render)
1. Dashboard Render
2. Sélectionner votre service
3. Onglet "Logs"

### Logs Frontend (Vercel)
1. Dashboard Vercel
2. Sélectionner votre projet
3. Onglet "Logs"

### Base de Données (Neon)
1. Dashboard Neon
2. Onglet "Monitoring"
3. Voir les métriques

### Erreurs (Sentry)
Si configuré:
1. Dashboard Sentry
2. Voir les erreurs en temps réel

---

## 💰 Coûts Estimés

**Gratuit (pour commencer):**
- ✅ Vercel Hobby: Gratuit
- ✅ Neon: Gratuit (3GB)
- ✅ Stripe: Gratuit (frais par transaction)
- ✅ GitHub: Gratuit

**Payant (minimum):**
- 💵 Render Starter: $7/mois

**Total minimum: $7/mois**

**Recommandé (production):**
- Render Pro: $25/mois
- Neon Pro: $19/mois
- Vercel Pro: $20/mois
- **Total: ~$65/mois**

---

## 📞 Support

### Documentation
- **Projet**: Voir `RAPPORT_ANALYSE_COMPLET.md`
- **Déploiement**: Voir `scripts/deploy-checklist.md`

### Services
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs
- **Stripe**: https://stripe.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs

---

## 🎉 C'est Tout!

Votre application devrait maintenant être déployée et fonctionnelle !

**Prochaines étapes:**
1. ✅ Tester toutes les fonctionnalités
2. 📊 Configurer le monitoring
3. 🔒 Vérifier la sécurité
4. 🚀 Promouvoir votre app!

**N'oubliez pas:**
- Passer en mode **live** Stripe quand vous êtes prêt
- Configurer un **domaine custom**
- Activer le **monitoring d'uptime**
- Faire des **backups réguliers**

---

*Guide créé le 1er octobre 2025*
*Pour Français Fluide - Plateforme d'apprentissage du français*


