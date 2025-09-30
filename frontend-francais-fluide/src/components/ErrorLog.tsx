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
        return (
          error.message.toLowerCase().includes('error') ||
          error.message.toLowerCase().includes('failed') ||
          error.message.toLowerCase().includes('exception')
        );
      default:
        return true;
    }
  });

  const copyAllErrors = () => {
    const errorText = filteredErrors
      .map(
        (error, index) =>
          `[${index + 1}] ${error.timestamp} - ${error.source || 'Unknown'}\n` +
          `Message: ${error.message}\n` +
          (error.stack ? `Stack: ${error.stack}\n` : '') +
          `URL: ${error.url}\n` +
          '---\n'
      )
      .join('\n');

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
        second: '2-digit',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[80vh] w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <Bug className="size-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Journal d'erreurs</h2>
              <p className="text-sm text-gray-600">{filteredErrors.length} erreur(s) trouvée(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="size-5" />
          </button>
        </div>

        {/* Filtres et actions */}
        <div className="border-b bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex gap-2">
              {(['all', 'recent', 'critical'] as const).map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    filter === filterType
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterType === 'all'
                    ? 'Toutes'
                    : filterType === 'recent'
                      ? 'Récentes'
                      : 'Critiques'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              {showDetails ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showDetails ? 'Masquer détails' : 'Afficher détails'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyAllErrors}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              <Copy className="size-4" />
              Copier toutes les erreurs
            </button>
            <button
              onClick={clearErrors}
              className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              <Trash2 className="size-4" />
              Effacer le journal
            </button>
            <button
              onClick={loadErrors}
              className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des erreurs */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredErrors.length === 0 ? (
            <div className="py-12 text-center">
              <AlertTriangle className="mx-auto mb-4 size-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Aucune erreur trouvée</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? "Aucune erreur n'a été capturée pour le moment."
                  : `Aucune erreur ${filter === 'recent' ? 'récente' : 'critique'} trouvée.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredErrors.map((error, index) => (
                <div key={index} className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getErrorIcon(error.message)}</span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-red-800">
                          {error.source || 'Unknown Source'}
                        </span>
                        <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                          {formatTimestamp(error.timestamp)}
                        </span>
                      </div>

                      <p className="mb-2 break-words text-sm text-red-700">{error.message}</p>

                      {showDetails && (
                        <div className="space-y-2">
                          {error.stack && (
                            <details className="text-xs">
                              <summary className="cursor-pointer font-medium text-red-800">
                                Stack trace
                              </summary>
                              <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-red-600">
                                {error.stack}
                              </pre>
                            </details>
                          )}

                          <div className="text-xs text-red-600">
                            <p>
                              <strong>URL:</strong> {error.url}
                            </p>
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
        <div className="border-t bg-gray-50 p-4 text-xs text-gray-600">
          <p>
            💡 <strong>Astuce :</strong> Les erreurs sont automatiquement capturées et sauvegardées.
            Utilisez "Copier toutes les erreurs" pour partager les détails avec l'équipe de
            développement.
          </p>
        </div>
      </div>
    </div>
  );
}
