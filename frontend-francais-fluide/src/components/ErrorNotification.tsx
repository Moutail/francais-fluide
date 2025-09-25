'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Copy, Bug, Clock, Eye } from 'lucide-react';

interface ErrorNotificationProps {
  error: {
    message: string;
    stack?: string;
    timestamp: string;
    source?: string;
  };
  onClose: () => void;
  persistent?: boolean;
}

export default function ErrorNotification({ 
  error, 
  onClose, 
  persistent = true 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!persistent) {
      // Auto-hide après 30 secondes au lieu de 10
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [persistent, onClose]);

  const copyError = () => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: error.timestamp,
      source: error.source,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-right">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-red-800">
                Erreur détectée
              </h4>
              <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                {formatTimestamp(error.timestamp)}
              </span>
            </div>
            
            <p className="text-sm text-red-700 break-words mb-2">
              {error.message}
            </p>

            {error.source && (
              <p className="text-xs text-red-600 mb-2">
                Source: {error.source}
              </p>
            )}
            
            {showDetails && error.stack && (
              <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                <pre className="whitespace-pre-wrap text-red-800 overflow-x-auto">
                  {error.stack}
                </pre>
              </div>
            )}
            
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={copyError}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'Copié!' : 'Copier'}
              </button>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Eye className="w-3 h-3" />
                {showDetails ? 'Masquer' : 'Détails'}
              </button>

              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <X className="w-3 h-3" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
