// src/components/ai/SimpleAIAssistant.tsx
'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface SimpleAIAssistantProps {
  userPlan?: string;
}

export const SimpleAIAssistant: React.FC<SimpleAIAssistantProps> = ({
  userPlan = 'free'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{id: string, text: string, isUser: boolean}>>([]);

  // Mapping des plans backend vers frontend
  const getFrontendPlanId = (backendPlan: string) => {
    const mapping: { [key: string]: string } = {
      'demo': 'free',
      'etudiant': 'student', 
      'premium': 'premium',
      'etablissement': 'enterprise',
    };
    return mapping[backendPlan] || 'free';
  };

  const frontendPlanId = getFrontendPlanId(userPlan);
  const canUseAI = frontendPlanId && frontendPlanId !== 'free';
  
  // Debug
  console.log('🤖 SimpleAIAssistant Debug:', {
    userPlan,
    frontendPlanId,
    canUseAI
  });

  const handleSend = () => {
    if (!message.trim() || !canUseAI) return;
    
    const userMsg = { id: Date.now().toString(), text: message, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    
    // Simulation de réponse IA
    setTimeout(() => {
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        text: "Je suis votre assistant IA pour l'apprentissage du français. Comment puis-je vous aider ?", 
        isUser: false 
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1000);
    
    setMessage('');
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
        className={`fixed w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all z-40 ${
          canUseAI 
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
            : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        }`}
        style={{ 
          bottom: '80px',
          right: '24px'
        }}
        title={canUseAI ? "Assistant IA" : "Assistant IA - Upgrade requis"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div 
            className="w-full max-w-md h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Assistant IA
                  </h3>
                  <p className="text-xs text-gray-600">
                    {canUseAI ? 'Disponible' : 'Upgrade requis'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                title="Fermer"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                    Assistant IA FrançaisFluide
                  </h4>
                  <p className="text-gray-600 text-xs">
                    Posez vos questions sur le français
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    msg.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!msg.isUser && (
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                      msg.isUser
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.isUser && (
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-gray-600">
                        Vous
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              {!canUseAI && (
                <div className="mb-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-orange-800 mb-1">
                      🚀 Assistant IA Premium
                    </p>
                    <p className="text-xs text-orange-700">
                      {frontendPlanId === 'free' 
                        ? "Votre plan démo ne permet pas l'accès à l'assistant IA" 
                        : "Upgradez vers un plan Étudiant (14.99$/mois) ou supérieur pour utiliser l'assistant IA"
                      }
                    </p>
                    <button 
                      onClick={() => window.location.href = '/subscription'}
                      className="mt-2 px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
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
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={canUseAI 
                    ? "Posez votre question..." 
                    : "Upgradez pour utiliser l'assistant..."
                  }
                  disabled={!canUseAI}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || !canUseAI}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
