# 🚀 Checklist de Déploiement - Français Fluide

## ✅ PRÉ-DÉPLOIEMENT

### Backend (Render)

- [ ] **Base de données configurée**
  - [ ] PostgreSQL créé sur Neon/Supabase/Railway
  - [ ] URL de connexion obtenue
  - [ ] Migrations appliquées (`npx prisma migrate deploy`)

- [ ] **Variables d'environnement**
  ```bash
  DATABASE_URL=postgresql://...
  JWT_SECRET=<généré avec crypto.randomBytes(64)>
  STRIPE_SECRET_KEY=sk_test_... (ou sk_live_...)
  STRIPE_WEBHOOK_SECRET=whsec_...
  OPENAI_API_KEY=sk-... (optionnel)
  ANTHROPIC_API_KEY=sk-ant-... (optionnel)
  FRONTEND_URL=https://votre-domaine.vercel.app
  NODE_ENV=production
  PORT=3001
  ```

- [ ] **Compte Stripe configuré**
  - [ ] Produits créés (Demo, Étudiant, Premium, Établissement)
  - [ ] Prix configurés en CAD
  - [ ] Webhook endpoint ajouté
  - [ ] Clés API obtenues

- [ ] **Tests backend**
  ```bash
  cd backend-francais-fluide
  npm test
  npm run test:auth
  npm run test:db
  ```

### Frontend (Vercel)

- [ ] **Repository GitHub**
  - [ ] Code poussé sur main/master
  - [ ] `.env.local` dans .gitignore
  - [ ] README à jour

- [ ] **Variables d'environnement**
  ```bash
  NEXT_PUBLIC_API_URL=https://votre-backend.render.com
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_...)
  NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
  ```

- [ ] **Build local réussi**
  ```bash
  cd frontend-francais-fluide
  rm -rf .next
  npm run build
  npm start  # Vérifier que ça démarre
  ```

- [ ] **Tests frontend**
  ```bash
  npm test
  npm run cypress:run  # Tests E2E
  ```

## 🔧 DÉPLOIEMENT

### Backend sur Render

