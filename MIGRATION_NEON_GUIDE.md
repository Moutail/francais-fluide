# 🗄️ Guide de Migration vers PostgreSQL Neon

## 📅 Date: 3 octobre 2025

---

## ✅ ÉTAPE 1: CONFIGURATION (Déjà faite)

### Fichiers Modifiés

**1. `backend-francais-fluide/prisma/schema.prisma`** ✅
```prisma
// AVANT (SQLite)
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// APRÈS (PostgreSQL)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. `backend-francais-fluide/.env`** ✅ Créé
```bash
DATABASE_URL="postgresql://neondb_owner:npg_FGB42DEVwSTf@ep-soft-wind-ad7qthbt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

---

## 🚀 ÉTAPE 2: MIGRATION VERS NEON

### Commandes à Exécuter

```powershell
# 1. Aller dans le répertoire backend
cd C:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide\backend-francais-fluide

# 2. Générer le client Prisma pour PostgreSQL
npx prisma generate

# 3. Créer la migration initiale
npx prisma migrate dev --name init

# 4. Appliquer la migration sur Neon (production)
npx prisma migrate deploy

# 5. (Optionnel) Peupler la base avec des données de test
npm run db:seed
npm run db:seed-achievements

# 6. (Optionnel) Créer un utilisateur admin
npm run create-admin

# 7. Vérifier la connexion
npx prisma studio
# Devrait ouvrir Prisma Studio avec votre DB Neon
```

---

## 📋 DÉTAILS DES COMMANDES

### 1. Générer le Client Prisma
```powershell
npx prisma generate
```
**Ce que ça fait:**
- Génère le client Prisma adapté à PostgreSQL
- Crée les types TypeScript
- Configure les connexions

**Sortie attendue:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

### 2. Créer la Migration Initiale
```powershell
npx prisma migrate dev --name init
```
**Ce que ça fait:**
- Crée un fichier de migration SQL dans `prisma/migrations/`
- Applique la migration sur la DB Neon
- Crée toutes les tables

**Sortie attendue:**
```
Applying migration `20251003_init`
Database synchronized with schema
```

### 3. Déployer en Production
```powershell
npx prisma migrate deploy
```
**Ce que ça fait:**
- Applique toutes les migrations en attente
- Idéal pour les environnements de production
- Ne demande pas de confirmation

### 4. Peupler la Base (Optionnel)
```powershell
# Peupler avec des données de base
npm run db:seed

# Ajouter les achievements
npm run db:seed-achievements
```

### 5. Créer un Admin (Optionnel)
```powershell
npm run create-admin
```
**Ce que ça fait:**
- Crée un utilisateur administrateur
- Demande email/nom/mot de passe
- Utile pour tester

### 6. Vérifier avec Prisma Studio
```powershell
npx prisma studio
```
**Ce que ça fait:**
- Ouvre une interface web sur http://localhost:5555
- Permet de voir et éditer les données
- Très utile pour debug

---

## ⚠️ SÉCURITÉ: NE PAS COMMITTER .env

### Vérifier le .gitignore

```powershell
# Vérifier que .env est ignoré
cat backend-francais-fluide\.gitignore | Select-String ".env"
```

**Si .env n'est pas dans .gitignore, ajoutez-le:**
```bash
# Dans backend-francais-fluide/.gitignore
.env
.env.local
.env.*.local
*.db
*.db-journal
```

---

## 🔐 GÉNÉRER UN JWT_SECRET SÉCURISÉ

**Important**: Changez le JWT_SECRET par défaut !

```powershell
# Générer un secret aléatoire sécurisé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Copier la sortie et remplacer dans `backend-francais-fluide/.env`:**
```bash
JWT_SECRET="<la_valeur_générée>"
```

---

## 📊 VÉRIFICATION DE LA MIGRATION

### 1. Tester la Connexion
```powershell
cd backend-francais-fluide

