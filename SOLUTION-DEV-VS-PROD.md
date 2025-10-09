# 🎯 Solution : Séparer Dev et Production

## 🔍 Problème Identifié

- ✅ **Production (Render + Vercel)** : Fonctionne parfaitement
- ❌ **Local (Dev)** : Erreur "colonne"

**Cause** : Vous utilisez la **même base de données Neon** pour dev et prod, mais le client Prisma local est désynchronisé.

---

## ✅ Solution : Base de Données Locale pour le Dev

### Option 1 : PostgreSQL Local (Recommandé)

#### Étape 1 : Installer PostgreSQL

**Windows** :
```
1. Télécharger : https://www.postgresql.org/download/windows/
2. Installer (mot de passe : postgres)
3. Port : 5432
```

#### Étape 2 : Créer la Base Locale

```sql
-- Ouvrir pgAdmin ou psql
CREATE DATABASE francais_fluide_dev;
```

#### Étape 3 : Créer .env.development

Créez un nouveau fichier `.env.development` :

```env
# Base de données LOCALE pour le développement
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/francais_fluide_dev?schema=public"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise-ici-changez-moi"

# Serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Stripe (Paiements)
STRIPE_SECRET_KEY=sk_test_51QVRfLIDmnVVCMWeLFzm7YyAQqpgo39QjhmOVgofirUPinyqeVdcWnFUYTWT7ZO9UaS6pwkSlo102UmCZgF9sXel00RfNSfnUp
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=sk_test_51QVRfLIDmnVVCMWeLFzm7YyAQqpgo39QjhmOVgofirUPinyqeVdcWnFUYTWT7ZO9UaS6pwkSlo102UmCZgF9sXel00RfNSfnUp

# IA Providers
AI_PROVIDER=openai
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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

# LanguageTool (Optionnel)
LANGUAGE_TOOL_URL=https://api.languagetool.org/v2
LANGUAGE_TOOL_API_KEY=your_api_key_here
```

#### Étape 4 : Modifier package.json

```json
{
  "scripts": {
    "dev": "NODE_ENV=development nodemon src/server.js",
    "dev:local": "cp .env.development .env && npm run dev",
    "start": "node src/server.js"
  }
}
```

#### Étape 5 : Initialiser la Base Locale

```bash
# Copier .env.development vers .env
copy .env.development .env

# Pousser le schéma
npx prisma db push

# Créer l'admin
node create-admin-auto.js

# Démarrer
npm run dev
```

---

### Option 2 : Utiliser SQLite (Plus Simple)

#### Étape 1 : Modifier schema.prisma

Créez `schema.dev.prisma` :

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// Copier tous les models du schema.prisma original
```

#### Étape 2 : Utiliser le Schéma Dev

```bash
# Générer avec le schéma dev
npx prisma generate --schema=schema.dev.prisma

# Pousser
npx prisma db push --schema=schema.dev.prisma

# Créer l'admin
node create-admin-auto.js
```

---

### Option 3 : Créer une Nouvelle Base Neon pour le Dev

#### Étape 1 : Créer une Base Neon Dev

1. Aller sur https://neon.tech
2. Créer un nouveau projet : `francais-fluide-dev`
3. Copier la DATABASE_URL

#### Étape 2 : Modifier .env

```env
# Remplacer par la nouvelle URL Neon DEV
DATABASE_URL="postgresql://nouvelle_url_neon_dev..."
```

#### Étape 3 : Initialiser

```bash
npx prisma db push
node create-admin-auto.js
npm run dev
```

---

## 🎯 Meilleure Pratique : Environnements Séparés

### Structure Recommandée

```
.env.development    → Base locale PostgreSQL
.env.production     → Base Neon (Render)
.env                → Copie de .env.development (gitignored)
```

### Script package.json

```json
{
  "scripts": {
    "dev": "cp .env.development .env && nodemon src/server.js",
    "prod": "cp .env.production .env && node src/server.js"
  }
}
```

---

## ✅ Solution Immédiate (Sans Installer PostgreSQL)

Si vous voulez une solution rapide MAINTENANT :

### Créer une Nouvelle Base Neon Dev

```bash
# 1. Aller sur https://neon.tech
# 2. Créer un nouveau projet "francais-fluide-dev"
# 3. Copier la DATABASE_URL

# 4. Modifier .env (remplacer DATABASE_URL)
# DATABASE_URL="postgresql://nouvelle_url..."

# 5. Pousser le schéma
npx prisma db push

# 6. Créer l'admin
node create-admin-auto.js

# 7. Démarrer
npm run dev

# 8. Tester
# http://localhost:3000
# admin@francais-fluide.com / Admin123!
```

---

## 📋 Pourquoi ça Fonctionne en Prod ?

**Production (Render)** :
- ✅ Base Neon avec la bonne structure
- ✅ Client Prisma généré au déploiement
- ✅ Tout est synchronisé

**Local (Dev)** :
- ❌ Même base Neon
- ❌ Client Prisma local désynchronisé
- ❌ Cache du pooler Neon

**Solution** : Utiliser des bases séparées !

---

## 🎯 Commandes Finales (Nouvelle Base Neon Dev)

```bash
# 1. Créer une nouvelle base Neon pour le dev
# https://neon.tech → Nouveau projet

# 2. Modifier .env avec la nouvelle URL
# DATABASE_URL="postgresql://nouvelle_url_dev..."

# 3. Pousser le schéma
npx prisma db push

# 4. Créer l'admin
node create-admin-auto.js

# 5. Démarrer
npm run dev

# 6. ✅ Ça devrait fonctionner !
```

---

**La meilleure solution : Créer une base Neon séparée pour le développement !** 🚀

Cela vous évitera de polluer votre base de production et résoudra tous les problèmes de synchronisation.
