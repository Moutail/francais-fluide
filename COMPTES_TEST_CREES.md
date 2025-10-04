# 👥 Comptes de Test Créés - Français Fluide

## Date: 3 octobre 2025

---

## ✅ 11 COMPTES CRÉÉS DANS NEON POSTGRESQL

### 📊 Résumé
```
Total: 11 utilisateurs
Admin: 1
Professeurs: 2
Testeurs: 2
Premium: 2
Étudiants: 2
Établissement: 2
```

---

## 🔑 LISTE COMPLÈTE DES COMPTES

### 👑 ADMIN (Super Admin)
```
Email: admin@francais-fluide.com
Password: Admin123!
Rôle: super_admin
Plan: établissement (1 an)
```

---

### 👨‍🏫 PROFESSEURS (2 comptes)

#### Professeur 1
```
Nom: Professeur Dubois
Email: professeur1@francais-fluide.com
Password: Prof123!
Rôle: teacher
Plan: établissement (1 an)
Expire: 04/10/2026
```

#### Professeur 2
```
Nom: Professeur Martin
Email: professeur2@francais-fluide.com
Password: Prof123!
Rôle: teacher
Plan: établissement (1 an)
Expire: 04/10/2026
```

---

### 🔧 TESTEURS (2 comptes)

#### Testeur 1
```
Nom: Testeur 1
Email: testeur1@francais-fluide.com
Password: Test123!
Rôle: tester
Plan: premium (1 mois)
Expire: 03/11/2025
```

#### Testeur 2
```
Nom: Testeur 2
Email: testeur2@francais-fluide.com
Password: Test123!
Rôle: tester
Plan: premium (1 mois)
Expire: 03/11/2025
```

---

### 🎓 ÉTUDIANTS (2 comptes)

#### Étudiant 1
```
Nom: Étudiant Marie
Email: etudiant1@francais-fluide.com
Password: Etudiant123!
Rôle: user
Plan: etudiant (1 mois)
Expire: 03/11/2025
```

#### Étudiant 2
```
Nom: Étudiant Jean
Email: etudiant2@francais-fluide.com
Password: Etudiant123!
Rôle: user
Plan: etudiant (1 mois)
Expire: 03/11/2025
```

---

### ⭐ PREMIUM (2 comptes)

#### Premium 1
```
Nom: Premium Sophie
Email: premium1@francais-fluide.com
Password: Premium123!
Rôle: user
Plan: premium (1 mois)
Expire: 03/11/2025
```

#### Premium 2
```
Nom: Premium Pierre
Email: premium2@francais-fluide.com
Password: Premium123!
Rôle: user
Plan: premium (1 mois)
Expire: 03/11/2025
```

---

### 🏢 ÉTABLISSEMENT (2 comptes)

#### Établissement 1
```
Nom: École Secondaire Montreal
Email: etablissement1@francais-fluide.com
Password: Etablissement123!
Rôle: user
Plan: établissement (1 an)
Expire: 04/10/2026
```

#### Établissement 2
```
Nom: Université Laval
Email: etablissement2@francais-fluide.com
Password: Etablissement123!
Rôle: user
Plan: établissement (1 an)
Expire: 04/10/2026
```

---

## 📋 RÉSUMÉ PAR PLAN

### Démo (0 comptes)
- Gratuit
- 10 corrections/jour
- 5 exercices/jour

### Étudiant (2 comptes)
- 14.99 CAD/mois
- 100 corrections/jour
- 50 exercices/jour
- **Comptes:** etudiant1@, etudiant2@

### Premium (4 comptes: 2 premium + 2 testeurs)
- 29.99 CAD/mois
- Corrections illimitées
- Exercices illimités
- **Comptes:** premium1@, premium2@, testeur1@, testeur2@

### Établissement (5 comptes: 2 établissement + 2 professeurs + 1 admin)
- Sur devis
- Toutes fonctionnalités
- Multi-utilisateurs
- **Comptes:** etablissement1@, etablissement2@, professeur1@, professeur2@, admin@

---

## 🎯 UTILISATION DES COMPTES

### Pour Tester les Fonctionnalités

#### Connexion Standard
```
URL: https://francais-fluide.vercel.app/auth/login
Email: etudiant1@francais-fluide.com
Password: Etudiant123!
```

#### Connexion Premium
```
URL: https://francais-fluide.vercel.app/auth/login
Email: premium1@francais-fluide.com
Password: Premium123!
```

#### Connexion Professeur
```
URL: https://francais-fluide.vercel.app/auth/login
Email: professeur1@francais-fluide.com
Password: Prof123!
```

#### Connexion Admin
```
URL: https://francais-fluide.vercel.app/admin/login
Email: admin@francais-fluide.com
Password: Admin123!
```

---

## 🔍 TESTER LES RESTRICTIONS

### Plan Étudiant (Quotas Limités)
**Tester avec:** etudiant1@ ou etudiant2@

**Quotas:**
- 100 corrections/jour
- 50 exercices/jour
- Assistant IA complet

**À tester:**
1. Faire 100 corrections → Quota atteint
2. Faire 50 exercices → Quota atteint
3. Tenter une 101ème correction → Blocage