# Vérifier que Prisma peut se connecter
npx prisma db pull
```

**Si ça marche**: ✅ Connexion OK
**Si erreur**: ⚠️ Vérifier DATABASE_URL

### 2. Vérifier les Tables Créées
```powershell
npx prisma studio
```
**Vous devriez voir:**
- users
- user_progress
- subscriptions
- achievements
- user_achievements
- exercises
- questions
- exercise_submissions
- conversations
- messages
- usage_logs
- dictations
- calendar_events
- documents
- telemetry_events
- support_tickets
- daily_usage

**Total: 17 tables** ✅

### 3. Tester le Backend
```powershell
# Démarrer le serveur
npm run dev
```

**Dans un autre terminal, tester:**
```powershell
# Test de santé
curl http://localhost:3001/api/health

# Test d'inscription
curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test User\"}'
```

---

## 🔄 SI VOUS VOULEZ MIGRER DES DONNÉES

### Option 1: Export/Import Manuel

**1. Exporter de SQLite (si vous avez des données à conserver)**
```powershell
# Si vous avez l'ancien dev.db et voulez garder les données
npx prisma db pull --schema=prisma/schema.sqlite.prisma
```

**2. Script de migration des données**
```javascript
// scripts/migrate-data.js
const { PrismaClient } = require('@prisma/client');

// Ancienne DB (SQLite)
const oldPrisma = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
});

// Nouvelle DB (PostgreSQL)
const newPrisma = new PrismaClient();

async function migrateData() {
  console.log('Migration des utilisateurs...');
  const users = await oldPrisma.user.findMany({
    include: { 
      progress: true, 
      subscription: true,
      achievements: true 
    }
  });
  
  for (const user of users) {
    await newPrisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: user.password,
        role: user.role,
        // ... autres champs
      }
    });
  }
  
  console.log(`✅ ${users.length} utilisateurs migrés`);
}

migrateData()
  .catch(console.error)
  .finally(() => {
    oldPrisma.$disconnect();
    newPrisma.$disconnect();
  });
```

### Option 2: Recommencer à Zéro (Recommandé pour Dev)

**C'est plus simple si vous n'avez pas de données importantes:**
1. ✅ Migration déjà faite (tables créées)
2. ✅ Utiliser les seeds pour données de test
3. ✅ Créer des utilisateurs de test

---

## 📝 CONFIGURATION POUR RENDER

### Variables d'Environnement Render

Quand vous déployez sur Render, ajoutez ces variables:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_FGB42DEVwSTf@ep-soft-wind-ad7qthbt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=<votre_secret_généré>
STRIPE_SECRET_KEY=<votre_clé_stripe>
OPENAI_API_KEY=<votre_clé_openai>
FRONTEND_URL=https://votre-app.vercel.app
NODE_ENV=production
PORT=3001
```

### Build Command Render
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

**Important**: `migrate deploy` au lieu de `migrate dev` en production!

---

## 🔍 TROUBLESHOOTING

### Erreur: "Can't reach database server"

**Solution:**
1. Vérifier que l'URL Neon est correcte
2. Vérifier que `?sslmode=require` est dans l'URL
3. Vérifier votre connexion internet
4. Vérifier que le projet Neon est actif

```powershell
# Tester la connexion
npx prisma db pull
```

### Erreur: "Schema engine error"

**Solution:**
1. Supprimer les anciens fichiers de migration
```powershell
Remove-Item -Recurse -Force prisma\migrations -ErrorAction SilentlyContinue
```

2. Recréer la migration
```powershell
npx prisma migrate dev --name init
```

### Erreur: "P1001: Can't reach database"

**Solution:**
Vérifier l'URL de connexion:
```bash
# L'URL doit avoir ce format:
postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require

# Votre URL:
postgresql://neondb_owner:npg_FGB42DEVwSTf@ep-soft-wind-ad7qthbt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Erreur: "Database is not empty"

**Si la DB Neon a déjà des tables:**
```powershell
# Option 1: Reset complet (ATTENTION: efface tout!)
npx prisma migrate reset

