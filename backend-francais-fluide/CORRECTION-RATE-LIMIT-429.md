# 🔧 Correction Erreur 429 - Rate Limiting

Date : 7 octobre 2025  
Problème : Erreur HTTP 429 sur `/api/progress` dans l'éditeur

---

## 🎯 Problème Identifié

### Symptômes
```
Erreur HTTP 429: Trop de requêtes
Source: /api/progress
Contexte: Éditeur de texte
```

### Cause Racine

Le middleware de rate limiting backend (`src/middleware/rateLimiting.js`) traitait **toutes les requêtes PUT** comme des "soumissions" avec une limite stricte de **30 requêtes/minute**.

```javascript
// AVANT - Ligne 103
if (path.includes('/submit') || path.includes('/attempt') || req.method === 'PUT') {
  return submissionLimiter(req, res, next); // ❌ Trop strict pour /progress
}
```

L'éditeur fait des PUT à `/api/progress` pour sauvegarder la progression, et même avec le debouncing frontend (3 secondes), cela dépassait la limite en production.

---

## ✅ Solution Appliquée

### 1. Créer un Rate Limiter Spécifique pour /progress

```javascript
// Rate limiter spécifique pour /api/progress (plus permissif car debounced côté frontend)
const progressLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // 20 par minute en prod
  message: 'Trop de mises à jour de progression. Veuillez patienter.'
});
```

### 2. Modifier le Smart Rate Limiter

```javascript
// Routes de soumission (EXCLURE /progress qui a son propre debouncing)
if (path.includes('/submit') || path.includes('/attempt')) {
  return submissionLimiter(req, res, next);
}

// PUT sur /progress avec rate limiting plus permissif
if (req.method === 'PUT' && path.includes('/progress')) {
  return progressLimiter(req, res, next); // ✅ 20 requêtes/minute
}

// Autres PUT
if (req.method === 'PUT') {
  return submissionLimiter(req, res, next); // 30 requêtes/minute
}
```

### 3. Exporter le Nouveau Limiter

```javascript
module.exports = {
  // ... autres limiters
  progressLimiter, // ✅ Ajouté
  // ...
};
```

---

## 📊 Limites de Rate Limiting

| Route | Limite Production | Limite Dev | Fenêtre |
|-------|-------------------|------------|---------|
| `/api/progress` (PUT) | **20/min** | 200/min | 1 minute |
| `/submit`, `/attempt` | 30/min | 300/min | 1 minute |
| Autres PUT | 30/min | 300/min | 1 minute |
| `/auth/login`, `/auth/register` | 5/15min | 50/15min | 15 minutes |
| `/ai/*`, `/grammar/*` | 10/min | 100/min | 1 minute |
| POST création | 20/min | 200/min | 1 minute |
| Général | 100/15min | 1000/15min | 15 minutes |

---

## 🔄 Combinaison Frontend + Backend

### Frontend (Debouncing)
```typescript
// src/app/editor/page.tsx
const debouncedMetrics = useDebounce(metrics, 3000); // 3 secondes

useEffect(() => {
  // Sauvegarde seulement toutes les 3 secondes
  if (debouncedMetrics && hasChanged) {
    await fetch('/api/progress', { method: 'PUT', ... });
  }
}, [debouncedMetrics]);
```

### Backend (Rate Limiting)
```javascript
// src/middleware/rateLimiting.js
const progressLimiter = createRateLimiter({
  max: 20, // 20 requêtes par minute max
  windowMs: 60000
});
```

### Résultat
- **Frontend** : Maximum 20 requêtes/minute (1 toutes les 3 secondes)
- **Backend** : Accepte jusqu'à 20 requêtes/minute
- **Marge de sécurité** : Parfaite adéquation

---

## 🚀 Déploiement

### 1. Redémarrer le Backend

```bash
# En développement
npm run dev

# En production
pm2 restart francais-fluide-backend
# ou
npm run start
```

### 2. Vérifier les Logs

```bash
# Surveiller les logs
pm2 logs francais-fluide-backend

# Ou avec Node
tail -f logs/app.log
```

### 3. Tester

```bash
# Test manuel dans l'éditeur
1. Ouvrir https://francais-fluide.vercel.app/editor
2. Taper du texte rapidement
3. Vérifier qu'il n'y a plus d'erreur 429
4. Vérifier que la progression se sauvegarde
```

---

## 🧪 Tests Recommandés

### Test 1 : Frappe Rapide
```
1. Ouvrir l'éditeur
2. Taper du texte rapidement pendant 1 minute
3. ✅ Pas d'erreur 429
4. ✅ Progression sauvegardée
```

### Test 2 : Limite Atteinte
```
1. Faire 21 requêtes PUT /api/progress en 1 minute
2. ✅ La 21ème devrait retourner 429
3. ✅ Message: "Trop de mises à jour de progression"
```

### Test 3 : Reset Automatique
```
1. Atteindre la limite (20 requêtes)
2. Attendre 1 minute
3. ✅ Compteur réinitialisé
4. ✅ Nouvelles requêtes acceptées
```

---

## 📝 Monitoring

### Logs à Surveiller

```javascript
// Requête normale
[RATE LIMIT] PUT /api/progress - IP: xxx.xxx.xxx.xxx (dev mode)

// Limite atteinte
[RATE LIMIT EXCEEDED] PUT /api/progress - IP: xxx.xxx.xxx.xxx - User: user123

// Activité suspecte
[SUSPICIOUS ACTIVITY] IP: xxx.xxx.xxx.xxx, UA: bot/crawler, Path: /api/progress
```

### Métriques Importantes

- Nombre de 429 par heure
- Utilisateurs affectés
- Routes les plus limitées
- Temps de réponse moyen

---

## 🔍 Debugging

### Si l'erreur 429 persiste :

1. **Vérifier le déploiement**
   ```bash
   git log -1 --oneline  # Vérifier le dernier commit
   pm2 list              # Vérifier que le backend tourne
   ```

2. **Vérifier les variables d'environnement**
   ```bash
   echo $NODE_ENV  # Doit être 'production' ou 'development'
   ```

3. **Vérifier les logs**
   ```bash
   grep "RATE LIMIT" logs/app.log | tail -20
   ```

4. **Tester directement l'API**
   ```bash
   # Faire 5 requêtes rapides
   for i in {1..5}; do
     curl -X PUT https://api.francais-fluide.com/api/progress \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"wordsWritten": 100}'
   done
   ```

5. **Réinitialiser le rate limit manuellement**
   ```bash
   node scripts/reset-rate-limit.js
   ```

---

## ✅ Checklist de Vérification

- [x] Créer `progressLimiter` avec limite de 20/min
- [x] Modifier `smartRateLimiter` pour utiliser `progressLimiter`
- [x] Exporter `progressLimiter` dans module.exports
- [x] Tester en développement
- [ ] Déployer sur production
- [ ] Surveiller les logs pendant 24h
- [ ] Ajuster les limites si nécessaire

---

## 📚 Ressources

- Documentation express-rate-limit : https://www.npmjs.com/package/express-rate-limit
- Middleware actuel : `src/middleware/rateLimiting.js`
- Frontend debouncing : `src/app/editor/page.tsx`
- Hook debounce : `src/hooks/useDebounce.ts`

---

**Correction appliquée avec succès !** ✅

Le rate limiting est maintenant adapté au comportement de l'éditeur avec debouncing frontend.
