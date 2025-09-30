// src/lib/monitoring/analytics.ts

/**
 * Système d'analytics pour FrançaisFluide
 * Intégration Google Analytics et Plausible
 */

// Types pour les analytics
export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface UserProperties {
  user_id?: string;
  user_level?: 'beginner' | 'intermediate' | 'advanced';
  subscription_type?: 'free' | 'premium' | 'enterprise';
  language?: string;
  country?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
}

export interface PageView {
  page_title: string;
  page_location: string;
  page_path: string;
  referrer?: string;
}

// Configuration des analytics
const ANALYTICS_CONFIG = {
  googleAnalytics: {
    enabled: process.env.NEXT_PUBLIC_GA_ID && process.env.NODE_ENV === 'production',
    measurementId: process.env.NEXT_PUBLIC_GA_ID,
    debug: process.env.NODE_ENV === 'development',
  },
  plausible: {
    enabled: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && process.env.NODE_ENV === 'production',
    domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    apiHost: process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io',
  },
  custom: {
    enabled:
      process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_ENDPOINT && process.env.NODE_ENV === 'production',
    endpoint: process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_ENDPOINT,
  },
};

class AnalyticsTracker {
  private isInitialized: boolean = false;
  private userProperties: UserProperties = {};
  private sessionStart: number = Date.now();
  private eventQueue: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Initialise les services d'analytics
   */
  private async initializeAnalytics(): Promise<void> {
    try {
      // Initialiser Google Analytics
      if (ANALYTICS_CONFIG.googleAnalytics.enabled) {
        await this.initializeGoogleAnalytics();
      }

      // Initialiser Plausible
      if (ANALYTICS_CONFIG.plausible.enabled) {
        this.initializePlausible();
      }

      this.isInitialized = true;
      console.log('✅ Analytics initialisés');

      // Traiter la queue d'événements
      this.processEventQueue();
    } catch (error) {
      console.error('❌ Erreur initialisation analytics:', error);
    }
  }

