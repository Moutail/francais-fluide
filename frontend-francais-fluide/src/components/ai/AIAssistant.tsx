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
  X
} from 'lucide-react';
import { useAICorrections } from '@/lib/ai/advanced-corrections';
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
  compact = false
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
      includeCulturalNotes: true
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Hooks pour les services IA
  const { correctText, isLoading: isCorrecting } = useAICorrections();
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
          relatedTopics: ['grammaire', 'vocabulaire', 'exercices']
        }
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
      general: `Hello ! Je suis votre assistant IA pour le français. Posez-moi vos questions ou demandez-moi de l'aide !`
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
        type: 'question'
      }
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
        metadata: response.metadata
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
          confidence: 0.1
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, mode, context]);

  /**
   * Traite le message de l'utilisateur
   */
  const processUserMessage = async (message: string): Promise<{ content: string; metadata: any }> => {
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
  const detectMessageType = (message: string): 'correction' | 'explanation' | 'exercise' | 'general' => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('corrige') || lowerMessage.includes('erreur') || lowerMessage.includes('faute')) {
      return 'correction';
    }
    
    if (lowerMessage.includes('explique') || lowerMessage.includes('pourquoi') || lowerMessage.includes('comment')) {
      return 'explanation';
    }
    
    if (lowerMessage.includes('exercice') || lowerMessage.includes('entraîne') || lowerMessage.includes('pratique')) {
      return 'exercise';
    }
    
    return 'general';
  };

  /**
   * Gère les demandes de correction
   */
  const handleCorrectionRequest = async (message: string): Promise<{ content: string; metadata: any }> => {
    try {
      const correction = await correctText({
        text: message,
        level: context.userLevel as any,
        focus: 'all'
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
          sources: ['IA Correction Engine']
        }
      };
    } catch (error) {
      return {
        content: 'Je ne peux pas corriger ce texte pour le moment. Pouvez-vous réessayer ?',
        metadata: { type: 'correction', confidence: 0.1 }
      };
    }
  };

  /**
   * Gère les demandes d'explication
   */
  const handleExplanationRequest = async (message: string): Promise<{ content: string; metadata: any }> => {
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
          relatedTopics: explanation.relatedConcepts
        }
      };
    } catch (error) {
      return {
        content: 'Je ne peux pas expliquer ce concept pour le moment. Pouvez-vous reformuler votre question ?',
        metadata: { type: 'explanation', confidence: 0.1 }
      };
    }
  };

  /**
   * Gère les demandes d'exercices
   */
  const handleExerciseRequest = async (message: string): Promise<{ content: string; metadata: any }> => {
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
          goals: ['améliorer le français']
        }
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
          relatedTopics: exercise.relatedTopics
        }
      };
    } catch (error) {
      return {
        content: 'Je ne peux pas générer d\'exercice pour le moment. Pouvez-vous réessayer ?',
        metadata: { type: 'exercise', confidence: 0.1 }
      };
    }
  };

  /**
   * Gère les questions générales
   */
  const handleGeneralQuestion = async (message: string): Promise<{ content: string; metadata: any }> => {
    // Simulation d'une réponse générale (en production, utiliser une vraie API de chat)
    const responses = {
      beginner: [
        "Je comprends que vous débutez en français. C'est une belle langue ! Que souhaitez-vous apprendre en premier ?",
        "Parfait pour commencer ! Je peux vous aider avec les bases. Avez-vous des questions spécifiques ?",
        "Excellente question ! Pour bien débuter, je recommande de commencer par les verbes être et avoir."
      ],
      intermediate: [
        "Excellente question ! Je peux vous aider à approfondir vos connaissances. Sur quoi voulez-vous travailler ?",
        "Je vois que vous avez déjà de bonnes bases. Voulez-vous pratiquer un point spécifique ?",
        "Intéressant ! Je peux vous proposer des exercices plus avancés. Quel thème vous intéresse ?"
      ],
      advanced: [
        "Question très pertinente ! Je peux vous aider avec les subtilités du français. Quel aspect voulez-vous explorer ?",
        "Excellent niveau ! Je peux vous proposer des exercices complexes. Sur quoi voulez-vous vous concentrer ?",
        "Très bien ! Je peux vous aider avec les nuances avancées. Avez-vous un point particulier en tête ?"
      ]
    };

    const levelResponses = responses[context.userLevel as keyof typeof responses];
    const randomResponse = levelResponses[Math.floor(Math.random() * levelResponses.length)];

    return {
      content: randomResponse,
      metadata: {
        type: 'general',
        confidence: 0.8,
        relatedTopics: ['grammaire', 'vocabulaire', 'exercices']
      }
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
      recentTopics: [...new Set([...prev.recentTopics, ...newTopics])].slice(-5) // Garder les 5 derniers
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
          className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            >
              <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Assistant IA</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="h-64 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Posez votre question..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2 rounded-md ${
                      isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assistant IA</h3>
              <p className="text-sm text-gray-500">Mode: {mode} • Niveau: {userLevel}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-lg ${
                isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button className="p-2 bg-gray-100 text-gray-600 rounded-lg">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-2 rounded-lg ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
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
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question ou demandez une correction..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
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
  userLevel = 'intermediate' 
}) => {
  return <AIAssistant compact mode={mode as any} userLevel={userLevel as any} />;
};
