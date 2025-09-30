// src/components/ai/AIAssistant.tsx

/**
 * Assistant conversationnel IA pour FrançaisFluide
 * Tuteur virtuel avec réponses aux questions grammaticales et explications interactives
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Lightbulb,
  BookOpen,
  Target,
  Zap,
  Mic,
  MicOff,
  Settings,
  X,
} from 'lucide-react';
import { useAdvancedCorrections } from '@/lib/ai/advanced-corrections';
import { useAIContentGenerator } from '@/lib/ai/content-generator';

// Types pour l'assistant
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    type: 'question' | 'explanation' | 'exercise' | 'correction' | 'general';
    confidence?: number;
    sources?: string[];
    relatedTopics?: string[];
  };
}

// Types pour les corrections
interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
}

interface CorrectionResult {
  corrections: CorrectionItem[];
  suggestions: string[];
  confidence: number;
}

interface AIAssistantProps {
  className?: string;
  mode?: 'tutor' | 'corrector' | 'general';
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
  compact?: boolean;
}

interface ConversationContext {
  userLevel: string;
  currentTheme: string;
  recentTopics: string[];
  userPreferences: {
    explanationStyle: 'simple' | 'detailed' | 'academic';
    examplesCount: number;
    includeCulturalNotes: boolean;
  };
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  className = '',
  mode = 'tutor',
  userLevel = 'intermediate',
  theme = 'général',
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    userLevel,
    currentTheme: theme,
    recentTopics: [],
    userPreferences: {
      explanationStyle: 'detailed',
      examplesCount: 3,
      includeCulturalNotes: true,
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Hooks pour les services IA
  const { analyzeText } = useAdvancedCorrections(process.env.NEXT_PUBLIC_OPENAI_API_KEY || '');
  // Adaptateur local pour conserver l'API attendue par le composant
  const correctText = useCallback(
    async ({
      text,
      level,
    }: {
      text: string;
      level: 'beginner' | 'intermediate' | 'advanced';
      focus?: string;
    }): Promise<CorrectionResult> => {
      const results = await analyzeText({
        text,
        userProfile: {
          id: 'current',
          level,
          weakPoints: [],
          strongPoints: [],
          learningStyle: 'mixed',
          preferredDifficulty: 'medium',
          recentErrors: [],
          progressHistory: [],
        },
        subscriptionPlan: 'demo',
      });
      const avgConfidence = results.length
        ? results.reduce((a, c) => a + (c.confidence || 0), 0) / results.length
        : 0.8;
      return {
        corrections: results.map(r => ({
          original: r.originalText,
          corrected: r.suggestedText,
          explanation: r.explanation,
        })),
        suggestions: [],
        confidence: avgConfidence,
      };
    },
    [analyzeText]
  );
  const isCorrecting = false;
  const { generateExplanation, generateExercise, isGenerating } = useAIContentGenerator();

  // Initialiser la reconnaissance vocale
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Erreur reconnaissance vocale:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message d'accueil
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'assistant',
        content: getWelcomeMessage(),
        timestamp: Date.now(),
        metadata: {
          type: 'general',
          confidence: 1.0,
          relatedTopics: ['grammaire', 'vocabulaire', 'exercices'],
        },
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  /**
   * Obtient le message d'accueil personnalisé
   */
  const getWelcomeMessage = (): string => {
    const greetings = {
      tutor: `Bonjour ! Je suis votre tuteur virtuel en français. Je peux vous aider avec la grammaire, le vocabulaire, et créer des exercices personnalisés. Que souhaitez-vous apprendre aujourd'hui ?`,
      corrector: `Salut ! Je suis votre correcteur IA. Envoyez-moi du texte et je vous aiderai à l'améliorer avec des explications détaillées.`,
      general: `Hello ! Je suis votre assistant IA pour le français. Posez-moi vos questions ou demandez-moi de l'aide !`,
    };

    return greetings[mode] || greetings.general;
  };

  /**
   * Envoie un message
   */
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
      metadata: {
        type: 'question',
      },
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await processUserMessage(inputValue.trim());

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        metadata: response.metadata,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Mettre à jour le contexte
      updateContext(response.metadata?.relatedTopics || []);
    } catch (error) {
      console.error('Erreur traitement message:', error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Désolé, une erreur est survenue. Pouvez-vous reformuler votre question ?',
        timestamp: Date.now(),
        metadata: {
          type: 'general',
          confidence: 0.1,
        },
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, mode, context]);

  /**
   * Traite le message de l'utilisateur
   */
  const processUserMessage = async (
    message: string
  ): Promise<{ content: string; metadata: any }> => {
    const messageType = detectMessageType(message);

    switch (messageType) {
      case 'correction':
        return await handleCorrectionRequest(message);
      case 'explanation':
        return await handleExplanationRequest(message);
      case 'exercise':
        return await handleExerciseRequest(message);
      case 'general':
      default:
        return await handleGeneralQuestion(message);
    }
  };

  /**
   * Détecte le type de message
   */
  const detectMessageType = (
    message: string
  ): 'correction' | 'explanation' | 'exercise' | 'general' => {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('corrige') ||
      lowerMessage.includes('erreur') ||
      lowerMessage.includes('faute')
    ) {
      return 'correction';
    }

    if (
      lowerMessage.includes('explique') ||
      lowerMessage.includes('pourquoi') ||
      lowerMessage.includes('comment')
    ) {
      return 'explanation';
    }

    if (
      lowerMessage.includes('exercice') ||
      lowerMessage.includes('entraîne') ||
      lowerMessage.includes('pratique')
    ) {
      return 'exercise';
    }

    return 'general';
  };

  /**
   * Gère les demandes de correction
   */
  const handleCorrectionRequest = async (
    message: string
  ): Promise<{ content: string; metadata: any }> => {
    try {
      const correction = await correctText({
        text: message,
        level: context.userLevel as any,
        focus: 'all',
      });

      let content = '**Corrections suggérées :**\n\n';

      if (correction.corrections.length > 0) {
        correction.corrections.forEach((corr, index) => {
          content += `${index + 1}. **${corr.original}** → **${corr.corrected}**\n`;
          content += `   *${corr.explanation}*\n\n`;
        });
      }

      if (correction.suggestions.length > 0) {
        content += '**Suggestions générales :**\n';
        correction.suggestions.forEach(suggestion => {
          content += `• ${suggestion}\n`;
        });
      }

      return {
        content,
        metadata: {
          type: 'correction',
          confidence: correction.confidence,
          sources: ['IA Correction Engine'],
        },
      };
    } catch (error) {
      return {
        content: 'Je ne peux pas corriger ce texte pour le moment. Pouvez-vous réessayer ?',
        metadata: { type: 'correction', confidence: 0.1 },
      };
    }
  };

  /**
   * Gère les demandes d'explication
   */
  const handleExplanationRequest = async (
    message: string
  ): Promise<{ content: string; metadata: any }> => {
    try {
      // Extraire le concept à expliquer
      const concept = extractConcept(message);

      const explanation = await generateExplanation(
        concept,
        context.userLevel,
        context.currentTheme
      );

      let content = `**${explanation.concept}**\n\n`;
      content += `${explanation.definition}\n\n`;

      if (explanation.examples.length > 0) {
        content += '**Exemples :**\n';
        explanation.examples.forEach((example, index) => {
          content += `${index + 1}. ${example}\n`;
        });
        content += '\n';
      }

      if (explanation.rules.length > 0) {
        content += '**Règles importantes :**\n';
        explanation.rules.forEach((rule, index) => {
          content += `${index + 1}. ${rule}\n`;
        });
        content += '\n';
      }

      if (explanation.commonMistakes.length > 0) {
        content += '**Erreurs courantes à éviter :**\n';
        explanation.commonMistakes.forEach((mistake, index) => {
          content += `${index + 1}. ${mistake}\n`;
        });
      }

      return {
        content,
        metadata: {
          type: 'explanation',
          confidence: 0.9,
          relatedTopics: explanation.relatedConcepts,
        },
      };
    } catch (error) {
      return {
        content:
          'Je ne peux pas expliquer ce concept pour le moment. Pouvez-vous reformuler votre question ?',
        metadata: { type: 'explanation', confidence: 0.1 },
      };
    }
  };

  /**
   * Gère les demandes d'exercices
   */
  const handleExerciseRequest = async (
    message: string
  ): Promise<{ content: string; metadata: any }> => {
    try {
      const exercise = await generateExercise({
        type: 'exercise',
        level: context.userLevel as any,
        theme: context.currentTheme,
        userProfile: {
          level: context.userLevel as any,
          interests: context.recentTopics,
          weakPoints: [],
          strongPoints: [],
          learningStyle: 'reading',
          goals: ['améliorer le français'],
        },
      });

      let content = `**${exercise.title}**\n\n`;
      content += `${exercise.description}\n\n`;
      content += `**Instructions :** ${exercise.instructions}\n\n`;

      if (exercise.content.questions.length > 0) {
        content += '**Questions :**\n';
        exercise.content.questions.forEach((question, index) => {
          content += `${index + 1}. ${question.text}\n`;
          if (question.options) {
            question.options.forEach((option, optIndex) => {
              content += `   ${String.fromCharCode(97 + optIndex)}. ${option}\n`;
            });
          }
          content += '\n';
        });
      }

      if (exercise.hints.length > 0) {
        content += '**Indices :**\n';
        exercise.hints.forEach((hint, index) => {
          content += `${index + 1}. ${hint}\n`;
        });
      }

      return {
        content,
        metadata: {
          type: 'exercise',
          confidence: 0.85,
          relatedTopics: exercise.relatedTopics,
        },
      };
    } catch (error) {
      return {
        content: "Je ne peux pas générer d'exercice pour le moment. Pouvez-vous réessayer ?",
        metadata: { type: 'exercise', confidence: 0.1 },
      };
    }
  };

  /**
   * Gère les questions générales
   */
  const handleGeneralQuestion = async (
    message: string
  ): Promise<{ content: string; metadata: any }> => {
    // Simulation d'une réponse générale (en production, utiliser une vraie API de chat)
    const responses = {
      beginner: [
        "Je comprends que vous débutez en français. C'est une belle langue ! Que souhaitez-vous apprendre en premier ?",
        'Parfait pour commencer ! Je peux vous aider avec les bases. Avez-vous des questions spécifiques ?',
        'Excellente question ! Pour bien débuter, je recommande de commencer par les verbes être et avoir.',
      ],
      intermediate: [
        'Excellente question ! Je peux vous aider à approfondir vos connaissances. Sur quoi voulez-vous travailler ?',
        'Je vois que vous avez déjà de bonnes bases. Voulez-vous pratiquer un point spécifique ?',
        'Intéressant ! Je peux vous proposer des exercices plus avancés. Quel thème vous intéresse ?',
      ],
      advanced: [
        'Question très pertinente ! Je peux vous aider avec les subtilités du français. Quel aspect voulez-vous explorer ?',
        'Excellent niveau ! Je peux vous proposer des exercices complexes. Sur quoi voulez-vous vous concentrer ?',
        'Très bien ! Je peux vous aider avec les nuances avancées. Avez-vous un point particulier en tête ?',
      ],
    };

    const levelResponses = responses[context.userLevel as keyof typeof responses];
    const randomResponse = levelResponses[Math.floor(Math.random() * levelResponses.length)];

    return {
      content: randomResponse,
      metadata: {
        type: 'general',
        confidence: 0.8,
        relatedTopics: ['grammaire', 'vocabulaire', 'exercices'],
      },
    };
  };

  /**
   * Extrait le concept d'un message
   */
  const extractConcept = (message: string): string => {
    // Logique simple d'extraction (en production, utiliser NLP)
    const words = message.toLowerCase().split(' ');

    const grammarConcepts = ['verbe', 'nom', 'adjectif', 'adverbe', 'préposition', 'conjonction'];
    const foundConcept = words.find(word => grammarConcepts.includes(word));

    return foundConcept || 'grammaire française';
  };

  /**
   * Met à jour le contexte de conversation
   */
  const updateContext = (newTopics: string[]) => {
    setContext(prev => ({
      ...prev,
      recentTopics: [...new Set([...prev.recentTopics, ...newTopics])].slice(-5), // Garder les 5 derniers
    }));
  };

  /**
   * Démarre/arrête la reconnaissance vocale
   */
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  /**
   * Gère les raccourcis clavier
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (compact) {
    return (
      <div className={`ai-assistant-compact ${className}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-20 right-4 z-50 h-96 w-80 rounded-lg border border-gray-200 bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-gray-200 p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Assistant IA</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="h-64 space-y-3 overflow-y-auto p-3">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-2 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-gray-100 p-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={toggleVoiceInput}
                    className={`rounded-md p-2 ${
                      isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`ai-assistant ${className}`}>
      <div className="flex h-96 flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Bot className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assistant IA</h3>
              <p className="text-sm text-gray-500">
                Mode: {mode} • Niveau: {userLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`rounded-lg p-2 ${
                isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
            <button className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-xs gap-3 lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`rounded-lg p-2 ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>

                <div
                  className={`rounded-lg p-3 ${
                    message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>

                  {message.metadata && (
                    <div className="mt-2 text-xs opacity-75">
                      {message.metadata.confidence && (
                        <span>Confiance: {Math.round(message.metadata.confidence * 100)}%</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="rounded-lg bg-gray-100 p-3">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question ou demandez une correction..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Appuyez sur Entrée pour envoyer</span>
            <span>{messages.length} messages</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export du composant compact pour l'utilisation dans d'autres composants
export const AIAssistantButton: React.FC<{ mode?: string; userLevel?: string }> = ({
  mode = 'tutor',
  userLevel = 'intermediate',
}) => {
  return <AIAssistant compact mode={mode as any} userLevel={userLevel as any} />;
};
