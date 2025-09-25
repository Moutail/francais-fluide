'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import ErrorNotification from './ErrorNotification';
import ErrorLog from './ErrorLog';
import { globalErrorHandler } from '@/lib/globalErrorHandler';
import { Bug } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

interface ErrorInfo {
  message: string;
  stack?: string;
  source?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

interface ErrorContextType {
  showErrorLog: () => void;
  clearErrors: () => void;
  getErrorCount: () => number;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export default function ErrorProvider({ children }: ErrorProviderProps) {
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [showErrorLog, setShowErrorLog] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const isMounted = useIsMounted();

  useEffect(() => {
    // Écouter les nouvelles erreurs
    const handleNewError = (error: ErrorInfo) => {
      setCurrentError(error);
      setErrorCount(prev => prev + 1);
    };

    globalErrorHandler.addErrorListener(handleNewError);

    // Charger le nombre d'erreurs existantes
    setErrorCount(globalErrorHandler.getAllErrors().length);

    return () => {
      globalErrorHandler.removeErrorListener(handleNewError);
    };
  }, []);

  const handleCloseError = () => {
    setCurrentError(null);
  };

  const showErrorLogModal = () => {
    setShowErrorLog(true);
  };

  const closeErrorLog = () => {
    setShowErrorLog(false);
  };

  const clearErrors = () => {
    globalErrorHandler.clearErrors();
    setErrorCount(0);
    setCurrentError(null);
  };

  const getErrorCount = () => {
    return globalErrorHandler.getAllErrors().length;
  };

  const contextValue: ErrorContextType = {
    showErrorLog: showErrorLogModal,
    clearErrors,
    getErrorCount
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
      
      {/* Notification d'erreur actuelle */}
      {currentError && (
        <ErrorNotification
          error={currentError}
          onClose={handleCloseError}
          persistent={true}
        />
      )}

      {/* Bouton flottant pour le journal d'erreurs */}
      {isMounted && errorCount > 0 && (
        <button
          onClick={showErrorLogModal}
          className="fixed bottom-4 left-4 z-40 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors group"
          title={`${errorCount} erreur(s) détectée(s)`}
        >
          <Bug className="w-5 h-5" />
          {errorCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {errorCount > 99 ? '99+' : errorCount}
            </span>
          )}
        </button>
      )}

      {/* Journal d'erreurs modal */}
      <ErrorLog
        isOpen={showErrorLog}
        onClose={closeErrorLog}
      />
    </ErrorContext.Provider>
  );
}