### Plan Premium (Illimité)
**Tester avec:** premium1@ ou premium2@

**Quotas:**
- Corrections illimitées ✅
- Exercices illimités ✅
- Dictées premium ✅
- Priorité support ✅

**À tester:**
1. Corrections multiples → Pas de limite
2. Accès dictées premium
3. Chat IA illimité

### Plan Établissement (Tout + Multi-users)
**Tester avec:** etablissement1@ ou etablissement2@

**Features:**
- Tout Premium +
- Gestion multi-utilisateurs
- Tableau de bord admin
- API access

### Rôle Professeur
**Tester avec:** professeur1@ ou professeur2@

**Permissions spéciales:**
- Créer des exercices personnalisés
- Voir progression de tous les étudiants (si liés)
- Créer des groupes
- Assigner des exercices

### Rôle Testeur
**Tester avec:** testeur1@ ou testeur2@

**Permissions:**
- Accès à toutes les features
- Bypass des quotas (pour tests)
- Accès aux features beta
- Logs détaillés

---

## 🎮 SCÉNARIOS DE TEST

### Scénario 1: Nouveau Utilisateur Étudiant
```
1. Se connecter: etudiant1@francais-fluide.com
2. Visiter /dashboard
3. Essayer /editor → Devrait fonctionner
4. Essayer /exercises → Devrait fonctionner
5. Vérifier quotas restants
```

### Scénario 2: Utilisateur Premium
```
1. Se connecter: premium1@francais-fluide.com
2. Visiter /dissertation → Accès premium requis
3. Utiliser IA illimitée
4. Créer 100+ corrections → Pas de limite
```

### Scénario 3: Professeur
```
1. Se connecter: professeur1@francais-fluide.com
2. Créer un exercice personnalisé
3. Voir tableau de bord professeur
4. Gérer les étudiants
```

### Scénario 4: Établissement
```
1. Se connecter: etablissement1@francais-fluide.com
2. Accès à toutes les features
3. Voir analytics établissement
4. Gérer plusieurs utilisateurs
```

---

## 📊 PROGRESSION INITIALE

**Chaque compte a été créé avec:**
- Niveau aléatoire (1-5 pour users, 10 pour teachers)
- XP aléatoire (0-1000 pour users, 5000 pour teachers)
- Mots écrits: 0-5000
- Précision: 80-100%
- Exercices complétés: 0-50
- Série actuelle: 0-10 jours

**Cela simule des utilisateurs réels avec historique!**

---

## 🔄 CRÉER D'AUTRES COMPTES

### Script Disponible

```powershell
cd backend-francais-fluide
node create-test-accounts.js
```

**Ou pour en créer manuellement:**

```javascript
// Éditer create-test-accounts.js
// Ajouter dans testAccounts:
{
  name: 'Nouveau User',
  email: 'nouveau@francais-fluide.com',
  password: 'Password123!',
  role: 'user', // user, teacher, admin, super_admin, tester
  plan: 'premium', // demo, etudiant, premium, etablissement
  status: 'active' // active, pending, cancelled, expired
}
```

---

## ⚠️ SÉCURITÉ

### Pour la Production

**IMPORTANT:**

1. **Changez tous les mots de passe!**
   ```
   Admin123! → Mot de passe fort unique
   Test123! → Mot de passe fort unique
   etc.
   ```

2. **Supprimez les comptes de test**
   ```sql
   DELETE FROM users WHERE email LIKE '%@francais-fluide.com';
   ```

3. **Ou désactivez-les**
   ```sql
   UPDATE users SET isActive = false WHERE role = 'tester';
   ```

### Pour le Développement

**Ces comptes sont PARFAITS pour:**
- ✅ Tests locaux
- ✅ Démonstrations
- ✅ Validation des features
- ✅ Tests E2E
- ✅ Staging environment

---

## 📝 NOTES D'IMPLÉMENTATION

### Rôles Disponibles

```typescript
type UserRole = 
  | 'user'          // Utilisateur standard
  | 'teacher'       // Professeur (créer exercices, voir étudiants)
  | 'admin'         // Administrateur (gestion users/subscriptions)
  | 'super_admin'   // Super Admin (tout accès)
  | 'tester'        // Testeur (bypass quotas, beta features)
```

### Plans d'Abonnement

```typescript
type SubscriptionPlan = 
  | 'demo'           // Gratuit, limité
  | 'etudiant'       // 14.99 CAD/mois
  | 'premium'        // 29.99 CAD/mois
  | 'etablissement'  // Sur devis, multi-users
```

### Statuts d'Abonnement

```typescript
type SubscriptionStatus = 
  | 'active'    // Actif, toutes features
  | 'pending'   // En attente de paiement
  | 'cancelled' // Annulé, accès jusqu'à endDate
  | 'expired'   // Expiré, accès révoqué
```

---

## 🎯 PROCHAINES ÉTAPES

### 1. Pousser sur GitHub

