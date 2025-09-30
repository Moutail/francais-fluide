# Documentation API - FrançaisFluide

Cette documentation décrit les APIs disponibles dans FrançaisFluide, incluant les endpoints REST, les types de données, et les exemples d'utilisation.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [API Grammaire](#api-grammaire)
- [API Exercices](#api-exercices)
- [API Progression](#api-progression)
- [API Utilisateurs](#api-utilisateurs)
- [API Collaboration](#api-collaboration)
- [Codes d'erreur](#codes-derreur)
- [Limites et quotas](#limites-et-quotas)
- [Exemples d'utilisation](#exemples-dutilisation)

## Vue d'ensemble

FrançaisFluide expose plusieurs APIs pour différentes fonctionnalités :

- **API Grammaire** : Correction et analyse grammaticale
- **API Exercices** : Gestion des exercices d'apprentissage
- **API Progression** : Suivi des progrès utilisateur
- **API Utilisateurs** : Gestion des profils et authentification
- **API Collaboration** : Fonctionnalités collaboratives en temps réel

### Base URL

```
Production: https://api.francais-fluide.com
Staging: https://staging-api.francais-fluide.com
Local: http://localhost:3000/api
```

### Format des réponses

Toutes les réponses utilisent le format JSON avec la structure suivante :

```json
{
  "success": true,
  "data": {},
  "error": null,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Authentification

### Authentification par token

La plupart des endpoints requièrent une authentification via token JWT dans l'en-tête Authorization :

```http
Authorization: Bearer <your-jwt-token>
```

### Endpoints d'authentification

#### POST /api/auth/login

Connecte un utilisateur existant.

**Requête :**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "user@example.com",
      "level": 2,
      "totalPoints": 150
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/signup

Crée un nouveau compte utilisateur.

**Requête :**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "user@example.com",
      "level": 1,
      "totalPoints": 0
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### POST /api/auth/refresh

Rafraîchit un token expiré.

**Requête :**

```json
{
  "refreshToken": "refresh-token-here"
}
```

#### POST /api/auth/logout

Déconnecte l'utilisateur actuel.

## API Grammaire

### POST /api/grammar

Analyse un texte pour détecter les erreurs grammaticales.

**Requête :**

```json
{
  "text": "il manger du pain",
  "options": {
    "level": "strict",
    "categories": ["grammar", "spelling"],
    "realTime": true
  }
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "text": "il manger du pain",
    "errors": [
      {
        "offset": 0,
        "length": 6,
        "message": "Le verbe \"manger\" n'est pas conjugué avec \"il\"",
        "replacements": ["mange"],
        "rule": {
          "id": "conjugaison-3p-singulier",
          "category": "grammar",
          "severity": "critical"
        },
        "context": {
          "text": "manger",
          "offset": 0,
          "length": 6
        }
      }
    ],
    "statistics": {
      "wordCount": 3,
      "sentenceCount": 1,
      "averageWordLength": 4.3,
      "averageSentenceLength": 3,
      "errorCount": 1,
      "errorDensity": 0.33,
      "errorsByCategory": {
        "grammar": 1
      },
      "readabilityScore": 85
    }
  }
}
```

### GET /api/grammar/rules

Récupère la liste des règles grammaticales disponibles.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "conjugaison-3p-singulier",
        "name": "Conjugaison 3ème personne singulier",
        "category": "grammar",
        "severity": "critical",
        "description": "Vérifie la conjugaison des verbes avec il/elle/on"
      }
    ]
  }
}
```

### POST /api/grammar/suggest

Suggère des améliorations de style et de clarté.

**Requête :**

```json
{
  "text": "Cette phrase est très longue et pourrait être divisée pour améliorer la lisibilité.",
  "type": "style"
}
```

## API Exercices

### GET /api/exercises

Récupère la liste des exercices disponibles.

**Paramètres de requête :**

- `category` : Filtre par catégorie (grammar, vocabulary, conjugation, spelling)
- `difficulty` : Filtre par difficulté (beginner, intermediate, advanced)
- `limit` : Nombre d'exercices à retourner (défaut: 20)
- `offset` : Décalage pour la pagination (défaut: 0)

**Réponse :**

```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "exercise-123",
        "title": "Conjugaison des verbes en -er",
        "description": "Conjuguez les verbes suivants avec il/elle/on",
        "category": "grammar",
        "difficulty": "beginner",
        "estimatedDuration": 300,
        "questionCount": 10,
        "points": 50
      }
    ],
    "pagination": {
      "total": 100,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### GET /api/exercises/:id

Récupère un exercice spécifique.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "exercise-123",
    "title": "Conjugaison des verbes en -er",
    "description": "Conjuguez les verbes suivants avec il/elle/on",
    "category": "grammar",
    "difficulty": "beginner",
    "estimatedDuration": 300,
    "questions": [
      {
        "id": "question-1",
        "type": "conjugation",
        "text": "Conjuguez \"manger\" avec \"il\"",
        "correctAnswer": "mange",
        "options": ["mange", "manger", "mangé", "mangent"]
      }
    ]
  }
}
```

### POST /api/exercises/:id/submit

Soumet les réponses d'un exercice.

**Requête :**

```json
{
  "answers": [
    {
      "questionId": "question-1",
      "answer": "mange",
      "timeSpent": 15
    }
  ],
  "totalTime": 300
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "score": 85,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "timeSpent": 300,
    "feedback": [
      {
        "questionId": "question-1",
        "correct": true,
        "userAnswer": "mange",
        "correctAnswer": "mange",
        "explanation": "Correct ! \"Il mange\" est la bonne conjugaison."
      }
    ],
    "achievements": [
      {
        "id": "achievement-123",
        "name": "Premier exercice",
        "description": "Vous avez complété votre premier exercice !",
        "points": 25
      }
    ]
  }
}
```

## API Progression

### GET /api/progress

Récupère la progression de l'utilisateur connecté.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "totalPoints": 150,
    "currentLevel": 2,
    "pointsToNextLevel": 150,
    "streakDays": 3,
    "perfectStreak": 2,
    "accuracyRate": 85,
    "statistics": {
      "wordsWritten": 500,
      "exercisesCompleted": 15,
      "errorsCorrected": 25,
      "achievementsUnlocked": 3
    },
    "weeklyProgress": [
      {
        "date": "2024-01-01",
        "points": 20,
        "exercises": 2,
        "words": 100
      }
    ]
  }
}
```

### POST /api/progress/update

Met à jour la progression de l'utilisateur.

**Requête :**

```json
{
  "event": {
    "type": "word_written",
    "points": 1,
    "metadata": {
      "wordCount": 10,
      "accuracy": 95
    }
  }
}
```

### GET /api/progress/analytics

Récupère les analytics détaillés de progression.

**Paramètres de requête :**

- `period` : Période (week, month, year)
- `category` : Catégorie d'exercice

**Réponse :**

```json
{
  "success": true,
  "data": {
    "period": "week",
    "summary": {
      "totalPoints": 150,
      "exercisesCompleted": 15,
      "averageAccuracy": 85,
      "timeSpent": 1800
    },
    "dailyProgress": [
      {
        "date": "2024-01-01",
        "points": 20,
        "exercises": 2,
        "accuracy": 90
      }
    ],
    "categoryBreakdown": {
      "grammar": {
        "exercises": 8,
        "accuracy": 85,
        "points": 80
      },
      "vocabulary": {
        "exercises": 7,
        "accuracy": 90,
        "points": 70
      }
    }
  }
}
```

## API Utilisateurs

### GET /api/users/profile

Récupère le profil de l'utilisateur connecté.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "level": 2,
    "totalPoints": 150,
    "preferences": {
      "language": "fr",
      "theme": "light",
      "notifications": true,
      "correctionLevel": "strict"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T12:00:00Z"
  }
}
```

### PUT /api/users/profile

Met à jour le profil de l'utilisateur.

**Requête :**

```json
{
  "name": "John Doe Updated",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

### GET /api/users/achievements

Récupère les achievements de l'utilisateur.

**Réponse :**

```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "achievement-123",
        "name": "Premier pas",
        "description": "Vous avez écrit vos premiers mots !",
        "icon": "🌟",
        "points": 10,
        "unlockedAt": "2024-01-01T10:00:00Z"
      }
    ],
    "totalUnlocked": 3,
    "totalAvailable": 50
  }
}
```

## API Collaboration

### WebSocket /ws/collaboration

Endpoint WebSocket pour la collaboration en temps réel.

**Messages entrants :**

```json
{
  "type": "join_room",
  "roomId": "room-123",
  "userId": "user-123"
}
```

```json
{
  "type": "text_change",
  "roomId": "room-123",
  "userId": "user-123",
  "content": "Nouveau contenu",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Messages sortants :**

```json
{
  "type": "user_joined",
  "roomId": "room-123",
  "user": {
    "id": "user-456",
    "name": "Jane Doe"
  }
}
```

```json
{
  "type": "text_changed",
  "roomId": "room-123",
  "userId": "user-456",
  "content": "Contenu modifié",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /api/collaboration/rooms

Crée une nouvelle salle de collaboration.

**Requête :**

```json
{
  "name": "Salle de travail",
  "description": "Collaboration sur un projet",
  "isPublic": false
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "roomId": "room-123",
    "name": "Salle de travail",
    "description": "Collaboration sur un projet",
    "isPublic": false,
    "createdBy": "user-123",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

## Codes d'erreur

### Codes HTTP

- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non autorisé
- `403` - Interdit
- `404` - Non trouvé
- `429` - Trop de requêtes
- `500` - Erreur serveur

### Codes d'erreur personnalisés

```json
{
  "success": false,
  "error": {
    "code": "GRAMMAR_ANALYSIS_FAILED",
    "message": "L'analyse grammaticale a échoué",
    "details": {
      "text": "Texte problématique",
      "reason": "Texte trop long"
    }
  }
}
```

**Codes d'erreur courants :**

- `INVALID_TOKEN` - Token JWT invalide ou expiré
- `USER_NOT_FOUND` - Utilisateur non trouvé
- `EXERCISE_NOT_FOUND` - Exercice non trouvé
- `GRAMMAR_ANALYSIS_FAILED` - Échec de l'analyse grammaticale
- `RATE_LIMIT_EXCEEDED` - Limite de taux dépassée
- `VALIDATION_ERROR` - Erreur de validation des données

## Limites et quotas

### Limites par utilisateur

- **Analyse grammaticale** : 1000 requêtes/heure
- **Exercices** : 50 exercices/jour
- **Collaboration** : 10 salles simultanées
- **Taille de texte** : 10,000 caractères maximum

### Limites par IP

- **Requêtes API** : 10,000/heure
- **Authentification** : 100 tentatives/heure

### Headers de quota

Les réponses incluent des headers d'information sur les quotas :

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Exemples d'utilisation

### JavaScript/TypeScript

```typescript
// Configuration de l'API
const API_BASE = 'https://api.francais-fluide.com';

class FrancaisFluideAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async analyzeGrammar(text: string) {
    const response = await fetch(`${API_BASE}/grammar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ text }),
    });

    return response.json();
  }

  async getExercises(category?: string) {
    const url = new URL(`${API_BASE}/exercises`);
    if (category) url.searchParams.set('category', category);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    return response.json();
  }
}

