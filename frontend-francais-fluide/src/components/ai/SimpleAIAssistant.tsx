// src/components/ai/SimpleAIAssistant.tsx
'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface SimpleAIAssistantProps {
  userPlan?: string;
}

export const SimpleAIAssistant: React.FC<SimpleAIAssistantProps> = ({ userPlan = 'free' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; text: string; isUser: boolean }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Mapping des plans backend vers frontend
  const getFrontendPlanId = (backendPlan: string) => {
    const mapping: { [key: string]: string } = {
      demo: 'free',
      etudiant: 'student',
      premium: 'premium',
      etablissement: 'enterprise',
    };
    return mapping[backendPlan] || 'free';
  };

  const frontendPlanId = getFrontendPlanId(userPlan);
  const canUseAI = frontendPlanId && frontendPlanId !== 'free';

  // Debug
  console.log('🤖 SimpleAIAssistant Debug:', {
    userPlan,
    frontendPlanId,
    canUseAI,
  });

  const handleSend = async () => {
    if (!message.trim() || !canUseAI || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: message, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    // Appeler l'API backend
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: currentMessage,
          context: 'Assistant IA pour l\'apprentissage du français',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          text: data.data?.response || data.data || 'Désolé, je n\'ai pas pu générer une réponse.',
          isUser: false,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          text: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          isUser: false,
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error('Erreur assistant IA:', error);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, je ne peux pas me connecter au serveur. Vérifiez votre connexion.',
        isUser: false,
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all ${
          canUseAI
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
        }`}
        style={{
          bottom: '80px',
          right: '24px',
        }}
        title={canUseAI ? 'Assistant IA' : 'Assistant IA - Upgrade requis'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className="relative flex h-[500px] w-full max-w-md flex-col rounded-2xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Assistant IA</h3>
                  <p className="text-xs text-gray-600">
                    {canUseAI ? 'Disponible' : 'Upgrade requis'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="group rounded-lg p-2 transition-colors hover:bg-red-100"
                title="Fermer"
              >
                <X className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="py-8 text-center">
                  <Sparkles className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                  <h4 className="mb-1 text-sm font-semibold text-gray-900">
                    Assistant IA FrançaisFluide
                  </h4>
                  <p className="text-xs text-gray-600">Posez vos questions sur le français</p>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isUser && (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                      msg.isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.isUser && (
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
                      <span className="text-xs font-medium text-gray-600">Vous</span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                    <Sparkles className="h-3 w-3 text-white animate-pulse" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl p-3 text-xs bg-gray-100 text-gray-900">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              {!canUseAI && (
                <div className="mb-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 p-3">
                  <div className="text-center">
                    <p className="mb-1 text-sm font-medium text-orange-800">
                      🚀 Assistant IA Premium
                    </p>
                    <p className="text-xs text-orange-700">
                      {frontendPlanId === 'free'
                        ? "Votre plan démo ne permet pas l'accès à l'assistant IA"
                        : "Upgradez vers un plan Étudiant (14.99$/mois) ou supérieur pour utiliser l'assistant IA"}
                    </p>
                    <button
                      onClick={() => (window.location.href = '/subscription')}
                      className="mt-2 rounded-lg bg-orange-600 px-3 py-1 text-xs text-white transition-colors hover:bg-orange-700"
                    >
                      Voir les plans
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    canUseAI ? 'Posez votre question...' : "Upgradez pour utiliser l'assistant..."
                  }
                  disabled={!canUseAI}
                  className="flex-1 rounded-lg border border-gray-300 p-2 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || !canUseAI}
                  className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
