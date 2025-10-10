# ✅ Comptes de Test Créés en Local

Date : 10 octobre 2025  
Base de données : PostgreSQL Local (`francais_fluide`)

---

## 🎉 Comptes Créés avec Succès

### 👨‍💼 ADMIN (1)

```
Email : admin@francais-fluide.com
Mot de passe : Admin123!
Rôle : super_admin
Plan : Établissement
```

### 👨‍🎓 ÉTUDIANTS (5)

```
Email : etudiant1@francais-fluide.com
Mot de passe : Etudiant123!
Rôle : user
Plan : Étudiant

Email : etudiant2@francais-fluide.com
Mot de passe : Etudiant123!
Rôle : user
Plan : Étudiant

Email : etudiant3@francais-fluide.com
Mot de passe : Etudiant123!
Rôle : user
Plan : Étudiant

Email : etudiant4@francais-fluide.com
Mot de passe : Etudiant123!
Rôle : user
Plan : Étudiant

Email : etudiant5@francais-fluide.com
Mot de passe : Etudiant123!
Rôle : user
Plan : Demo
```

### 💎 PREMIUM (2)

```
Email : premium1@francais-fluide.com
Mot de passe : Premium123!
Rôle : user
Plan : Premium

Email : premium2@francais-fluide.com
Mot de passe : Premium123!
Rôle : user
Plan : Premium
```

### 🏢 ÉTABLISSEMENTS (2)

```
Email : etablissement1@francais-fluide.com
Mot de passe : Etablissement123!
Rôle : user
Plan : Établissement

Email : etablissement2@francais-fluide.com
Mot de passe : Etablissement123!
Rôle : user
Plan : Établissement
```

### 👨‍🏫 PROFESSEURS (2)

```
Email : professeur1@francais-fluide.com
Mot de passe : Prof123!
Rôle : teacher
Plan : Établissement

Email : professeur2@francais-fluide.com
Mot de passe : Prof123!
Rôle : teacher
Plan : Établissement
```

---

## 🧪 Test de Connexion

### Sur Local (http://localhost:3000)

1. Démarrer le backend :
   ```bash
   cd backend-francais-fluide
   .\start-dev.bat
   ```

2. Démarrer le frontend :
   ```bash
   cd frontend-francais-fluide
   npm run dev
   ```

3. Se connecter avec n'importe quel compte ci-dessus

### Exemple avec Admin

```
URL : http://localhost:3000/auth/login
Email : admin@francais-fluide.com
Mot de passe : Admin123!
```

**Résultat attendu** :
```
✅ Connexion réussie
✅ Redirection vers le dashboard
✅ Accès à l'interface admin
```

### Exemple avec Étudiant

```
Email : etudiant1@francais-fluide.com
Mot de passe : Etudiant123!
```

**Résultat attendu** :
```
✅ Connexion réussie
✅ Accès aux exercices
✅ Plan Étudiant actif
```

---

## 📊 Récapitulatif

### Total des Comptes

- **Admin** : 1
- **Étudiants** : 5 (4 Étudiant + 1 Demo)
- **Premium** : 2
- **Professeurs** : 2
- **Établissements** : 2
- **TOTAL** : 12 comptes

### Plans d'Abonnement

- **Demo** : 1 compte (etudiant5)
- **Étudiant** : 4 comptes (etudiant1-4)
- **Premium** : 2 comptes (premium1-2)
- **Établissement** : 5 comptes (admin, etablissement1-2, professeur1-2)

---

## 🔧 Scripts Créés

### 1. setup-local-db.bat

Script pour créer les comptes dans PostgreSQL local :

```batch
@echo off
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/francais_fluide
node create-test-accounts.js
```

**Utilisation** :
```bash
.\setup-local-db.bat
```

### 2. start-dev.bat

Script pour démarrer le serveur avec PostgreSQL local :

```batch
@echo off
set DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/francais_fluide
npm run dev
```

**Utilisation** :
```bash
.\start-dev.bat
```

---

## 🎯 Environnements Séparés

### Développement (Local)

**Base de données** : PostgreSQL local
```
Host : localhost
Port : 5432
Database : francais_fluide
User : postgres
Password : postgres123
```

