# Backend de Correction Grammaticale - FrançaisFluide

## 🎯 Vue d'ensemble

Le backend de correction grammaticale de FrançaisFluide est un système robuste qui combine :

- **Détection locale** avec des règles de grammaire françaises avancées
- **Intégration LanguageTool** comme fallback pour une couverture complète
- **Cache en mémoire** pour optimiser les performances
- **Rate limiting** pour protéger l'API
- **Gestion d'erreurs** complète

## 🏗️ Architecture

```
src/app/api/grammar/route.ts          # Route API principale
src/lib/grammar/backend-service.ts    # Service backend principal
src/lib/grammar/detector.ts           # Détecteur local existant
src/lib/grammar/test-backend.ts       # Tests du service
test-grammar-api.js                   # Tests de l'API
```

## 🚀 Fonctionnalités

### 1. Détection Locale Avancée

#### Règles de Grammaire Implémentées

**Concordance des Temps**

- Détection des erreurs de concordance après les conjonctions temporelles
- Correction des temps inappropriés dans les subordonnées

**Subjonctif**

- Détection des expressions nécessitant le subjonctif
- Suggestions de conjugaisons correctes

**Participes Passés Complexes**

- Gestion des accords avec "avoir" et "être"
- Détection des erreurs d'accord complexes

**Barbarismes et Anglicismes**

- Détection des expressions incorrectes courantes
- Suggestions d'alternatives françaises

**Pléonasmes**

- Identification des redondances ("monter en haut", "sortir dehors")
- Suggestions de formulations plus concises

### 2. Intégration LanguageTool

- **API gratuite** LanguageTool comme fallback
- **Timeout** de 5 secondes pour éviter les blocages
- **Cache** des résultats pour optimiser les performances
- **Gestion d'erreurs** robuste

### 3. Système de Cache

- **Cache en mémoire** Redis-like
- **TTL** de 5 minutes par défaut
- **Clé de cache** basée sur le texte et les options
- **Nettoyage automatique** des entrées expirées

### 4. Rate Limiting

- **Limite** de 10 requêtes par minute par IP
- **Fenêtre glissante** de 60 secondes
- **Headers HTTP** pour informer le client
- **Gestion gracieuse** des dépassements

## 📡 API Endpoints

### POST /api/grammar

**Correction grammaticale d'un texte**

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
          },
          "context": {
            "text": "jardin",
            "offset": 25,
            "length": 6
          }
        }
      ],
      "statistics": {
        "wordCount": 6,
        "sentenceCount": 1,
        "averageWordLength": 5.2,
        "averageSentenceLength": 6,
        "errorCount": 1,
        "errorDensity": 0.167,
        "errorsByCategory": {
          "grammar": 1
        },
        "readabilityScore": 83
      }
    },
    "metrics": {
      "wordCount": 6,
      "errorCount": 1,
      "errorDensity": 0.167,
      "accuracy": 83,
      "cacheSize": 15,
      "rateLimitRemaining": 9
    }
  }
}
```

### GET /api/grammar

**Informations sur l'API**

```json
{
  "success": true,
  "data": {
    "version": "2.0.0",
    "supportedLanguages": ["fr"],
    "maxTextLength": 10000,
    "features": {
      "localDetection": true,
      "languageToolIntegration": true,
      "caching": true,
      "rateLimiting": true,
      "advancedGrammarRules": true
    },
    "cache": {
      "size": 15
    },
    "grammarRules": {
      "total": 25,
      "categories": ["grammar", "spelling", "punctuation", "style"],
      "advanced": [
        "Concordance des temps",
        "Subjonctif",
        "Participes passés complexes",
        "Barbarismes courants",
        "Anglicismes",
        "Pléonasmes",
        "Conjonctions et connecteurs"
      ]
    }
  }
}
```

### DELETE /api/grammar

**Vider le cache**

```json
{
  "success": true,
  "message": "Cache vidé avec succès"
}
```

## 🧪 Tests

### Tests du Service Backend

```typescript
import { runAllTests } from '@/lib/grammar/test-backend';

// Exécuter tous les tests
const results = await runAllTests();
console.log(`Tests passés: ${results.grammar.passed}/${results.grammar.total}`);
```

### Tests de l'API

```bash
# Démarrer le serveur de développement
npm run dev

# Dans un autre terminal, exécuter les tests
node test-grammar-api.js
```

## ⚙️ Configuration

### Service Backend

```typescript
const config = {
  enableLanguageTool: true, // Activer LanguageTool
  enableCaching: true, // Activer le cache
  maxTextLength: 10000, // Longueur max du texte
  cacheTTL: 5 * 60 * 1000, // TTL du cache (5 min)
  rateLimitWindow: 60 * 1000, // Fenêtre de rate limiting (1 min)
  rateLimitMaxRequests: 10, // Max requêtes par fenêtre
};

const service = new GrammarBackendService(config);
```

### Variables d'Environnement

```env
# Optionnel : Configuration LanguageTool
LANGUAGETOOL_API_URL=https://api.languagetool.org/v2/check
LANGUAGETOOL_TIMEOUT=5000

# Optionnel : Configuration du cache
CACHE_TTL=300000
MAX_CACHE_SIZE=1000

# Optionnel : Configuration du rate limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## 📊 Métriques et Monitoring

### Métriques Disponibles

- **wordCount** : Nombre de mots analysés
- **errorCount** : Nombre d'erreurs détectées
- **errorDensity** : Densité d'erreurs (erreurs/mots)
- **accuracy** : Précision du texte (0-100%)
- **cacheSize** : Taille du cache
- **rateLimitRemaining** : Requêtes restantes

### Headers HTTP

- `X-RateLimit-Remaining` : Requêtes restantes
- `X-Cache-Size` : Taille du cache
- `Retry-After` : Délai avant retry (en cas de rate limiting)

## 🔧 Développement

### Ajouter une Nouvelle Règle

```typescript
const newRule = {
  id: 'ma-nouvelle-regle',
  category: 'grammar',
  severity: 'warning',
  pattern: /\bpattern\b/gi,
  check: (match: RegExpExecArray) => {
    // Logique de vérification
    return {
      message: "Message d'erreur",
      suggestions: ['suggestion1', 'suggestion2'],
    };
  },
};

// Ajouter à ADVANCED_GRAMMAR_RULES
```

### Débogage

```typescript
// Activer les logs détaillés
console.log('Cache size:', grammarBackendService.getCacheSize());
console.log('Rate limit remaining:', grammarBackendService.getRateLimitRemaining('127.0.0.1'));

// Vider le cache
grammarBackendService.clearCache();
```

## 🚨 Gestion d'Erreurs

### Types d'Erreurs

1. **Validation** : Texte invalide, trop long, etc.
2. **Rate Limiting** : Trop de requêtes
3. **LanguageTool** : API indisponible
4. **Serveur** : Erreurs internes

### Codes de Statut HTTP

- `200` : Succès
- `400` : Erreur de validation
- `429` : Rate limiting
- `500` : Erreur serveur

## 📈 Performance

### Optimisations

- **Cache en mémoire** pour éviter les recalculs
- **Rate limiting** pour protéger les ressources
- **Timeout** sur les appels externes
- **Débounce** côté client

### Benchmarks

- **Détection locale** : ~10-50ms
- **Avec LanguageTool** : ~100-500ms
- **Cache hit** : ~1-5ms
- **Throughput** : ~10 req/min par IP

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

1. Installer les dépendances
2. Configurer les variables d'environnement
3. Tester l'API localement
4. Déployer en production
5. Monitorer les performances

---

**Fait avec ❤️ pour améliorer l'apprentissage du français**
