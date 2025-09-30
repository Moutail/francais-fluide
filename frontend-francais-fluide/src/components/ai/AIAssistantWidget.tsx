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
  AlertCircle,
} from 'lucide-react';
import {
  AIAssistant,
  type AIAssistantMessage,
  type AIAssistantConfig,
} from '@/lib/ai/advanced-assistant';
import { useSubscriptionLimits } from '@/lib/subscription/limits';
import { cn } from '@/lib/utils/cn';

interface AIAssistantWidgetProps {
  userPlan?: string;
  apiKey?: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  userPlan = 'free',
  apiKey,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIAssistantMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { limiter, canUseAI, getUpgradePrompt } = useSubscriptionLimits(userPlan);

  const assistant = new AIAssistant(
    {
      personality: 'tutor',
      language: 'fr',
      expertise: 'intermediate',
      context: {
        userLevel: 'intermediate',
        recentErrors: [],
        learningGoals: ['grammaire', 'orthographe'],
      },
    },
    apiKey
  );

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
      timestamp: new Date(),
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
        type: 'feedback',
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
      case 'explanation':
        return Sparkles;
      case 'exercise':
        return MessageCircle;
      case 'feedback':
        return AlertCircle;
      default:
        return MessageCircle;
    }
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case 'explanation':
        return 'bg-blue-50 border-blue-200';
      case 'exercise':
        return 'bg-green-50 border-green-200';
      case 'feedback':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
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
          'fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all',
          canUseAI
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            : 'bg-gradient-to-r from-gray-400 to-gray-500'
        )}
        style={{
          bottom: '24px',
          right: '24px',
        }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Modal de l'assistant */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative flex h-[70vh] max-h-[600px] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Assistant IA FrançaisFluide</h3>
                    <p className="text-sm text-gray-600">
                      {canUseAI ? 'Disponible' : 'Limite atteinte - Plan actuel'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="group rounded-lg p-2 transition-colors hover:bg-red-100"
                  title="Fermer l'assistant"
                >
                  <X className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {messages.length === 0 && (
                  <div className="py-8 text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-blue-500" />
                    <h4 className="mb-2 font-semibold text-gray-900">
                      Bonjour ! Je suis votre tuteur IA
                    </h4>
                    <p className="text-sm text-gray-600">
                      Posez-moi vos questions sur le français : grammaire, orthographe,
                      conjugaison...
                    </p>
                  </div>
                )}

                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        {React.createElement(getMessageTypeIcon(message.type), {
                          className: 'w-4 h-4 text-white',
                        })}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl p-4',
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : cn('border', getMessageTypeColor(message.type))
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <p className="mt-2 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                        <span className="text-sm font-medium text-gray-600">Vous</span>
                      </div>
                    )}
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start gap-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent"
                        />
                        <span className="text-sm text-gray-600">L'assistant réfléchit...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-6">
                {!canUseAI && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <Lock className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">
                        Limite de corrections atteinte
                      </p>
                      <p className="text-xs text-yellow-700">{getUpgradePrompt('assistant IA')}</p>
                    </div>
                    <button
                      onClick={() => (window.location.href = '/subscription')}
                      className="flex items-center gap-2 rounded-lg bg-yellow-600 px-3 py-1 text-sm text-white transition-colors hover:bg-yellow-700"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        canUseAI
                          ? 'Posez votre question sur le français...'
                          : "Upgradez pour utiliser l'assistant IA..."
                      }
                      disabled={!canUseAI || isLoading}
                      className="w-full resize-none rounded-xl border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                        'rounded-xl p-3 transition-colors',
                        isListening
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        !canUseAI && 'cursor-not-allowed opacity-50'
                      )}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading || !canUseAI}
                      className={cn(
                        'rounded-xl p-3 transition-colors',
                        inputValue.trim() && canUseAI && !isLoading
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                      )}
                    >
                      <Send className="h-5 w-5" />
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
