# 🧪 Guide des Tests - FrançaisFluide Backend

## Scripts de Test Disponibles

### 1. Test Complet
```bash
npm run test:all
```
Lance tous les tests (base de données + authentification)

### 2. Test Base de Données
```bash
npm run test:db
```
Teste la connexion et l'intégrité de la base de données

### 3. Test Authentification
```bash
npm run test:auth
```
Teste l'authentification end-to-end (inscription, connexion, profil)

## Prérequis

1. **Serveur démarré** : Le backend doit tourner sur le port 3001
   ```bash
   npm run dev
   ```

2. **Base de données configurée** :
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. **Variables d'environnement** : Fichier `.env` configuré avec :
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=3001`

## Tests Effectués

### Tests Base de Données ✅
- Connexion à la base de données
- Vérification des tables (users, exercises, achievements)
- Test des relations entre tables
- Test d'écriture (création/suppression)
- Validation des contraintes d'unicité

### Tests Authentification ✅
- Santé du serveur (`/health`)
- Inscription utilisateur (`/api/auth/register`)
- Récupération profil (`/api/auth/me`)
- Refresh token (`/api/auth/refresh`)
- Connexion utilisateur (`/api/auth/login`)
- Protection des routes
- Validation des tokens invalides

## Résultats Attendus

### ✅ Succès
```
🎉 DIAGNOSTIC COMPLET TERMINÉ AVEC SUCCÈS !
✅ Base de données: OK
✅ Authentification: OK
✅ API: OK

🚀 Votre backend est prêt à être utilisé !
```

### ❌ Échec
Le script s'arrête à la première erreur et affiche :
- Le message d'erreur détaillé
- Les actions recommandées pour corriger

## Dépannage

### Erreur de Base de Données
```bash
# Régénérer le client Prisma
npm run db:generate

# Synchroniser le schéma
npm run db:push

# Optionnel: Ajouter des données de test
npm run db:seed
```

### Erreur de Connexion API
```bash
# Vérifier que le serveur tourne
npm run dev

# Vérifier les logs
npm run logs
```

### Erreur JWT
Vérifiez que `JWT_SECRET` est défini dans `.env`

## Utilisation en CI/CD

Ces scripts peuvent être intégrés dans votre pipeline CI/CD :

```yaml
# .github/workflows/test.yml
- name: Test Backend
  run: |
    cd backend-francais-fluide
    npm install
    npm run db:generate
    npm run db:push
    npm run dev &
    sleep 5
    npm run test:all
```
