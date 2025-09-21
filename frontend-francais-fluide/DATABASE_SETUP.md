# 🗄️ Configuration de la Base de Données - FrançaisFluide

## 📋 **Base de Données Utilisée**

### **PostgreSQL + Prisma ORM**
- **Base de données :** PostgreSQL (recommandé pour la production)
- **ORM :** Prisma (type-safe, migrations automatiques)
- **Alternative :** SQLite pour le développement local

## 🚀 **Installation et Configuration**

### **1. Installer les dépendances**
```bash
npm install @prisma/client prisma stripe bcryptjs jsonwebtoken zod
npm install -D @types/bcryptjs @types/jsonwebtoken tsx
```

### **2. Configurer la base de données**

#### **Option A : PostgreSQL (Recommandé)**
```bash
# Installer PostgreSQL
# Windows : Télécharger depuis https://www.postgresql.org/download/windows/
# macOS : brew install postgresql
# Ubuntu : sudo apt-get install postgresql postgresql-contrib

# Créer la base de données
createdb francais_fluide

# Configurer l'URL de connexion
DATABASE_URL="postgresql://username:password@localhost:5432/francais_fluide?schema=public"
```

#### **Option B : SQLite (Développement)**
```bash
# SQLite est inclus avec Node.js
DATABASE_URL="file:./dev.db"
```

### **3. Initialiser Prisma**
```bash
# Générer le client Prisma
npx prisma generate

# Créer la première migration
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio
npx prisma studio
```

## 📊 **Modèle de Données**

### **Tables Principales :**

#### **1. Users (Utilisateurs)**
```sql
- id: String (CUID)
- email: String (unique)
- name: String
- password: String (hashé)
- plan: String (free, student, premium, enterprise)
- createdAt: DateTime
- updatedAt: DateTime
```

#### **2. Subscriptions (Abonnements)**
```sql
- id: String (CUID)
- userId: String (FK)
- plan: String
- status: String (active, cancelled, expired)
- currentPeriodStart: DateTime
- currentPeriodEnd: DateTime
- cancelAtPeriodEnd: Boolean
```

#### **3. Payments (Paiements)**
```sql
- id: String (CUID)
- userId: String (FK)
- subscriptionId: String (FK)
- amount: Decimal
- currency: String (CAD)
- status: String (pending, completed, failed, refunded)
- stripePaymentIntentId: String
- stripeSessionId: String
```

#### **4. UserProgress (Progression)**
```sql
- id: String (CUID)
- userId: String (FK)
- wordsWritten: Int
- accuracy: Float
- timeSpent: Int (minutes)
- exercisesCompleted: Int
- currentStreak: Int
- level: Int
- xp: Int
- lastActivity: DateTime
```

## 🔧 **Scripts Disponibles**

### **Package.json Scripts :**
```json
{
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts"
}
```

### **Commandes Utiles :**
```bash
# Générer le client Prisma
npm run db:generate

# Appliquer les changements au schéma
npm run db:push

# Créer une migration
npm run db:migrate

# Ouvrir l'interface graphique
npm run db:studio

# Peupler la base avec des données de test
npm run db:seed
```

## 💳 **Configuration Stripe**

### **1. Créer un compte Stripe**
- Aller sur https://stripe.com
- Créer un compte développeur
- Récupérer les clés API

### **2. Variables d'environnement**
```env
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### **3. Webhooks Stripe**
- Configurer les webhooks pour les événements :
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

## 🚀 **Déploiement**

### **Vercel + Railway (Recommandé)**
```bash
# 1. Déployer la base de données sur Railway
# 2. Configurer les variables d'environnement
# 3. Déployer l'application sur Vercel
```

### **Variables d'environnement de production :**
```env
DATABASE_URL="postgresql://user:pass@host:port/db"
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
JWT_SECRET="production-secret-key"
NEXTAUTH_URL="https://your-domain.com"
```

## 🔒 **Sécurité**

### **Bonnes pratiques :**
- ✅ Mots de passe hashés avec bcrypt
- ✅ JWT pour l'authentification
- ✅ Validation des données avec Zod
- ✅ HTTPS en production
- ✅ Variables d'environnement sécurisées
- ✅ Rate limiting sur les API

### **RGPD/Conformité :**
- ✅ Consentement explicite
- ✅ Droit à l'oubli
- ✅ Export des données
- ✅ Chiffrement des données sensibles

## 📈 **Monitoring**

### **Métriques importantes :**
- Nombre d'utilisateurs actifs
- Taux de conversion des abonnements
- Revenus mensuels
- Taux d'erreur des paiements
- Performance des requêtes

### **Outils recommandés :**
- Prisma Studio (gestion des données)
- Stripe Dashboard (paiements)
- Vercel Analytics (performance)
- Sentry (erreurs)

---

## 🎯 **Prochaines Étapes**

1. **Installer PostgreSQL** localement
2. **Configurer les variables d'environnement**
3. **Exécuter les migrations Prisma**
4. **Tester l'API de paiement Stripe**
5. **Déployer en production**

**La base de données est maintenant prête pour gérer les utilisateurs, abonnements et paiements !** 🚀