  /**
   * Initialise Google Analytics
   */
  private async initializeGoogleAnalytics(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Charger gtag
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`;
      document.head.appendChild(script);

      // Initialiser gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };

      window.gtag('js', new Date());
      window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
        debug_mode: ANALYTICS_CONFIG.googleAnalytics.debug,
        send_page_view: false, // Nous gérons les page views manuellement
        custom_map: {
          custom_parameter_1: 'user_level',
          custom_parameter_2: 'subscription_type',
        },
      });

      console.log('✅ Google Analytics initialisé');
    } catch (error) {
      console.error('❌ Erreur Google Analytics:', error);
    }
  }

  /**
   * Initialise Plausible
   */
  private initializePlausible(): void {
    if (typeof window === 'undefined') return;

    try {
      const domain = ANALYTICS_CONFIG.plausible.domain;
      if (!domain) {
        // Domaine non configuré, ignorer l'init Plausible
        return;
      }
      const script = document.createElement('script');
      script.defer = true;
      script.setAttribute('data-domain', domain as string);
      script.src = `${ANALYTICS_CONFIG.plausible.apiHost}/js/script.js`;
      document.head.appendChild(script);

      console.log('✅ Plausible initialisé');
    } catch (error) {
      console.error('❌ Erreur Plausible:', error);
    }
  }

  /**
   * Traque un événement
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      this.eventQueue.push(event);
      return;
    }

    try {
      // Google Analytics
      if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
        window.gtag('event', event.action, {
          event_category: event.category,
          event_label: event.label,
          value: event.value,
          custom_parameters: event.custom_parameters,
          ...this.userProperties,
        });
      }

      // Plausible
      if (ANALYTICS_CONFIG.plausible.enabled && window.plausible) {
        window.plausible(event.action, {
          props: {
            category: event.category,
            label: event.label,
            value: event.value,
            ...event.custom_parameters,
          },
        });
      }

      // Analytics personnalisé
      if (ANALYTICS_CONFIG.custom.enabled) {
        this.sendCustomEvent(event);
      }

      console.log('📊 Event tracked:', event);
    } catch (error) {
      console.error('❌ Erreur tracking événement:', error);
    }
  }

  /**
   * Traque une page view
   */
  public trackPageView(pageView: PageView): void {
    try {
      // Google Analytics
      if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
        window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
          page_title: pageView.page_title,
          page_location: pageView.page_location,
          page_path: pageView.page_path,
          custom_map: {
            custom_parameter_1: 'user_level',
            custom_parameter_2: 'subscription_type',
          },
        });
      }

      // Plausible (automatique avec le script)
      // Pas besoin de code supplémentaire

      // Analytics personnalisé
      if (ANALYTICS_CONFIG.custom.enabled) {
        this.sendCustomPageView(pageView);
      }

      this.pageViews.push(pageView);
      console.log('📄 Page view tracked:', pageView);
    } catch (error) {
      console.error('❌ Erreur tracking page view:', error);
    }
  }

  /**
   * Définit les propriétés utilisateur
   */
  public setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };

    try {
      // Google Analytics
      if (ANALYTICS_CONFIG.googleAnalytics.enabled && window.gtag) {
        window.gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
          user_id: properties.user_id,
          custom_map: {
            custom_parameter_1: 'user_level',
            custom_parameter_2: 'subscription_type',
          },
        });
      }

      console.log('👤 User properties set:', properties);
    } catch (error) {
      console.error('❌ Erreur définition propriétés utilisateur:', error);
    }
  }

  /**
   * Envoie un événement personnalisé
   */
  private async sendCustomEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(ANALYTICS_CONFIG.custom.endpoint + '/event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          user_properties: this.userProperties,
          timestamp: Date.now(),
          session_id: this.getSessionId(),
        }),
      });
    } catch (error) {
      console.error('❌ Erreur envoi événement personnalisé:', error);
    }
  }

  /**
   * Envoie une page view personnalisée
   */
  private async sendCustomPageView(pageView: PageView): Promise<void> {
    try {
      await fetch(ANALYTICS_CONFIG.custom.endpoint + '/pageview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pageView,
          user_properties: this.userProperties,
          timestamp: Date.now(),
          session_id: this.getSessionId(),
        }),
      });
    } catch (error) {
      console.error('❌ Erreur envoi page view personnalisée:', error);
    }
  }

  /**
   * Traite la queue d'événements
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.trackEvent(event);
      }
    }
  }

  /**
   * Génère un ID de session unique
   */
  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';

    let sessionId = localStorage.getItem('analytics-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('analytics-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Obtient les métriques de session
   */
  public getSessionMetrics(): any {
    const now = Date.now();
    const sessionDuration = now - this.sessionStart;

    return {
      sessionId: this.getSessionId(),
      sessionStart: this.sessionStart,
      sessionDuration,
      pageViews: this.pageViews.length,
      events: this.eventQueue.length,
      userProperties: this.userProperties,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Événements prédéfinis pour FrançaisFluide
   */
  public trackGrammarCheck = (textLength: number, errorsFound: number, level: string) => {
    this.trackEvent({
      action: 'grammar_check',
      category: 'learning',
      label: level,
      value: errorsFound,
      custom_parameters: {
        text_length: textLength,
        errors_found: errorsFound,
        user_level: level,
      },
    });
  };

  public trackExerciseStart = (exerciseType: string, difficulty: number, theme: string) => {
    this.trackEvent({
      action: 'exercise_start',
      category: 'learning',
      label: exerciseType,
      value: difficulty,
      custom_parameters: {
        exercise_type: exerciseType,
        difficulty,
        theme,
      },
    });
  };

  public trackExerciseComplete = (exerciseType: string, score: number, timeSpent: number) => {
    this.trackEvent({
      action: 'exercise_complete',
      category: 'learning',
      label: exerciseType,
      value: score,
      custom_parameters: {
        exercise_type: exerciseType,
        score,
        time_spent: timeSpent,
      },
    });
  };

  public trackAICorrection = (provider: string, responseTime: number, confidence: number) => {
    this.trackEvent({
      action: 'ai_correction',
      category: 'ai',
      label: provider,
      value: confidence * 100,
      custom_parameters: {
        provider,
        response_time: responseTime,
        confidence,
      },
    });
  };

  public trackContentGeneration = (type: string, level: string, success: boolean) => {
    this.trackEvent({
      action: 'content_generation',
      category: 'ai',
      label: type,
      value: success ? 1 : 0,
      custom_parameters: {
        content_type: type,
        user_level: level,
        success,
      },
    });
  };

  public trackUserProgress = (level: string, progress: number, achievements: string[]) => {
    this.trackEvent({
      action: 'progress_update',
      category: 'gamification',
      label: level,
      value: progress,
      custom_parameters: {
        user_level: level,
        progress_percentage: progress,
        achievements_count: achievements.length,
      },
    });
  };

  public trackFeatureUsage = (feature: string, context?: string) => {
    this.trackEvent({
      action: 'feature_usage',
      category: 'engagement',
      label: feature,
      custom_parameters: {
        feature,
        context,
      },
    });
  };

  public trackError = (errorType: string, component: string, severity: string) => {
    this.trackEvent({
      action: 'error_occurred',
      category: 'error',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        component,
        severity,
      },
    });
  };
}

// Instance singleton
export const analyticsTracker = new AnalyticsTracker();

// Hook React pour utiliser les analytics
export const useAnalytics = () => {
  const [metrics, setMetrics] = React.useState(analyticsTracker.getSessionMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(analyticsTracker.getSessionMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const trackEvent = React.useCallback((event: AnalyticsEvent) => {
    analyticsTracker.trackEvent(event);
  }, []);

  const trackPageView = React.useCallback((pageView: PageView) => {
    analyticsTracker.trackPageView(pageView);
  }, []);

  const setUserProperties = React.useCallback((properties: UserProperties) => {
    analyticsTracker.setUserProperties(properties);
  }, []);

  return {
    metrics,
    trackEvent,
    trackPageView,
    setUserProperties,
    // Méthodes prédéfinies
    trackGrammarCheck: analyticsTracker.trackGrammarCheck,
    trackExerciseStart: analyticsTracker.trackExerciseStart,
    trackExerciseComplete: analyticsTracker.trackExerciseComplete,
    trackAICorrection: analyticsTracker.trackAICorrection,
    trackContentGeneration: analyticsTracker.trackContentGeneration,
    trackUserProgress: analyticsTracker.trackUserProgress,
    trackFeatureUsage: analyticsTracker.trackFeatureUsage,
    trackError: analyticsTracker.trackError,
  };
};

// Types globaux pour TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    plausible: (event: string, options?: any) => void;
  }
}

// Import React pour les hooks
import React from 'react';
