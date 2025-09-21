// src/components/ai/AIAssistantWidget.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Mic, 
  MicOff,
  Sparkles,
  Lock,
  Crown,
  AlertCircle
} from 'lucide-react';
import { AIAssistant, type AIAssistantMessage, type AIAssistantConfig } from '@/lib/ai/advanced-assistant';
import { useSubscriptionLimits } from '@/lib/subscription/limits';
import { cn } from '@/lib/utils/cn';

interface AIAssistantWidgetProps {
  userPlan?: string;
  apiKey?: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  userPlan = 'free',
  apiKey
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { limiter, canUseAI, getUpgradePrompt } = useSubscriptionLimits(userPlan);

  const assistant = new AIAssistant({
    personality: 'tutor',
    language: 'fr',
    expertise: 'intermediate',
    context: {
      userLevel: 'intermediate',
      recentErrors: [],
      learningGoals: ['grammaire', 'orthographe']
    }
  }, apiKey);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: AIAssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await assistant.askQuestion(inputValue, userPlan);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Erreur assistant:', error);
      const errorMessage: AIAssistantMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
        type: 'feedback'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    // Implémentation de la reconnaissance vocale ici
  };

  const getMessageTypeIcon = (type?: string) => {
    switch (type) {
      case 'explanation': return Sparkles;
      case 'exercise': return MessageCircle;
      case 'feedback': return AlertCircle;
      default: return MessageCircle;
    }
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'explanation': return 'bg-blue-50 border-blue-200';
      case 'exercise': return 'bg-green-50 border-green-200';
      case 'feedback': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all z-40",
          canUseAI 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            : "bg-gradient-to-r from-gray-400 to-gray-500"
        )}
        style={{ 
          bottom: '24px',
          right: '24px'
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Modal de l'assistant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Assistant IA FrançaisFluide
                    </h3>
                    <p className="text-sm text-gray-600">
                      {canUseAI ? 'Disponible' : 'Limite atteinte - Plan actuel'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                  title="Fermer l'assistant"
                >
                  <X className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Bonjour ! Je suis votre tuteur IA
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Posez-moi vos questions sur le français : grammaire, orthographe, conjugaison...
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        {React.createElement(getMessageTypeIcon(message.type), {
                          className: "w-4 h-4 text-white"
                        })}
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] p-4 rounded-2xl",
                        message.role === 'user'
                          ? "bg-blue-600 text-white"
                          : cn(
                              "border",
                              getMessageTypeColor(message.type)
                            )
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-gray-600">
                          Vous
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                        />
                        <span className="text-sm text-gray-600">
                          L'assistant réfléchit...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200">
                {!canUseAI && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                    <Lock className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800 font-medium">
                        Limite de corrections atteinte
                      </p>
                      <p className="text-xs text-yellow-700">
                        {getUpgradePrompt('assistant IA')}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/subscription'}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={canUseAI 
                        ? "Posez votre question sur le français..." 
                        : "Upgradez pour utiliser l'assistant IA..."
                      }
                      disabled={!canUseAI || isLoading}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleVoice}
                      disabled={!canUseAI}
                      className={cn(
                        "p-3 rounded-xl transition-colors",
                        isListening
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                        !canUseAI && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || !canUseAI}
                      className={cn(
                        "p-3 rounded-xl transition-colors",
                        inputValue.trim() && canUseAI && !isLoading
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
