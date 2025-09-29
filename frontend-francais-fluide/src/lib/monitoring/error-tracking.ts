// src/lib/monitoring/error-tracking.ts

/**
 * Système de suivi des erreurs avec Sentry pour FrançaisFluide
 * Tracking des erreurs JavaScript, React, et API
 */

// Types pour le tracking d'erreurs
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: number;
  level?: 'error' | 'warning' | 'info' | 'debug';
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface PerformanceContext {
  operation: string;
  duration: number;
  memory?: number;
  timestamp?: number;
  tags?: Record<string, string>;
}

export interface UserFeedback {
  eventId: string;
  name: string;
  email: string;
  comments: string;
  rating?: number;
}

// Configuration Sentry
const SENTRY_CONFIG = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1, // 10% des transactions
  profilesSampleRate: 0.1, // 10% des profils
  beforeSend: (event: any, hint: any) => {
    // Filtrer les erreurs sensibles
    if (event.exception) {
      const error = hint.originalException;
      if (error && error.message) {
        // Filtrer les erreurs de réseau
        if (error.message.includes('Network Error') || 
            error.message.includes('Failed to fetch')) {
          return null;
        }
        
        // Filtrer les erreurs de CORS
        if (error.message.includes('CORS') || 
            error.message.includes('cross-origin')) {
          return null;
        }
      }
    }
    
    return event;
  },
  beforeBreadcrumb: (breadcrumb: any) => {
    // Filtrer les breadcrumbs sensibles
    if (breadcrumb.category === 'console' && 
        (breadcrumb.message?.includes('password') || 
         breadcrumb.message?.includes('token'))) {
      return null;
    }
    
    return breadcrumb;
  }
};

class ErrorTracker {
  private isInitialized: boolean = false;
  private sessionId: string;
  private userId: string | null = null;
  private context: ErrorContext = {};

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeSentry();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialise Sentry
   */
  private async initializeSentry(): Promise<void> {
    if (!SENTRY_CONFIG.enabled || !SENTRY_CONFIG.dsn) {
      console.log('🔍 Sentry non configuré ou désactivé');
      return;
    }

    try {
      // Import dynamique de Sentry
      const Sentry = await import('@sentry/nextjs');
      // Le SDK Next.js fournit une instrumentation de routage prête à l'emploi

      Sentry.init({
        dsn: SENTRY_CONFIG.dsn,
        environment: SENTRY_CONFIG.environment,
        tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
        profilesSampleRate: SENTRY_CONFIG.profilesSampleRate,
        beforeSend: SENTRY_CONFIG.beforeSend,
        beforeBreadcrumb: SENTRY_CONFIG.beforeBreadcrumb,
        integrations: [
          new Sentry.BrowserTracing({
            // Tracing des routes Next.js
            // Cast nécessaire car l'import dynamique rend le type trop large
            routingInstrumentation: (Sentry as any).nextRouterInstrumentation as any,
          }),
          new Sentry.Replay({
            // Replay des sessions
            maskAllText: false,
            blockAllMedia: true,
          }),
        ],
        // Configuration des tags par défaut
        initialScope: {
          tags: {
            component: 'francais-fluide',
            version: process.env.npm_package_version || '1.0.0',
          },
        },
      });

      this.isInitialized = true;
      console.log('✅ Sentry initialisé');
      
    } catch (error) {
      console.error('❌ Erreur initialisation Sentry:', error);
    }
  }

