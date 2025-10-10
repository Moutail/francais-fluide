# ✅ Configuration IA - OpenAI + Anthropic

Date : 10 octobre 2025  
Statut : **Clés API Configurées**

---

## 🎯 Configuration Actuelle

### Clés API Définies

```env
# Provider par défaut
AI_PROVIDER=openai

# OpenAI (GPT-4)
OPENAI_API_KEY=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

# Anthropic (Claude)
ANTHROPIC_API_KEY=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
```

---

## 🤖 Modèles Disponibles

### OpenAI

| Modèle | Utilisation | Coût | Performance |
|--------|-------------|------|-------------|
| **gpt-4** | Textes complexes, créativité | $$$ | ⭐⭐⭐⭐⭐ |
| **gpt-4-turbo** | Équilibré rapidité/qualité | $$ | ⭐⭐⭐⭐ |
| **gpt-3.5-turbo** | Exercices simples | $ | ⭐⭐⭐ |

### Anthropic

| Modèle | Utilisation | Coût | Performance |
|--------|-------------|------|-------------|
| **claude-3-opus** | Grammaire, précision | $$$ | ⭐⭐⭐⭐⭐ |
| **claude-3-sonnet** | Équilibré (recommandé) | $$ | ⭐⭐⭐⭐ |
| **claude-3-haiku** | Rapide, économique | $ | ⭐⭐⭐ |

---

## 💡 Stratégie d'Utilisation

### Utilisez OpenAI GPT-4 Pour

✅ **Textes littéraires créatifs**
```typescript
{
  type: 'text',
  theme: 'nature',
  style: 'descriptif',
  provider: 'openai',
  model: 'gpt-4'
}
```

✅ **Histoires et narrations**
```typescript
{
  type: 'storytelling',
  genre: 'aventure',
  length: 200,
  provider: 'openai'
}
```

✅ **Dialogues naturels**
```typescript
{
  type: 'dialogue',
  context: 'restaurant',
  level: 'intermediate'
}
```

### Utilisez Anthropic Claude Pour

✅ **Exercices de grammaire**
```typescript
{
  type: 'grammar',
  focus: ['subjonctif', 'accords'],
  provider: 'anthropic',
  model: 'claude-3-sonnet'
}
```

✅ **Corrections de style**
```typescript
{
  type: 'correction',
  focus: ['anglicismes', 'pléonasmes'],
  provider: 'anthropic'
}
```

✅ **Explications pédagogiques**
```typescript
{
  type: 'explanation',
  concept: 'subjonctif',
  level: 'intermediate'
}
```

---

## 🧪 Test de Configuration

### Script de Test Créé

Un script `test-ai-keys.js` a été créé pour vérifier vos clés API :

```bash
cd backend-francais-fluide
node test-ai-keys.js
```

**Résultat attendu** :
```
═══════════════════════════════════════════════════
   Test des Clés API - Français Fluide
═══════════════════════════════════════════════════

🔍 Test OpenAI API...
✅ OPENAI_API_KEY définie
   Clé : sk-proj-ofh0IIv_cJOh...
✅ OpenAI API fonctionne
   Modèles disponibles : 50+
✅ Accès à GPT-4 confirmé

🔍 Test Anthropic API...
✅ ANTHROPIC_API_KEY définie
   Clé : sk-ant-api03-C3CHqn...
✅ Anthropic API fonctionne
   Modèle testé : claude-3-haiku
   Réponse : Bonjour ! Comment puis-je vous aider ?

🧪 Test de génération d'exercice...
   Provider configuré : openai
✅ Génération OpenAI réussie
   Réponse : Le soleil brille dans le ciel bleu.

═══════════════════════════════════════════════════
   Résumé des Tests
═══════════════════════════════════════════════════
OpenAI API     : ✅ OK
Anthropic API  : ✅ OK
Génération IA  : ✅ OK
═══════════════════════════════════════════════════

🎉 Toutes les clés API sont fonctionnelles !
   Vous pouvez générer des exercices avec l'IA.
```

---

## 🎨 Exemples de Génération

### Exemple 1 : Texte Littéraire (GPT-4)