# Option 2: Utiliser db push pour synchroniser
npx prisma db push

# Option 3: Créer une nouvelle base Neon
```

---

## 📊 VALIDATION POST-MIGRATION

### Checklist

- [ ] ✅ Schema.prisma mis à jour (provider: postgresql)
- [ ] ✅ .env créé avec DATABASE_URL
- [ ] ✅ Client Prisma généré
- [ ] ✅ Migration créée
- [ ] ✅ Tables créées sur Neon
- [ ] ✅ Connexion testée (Prisma Studio)
- [ ] ✅ Backend démarre sans erreur
- [ ] ✅ API fonctionne

### Tests à Effectuer

```powershell
# 1. Vérifier les tables
npx prisma studio
# → Doit afficher les 17 tables

# 2. Démarrer le backend
npm run dev
# → Doit démarrer sur port 3001

# 3. Test API
curl http://localhost:3001/api/health
# → {"status":"ok"}
```

---

## 📈 COMPARAISON SQLITE vs POSTGRESQL

### SQLite (Avant) ❌
- ✅ Facile pour développement local
- ❌ Fichier unique (dev.db)
- ❌ Pas adapté pour production
- ❌ Pas de connexions concurrentes
- ❌ Pas de scalabilité

### PostgreSQL Neon (Après) ✅
- ✅ Production-ready
- ✅ Connexions concurrentes
- ✅ Scalable
- ✅ Backups automatiques
- ✅ Haute disponibilité
- ✅ Compatible Render/Vercel
- ✅ Gratuit jusqu'à 3GB

---

## 🎯 PROCHAINES ÉTAPES

### 1. Exécuter la Migration (10 minutes)
```powershell
cd backend-francais-fluide
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio  # Vérifier
```

### 2. Générer JWT_SECRET Sécurisé (1 minute)
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copier la valeur dans .env
```

### 3. Tester Localement (5 minutes)
```powershell
npm run dev
# Tester l'API
```

### 4. Committer et Pousser (2 minutes)
```powershell
cd ..
git add .
git commit -m "feat: Migration vers PostgreSQL Neon

- Update schema.prisma: SQLite → PostgreSQL
- Add .env avec connection Neon
- Create migration initiale
- Update documentation migration

Le projet est maintenant prêt pour Render et Vercel."

git push origin main
```

### 5. Déployer sur Render (10 minutes)
- Suivre `GUIDE_RAPIDE_DEPLOIEMENT.md` section Backend

---

## 🎁 BONUS: COMMANDES UTILES

### Gestion des Migrations
```powershell
# Voir le statut des migrations
npx prisma migrate status

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations en production
npx prisma migrate deploy

# Reset complet (ATTENTION: efface tout!)
npx prisma migrate reset
```

### Gestion de la Base
```powershell
# Synchroniser le schema sans migration (dev uniquement)
npx prisma db push

# Vérifier que la DB est à jour avec le schema
npx prisma db pull

# Ouvrir Prisma Studio
npx prisma studio

# Formatter le schema
npx prisma format
```

### Debug
```powershell
# Tester la connexion
npx prisma db execute --stdin < test.sql

# Voir les logs Prisma
$env:DEBUG="prisma:*"
npm run dev
```

---

## 🔒 SÉCURITÉ IMPORTANTE

### ⚠️ NE JAMAIS COMMITTER .env

**Vérifier:**
```powershell
# .env doit être dans .gitignore
cat backend-francais-fluide\.gitignore | Select-String ".env"
```

**Si pas présent, ajouter:**
```bash
# backend-francais-fluide/.gitignore
.env
.env.local
.env.*.local
```

### ⚠️ Connection String Sensible

Votre connection string contient:
- ❌ **Username**: neondb_owner
- ❌ **Password**: npg_FGB42DEVwSTf
- ❌ **Host**: ep-soft-wind-ad7qthbt-pooler.us-east-1.aws.neon.tech

**NE JAMAIS:**
- Committer le .env
- Partager publiquement
- Mettre dans le code

