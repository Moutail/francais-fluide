'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface TokenExpiredNotificationProps {
  onRefresh: () => void;
  onLogin: () => void;
}

export default function TokenExpiredNotification({
  onRefresh,
  onLogin,
}: TokenExpiredNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isMounted = useIsMounted();

  useEffect(() => {
    // Écouter les erreurs 401
    const handleTokenExpired = () => {
      setIsVisible(true);
    };

    // Écouter les erreurs dans la console
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('Session expirée') || message.includes('Token expiré')) {
        handleTokenExpired();
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setIsVisible(false);
    } catch (error) {
      console.warn('Erfresh échoué:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogin = () => {
    onLogin();
    setIsVisible(false);
  };

  if (!isMounted || !isVisible) return null;

  return (
    <div className="fixed left-1/2 top-4 z-50 mx-4 w-full max-w-md -translate-x-1/2">
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />

          <div className="flex-1">
            <h4 className="mb-1 text-sm font-semibold text-yellow-800">Session expirée</h4>
            <p className="mb-3 text-sm text-yellow-700">
              Votre session a expiré. Vous devez vous reconnecter pour continuer.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-700 transition-colors hover:bg-yellow-200 disabled:opacity-50"
              >
                <RefreshCw className={`${isRefreshing ? 'animate-spin' : ''} size-3`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </button>

              <button
                onClick={handleLogin}
                className="flex items-center gap-1 rounded bg-yellow-600 px-3 py-1 text-xs text-white transition-colors hover:bg-yellow-700"
              >
                <LogIn className="size-3" />
                Se reconnecter
              </button>
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-yellow-400 hover:text-yellow-600"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