**Comptes** : 12 comptes de test créés

**Script de démarrage** : `.\start-dev.bat`

### Production (Render + Vercel)

**Base de données** : Neon DB
```
URL : postgresql://neondb_owner:...@ep-soft-wind-ad7qthbt-pooler.c-2.us-east-1.aws.neon.tech/neondb
```

**Comptes** : 10 comptes de test créés (via `setup-production-neon.bat`)

**URL** : https://francais-fluide.vercel.app

---

## 📋 Vérification

### Vérifier dans PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres -d francais_fluide

# Lister les utilisateurs
SELECT email, role, name FROM users ORDER BY role, email;

# Vérifier les abonnements
SELECT u.email, s.plan, s.status 
FROM users u 
JOIN subscriptions s ON u.id = s."userId" 
ORDER BY s.plan, u.email;

# Quitter
\q
```

**Résultat attendu** :
```
admin@francais-fluide.com       | super_admin | Admin FrançaisFluide
professeur1@francais-fluide.com | teacher     | Professeur 1
professeur2@francais-fluide.com | teacher     | Professeur 2
etablissement1@francais-fluide.com | user     | Établissement 1
etablissement2@francais-fluide.com | user     | Établissement 2
etudiant1@francais-fluide.com   | user        | Étudiant 1
etudiant2@francais-fluide.com   | user        | Étudiant 2
etudiant3@francais-fluide.com   | user        | Étudiant 3
etudiant4@francais-fluide.com   | user        | Étudiant 4
etudiant5@francais-fluide.com   | user        | Étudiant 5
premium1@francais-fluide.com    | user        | Premium 1
premium2@francais-fluide.com    | user        | Premium 2
```

---

## 🚀 Utilisation

### Pour Tester Différents Plans

**Plan Demo (Limité)** :
```
Email : etudiant5@francais-fluide.com
Mot de passe : Etudiant123!
Quotas : 10 corrections, 5 exercices, 0 dictées
```

**Plan Étudiant** :
```
Email : etudiant1@francais-fluide.com
Mot de passe : Etudiant123!
Quotas : 100 corrections, 50 exercices, 10 dictées
```

**Plan Premium (Illimité)** :
```
Email : premium1@francais-fluide.com
Mot de passe : Premium123!
Quotas : Illimité
```

**Plan Établissement** :
```
Email : etablissement1@francais-fluide.com
Mot de passe : Etablissement123!
Quotas : Illimité
```

**Professeur** :
```
Email : professeur1@francais-fluide.com
Mot de passe : Prof123!
Rôle : teacher
Quotas : Illimité
```

**Admin** :
```
Email : admin@francais-fluide.com
Mot de passe : Admin123!
Rôle : super_admin
Accès : Interface admin complète
```

---

## ✅ Résultat Final

**La base de données PostgreSQL locale contient maintenant** :
- ✅ 12 comptes de test
- ✅ Tous les plans d'abonnement
- ✅ Différents rôles (admin, teacher, user)
- ✅ Progression initialisée pour chaque utilisateur
- ✅ Abonnements actifs

**Vous pouvez maintenant** :
- ✅ Développer en local avec des données de test
- ✅ Tester tous les plans d'abonnement
- ✅ Tester les fonctionnalités admin
- ✅ Tester les quotas
- ✅ Développer sans affecter la production

---

## 🎯 Prochaines Étapes

1. **Démarrer les serveurs** :
   ```bash
   # Terminal 1 - Backend
   cd backend-francais-fluide
   .\start-dev.bat

   # Terminal 2 - Frontend
   cd frontend-francais-fluide
   npm run dev
   ```

2. **Tester les comptes** :
   - Se connecter avec différents comptes
   - Vérifier les quotas
   - Tester les fonctionnalités

3. **Développer** :
   - Ajouter des exercices
   - Créer des dictées
   - Tester les corrections

---

**Tous les comptes de test sont maintenant disponibles en local !** 🎉

Vous avez maintenant :
- ✅ **Local** : PostgreSQL avec 12 comptes de test
- ✅ **Production** : Neon DB avec 10 comptes de test
- ✅ Environnements séparés et fonctionnels