**À FAIRE:**
- ✅ Garder dans .env (local)
- ✅ Ajouter dans variables Render (production)
- ✅ Régénérer si compromis

---

## 🎯 PLAN DE MIGRATION COMPLET

### Phase 1: Préparation ✅ (Fait)
- ✅ Modifier schema.prisma
- ✅ Créer .env avec Neon URL
- ✅ Vérifier .gitignore

### Phase 2: Migration (À faire - 10 min)
```powershell
cd backend-francais-fluide

# Étape 1: Générer le client
npx prisma generate

# Étape 2: Créer et appliquer la migration
npx prisma migrate dev --name init

# Étape 3: Vérifier
npx prisma studio
```

### Phase 3: Données (Optionnel - 5 min)
```powershell
# Peupler avec des données de test
npm run db:seed
npm run db:seed-achievements

# Créer un admin
npm run create-admin
```

### Phase 4: Tests (5 min)
```powershell
# Démarrer le backend
npm run dev

# Dans un autre terminal
npm run test:db
npm run test:auth
```

### Phase 5: Déploiement (10 min)
1. Pousser sur GitHub
2. Configurer Render avec même DATABASE_URL
3. Render va automatiquement exécuter les migrations
4. Tester en production

---

## 📊 AVANT / APRÈS

### AVANT (SQLite)
```bash
Database: file:./dev.db (local)
Location: backend-francais-fluide/prisma/dev.db
Type: SQLite (fichier)
Production: ❌ Non adapté
Backups: ❌ Manuel
Scalabilité: ❌ Limitée
```

### APRÈS (PostgreSQL Neon)
```bash
Database: PostgreSQL Neon
Location: Cloud (us-east-1)
Type: PostgreSQL 15
Production: ✅ Ready
Backups: ✅ Automatiques
Scalabilité: ✅ Excellente
SSL: ✅ Requis
Gratuit: ✅ Jusqu'à 3GB
```

---

## 🎉 AVANTAGES DE NEON

### Features Incluses (Plan Gratuit)
- ✅ **3GB de stockage**
- ✅ **Backups quotidiens** (7 jours de rétention)
- ✅ **SSL/TLS automatique**
- ✅ **Connection pooling**
- ✅ **Branching** (comme git pour les bases de données!)
- ✅ **Auto-scaling**
- ✅ **Monitoring intégré**

### Dashboard Neon
Accédez à https://console.neon.tech pour:
- 📊 Voir les métriques
- 📈 Monitorer les requêtes
- 💾 Gérer les backups
- 🌿 Créer des branches de DB
- 🔐 Gérer les accès

---

## 🆘 PROBLÈMES COURANTS

### "Migration failed: database is not empty"

**Solution:**
```powershell
# Option 1: Reset (ATTENTION: efface tout)
npx prisma migrate reset

# Option 2: Baseline (marquer comme appliqué)
npx prisma migrate resolve --applied "20251003_init"
```

### "SSL connection error"

**Solution:**
Ajouter `?sslmode=require` à l'URL:
```bash
DATABASE_URL="postgresql://...?sslmode=require"
```

### "Too many connections"

**Solution:**
Neon a du connection pooling. Utiliser l'URL avec `-pooler`:
```bash
# ✅ Bon (avec pooler)
@ep-soft-wind-ad7qthbt-pooler.us-east-1.aws.neon.tech

# ⚠️ Sans pooler (limité)
@ep-soft-wind-ad7qthbt.us-east-1.aws.neon.tech
```

### "Password authentication failed"

**Solution:**
1. Vérifier le mot de passe dans l'URL
2. Régénérer le mot de passe sur Neon Dashboard
3. Mettre à jour DATABASE_URL

---

## 📋 CHECKLIST FINALE