1. [ ] Créer un compte sur [render.com](https://render.com)
2. [ ] Nouveau Web Service
   - [ ] Connecter repository GitHub
   - [ ] Branche: `main`
   - [ ] Root Directory: `backend-francais-fluide`
   - [ ] Build Command: `npm install && npx prisma generate`
   - [ ] Start Command: `npm start`
   - [ ] Plan: Starter ($7/mois minimum)
3. [ ] Ajouter les variables d'environnement
4. [ ] Déployer
5. [ ] Vérifier les logs
6. [ ] Tester l'API: `https://votre-backend.render.com/api/health`

### Frontend sur Vercel

1. [ ] Créer un compte sur [vercel.com](https://vercel.com)
2. [ ] Importer le projet
   - [ ] Connecter repository GitHub
   - [ ] Root Directory: `frontend-francais-fluide`
   - [ ] Framework Preset: Next.js
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `.next`
3. [ ] Ajouter les variables d'environnement
4. [ ] Déployer
5. [ ] Vérifier le déploiement
6. [ ] Tester le site

### Base de données

#### Option 1: Neon (Recommandé)
1. [ ] Créer un compte sur [neon.tech](https://neon.tech)
2. [ ] Créer un nouveau projet
3. [ ] Copier la connection string
4. [ ] Ajouter à DATABASE_URL sur Render

#### Option 2: Supabase
1. [ ] Créer un compte sur [supabase.com](https://supabase.com)
2. [ ] Créer un nouveau projet
3. [ ] Obtenir la connection string (PostgreSQL, pas Supabase URL)
4. [ ] Ajouter à DATABASE_URL sur Render

#### Option 3: Railway
1. [ ] Créer un compte sur [railway.app](https://railway.app)
2. [ ] Ajouter PostgreSQL
3. [ ] Copier DATABASE_URL
4. [ ] Ajouter à Render

## ✅ POST-DÉPLOIEMENT

### Tests de Production

- [ ] **Frontend accessible**
  - [ ] Page d'accueil charge
  - [ ] Inscription fonctionne
  - [ ] Connexion fonctionne
  - [ ] Navigation fluide

- [ ] **Backend accessible**
  - [ ] API répond
  - [ ] Authentification fonctionne
  - [ ] Requêtes protégées nécessitent token

- [ ] **Intégration**
  - [ ] Frontend communique avec backend
  - [ ] Données sauvegardées en DB
  - [ ] Stripe fonctionne (mode test)

### Monitoring

- [ ] **Sentry configuré** (détection d'erreurs)
  ```bash
  # Déjà installé dans le frontend
  # Ajouter SENTRY_DSN dans variables d'environnement
  ```

- [ ] **Uptime monitoring** (optionnel)
  - [ ] [UptimeRobot](https://uptimerobot.com) (gratuit)
  - [ ] [Better Uptime](https://betteruptime.com)

- [ ] **Analytics** (optionnel)
  - [ ] Vercel Analytics
  - [ ] Google Analytics
  - [ ] Plausible (privacy-friendly)

### Sécurité

- [ ] **HTTPS activé** (automatique sur Vercel/Render)
- [ ] **CORS configuré** avec domaines de production
- [ ] **Rate limiting actif**
- [ ] **Secrets sécurisés** (jamais dans le code)
- [ ] **Certificats SSL valides**

### Performance

- [ ] **Lighthouse score > 90**
  - [ ] Performance
  - [ ] Accessibility
  - [ ] Best Practices
  - [ ] SEO

- [ ] **Temps de chargement < 3s**
- [ ] **First Contentful Paint < 1.5s**
- [ ] **Largest Contentful Paint < 2.5s**

### Documentation

- [ ] **README à jour**
  - [ ] Instructions de développement
  - [ ] Variables d'environnement
  - [ ] Liens vers les services

- [ ] **Guide utilisateur** (optionnel)
- [ ] **API documentation** (optionnel)

## 🔄 MAINTENANCE

### Hebdomadaire

- [ ] Vérifier les logs d'erreur
- [ ] Surveiller l'uptime
- [ ] Vérifier les métriques de performance

### Mensuel

- [ ] Mettre à jour les dépendances
  ```bash
  npm outdated
  npm update
  npm audit fix
  ```
- [ ] Vérifier la sécurité
  ```bash
  npm audit
  ```
- [ ] Sauvegarder la base de données
- [ ] Analyser les coûts

### Avant chaque déploiement

- [ ] Tests passent
- [ ] Build réussi
- [ ] Pas de secrets exposés
- [ ] Migrations DB testées
- [ ] Changelog mis à jour

## 🆘 EN CAS DE PROBLÈME

### Backend ne démarre pas

1. Vérifier les logs Render
2. Vérifier DATABASE_URL
3. Vérifier JWT_SECRET
4. Tester connexion DB localement
5. Vérifier les migrations Prisma

### Frontend ne charge pas

1. Vérifier les logs Vercel
2. Vérifier NEXT_PUBLIC_API_URL
3. Vérifier la communication avec le backend
4. Tester le build localement
5. Vérifier les variables d'environnement

### Erreur 500

1. Consulter les logs
2. Vérifier Sentry
3. Vérifier la connexion DB
4. Vérifier les quotas des services

### Stripe ne fonctionne pas

1. Vérifier les clés API (test vs live)
2. Vérifier le webhook endpoint
3. Consulter les logs Stripe
4. Vérifier les produits configurés

## 📞 CONTACTS SUPPORT

- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/support
- **Neon**: https://neon.tech/docs
- **Stripe**: https://support.stripe.com

## 🎉 TERMINÉ !

Une fois tout coché, votre application est déployée et prête pour la production !

N'oubliez pas:
- 🔒 Sécurité d'abord
- 📊 Monitorer régulièrement
- 🚀 Améliorer continuellement
- 🐛 Corriger rapidement les bugs
- 💾 Sauvegarder régulièrement

---

**Bonne chance! 🚀**


