# 🇨🇦 FrançaisFluide Backend API

Backend API séparé pour l'application FrançaisFluide - Service d'apprentissage du français.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 13+
- npm ou yarn

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd backend-francais-fluide
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# (Optionnel) Peupler la base de données
npm run db:seed
```

5. **Démarrer le serveur**
```bash
# Développement
npm run dev

# Production
npm start
```

## 📚 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/refresh` - Rafraîchir le token

#### Grammaire
- `POST /api/grammar/analyze` - Analyser un texte
- `GET /api/grammar/info` - Informations sur l'API
- `DELETE /api/grammar/cache` - Vider le cache

#### Progression
- `GET /api/progress` - Récupérer la progression
- `PUT /api/progress` - Mettre à jour la progression
- `POST /api/progress/achievement` - Ajouter un achievement

#### IA
- `POST /api/ai/chat` - Chat avec l'IA
- `GET /api/ai/conversations` - Liste des conversations
- `GET /api/ai/conversations/:id` - Détails d'une conversation
- `DELETE /api/ai/conversations/:id` - Supprimer une conversation

#### Abonnements
- `GET /api/subscription/plans` - Plans disponibles
- `GET /api/subscription/current` - Abonnement actuel
- `POST /api/subscription/subscribe` - S'abonner
- `POST /api/subscription/confirm` - Confirmer le paiement
- `POST /api/subscription/cancel` - Annuler l'abonnement

#### Exercices
- `GET /api/exercises` - Liste des exercices
- `GET /api/exercises/:id` - Détails d'un exercice
- `POST /api/exercises/:id/submit` - Soumettre une réponse
- `GET /api/exercises/user/progress` - Progression des exercices

### Health Check
- `GET /health` - Statut du serveur
- `GET /api` - Informations sur l'API

## 🔧 Configuration

### Variables d'Environnement

```env
# Serveur
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/francais_fluide"

# JWT
JWT_SECRET=your-super-secret-jwt-key

# APIs IA
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ Base de Données

### Modèles Principaux

- **User** - Utilisateurs
- **UserProgress** - Progression des utilisateurs
- **Subscription** - Abonnements
- **Achievement** - Récompenses
- **Exercise** - Exercices
- **Question** - Questions d'exercices
- **Conversation** - Conversations IA
- **Message** - Messages de conversation
- **UsageLog** - Logs d'utilisation

### Migrations

```bash
# Créer une nouvelle migration
npm run db:migrate

# Réinitialiser la base de données
npm run db:push

# Visualiser la base de données
npm run db:studio
```

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

## 🚀 Déploiement

### Railway
1. Connecter le repository à Railway
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Docker
```bash
# Construire l'image
docker build -t francais-fluide-backend .

# Lancer le conteneur
docker run -p 3001:3001 francais-fluide-backend
```

## 📊 Monitoring

### Logs
- Logs structurés avec Winston
- Rotation automatique des fichiers
- Niveaux : error, warn, info, debug

### Métriques
- Rate limiting par IP
- Utilisation des APIs IA
- Performance des requêtes

## 🔒 Sécurité

- Authentification JWT
- Rate limiting
- Validation des données
- Headers de sécurité (Helmet)
- CORS configuré
- Chiffrement des mots de passe (bcrypt)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---

**FrançaisFluide Backend API** - Apprendre le français avec l'IA 🇨🇦