  /**
   * Configure les gestionnaires d'erreurs globaux
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Gestionnaire d'erreurs JavaScript globales
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        level: 'error',
        tags: {
          type: 'javascript',
          filename: event.filename,
          lineno: event.lineno?.toString(),
          colno: event.colno?.toString(),
        },
        extra: {
          message: event.message,
          stack: event.error?.stack,
        }
      });
    });

    // Gestionnaire d'erreurs de promesses non capturées
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        level: 'error',
        tags: {
          type: 'unhandledrejection',
        },
        extra: {
          reason: event.reason,
        }
      });
    });

    // Gestionnaire d'erreurs de ressources
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError(new Error(`Resource error: ${event.target}`), {
          level: 'warning',
          tags: {
            type: 'resource',
            tagName: (event.target as any)?.tagName,
          },
          extra: {
            src: (event.target as any)?.src,
            href: (event.target as any)?.href,
          }
        });
      }
    }, true);
  }

  /**
   * Capture une erreur
   */
  public captureError(error: Error | string, context?: Partial<ErrorContext>): void {
    if (!this.isInitialized) {
      console.error('Sentry non initialisé:', error);
      return;
    }

    const errorContext = {
      ...this.context,
      ...context,
      timestamp: Date.now(),
    };

    try {
      // Import dynamique de Sentry
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.withScope((scope) => {
          // Ajouter le contexte utilisateur
          if (this.userId) {
            scope.setUser({ id: this.userId });
          }

          // Ajouter les tags
          if (errorContext.tags) {
            Object.entries(errorContext.tags).forEach(([key, value]) => {
              scope.setTag(key, value);
            });
          }

          // Ajouter les données supplémentaires
          if (errorContext.extra) {
            Object.entries(errorContext.extra).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }

          // Définir le niveau
          if (errorContext.level) {
            scope.setLevel(errorContext.level);
          }

          // Capturer l'erreur
          if (typeof error === 'string') {
            Sentry.captureMessage(error);
          } else {
            Sentry.captureException(error);
          }
        });
      });
    } catch (err) {
      console.error('Erreur lors de la capture:', err);
    }
  }

  /**
   * Capture un message
   */
  public captureMessage(message: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', context?: Partial<ErrorContext>): void {
    if (!this.isInitialized) {
      console.log(`[${level.toUpperCase()}] ${message}`);
      return;
    }

    try {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.withScope((scope) => {
          if (this.userId) {
            scope.setUser({ id: this.userId });
          }

          scope.setLevel(level);

          if (context?.tags) {
            Object.entries(context.tags).forEach(([key, value]) => {
              scope.setTag(key, value);
            });
          }

          if (context?.extra) {
            Object.entries(context.extra).forEach(([key, value]) => {
              scope.setExtra(key, value);
            });
          }

          Sentry.captureMessage(message);
        });
      });
    } catch (err) {
      console.error('Erreur lors de la capture de message:', err);
    }
  }

  /**
   * Démarre une transaction de performance
   */
  public startTransaction(name: string, op: string): any {
    if (!this.isInitialized) return null;

    try {
      return import('@sentry/nextjs').then((Sentry) => {
        return Sentry.startTransaction({
          name,
          op,
        });
      });
    } catch (err) {
      console.error('Erreur lors du démarrage de transaction:', err);
      return null;
    }
  }

  /**
   * Ajoute un breadcrumb
   */
  public addBreadcrumb(message: string, category: string, level: 'error' | 'warning' | 'info' | 'debug' = 'info', data?: any): void {
    if (!this.isInitialized) return;

    try {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.addBreadcrumb({
          message,
          category,
          level,
          data,
          timestamp: Date.now(),
        });
      });
    } catch (err) {
      console.error('Erreur lors de l\'ajout de breadcrumb:', err);
    }
  }

  /**
   * Définit l'utilisateur actuel
   */
  public setUser(userId: string, userInfo?: { email?: string; username?: string }): void {
    this.userId = userId;
    
    if (!this.isInitialized) return;

    try {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.setUser({
          id: userId,
          email: userInfo?.email,
          username: userInfo?.username,
        });
      });
    } catch (err) {
      console.error('Erreur lors de la définition de l\'utilisateur:', err);
    }
  }

  /**
   * Définit le contexte global
   */
  public setContext(context: Partial<ErrorContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Ajoute des tags
   */
  public setTags(tags: Record<string, string>): void {
    if (!this.isInitialized) return;

    try {
      import('@sentry/nextjs').then((Sentry) => {
        Sentry.setTags(tags);
      });
    } catch (err) {
      console.error('Erreur lors de la définition des tags:', err);
    }
  }

  /**
   * Génère un ID de session unique
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtient l'ID de session
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Capture les métriques de performance
   */
  public capturePerformance(operation: string, duration: number, memory?: number, tags?: Record<string, string>): void {
    if (!this.isInitialized) return;

    this.captureMessage(`Performance: ${operation}`, 'info', {
      tags: {
        operation,
        duration: duration.toString(),
        ...tags,
      },
      extra: {
        duration,
        memory,
        timestamp: Date.now(),
      }
    });
  }

  /**
   * Capture les erreurs d'API
   */
  public captureAPIError(endpoint: string, method: string, statusCode: number, error: any): void {
    this.captureError(new Error(`API Error: ${method} ${endpoint}`), {
      level: 'error',
      tags: {
        type: 'api',
        endpoint,
        method,
        statusCode: statusCode.toString(),
      },
      extra: {
        endpoint,
        method,
        statusCode,
        error: error?.message || error,
      }
    });
  }

  /**
   * Capture les erreurs React
   */
  public captureReactError(error: Error, errorInfo: any, componentStack?: string): void {
    this.captureError(error, {
      level: 'error',
      tags: {
        type: 'react',
      },
      extra: {
        componentStack,
        errorInfo,
      }
    });
  }

  /**
   * Obtient les statistiques
   */
  public getStats(): any {
    return {
      isInitialized: this.isInitialized,
      sessionId: this.sessionId,
      userId: this.userId,
      environment: SENTRY_CONFIG.environment,
      enabled: SENTRY_CONFIG.enabled,
    };
  }
}

// Instance singleton
export const errorTracker = new ErrorTracker();

// Hook React pour utiliser le tracker d'erreurs
export const useErrorTracking = () => {
  const [stats, setStats] = React.useState(errorTracker.getStats());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(errorTracker.getStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const captureError = React.useCallback((error: Error | string, context?: Partial<ErrorContext>) => {
    errorTracker.captureError(error, context);
  }, []);

  const captureMessage = React.useCallback((message: string, level?: 'error' | 'warning' | 'info' | 'debug', context?: Partial<ErrorContext>) => {
    errorTracker.captureMessage(message, level, context);
  }, []);

  const setUser = React.useCallback((userId: string, userInfo?: { email?: string; username?: string }) => {
    errorTracker.setUser(userId, userInfo);
  }, []);

  const addBreadcrumb = React.useCallback((message: string, category: string, level?: 'error' | 'warning' | 'info' | 'debug', data?: any) => {
    errorTracker.addBreadcrumb(message, category, level, data);
  }, []);

  return {
    stats,
    captureError,
    captureMessage,
    setUser,
    addBreadcrumb,
    capturePerformance: errorTracker.capturePerformance.bind(errorTracker),
    captureAPIError: errorTracker.captureAPIError.bind(errorTracker),
    captureReactError: errorTracker.captureReactError.bind(errorTracker),
    setContext: errorTracker.setContext.bind(errorTracker),
    setTags: errorTracker.setTags.bind(errorTracker)
  };
};

// Import React pour les hooks
import React from 'react';
