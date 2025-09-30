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
  persistent = false,
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
    <div className="fixed right-4 top-4 z-50 max-w-md">
      <div className="animate-in slide-in-from-right rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />

          <div className="min-w-0 flex-1">
            <h4 className="mb-1 text-sm font-semibold text-red-800">Erreur de connexion</h4>
            <p className="break-words text-sm text-red-700">{error}</p>

            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={copyError}
                className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
              >
                <Copy className="size-3" />
                {copied ? 'Copié!' : 'Copier'}
              </button>

              {onShowDebug && (
                <button
                  onClick={onShowDebug}
                  className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200"
                >
                  <Bug className="size-3" />
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
            className="p-1 text-red-400 transition-colors hover:text-red-600"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
