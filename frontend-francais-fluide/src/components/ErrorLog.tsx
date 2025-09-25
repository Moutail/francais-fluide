'use client';

import React, { useState, useEffect } from 'react';
import { Bug, X, Copy, Trash2, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react';
import { globalErrorHandler } from '@/lib/globalErrorHandler';

interface ErrorLogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  source?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

export default function ErrorLog({ isOpen, onClose }: ErrorLogProps) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'critical'>('all');

  useEffect(() => {
    if (isOpen) {
      loadErrors();
    }
  }, [isOpen]);

  const loadErrors = () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const allErrors = globalErrorHandler.getAllErrors();
    setErrors(allErrors);
  };

  const filteredErrors = errors.filter(error => {
    switch (filter) {
      case 'recent':
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(error.timestamp) > oneHourAgo;
      case 'critical':
        return error.message.toLowerCase().includes('error') || 
               error.message.toLowerCase().includes('failed') ||
               error.message.toLowerCase().includes('exception');
      default:
        return true;
    }
  });

  const copyAllErrors = () => {
    const errorText = filteredErrors.map((error, index) => 
      `[${index + 1}] ${error.timestamp} - ${error.source || 'Unknown'}\n` +
      `Message: ${error.message}\n` +
      (error.stack ? `Stack: ${error.stack}\n` : '') +
      `URL: ${error.url}\n` +
      '---\n'
    ).join('\n');
    
    navigator.clipboard.writeText(errorText);
    alert('Erreurs copiées dans le presse-papiers !');
  };

  const clearErrors = () => {
    if (typeof window === 'undefined') {
      return;
    }
    
    globalErrorHandler.clearErrors();
    setErrors([]);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getErrorIcon = (message: string) => {
    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch')) {
      return '🌐';
    } else if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('token')) {
      return '🔐';
    } else if (message.toLowerCase().includes('promise')) {
      return '⏳';
    } else {
      return '⚠️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Journal d'erreurs</h2>
              <p className="text-sm text-gray-600">{filteredErrors.length} erreur(s) trouvée(s)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filtres et actions */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex gap-2">
              {(['all', 'recent', 'critical'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    filter === filterType
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterType === 'all' ? 'Toutes' : 
                   filterType === 'recent' ? 'Récentes' : 'Critiques'}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 px-3 py-1 bg-white text-gray-600 rounded hover:bg-gray-100 text-sm"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Masquer détails' : 'Afficher détails'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyAllErrors}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Copy className="w-4 h-4" />
              Copier toutes les erreurs
            </button>
            <button
              onClick={clearErrors}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Effacer le journal
            </button>
            <button
              onClick={loadErrors}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des erreurs */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredErrors.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune erreur trouvée</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Aucune erreur n\'a été capturée pour le moment.'
                  : `Aucune erreur ${filter === 'recent' ? 'récente' : 'critique'} trouvée.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((error, index) => (
                <div
                  key={index}
                  className="border border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getErrorIcon(error.message)}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-red-800">
                          {error.source || 'Unknown Source'}
                        </span>
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-red-700 break-words mb-2">
                        {error.message}
                      </p>
                      
                      {showDetails && (
                        <div className="space-y-2">
                          {error.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer font-medium text-red-800">
                                Stack trace
                              </summary>
                              <pre className="mt-1 p-2 bg-white rounded border text-red-600 overflow-x-auto">
                                {error.stack}
                              </pre>
                            </details>
                          )}
                          
                          <div className="text-xs text-red-600">
                            <p><strong>URL:</strong> {error.url}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
          <p>
            💡 <strong>Astuce :</strong> Les erreurs sont automatiquement capturées et sauvegardées. 
            Utilisez "Copier toutes les erreurs" pour partager les détails avec l'équipe de développement.
          </p>
        </div>
      </div>
    </div>
  );
}
