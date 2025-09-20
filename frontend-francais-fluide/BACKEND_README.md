# Backend de Correction Grammaticale - FrançaisFluide

## 🎯 Vue d'ensemble

Le backend de correction grammaticale de FrançaisFluide est un système robuste et performant qui combine détection locale avancée et intégration LanguageTool pour offrir une correction grammaticale complète du français.

## 🚀 Démarrage Rapide

### 1. Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### 2. Test de l'API

```bash
# Tester l'API de correction grammaticale
npm run test:grammar

# Tester le service backend
npm run test:backend
```

### 3. Exemples d'utilisation

```bash
# Exécuter les exemples
npx tsx examples/grammar-backend-usage.ts
```

## 📡 API Endpoints

### POST /api/grammar

Corriger un texte en français.

**Requête :**
```json
{
  "text": "Une belle maison et un grande jardin",
  "action": "analyze",
  "useLanguageTool": true,
  "maxErrors": 50
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "text": "Une belle maison et un grande jardin",
      "errors": [
        {
          "offset": 25,
          "length": 6,
          "message": "L'adjectif \"grande\" devrait s'accorder avec le nom masculin \"jardin\"",
          "replacements": ["grand"],
          "rule": {
            "id": "accord-adjectif-nom",
            "category": "grammar",
            "severity": "critical"
          }
        }
      ],
      "statistics": {
        "wordCount": 6,
        "errorCount": 1,
        "readabilityScore": 83
      }
    },
    "metrics": {
      "wordCount": 6,
      "errorCount": 1,
      "accuracy": 83,
      "cacheSize": 15,
      "rateLimitRemaining": 9
    }
  }
}
```

### GET /api/grammar

Obtenir les informations sur l'API.

### DELETE /api/grammar

Vider le cache.

## 🧪 Tests

### Tests Automatiques

```bash
# Tests de l'API
npm run test:grammar

# Tests du service backend
npm run test:backend
```

### Tests Manuels

```bash
# Test avec curl
curl -X POST http://localhost:3000/api/grammar \
  -H "Content-Type: application/json" \
  -d '{"text": "Une belle maison et un grande jardin", "action": "analyze"}'
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Configuration LanguageTool
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
LANGUAGETOOL_TIMEOUT=5000

# Configuration du cache
CACHE_TTL=300000
MAX_CACHE_SIZE=1000

# Configuration du rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### Configuration du Service

```typescript
import { GrammarBackendService } from '@/lib/grammar/backend-service';

const service = new GrammarBackendService({
  enableLanguageTool: true,
  enableCaching: true,
  maxTextLength: 10000,
  cacheTTL: 5 * 60 * 1000,
  rateLimitWindow: 60 * 1000,
  rateLimitMaxRequests: 10
});
```

## 📊 Fonctionnalités

### 1. Détection Locale Avancée

- **25+ règles de grammaire** françaises
- **Concordance des temps** et subjonctif
- **Participes passés complexes**
- **Barbarismes et anglicismes**
- **Pléonasmes et redondances**

### 2. Intégration LanguageTool

- **API gratuite** LanguageTool
- **Fallback** pour une couverture complète
- **Cache** des résultats
- **Timeout** de 5 secondes

### 3. Système de Cache

- **Cache en mémoire** Redis-like
- **TTL** de 5 minutes
- **Nettoyage automatique**
- **Métriques** de performance

### 4. Rate Limiting

- **10 requêtes/minute** par IP
- **Fenêtre glissante** de 60 secondes
- **Headers HTTP** informatifs
- **Gestion gracieuse** des dépassements

## 🚨 Gestion d'Erreurs

### Types d'Erreurs

1. **Validation** (400) : Texte invalide, trop long
2. **Rate Limiting** (429) : Trop de requêtes
3. **Serveur** (500) : Erreurs internes

### Exemples de Gestion

```typescript
try {
  const result = await grammarBackendService.analyzeText(text);
  // Traiter le résultat
} catch (error) {
  if (error.message.includes('Rate limit exceeded')) {
    // Gérer le rate limiting
  } else if (error.message.includes('Text too long')) {
    // Gérer le texte trop long
  } else {
    // Gérer les autres erreurs
  }
}
```

## 📈 Performance

### Benchmarks

- **Détection locale** : ~10-50ms
- **Avec LanguageTool** : ~100-500ms
- **Cache hit** : ~1-5ms
- **Throughput** : ~10 req/min par IP

### Optimisations

- **Cache en mémoire** pour éviter les recalculs
- **Rate limiting** pour protéger les ressources
- **Timeout** sur les appels externes
- **Débounce** côté client

## 🔒 Sécurité

### Mesures Implémentées

- **Rate limiting** par IP
- **Validation** stricte des entrées
- **Timeout** sur les appels externes
- **Sanitisation** des données

### Recommandations

- Utiliser HTTPS en production
- Implémenter l'authentification si nécessaire
- Monitorer les métriques de performance
- Configurer des alertes pour les erreurs

## 🚀 Déploiement

### Prérequis

- Node.js 18+
- Next.js 13+
- Accès à l'API LanguageTool

### Étapes

1. **Installation**
   ```bash
   npm install
   ```

2. **Configuration**
   ```bash
   cp .env.example .env.local
   # Modifier les variables d'environnement
   ```

3. **Test**
   ```bash
   npm run test:grammar
   ```

4. **Déploiement**
   ```bash
   npm run build
   npm start
   ```

## 📚 Documentation

### Règles de Grammaire

- [Documentation complète](GRAMMAR_BACKEND.md)
- [Exemples d'utilisation](examples/grammar-backend-usage.ts)
- [Tests automatisés](src/lib/grammar/test-backend.ts)

### API Reference

- **POST /api/grammar** : Correction grammaticale
- **GET /api/grammar** : Informations sur l'API
- **DELETE /api/grammar** : Vider le cache

## 🤝 Contribution

### Ajouter une Nouvelle Règle

1. **Définir la règle** dans `ADVANCED_GRAMMAR_RULES`
2. **Tester** avec des exemples
3. **Documenter** la règle
4. **Ajouter** des tests

### Exemple

```typescript
const newRule = {
  id: 'ma-nouvelle-regle',
  category: 'grammar',
  severity: 'warning',
  pattern: /\bpattern\b/gi,
  check: (match: RegExpExecArray) => {
    return {
      message: 'Message d\'erreur',
      suggestions: ['suggestion1', 'suggestion2']
    };
  }
};
```

## 📞 Support

### Problèmes Courants

1. **Rate limiting** : Attendre 1 minute
2. **LanguageTool indisponible** : Utiliser la détection locale
3. **Cache plein** : Vider le cache avec DELETE /api/grammar

### Debug

```typescript
// Activer les logs
console.log('Cache size:', grammarBackendService.getCacheSize());
console.log('Rate limit:', grammarBackendService.getRateLimitRemaining('127.0.0.1'));

// Vider le cache
grammarBackendService.clearCache();
```

---

**Fait avec ❤️ pour améliorer l'apprentissage du français**
