'use client';

import React, { useState, useEffect } from 'react';
import { errorLogger } from '@/lib/errorLogger';
import { Bug, X, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

interface ErrorDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ErrorDebugPanel({ isOpen, onClose }: ErrorDebugPanelProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen, filter]);

  const loadLogs = () => {
    const allLogs = errorLogger.getLogs();
    const filteredLogs = filter === 'all' ? allLogs : allLogs.filter(log => log.level === filter);

    setLogs(filteredLogs.slice(0, 50)); // Limiter à 50 logs
  };

  const copyLogs = () => {
    const logsText = logs
      .map(
        log =>
          `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}\n` +
          (log.details ? `Détails: ${JSON.stringify(log.details, null, 2)}\n` : '') +
          (log.stack ? `Stack: ${log.stack}\n` : '') +
          '---\n'
      )
      .join('\n');

    navigator.clipboard.writeText(logsText);
    alert('Logs copiés dans le presse-papiers !');
  };

  const clearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'debug':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Panneau de debug - Erreurs</h2>
            <span className="text-sm text-gray-500">({logs.length} logs)</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filtres et actions */}
        <div className="border-b bg-gray-50 p-4">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex gap-2">
              {(['all', 'error', 'warn', 'info'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`rounded px-3 py-1 text-sm font-medium ${
                    filter === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {level === 'all' ? 'Tous' : level.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 rounded bg-white px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showDetails ? 'Masquer détails' : 'Afficher détails'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLogs}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              <Copy className="h-4 w-4" />
              Copier les logs
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Effacer les logs
            </button>
            <button
              onClick={loadLogs}
              className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des logs */}
        <div className="flex-1 overflow-y-auto p-4">
          {logs.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Aucun log trouvé</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className={`rounded-lg border p-3 ${getLevelColor(log.level)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs font-semibold uppercase">{log.level}</span>
                        <span className="text-xs font-medium">{log.category}</span>
                      </div>
                      <p className="mb-1 text-sm font-medium">{log.message}</p>

                      {showDetails && log.details && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">Détails</summary>
                            <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-xs">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}

                      {showDetails && log.stack && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">Stack trace</summary>
                            <pre className="mt-1 overflow-x-auto rounded border bg-white p-2 text-xs">
                              {log.stack}
                            </pre>
                          </details>
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
            💡 <strong>Astuce :</strong> Les logs sont sauvegardés automatiquement. Utilisez "Copier
            les logs" pour partager les erreurs avec l'équipe de développement.
          </p>
        </div>
      </div>
    </div>
  );
}
