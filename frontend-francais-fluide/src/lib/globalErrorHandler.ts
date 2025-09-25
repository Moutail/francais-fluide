// lib/globalErrorHandler.ts - Capture globale des erreurs JavaScript

interface ErrorInfo {
  message: string;
  stack?: string;
  source?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  componentStack?: string;
}

class GlobalErrorHandler {
  private errors: ErrorInfo[] = [];
  private maxErrors = 50;
  private listeners: Array<(error: ErrorInfo) => void> = [];

  constructor() {
    this.setupGlobalErrorHandlers();
    this.loadErrorsFromStorage();
  }

  private setupGlobalErrorHandlers() {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    // Capturer les erreurs JavaScript non gérées
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message || 'Erreur JavaScript',
        stack: event.error?.stack,
        source: event.filename ? `Fichier: ${event.filename}:${event.lineno}:${event.colno}` : 'JavaScript',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Capturer les promesses rejetées non gérées
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Promesse rejetée: ${event.reason}`,
        stack: event.reason?.stack,
        source: 'Promise Rejection',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Capturer les erreurs de fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Capturer les erreurs HTTP
        if (!response.ok) {
          this.captureError({
            message: `Erreur HTTP ${response.status}: ${response.statusText}`,
            source: `Fetch: ${args[0]}`,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          });
        }
        
        return response;
      } catch (error) {
        this.captureError({
          message: `Erreur de réseau: ${error}`,
          source: `Fetch: ${args[0]}`,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        });
        throw error;
      }
    };
  }

  private loadErrorsFromStorage() {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem('global_errors');
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Impossible de charger les erreurs depuis le stockage:', error);
    }
  }

  private saveErrorsToStorage() {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem('global_errors', JSON.stringify(this.errors));
    } catch (error) {
      console.warn('Impossible de sauvegarder les erreurs:', error);
    }
  }

  captureError(errorInfo: ErrorInfo) {
    this.errors.unshift(errorInfo);
    
    // Garder seulement les dernières erreurs
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Sauvegarder
    this.saveErrorsToStorage();

    // Notifier les listeners
    this.listeners.forEach(listener => listener(errorInfo));

    // Afficher dans la console
    console.error('Erreur capturée:', errorInfo);
  }

  // Ajouter un listener pour les erreurs
  addErrorListener(listener: (error: ErrorInfo) => void) {
    this.listeners.push(listener);
  }

  // Supprimer un listener
  removeErrorListener(listener: (error: ErrorInfo) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // Récupérer toutes les erreurs
  getAllErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  // Récupérer les erreurs récentes
  getRecentErrors(limit = 10): ErrorInfo[] {
    return this.errors.slice(0, limit);
  }

  // Nettoyer les erreurs
  clearErrors() {
    this.errors = [];
    this.saveErrorsToStorage();
  }

  // Exporter les erreurs
  exportErrors(): string {
    return JSON.stringify(this.errors, null, 2);
  }

  // Afficher les erreurs dans la console
  showErrors() {
    console.group('🚨 Erreurs capturées');
    this.errors.forEach((error, index) => {
      console.log(`[${index + 1}] ${error.timestamp} - ${error.source}:`, error.message);
      if (error.stack) {
        console.log('Stack:', error.stack);
      }
    });
    console.groupEnd();
  }
}

// Instance singleton - seulement côté client
export const globalErrorHandler = typeof window !== 'undefined' ? new GlobalErrorHandler() : {
  captureError: () => {},
  addErrorListener: () => {},
  removeErrorListener: () => {},
  getAllErrors: () => [],
  getRecentErrors: () => [],
  clearErrors: () => {},
  exportErrors: () => '[]',
  showErrors: () => {}
} as GlobalErrorHandler;

// Fonction utilitaire pour capturer manuellement une erreur
export const captureError = (message: string, error?: Error, source?: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  globalErrorHandler.captureError({
    message,
    stack: error?.stack,
    source: source || 'Manual',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
};

export default globalErrorHandler;
