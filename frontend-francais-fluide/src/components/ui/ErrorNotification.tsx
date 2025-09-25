'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Copy, Bug } from 'lucide-react';

interface ErrorNotificationProps {
  error: string;
  onClose: () => void;
  onShowDebug?: () => void;
  persistent?: boolean;
}

export default function ErrorNotification({ 
  error, 
  onClose, 
  onShowDebug,
  persistent = false 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!persistent) {
      // Auto-hide après 15 secondes au lieu de 10
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Attendre l'animation
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [persistent, onClose]);

  const copyError = () => {
    navigator.clipboard.writeText(error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              Erreur de connexion
            </h4>
            <p className="text-sm text-red-700 break-words">
              {error}
            </p>
            
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={copyError}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copié!' : 'Copier'}
              </button>
              
              {onShowDebug && (
                <button
                  onClick={onShowDebug}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <Bug className="w-3 h-3" />
                  Debug
                </button>
              )}
            </div>
          </div>
          
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
