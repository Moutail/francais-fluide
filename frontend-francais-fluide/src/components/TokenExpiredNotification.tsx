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
  onLogin 
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">
              Session expirée
            </h4>
            <p className="text-sm text-yellow-700 mb-3">
              Votre session a expiré. Vous devez vous reconnecter pour continuer.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Actualisation...' : 'Actualiser'}
              </button>
              
              <button
                onClick={handleLogin}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                <LogIn className="w-3 h-3" />
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