### Avant de Continuer
- [ ] ✅ Schema.prisma mis à jour (postgresql)
- [ ] ✅ .env créé avec DATABASE_URL Neon
- [ ] ✅ .gitignore contient .env
- [ ] ⏳ Migrations créées et appliquées
- [ ] ⏳ Tables vérifiées dans Prisma Studio
- [ ] ⏳ Backend testé localement
- [ ] ⏳ JWT_SECRET généré et mis à jour
- [ ] ⏳ Données de test créées (optionnel)

### Après Migration
- [ ] Backend démarre sans erreur
- [ ] API répond correctement
- [ ] Données sauvegardées dans Neon
- [ ] Prisma Studio fonctionne
- [ ] Prêt pour Render

---

## 🚀 COMMANDES COMPLÈTES - COPIER-COLLER

```powershell
# ==============================================
# MIGRATION COMPLÈTE VERS NEON - TOUTES LES ÉTAPES
# ==============================================

# 1. Aller dans le backend
cd C:\Users\Cherif\OneDrive\Desktop\burreauDossiers\laboratoire\github\francais-fluide\backend-francais-fluide

# 2. Générer le client Prisma PostgreSQL
Write-Host "`n🔧 Génération du client Prisma..." -ForegroundColor Blue
npx prisma generate

# 3. Créer la migration initiale
Write-Host "`n📝 Création de la migration..." -ForegroundColor Blue
npx prisma migrate dev --name init

# 4. Vérifier les tables créées
Write-Host "`n✅ Vérification avec Prisma Studio..." -ForegroundColor Green
Write-Host "Ouvrir http://localhost:5555 dans votre navigateur" -ForegroundColor Yellow
npx prisma studio

# 5. Générer JWT_SECRET sécurisé
Write-Host "`n🔐 Génération JWT_SECRET..." -ForegroundColor Blue
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
Write-Host "⚠️  Copier la valeur ci-dessus dans backend-francais-fluide/.env" -ForegroundColor Yellow

# 6. (Optionnel) Peupler la base
Write-Host "`n🌱 Peuplement de la base (optionnel)..." -ForegroundColor Blue
npm run db:seed
npm run db:seed-achievements

# 7. (Optionnel) Créer un admin
Write-Host "`n👤 Création d'un admin (optionnel)..." -ForegroundColor Blue
npm run create-admin

# 8. Tester le backend
Write-Host "`n🚀 Démarrage du backend..." -ForegroundColor Green
npm run dev
```

**Temps total: 15-20 minutes**

---

## ✅ VALIDATION RÉUSSIE

### Comment Savoir que Ça Marche?

**1. Prisma Generate:**
```
✔ Generated Prisma Client to ./node_modules/@prisma/client
```

**2. Migration:**
```
Applying migration `20251003_init`
The following migration(s) have been created and applied:
migrations/
  └─ 20251003_init/
      └─ migration.sql

✔ Generated Prisma Client
```

**3. Prisma Studio:**
- Ouvre http://localhost:5555
- Affiche vos 17 tables
- Vous pouvez ajouter/modifier des données

**4. Backend:**
```
🔧 Variables d'environnement chargées:
DATABASE_URL: ✅ Définie
JWT_SECRET: ✅ Défini
PORT: 3001

🚀 Serveur démarré sur http://localhost:3001
✅ Connecté à PostgreSQL Neon
```

---

## 🎉 TERMINÉ!

### Après Ces Étapes, Vous Aurez:

- ✅ Base de données PostgreSQL sur Neon (cloud)
- ✅ Schema migré avec toutes les tables
- ✅ Backend configuré pour production
- ✅ Prêt pour déploiement Render
- ✅ Compatible avec Vercel frontend

### Prochaine Étape:

**Pousser sur GitHub:**
```powershell
cd ..
git add .
git commit -m "feat: Migration PostgreSQL Neon + Corrections build Vercel"
git push origin main
```

**Puis déployer:**
- Frontend sur Vercel (automatique)
- Backend sur Render (suivre le guide)

---

**Bonne migration! 🚀**

*Si vous rencontrez un problème, consultez la section Troubleshooting ci-dessus.*