```powershell
cd ..
git add backend-francais-fluide/create-test-accounts.js COMPTES_TEST_CREES.md
git commit -m "feat: Ajouter 10 comptes de test (testeurs, étudiants, premium, établissement, professeurs)"
git push origin main
```

### 2. Tester en Local

```powershell
# Démarrer le backend
cd backend-francais-fluide
npm run dev

# Démarrer le frontend (autre terminal)
cd frontend-francais-fluide
npm run dev

# Tester la connexion
# URL: http://localhost:3000/auth/login
# Utiliser un des comptes ci-dessus
```

### 3. Après Déploiement Render

**Les comptes seront disponibles en production!**

**⚠️ N'oubliez pas de:**
- Changer les mots de passe
- Ou supprimer les comptes de test
- Ou les désactiver

---

## 🎁 BONUS: SCRIPT NPM

Ajoutez dans `package.json`:

```json
"scripts": {
  ...
  "create-test-accounts": "node create-test-accounts.js"
}
```

**Puis:**
```powershell
npm run create-test-accounts
```

---

## 📊 BASE DE DONNÉES NEON

### État Actuel

```
Tables: 17 ✅
Achievements: 21 ✅
Users: 11 ✅
  - 1 super_admin
  - 2 teachers
  - 2 testers
  - 6 users (2 étudiants + 2 premium + 2 établissement)

Subscriptions: 11 ✅
  - 5 établissement (1 an)
  - 2 premium (1 mois)
  - 2 etudiant (1 mois)
  - 2 testeurs premium (1 mois)

User Progress: 11 ✅
  (Avec données aléatoires réalistes)
```

---

## 🎮 GUIDE DE TEST COMPLET

### Test 1: Connexion Basique
```
1. Aller sur: /auth/login
2. Email: etudiant1@francais-fluide.com
3. Password: Etudiant123!
4. Vérifier: Dashboard accessible
5. Vérifier: Quotas affichés (100 corrections, 50 exercices)
```

### Test 2: Features Premium
```
1. Connexion: premium1@francais-fluide.com / Premium123!
2. Aller sur: /dissertation
3. Vérifier: Accès autorisé
4. Tester: IA illimitée
5. Vérifier: Pas de quotas
```

### Test 3: Rôle Professeur
```
1. Connexion: professeur1@francais-fluide.com / Prof123!
2. Vérifier: Menu professeur visible
3. Créer: Exercice personnalisé
4. Accès: Toutes features établissement
```

### Test 4: Admin
```
1. Connexion: admin@francais-fluide.com / Admin123!
2. Aller sur: /admin
3. Voir: 11 utilisateurs dans la liste
4. Gérer: Subscriptions, support, etc.
```

---

## 🔒 SÉCURITÉ - IMPORTANT!

### ⚠️ EN PRODUCTION

**AVANT DE LANCER:**

1. **Changez TOUS les mots de passe**
   ```sql
   -- Via Prisma Studio ou SQL
   UPDATE users SET password = $hashedNewPassword WHERE email = '...';
   ```

2. **Ou supprimez les comptes de test**
   ```sql
   DELETE FROM users WHERE email LIKE '%@francais-fluide.com' 
   AND email NOT IN ('admin@francais-fluide.com');
   ```

3. **Ou désactivez-les**
   ```sql
   UPDATE users SET isActive = false 
   WHERE email LIKE '%@francais-fluide.com'
   AND role = 'tester';
   ```

---

## 📞 COMMANDES UTILES

### Voir tous les utilisateurs
```powershell
npx prisma studio
# Aller sur: Users
```

### Compter les utilisateurs par plan
```sql
SELECT plan, COUNT(*) as count
FROM subscriptions
GROUP BY plan;
```

### Compter par rôle
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### Supprimer un utilisateur
```javascript
await prisma.user.delete({
  where: { email: 'email@example.com' }
});
// Cascade: supprime aussi progress, subscription, etc.
```

---

## 🎉 RÉCAPITULATIF

### ✅ Ce qui a été créé

```
11 utilisateurs complets avec:
  - Authentification (email + password hashé)
  - Rôle approprié
  - Abonnement actif
  - Progression initiale (avec données)
  - Dates d'expiration
  
Tous stockés dans PostgreSQL Neon!
```

### 🔑 Accès Rapide

**Quick Copy-Paste pour Tester:**

```
Étudiant: etudiant1@francais-fluide.com / Etudiant123!
Premium: premium1@francais-fluide.com / Premium123!
Professeur: professeur1@francais-fluide.com / Prof123!
Admin: admin@francais-fluide.com / Admin123!
```

---

## 📚 DOCUMENTATION

Pour plus d'infos:
- `RAPPORT_ANALYSE_COMPLET.md` - Système d'abonnement détaillé
- `GUIDE_RAPIDE_DEPLOIEMENT.md` - Guide utilisateurs
- `SOLUTION_RENDER_FINALE.md` - Config backend

---

**Vos comptes de test sont prêts!** 🎉

**Testez maintenant sur:** https://francais-fluide.vercel.app

---

*Comptes créés le 3 octobre 2025*
*Base de données: PostgreSQL Neon*
*Tous les mots de passe: Changez-les en production!*

