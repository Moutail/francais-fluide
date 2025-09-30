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
  persistent = true,
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
      userAgent: navigator.userAgent,
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
        second: '2-digit',
      });
    } catch {
      return timestamp;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed right-4 top-4 z-50 max-w-md">
      <div className="animate-in slide-in-from-right rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h4 className="text-sm font-semibold text-red-800">Erreur détectée</h4>
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-600">
                {formatTimestamp(error.timestamp)}
              </span>
            </div>

            <p className="mb-2 break-words text-sm text-red-700">{error.message}</p>

            {error.source && <p className="mb-2 text-xs text-red-600">Source: {error.source}</p>}

            {showDetails && error.stack && (
              <div className="mt-2 rounded bg-red-100 p-2 text-xs">
                <pre className="overflow-x-auto whitespace-pre-wrap text-red-800">
                  {error.stack}
                </pre>
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={copyError}
                className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
              >
                <Copy className="h-3 w-3" />
                {copied ? 'Copié!' : 'Copier'}
              </button>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
              >
                <Eye className="h-3 w-3" />
                {showDetails ? 'Masquer' : 'Détails'}
              </button>

              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
              >
                <X className="h-3 w-3" />
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
