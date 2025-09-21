// src/lib/ai/advanced-assistant.ts
import { useSubscriptionLimits } from '../subscription/limits';

export interface AIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'question' | 'explanation' | 'exercise' | 'feedback';
}

export interface AIAssistantConfig {
  personality: 'tutor' | 'friendly' | 'professional';
  language: 'fr' | 'en';
  expertise: 'beginner' | 'intermediate' | 'advanced';
  context: {
    userLevel: string;
    recentErrors: string[];
    learningGoals: string[];
  };
}

export class AIAssistant {
  private config: AIAssistantConfig;
  private conversationHistory: AIAssistantMessage[] = [];
  private apiKey: string | null = null;

  constructor(config: AIAssistantConfig, apiKey?: string) {
    this.config = config;
    this.apiKey = apiKey || null;
  }

  async askQuestion(question: string, userPlan: string = 'free'): Promise<AIAssistantMessage> {
    const { limiter } = useSubscriptionLimits(userPlan);
    
    // Vérifier les limites d'abonnement
    if (!limiter.checkAICorrections().allowed) {
      return {
        id: `limit-${Date.now()}`,
        role: 'assistant',
        content: `🚫 ${limiter.checkAICorrections().message}\n\n💡 Passez à un plan supérieur pour utiliser l'assistant IA illimité !`,
        timestamp: new Date(),
        type: 'feedback'
      };
    }

    // Utiliser l'IA si disponible, sinon mode dégradé
    if (this.apiKey && userPlan !== 'free') {
      return await this.callOpenAI(question);
    } else {
      return await this.getFallbackResponse(question);
    }
  }

  private async callOpenAI(question: string): Promise<AIAssistantMessage> {
    if (!this.apiKey) {
      throw new Error('Clé API OpenAI manquante');
    }

    const systemPrompt = this.buildSystemPrompt();
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            ...this.conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      
      const assistantMessage: AIAssistantMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
        type: 'explanation'
      };

      this.conversationHistory.push(assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('Erreur OpenAI:', error);
      return await this.getFallbackResponse(question);
    }
  }

  private async getFallbackResponse(question: string): Promise<AIAssistantMessage> {
    // Réponses prédéfinies pour le mode dégradé
    const responses = {
      'accord': 'Pour l\'accord du participe passé, souvenez-vous : avec "être", il s\'accorde avec le sujet. Avec "avoir", il s\'accorde avec le COD si celui-ci est placé avant le verbe.',
      'conjugaison': 'La conjugaison française suit des règles précises. Pour vous aider, je peux vous expliquer les temps principaux : présent, passé composé, imparfait, futur simple.',
      'orthographe': 'L\'orthographe française peut être complexe, mais voici quelques règles utiles : "é" ou "er" ? Si on peut remplacer par "fait", c\'est "é".',
      'vocabulaire': 'Pour enrichir votre vocabulaire, je recommande de lire régulièrement et de noter les mots nouveaux dans un carnet.',
    };

    const lowerQuestion = question.toLowerCase();
    let response = 'Je comprends votre question sur le français ! ';

    if (lowerQuestion.includes('accord')) {
      response += responses.accord;
    } else if (lowerQuestion.includes('conjugaison')) {
      response += responses.conjugaison;
    } else if (lowerQuestion.includes('orthographe')) {
      response += responses.orthographe;
    } else if (lowerQuestion.includes('vocabulaire')) {
      response += responses.vocabulaire;
    } else {
      response += 'Pour une réponse plus détaillée et personnalisée, passez à un plan supérieur qui inclut l\'assistant IA avancé !';
    }

    return {
      id: `fallback-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type: 'explanation'
    };
  }

  private buildSystemPrompt(): string {
    return `Tu es un tuteur IA spécialisé dans l'enseignement du français. 
    
    Personnalité: ${this.config.personality}
    Niveau de l'utilisateur: ${this.config.expertise}
    Langue: ${this.config.language}
    
    Règles:
    - Réponds toujours en français
    - Sois patient et encourageant
    - Donne des exemples concrets
    - Explique les règles de grammaire clairement
    - Adapte ton langage au niveau de l'utilisateur
    - Propose des exercices pratiques quand c'est pertinent
    
    Contexte utilisateur:
    - Niveau: ${this.config.context.userLevel}
    - Erreurs récentes: ${this.config.context.recentErrors.join(', ')}
    - Objectifs: ${this.config.context.learningGoals.join(', ')}`;
  }

  async generateExercise(type: 'grammar' | 'vocabulary' | 'conjugation', userPlan: string = 'free'): Promise<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }> {
    const { limiter } = useSubscriptionLimits(userPlan);
    
    if (!limiter.checkFeature('customExercises') && userPlan === 'free') {
      throw new Error('Génération d\'exercices personnalisés disponible uniquement avec un abonnement premium');
    }

    // Exercices prédéfinis pour le mode dégradé
    const exercises = {
      grammar: {
        question: 'Choisissez la bonne forme du participe passé : "Les enfants sont _____ chez leurs grands-parents."',
        options: ['allés', 'allé', 'allée', 'allées'],
        correctAnswer: 0,
        explanation: 'Avec l\'auxiliaire "être", le participe passé s\'accorde avec le sujet "les enfants" (masculin pluriel).',
        difficulty: 'medium' as const
      },
      vocabulary: {
        question: 'Quel est le synonyme de "rapidement" ?',
        options: ['lentement', 'vite', 'doucement', 'calmement'],
        correctAnswer: 1,
        explanation: '"Vite" est un synonyme de "rapidement", tous deux expriment la vitesse.',
        difficulty: 'easy' as const
      },
      conjugation: {
        question: 'Conjuguez le verbe "aller" à la 3e personne du pluriel au présent :',
        options: ['ils vont', 'ils vonts', 'ils alle', 'ils allons'],
        correctAnswer: 0,
        explanation: 'Le verbe "aller" se conjugue "ils vont" au présent de l\'indicatif.',
        difficulty: 'easy' as const
      }
    };

    return exercises[type];
  }

  getConversationHistory(): AIAssistantMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
