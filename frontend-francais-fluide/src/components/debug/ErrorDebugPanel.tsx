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
    const filteredLogs = filter === 'all' 
      ? allLogs 
      : allLogs.filter(log => log.level === filter);
    
    setLogs(filteredLogs.slice(0, 50)); // Limiter à 50 logs
  };

  const copyLogs = () => {
    const logsText = logs.map(log => 
      `[${log.timestamp}] ${log.level.toUpperCase()} - ${log.category}: ${log.message}\n` +
      (log.details ? `Détails: ${JSON.stringify(log.details, null, 2)}\n` : '') +
      (log.stack ? `Stack: ${log.stack}\n` : '') +
      '---\n'
    ).join('\n');
    
    navigator.clipboard.writeText(logsText);
    alert('Logs copiés dans le presse-papiers !');
  };

  const clearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'debug': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold">Panneau de debug - Erreurs</h2>
            <span className="text-sm text-gray-500">({logs.length} logs)</span>
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
              {(['all', 'error', 'warn', 'info'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
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
              className="flex items-center gap-1 px-3 py-1 bg-white text-gray-600 rounded hover:bg-gray-100 text-sm"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Masquer détails' : 'Afficher détails'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyLogs}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <Copy className="w-4 h-4" />
              Copier les logs
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Effacer les logs
            </button>
            <button
              onClick={loadLogs}
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Liste des logs */}
        <div className="flex-1 overflow-y-auto p-4">
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Aucun log trouvé
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getLevelColor(log.level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-gray-500">
                          {new Date(log.timestamp).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs font-semibold uppercase">
                          {log.level}
                        </span>
                        <span className="text-xs font-medium">
                          {log.category}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">{log.message}</p>
                      
                      {showDetails && log.details && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">
                              Détails
                            </summary>
                            <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                      
                      {showDetails && log.stack && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer font-medium">
                              Stack trace
                            </summary>
                            <pre className="mt-1 p-2 bg-white rounded border text-xs overflow-x-auto">
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
        <div className="p-4 border-t bg-gray-50 text-xs text-gray-600">
          <p>
            💡 <strong>Astuce :</strong> Les logs sont sauvegardés automatiquement. 
            Utilisez "Copier les logs" pour partager les erreurs avec l'équipe de développement.
          </p>
        </div>
      </div>
    </div>
  );
}