**Requête** :
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "type": "text",
  "level": "intermediate",
  "theme": "coucher de soleil",
  "length": 150
}
```

**Génération** :
```
Le soleil déclinait lentement à l'horizon, embrasant le ciel de teintes orangées et pourpres. Les nuages, pareils à des voiles de soie, se teintaient de rose et d'or. La mer, calme et sereine, reflétait cette symphonie de couleurs comme un miroir parfait. Sur la plage déserte, les vagues venaient mourir en douceur, laissant derrière elles une fine dentelle d'écume. L'air s'emplissait de la fraîcheur du soir, portant avec lui le parfum salé de l'océan. C'était un moment suspendu, où le temps semblait s'arrêter.
```

### Exemple 2 : Correction de Style (Claude)

**Requête** :
```json
{
  "provider": "anthropic",
  "model": "claude-3-sonnet",
  "type": "correction",
  "level": "advanced",
  "focus": ["anglicismes", "pléonasmes"]
}
```

**Génération** :
```json
{
  "title": "Chassez les Anglicismes",
  "text": "Suite à notre meeting, j'ai réalisé qu'on devait finaliser le projet au jour d'aujourd'hui.",
  "questions": [
    {
      "error": "Suite à",
      "correction": "À la suite de",
      "explanation": "Anglicisme. Utilisez 'à la suite de' ou 'après'."
    },
    {
      "error": "meeting",
      "correction": "réunion",
      "explanation": "Utilisez le mot français 'réunion'."
    },
    {
      "error": "au jour d'aujourd'hui",
      "correction": "aujourd'hui",
      "explanation": "Pléonasme. 'Aujourd'hui' suffit."
    }
  ]
}
```

---

## 💰 Gestion des Coûts

### Estimation par Exercice

| Type d'Exercice | Modèle Recommandé | Coût Estimé |
|-----------------|-------------------|-------------|
| Texte littéraire | GPT-4 | $0.10 - $0.15 |
| Correction style | Claude Sonnet | $0.02 - $0.05 |
| Grammaire simple | GPT-3.5 / Haiku | $0.01 - $0.02 |
| Dictée | GPT-3.5 | $0.01 - $0.03 |
| Compréhension | GPT-4 | $0.08 - $0.12 |

### Optimisation

1. **Cache** : Réutiliser les exercices générés
2. **Modèles économiques** : `gpt-3.5-turbo` ou `claude-3-haiku` pour exercices simples
3. **Génération par lots** : 5-10 exercices à la fois
4. **Prompts concis** : Limiter la longueur des prompts

### Budget Mensuel Estimé

**Pour 100 exercices/mois** :
- Avec GPT-4 uniquement : ~$10-15
- Avec Claude Sonnet uniquement : ~$3-5
- Mixte (recommandé) : ~$5-8

**Pour 500 exercices/mois** :
- Mixte optimisé : ~$20-30

---

## 🔧 Configuration Avancée

### Changer de Provider par Défaut

Dans `.env` :
```env
# Utiliser OpenAI par défaut
AI_PROVIDER=openai

# OU utiliser Claude par défaut
AI_PROVIDER=anthropic
```

### Utilisation Hybride dans le Code

```typescript
// Générateur flexible
class ExerciseGenerator {
  async generate(type: string) {
    // Choisir le provider selon le type
    const provider = this.selectProvider(type);
    
    if (type === 'text' || type === 'creative') {
      return this.generateWithOpenAI();
    } else if (type === 'grammar' || type === 'correction') {
      return this.generateWithClaude();
    }
  }
  
  selectProvider(type: string) {
    const providerMap = {
      'text': 'openai',
      'creative': 'openai',
      'dialogue': 'openai',
      'grammar': 'anthropic',
      'correction': 'anthropic',
      'explanation': 'anthropic',
    };
    return providerMap[type] || process.env.AI_PROVIDER;
  }
}
```

---

## 📊 Monitoring et Logs

### Suivi de l'Utilisation

Votre application enregistre :
- ✅ Nombre de générations
- ✅ Coût estimé par génération
- ✅ Provider utilisé
- ✅ Temps de réponse
- ✅ Taux de succès

### Logs Exemple

```javascript
{
  timestamp: '2025-10-10T02:00:00Z',
  type: 'exercise_generation',
  provider: 'openai',
  model: 'gpt-4',
  exerciseType: 'text',
  tokensUsed: 450,
  estimatedCost: 0.12,
  duration: 3.5,
  success: true
}
```

---

## ✅ Checklist de Configuration

- [x] OPENAI_API_KEY définie
- [x] ANTHROPIC_API_KEY définie
- [x] AI_PROVIDER configuré
- [ ] Test des clés API (`node test-ai-keys.js`)
- [ ] Génération d'un exercice test
- [ ] Vérification des coûts
- [ ] Configuration du monitoring

---

## 🚀 Prochaines Étapes

### 1. Tester les Clés API

```bash
cd backend-francais-fluide
node test-ai-keys.js
```

### 2. Générer un Exercice Test

Dans l'application :
```
1. Se connecter
2. Aller dans Exercices
3. Cliquer sur "Générer avec IA"
4. Choisir le type et le niveau
5. Générer
```

### 3. Vérifier la Qualité

- ✅ Le texte est-il cohérent ?
- ✅ Les questions sont-elles pertinentes ?
- ✅ Les explications sont-elles claires ?
- ✅ Le niveau est-il adapté ?

### 4. Optimiser les Coûts

- ✅ Utiliser le cache
- ✅ Choisir les bons modèles
- ✅ Générer par lots
- ✅ Monitorer l'utilisation

---

## 📄 Fichiers Créés

1. ✅ `test-ai-keys.js` - Script de test des clés API
2. ✅ `CONFIGURATION-IA-COMPLETE.md` - Ce guide
3. ✅ `CAPACITES-IA-GENERATION.md` - Guide des capacités IA

---

**Vos clés API sont configurées et prêtes à générer des exercices de qualité !** 🤖✨

**Testez-les avec `node test-ai-keys.js` pour confirmer que tout fonctionne !**
