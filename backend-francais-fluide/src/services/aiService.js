// src/services/aiService.js
const OpenAI = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AIService {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null;
    
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null;
    
    this.provider = process.env.AI_PROVIDER || 'openai';
    
    // Log pour debug
    console.log('🤖 AIService initialisé:', {
      hasOpenAI: !!this.openai,
      hasAnthropic: !!this.anthropic,
      provider: this.provider
    });
  }

  async generateResponse(message, options = {}) {
    const {
      context = '',
      conversationHistory = [],
      userId = null
    } = options;

    try {
      // Récupérer le profil utilisateur et les données de télémétrie
      const userProfile = await this.getUserProfile(userId);
      const errorPatterns = await this.getUserErrorPatterns(userId);
      
      // Construire le contexte enrichi
      const enrichedContext = this.buildEnrichedContext(userProfile, errorPatterns, context);

      // Choisir le provider selon la configuration
      if (this.provider === 'anthropic' && this.anthropic) {
        return await this.generateWithAnthropic(message, enrichedContext, conversationHistory, userProfile);
      } else if (this.openai) {
        return await this.generateWithOpenAI(message, enrichedContext, conversationHistory, userProfile);
      }
      
      // Fallback sur une réponse basique
      return this.generateBasicResponse(message);
      
    } catch (error) {
      console.error('Erreur génération réponse IA:', error);
      return this.generateBasicResponse(message);
    }
  }

  async generateWithOpenAI(message, context, conversationHistory, userProfile) {
    const systemPrompt = this.buildSystemPrompt(userProfile, context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    return {
      content: response.choices[0].message.content,
      context: {
        model: 'gpt-4',
        tokens: response.usage?.total_tokens || 0
      }
    };
  }

  async generateWithAnthropic(message, context, conversationHistory, userProfile) {
    const systemPrompt = this.buildSystemPrompt(userProfile, context);

    const conversationText = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const fullMessage = conversationText 
      ? `${conversationText}\n\nuser: ${message}`
      : message;

    const response = await this.anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: fullMessage }]
    });

    return {
      content: response.content[0].text,
      context: {
        model: 'claude-3-sonnet',
        tokens: response.usage?.input_tokens + response.usage?.output_tokens || 0
      }
    };
  }

  // Méthodes utilitaires pour enrichir le contexte
  async getUserProfile(userId) {
    if (!userId) return null;
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { 
          progress: true,
          subscription: true 
        }
      });
      
      return user ? {
        level: user.progress?.level || 1,
        accuracy: user.progress?.accuracy || 0,
        exercisesCompleted: user.progress?.exercisesCompleted || 0,
        currentStreak: user.progress?.currentStreak || 0,
        plan: user.subscription?.plan || 'demo'
      } : null;
    } catch (error) {
      console.error('Erreur récupération profil utilisateur:', error);
      return null;
    }
  }

  async getUserErrorPatterns(userId) {
    if (!userId) return [];
    
    try {
      const errorEvents = await prisma.telemetryEvent.findMany({
        where: {
          userId,
          type: 'question_completed',
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 derniers jours
          }
        },
        take: 50
      });

      const errorPatterns = {};
      errorEvents.forEach(event => {
        try {
          const data = JSON.parse(event.data);
          if (!data.isCorrect) {
            const key = `${event.exerciseId}_error`;
            if (!errorPatterns[key]) {
              errorPatterns[key] = { count: 0, exerciseId: event.exerciseId };
            }
            errorPatterns[key].count++;
          }
        } catch (e) {
          // Ignorer les données malformées
        }
      });

      return Object.values(errorPatterns).sort((a, b) => b.count - a.count).slice(0, 5);
    } catch (error) {
      console.error('Erreur récupération patterns erreur:', error);
      return [];
    }
  }

  buildEnrichedContext(userProfile, errorPatterns, originalContext) {
    let context = originalContext || '';
    
    if (userProfile) {
      context += `\n\nProfil utilisateur:
- Niveau: ${userProfile.level}
- Précision: ${Math.round(userProfile.accuracy)}%
- Exercices complétés: ${userProfile.exercisesCompleted}
- Série actuelle: ${userProfile.currentStreak} jours
- Plan: ${userProfile.plan}`;
    }

    if (errorPatterns.length > 0) {
      context += `\n\nErreurs fréquentes détectées:
${errorPatterns.map(pattern => `- Exercice ${pattern.exerciseId}: ${pattern.count} erreurs`).join('\n')}`;
    }

    return context;
  }

  buildSystemPrompt(userProfile, context) {
    const basePrompt = `Vous êtes un tuteur de français expert et bienveillant. Votre mission est d'aider l'utilisateur à améliorer son français de manière personnalisée et efficace.

RÈGLES IMPORTANTES:
1. Adaptez votre niveau de langue au niveau de l'utilisateur
2. Soyez encourageant et positif dans vos réponses
3. Donnez des explications claires et concises
4. Proposez des exemples pratiques
5. Corrigez les erreurs avec bienveillance
6. Répondez UNIQUEMENT en français
7. Si l'utilisateur pose une question en anglais, répondez en français mais mentionnez que vous préférez le français

STYLE DE COMMUNICATION:
- Utilisez un ton amical et professionnel
- Employez des phrases courtes et claires
- Donnez des exemples concrets
- Encouragez la pratique régulière
- Félicitez les progrès`;

    if (userProfile) {
      const levelGuidance = this.getLevelGuidance(userProfile.level);
      const accuracyGuidance = this.getAccuracyGuidance(userProfile.accuracy);
      
      return `${basePrompt}

PROFIL DE L'UTILISATEUR:
${levelGuidance}
${accuracyGuidance}

CONTEXTE SPÉCIFIQUE:
${context}

Répondez en tenant compte de ce profil pour personnaliser votre aide.`;
    }

    return `${basePrompt}

CONTEXTE:
${context}

Aidez l'utilisateur à améliorer son français de manière adaptée à son niveau.`;
  }

  getLevelGuidance(level) {
    const guidance = {
      1: "Niveau débutant: Utilisez un vocabulaire simple, des phrases courtes, et expliquez les concepts de base.",
      2: "Niveau intermédiaire: Vous pouvez utiliser un vocabulaire plus riche et aborder des concepts plus complexes.",
      3: "Niveau avancé: Vous pouvez discuter de nuances linguistiques et de subtilités du français."
    };
    return guidance[level] || guidance[1];
  }

  getAccuracyGuidance(accuracy) {
    if (accuracy < 50) {
      return "L'utilisateur a des difficultés importantes. Concentrez-vous sur les bases et encouragez beaucoup.";
    } else if (accuracy < 75) {
      return "L'utilisateur progresse bien. Vous pouvez introduire des concepts plus avancés progressivement.";
    } else {
      return "L'utilisateur a un bon niveau. Vous pouvez aborder des subtilités et des nuances du français.";
    }
  }

  generateBasicResponse(message) {
    // Réponses basiques pour les cas où les APIs IA ne sont pas disponibles
    const responses = [
      "Je suis là pour vous aider avec votre français ! Pouvez-vous me donner plus de contexte sur ce que vous souhaitez apprendre ?",
      "C'est une excellente question ! Pour vous donner la meilleure réponse, pourriez-vous préciser votre niveau de français ?",
      "Je comprends votre question. Malheureusement, je ne peux pas accéder aux services IA en ce moment, mais je peux vous orienter vers des ressources utiles.",
      "Merci pour votre message ! Pour vous aider efficacement, pourriez-vous me dire quel aspect du français vous souhaitez améliorer ?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      context: {
        model: 'basic',
        fallback: true
      }
    };
  }

  async analyzeTextComplexity(text) {
    // Analyser la complexité du texte pour adapter les réponses
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    
    let complexity = 'beginner';
    if (avgWordsPerSentence > 15) complexity = 'advanced';
    else if (avgWordsPerSentence > 10) complexity = 'intermediate';
    
    return {
      wordCount,
      sentenceCount,
      avgWordsPerSentence,
      complexity
    };
  }
}

module.exports = {
  aiService: new AIService()
};