// Utilisation
const api = new FrancaisFluideAPI('your-jwt-token');

// Analyser un texte
const result = await api.analyzeGrammar('il manger du pain');
console.log(result.data.errors);

// Récupérer les exercices
const exercises = await api.getExercises('grammar');
console.log(exercises.data.exercises);
```

### Python

```python
import requests

class FrancaisFluideAPI:
    def __init__(self, token):
        self.base_url = 'https://api.francais-fluide.com'
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def analyze_grammar(self, text):
        response = requests.post(
            f'{self.base_url}/grammar',
            headers=self.headers,
            json={'text': text}
        )
        return response.json()

    def get_exercises(self, category=None):
        params = {}
        if category:
            params['category'] = category

        response = requests.get(
            f'{self.base_url}/exercises',
            headers=self.headers,
            params=params
        )
        return response.json()

# Utilisation
api = FrancaisFluideAPI('your-jwt-token')

# Analyser un texte
result = api.analyze_grammar('il manger du pain')
print(result['data']['errors'])

# Récupérer les exercices
exercises = api.get_exercises('grammar')
print(exercises['data']['exercises'])
```

### cURL

```bash
# Analyser un texte
curl -X POST https://api.francais-fluide.com/grammar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{"text": "il manger du pain"}'

# Récupérer les exercices
curl -X GET "https://api.francais-fluide.com/exercises?category=grammar" \
  -H "Authorization: Bearer your-jwt-token"

# Se connecter
curl -X POST https://api.francais-fluide.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Support et contact

Pour toute question sur l'API :

- **Documentation** : [docs.francais-fluide.com](https://docs.francais-fluide.com)
- **Support** : [support@francais-fluide.com](mailto:support@francais-fluide.com)
- **GitHub** : [github.com/francais-fluide/api](https://github.com/francais-fluide/api)
- **Discord** : [discord.gg/francais-fluide](https://discord.gg/francais-fluide)

---

_Cette documentation est mise à jour régulièrement. Dernière mise à jour : 2024-01-01_
