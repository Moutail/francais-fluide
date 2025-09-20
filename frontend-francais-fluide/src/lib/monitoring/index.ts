// src/lib/monitoring/index.ts

/**
 * Point d'entrée pour tous les outils de monitoring de FrançaisFluide
 */

// Error tracking
export { errorTracker, useErrorTracking } from './error-tracking';
export type { ErrorContext, PerformanceContext, UserFeedback } from './error-tracking';

// Analytics
export { analyticsTracker, useAnalytics } from './analytics';
export type { AnalyticsEvent, UserProperties, PageView } from './analytics';

// Performance monitoring
export { performanceMonitor, usePerformanceMonitoring } from './performance-monitoring';
export type { WebVitals, PerformanceMetrics, PerformanceThresholds } from './performance-monitoring';

// Fonction d'initialisation complète du monitoring
export function initializeMonitoring(): void {
  console.log('📊 Initialisation du monitoring...');

  // Initialiser le tracking d'erreurs
  errorTracker.getStats();
  console.log('🔍 Error tracking initialisé');

  // Initialiser les analytics
  analyticsTracker.getSessionMetrics();
  console.log('📈 Analytics initialisés');

  // Initialiser le monitoring de performance
  performanceMonitor.getMetrics();
  console.log('⚡ Performance monitoring initialisé');

  // Configuration des métriques par défaut
  setupDefaultMetrics();

  console.log('✅ Monitoring initialisé');
}

// Configuration des métriques par défaut
function setupDefaultMetrics(): void {
  // Métriques de performance par défaut
  performanceMonitor.updateThresholds({
    CLS: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
    FID: { good: 100, needsImprovement: 300, poor: 300 },
    FCP: { good: 1800, needsImprovement: 3000, poor: 3000 },
    LCP: { good: 2500, needsImprovement: 4000, poor: 4000 },
    TTFB: { good: 800, needsImprovement: 1800, poor: 1800 },
  });

  // Propriétés utilisateur par défaut
  analyticsTracker.setUserProperties({
    device_type: getDeviceType(),
    language: navigator.language,
  });

  console.log('⚙️ Métriques par défaut configurées');
}

// Détecte le type d'appareil
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// Fonction de nettoyage
export function cleanupMonitoring(): void {
  console.log('🧹 Nettoyage du monitoring...');
  
  // Nettoyer le monitoring de performance
  performanceMonitor.cleanup();
  
  console.log('✅ Nettoyage terminé');
}

// Hook React pour l'initialisation automatique
export function useMonitoringInitialization(): void {
  React.useEffect(() => {
    initializeMonitoring();
    
    return () => {
      cleanupMonitoring();
    };
  }, []);
}

// Configuration par défaut pour le monitoring
export const DEFAULT_MONITORING_CONFIG = {
  // Error tracking
  errorTracking: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1,
    maxBreadcrumbs: 100,
  },
  
  // Analytics
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    trackPageViews: true,
    trackUserInteractions: true,
    trackPerformance: true,
  },
  
  // Performance
  performance: {
    enabled: true,
    trackWebVitals: true,
    trackCustomMetrics: true,
    trackResourceTiming: true,
  }
};

// Import React pour les hooks
import React from 'react';
