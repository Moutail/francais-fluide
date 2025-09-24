# 🤖 Guide d'Intégration des Clés API IA

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer les clés API pour activer toutes les fonctionnalités IA avancées de FrançaisFluide.

## 🔑 Clés API Requises

### 1. **OpenAI (Recommandé)**
- **Usage** : Corrections IA, génération d'exercices, tuteur intelligent
- **Modèles** : GPT-4, GPT-3.5-turbo
- **Coût** : ~0.03$/1K tokens (GPT-4), ~0.002$/1K tokens (GPT-3.5)

**Configuration :**
```env
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_MODEL=gpt-4
```

### 2. **ElevenLabs (Optionnel)**
- **Usage** : Synthèse vocale pour les dictées
- **Modèles** : Eleven Multilingual v2
- **Coût** : ~0.18$/1K caractères

**Configuration :**
```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key-here
NEXT_PUBLIC_ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1
```

### 3. **Azure OpenAI (Alternative)**
- **Usage** : Alternative à OpenAI avec plus de contrôle
- **Modèles** : GPT-4, GPT-3.5-turbo
- **Coût** : Variable selon votre contrat Azure

**Configuration :**
```env
NEXT_PUBLIC_AZURE_API_KEY=your-azure-key-here
NEXT_PUBLIC_AZURE_ENDPOINT=https://your-resource.openai.azure.com
NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME=your-deployment-name
```

### 4. **Anthropic Claude (Alternative)**
- **Usage** : Alternative à OpenAI avec Claude
- **Modèles** : Claude-3-sonnet, Claude-3-haiku
- **Coût** : ~0.015$/1K tokens (Sonnet), ~0.0025$/1K tokens (Haiku)

**Configuration :**
```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-key-here
NEXT_PUBLIC_ANTHROPIC_BASE_URL=https://api.anthropic.com
```

## 🚀 Configuration Rapide

### Étape 1 : Créer le fichier .env.local
```bash
# Dans frontend-francais-fluide/
cp .env.example .env.local
```

### Étape 2 : Ajouter vos clés API
```env
# Clés API IA
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-key-here
NEXT_PUBLIC_ELEVENLABS_API_KEY=your-elevenlabs-key-here

# Configuration optionnelle
NEXT_PUBLIC_OPENAI_MODEL=gpt-4
NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
```

### Étape 3 : Redémarrer l'application
```bash
npm run dev
```

## 🎯 Fonctionnalités par Plan d'Abonnement

### Plan Gratuit (Démo)
- ❌ Corrections IA avancées
- ❌ Exercices personnalisés
- ❌ Tuteur IA
- ❌ Dictées audio
- ✅ Corrections basiques (5/jour)

### Plan Étudiant (14.99$/mois)
- ✅ Corrections IA illimitées
- ✅ Exercices personnalisés (20/jour)
- ✅ Dictées audio (10/jour)
- ✅ Tuteur IA intelligent
- ✅ Analytics avancées

### Plan Premium (29.99$/mois)
- ✅ Tout du plan Étudiant
- ✅ Exercices illimités
- ✅ Dictées audio illimitées
- ✅ Tuteur IA premium
- ✅ Mode hors-ligne

### Plan Établissement (149.99$/mois)
- ✅ Tout du plan Premium
- ✅ Gestion multi-utilisateurs
- ✅ Analytics institutionnelles
- ✅ Support dédié

## 🔧 Configuration Avancée

### Variables d'Environnement Complètes
```env
# OpenAI
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-key
NEXT_PUBLIC_OPENAI_BASE_URL=https://api.openai.com/v1
NEXT_PUBLIC_OPENAI_MODEL=gpt-4

# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_API_KEY=your-key
NEXT_PUBLIC_ELEVENLABS_BASE_URL=https://api.elevenlabs.io/v1

# Azure OpenAI (alternative)
NEXT_PUBLIC_AZURE_API_KEY=your-key
NEXT_PUBLIC_AZURE_ENDPOINT=https://your-resource.openai.azure.com
NEXT_PUBLIC_AZURE_DEPLOYMENT_NAME=your-deployment

# Anthropic (alternative)
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-key
NEXT_PUBLIC_ANTHROPIC_BASE_URL=https://api.anthropic.com
```

### Configuration Backend
```env
# Dans backend-francais-fluide/.env
OPENAI_API_KEY=sk-your-key
ELEVENLABS_API_KEY=your-key
```

## 🧪 Test de Configuration

### Vérifier les clés API
```typescript
import { useAIConfig } from '@/lib/ai/api-config';

function TestAIConfig() {
  const { report, isApiKeyConfigured } = useAIConfig();
  
  console.log('Status:', report.status);
  console.log('OpenAI configuré:', isApiKeyConfigured('openai'));
  console.log('ElevenLabs configuré:', isApiKeyConfigured('elevenlabs'));
}
```

### Tester les fonctionnalités
1. **Corrections IA** : Écrivez dans l'éditeur
2. **Dictées** : Allez dans Exercices > Dictées
3. **Tuteur IA** : Consultez le dashboard
4. **Exercices personnalisés** : Vérifiez la page Exercices

## 💰 Estimation des Coûts

### Utilisation Typique (100 utilisateurs actifs/mois)
- **OpenAI GPT-4** : ~50$/mois
- **ElevenLabs** : ~30$/mois
- **Total** : ~80$/mois

### Optimisations
- Utiliser GPT-3.5-turbo pour les tâches simples (-70% coût)
- Mise en cache des réponses fréquentes
- Limitation des requêtes par utilisateur

## 🛠️ Dépannage

### Erreurs Communes

**1. "API Key not configured"**
```bash
# Vérifier que les clés sont dans .env.local
cat .env.local | grep API_KEY
```

**2. "Rate limit exceeded"**
- Réduire la fréquence des requêtes
- Implémenter un système de cache
- Utiliser des modèles moins coûteux

**3. "Model not available"**
- Vérifier que le modèle est disponible dans votre région
- Utiliser un modèle alternatif

### Logs de Debug
```typescript
// Activer les logs détaillés
localStorage.setItem('debug', 'ai:*');
```

## 🔒 Sécurité

### Bonnes Pratiques
1. **Ne jamais** commiter les clés API
2. Utiliser des variables d'environnement
3. Limiter les permissions des clés
4. Surveiller l'utilisation

### Rotation des Clés
```bash
# Script de rotation automatique
npm run rotate-api-keys
```

## 📞 Support

### En cas de problème
1. Vérifier les logs de l'application
2. Tester avec des clés de test
3. Consulter la documentation des APIs
4. Contacter le support technique

### Ressources
- [Documentation OpenAI](https://platform.openai.com/docs)
- [Documentation ElevenLabs](https://docs.elevenlabs.io/)
- [Documentation Azure OpenAI](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)

---

**Note** : Ce guide sera mis à jour régulièrement avec les nouvelles fonctionnalités et optimisations.
