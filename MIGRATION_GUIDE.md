# 🚀 Guide de Migration - Séparation Frontend/Backend

Ce guide vous accompagne dans la migration de votre projet FrançaisFluide vers une architecture séparée.

## 📋 Vue d'Ensemble

### Architecture Avant
```
frontend-francais-fluide/
├── src/app/api/          # Routes API Next.js
├── backend-api/          # Backend Express partiel
└── ...                   # Frontend Next.js
```

### Architecture Après
```
francais-fluide/
├── frontend-francais-fluide/    # Frontend Next.js pur
└── backend-francais-fluide/     # Backend Express complet
```

## 🎯 Étapes de Migration

### 1. ✅ Backend Créé
- [x] Structure complète du backend Express.js
- [x] Routes API : auth, grammar, progress, ai, subscription, exercises
- [x] Services : grammarService, aiService, subscriptionService
- [x] Middlewares : auth, errorHandler, requestLogger
- [x] Schéma Prisma complet
- [x] Configuration Docker et déploiement

### 2. 🔄 Frontend en Cours
- [x] Client API pour communiquer avec le backend
- [x] Hooks personnalisés (useApi, useAuth, etc.)
- [ ] Migration des composants existants
- [ ] Suppression des routes API Next.js

### 3. ⏳ Configuration
- [ ] Variables d'environnement
- [ ] Base de données
- [ ] Tests de communication

## 🛠️ Instructions de Migration

### Étape 1 : Configuration du Backend

1. **Naviguer vers le backend**
```bash
cd backend-francais-fluide
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Configurer la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Créer les données de base
npm run migrate
```

5. **Démarrer le backend**
```bash
npm run dev
```

Le backend sera accessible sur `http://localhost:3001`

### Étape 2 : Configuration du Frontend

1. **Naviguer vers le frontend**
```bash
cd frontend-francais-fluide
```

2. **Configurer l'environnement**
```bash
cp .env.local.example .env.local
# Éditer .env.local avec l'URL du backend
```

3. **Installer les nouvelles dépendances** (si nécessaire)
```bash
npm install
```

4. **Démarrer le frontend**
```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### Étape 3 : Tests de Communication

1. **Tester le backend**
```bash
curl http://localhost:3001/health
```

2. **Tester l'authentification**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

3. **Tester le frontend**
- Ouvrir `http://localhost:3000`
- Vérifier que les appels API fonctionnent
- Tester l'inscription/connexion

## 🔧 Configuration des Variables d'Environnement

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://username:password@localhost:5432/francais_fluide"
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FrançaisFluide
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

## 📊 Avantages de la Nouvelle Architecture

### Sécurité 🔒
- Clés API protégées côté serveur
- Validation centralisée
- Authentification robuste
- Rate limiting

### Performance 🚀
- Bundle frontend allégé
- Cache serveur dédié
- Optimisations backend

### Maintenabilité 🛠️
- Code séparé par responsabilités
- Déploiements indépendants
- Tests plus ciblés

### Scalabilité 📈
- Backend scalable indépendamment
- Load balancing possible
- Microservices futurs

## 🚨 Points d'Attention

### Migration des Données
- Sauvegarder la base de données existante
- Tester la migration sur un environnement de test
- Vérifier l'intégrité des données

### Compatibilité
- Vérifier que toutes les fonctionnalités existantes marchent
- Tester les flux utilisateur complets
- Valider les performances

### Déploiement
- Configurer les environnements de production
- Mettre à jour les DNS et certificats
- Configurer le monitoring

## 🧪 Tests Recommandés

### Tests Backend
```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests de charge
npm run test:load
```

### Tests Frontend
```bash
# Tests unitaires
npm test

# Tests E2E
npm run cypress:run
```

### Tests de Communication
- Tester tous les endpoints API
- Vérifier la gestion d'erreurs
- Valider les performances

## 📞 Support

En cas de problème :
1. Vérifier les logs du backend (`logs/combined.log`)
2. Vérifier la console du navigateur
3. Tester les endpoints API individuellement
4. Consulter la documentation API

## 🎉 Conclusion

Cette migration vous permettra d'avoir une architecture plus robuste, sécurisée et scalable. Le projet sera plus facile à maintenir et à faire évoluer.

**Temps estimé** : 2-3 heures pour la migration complète
**Complexité** : Moyenne (vous avez déjà une base solide)
**Bénéfices** : Énormes en termes de maintenabilité et performance
