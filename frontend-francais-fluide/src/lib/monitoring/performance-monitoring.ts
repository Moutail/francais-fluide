// src/lib/monitoring/performance-monitoring.ts

/**
 * Monitoring des performances Web Vitals pour FrançaisFluide
 * Mesure et rapport des métriques de performance critiques
 */

import type { Metric } from 'web-vitals';

// Types pour le monitoring des performances
export interface WebVitals {
  // Core Web Vitals
  CLS: number; // Cumulative Layout Shift
  FID: number; // First Input Delay
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  TTFB: number; // Time to First Byte
  
  // Métriques supplémentaires
  FMP: number; // First Meaningful Paint
  SI: number; // Speed Index
  TTI: number; // Time to Interactive
  TBT: number; // Total Blocking Time
}

export interface PerformanceMetrics {
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
  deviceMemory?: number;
  webVitals: Partial<WebVitals>;
  customMetrics: Record<string, number>;
  navigationTiming: any;
  resourceTiming: any[];
}

export interface PerformanceThresholds {
  CLS: { good: number; needsImprovement: number; poor: number };
  FID: { good: number; needsImprovement: number; poor: number };
  FCP: { good: number; needsImprovement: number; poor: number };
  LCP: { good: number; needsImprovement: number; poor: number };
  TTFB: { good: number; needsImprovement: number; poor: number };
}

// Seuils de performance par défaut (Google)
const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  CLS: { good: 0.1, needsImprovement: 0.25, poor: 0.25 },
  FID: { good: 100, needsImprovement: 300, poor: 300 },
  FCP: { good: 1800, needsImprovement: 3000, poor: 3000 },
  LCP: { good: 2500, needsImprovement: 4000, poor: 4000 },
  TTFB: { good: 800, needsImprovement: 1800, poor: 1800 },
};

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized: boolean = false;
  private thresholds: PerformanceThresholds;
  private customMetrics: Map<string, number> = new Map();

  constructor() {
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    this.initializeMonitoring();
  }

  /**
   * Initialise le monitoring des performances
   */
  private async initializeMonitoring(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Vérifier la disponibilité de l'API Performance
      if (!window.performance || !window.PerformanceObserver) {
        console.warn('Performance API non disponible');
        return;
      }

      // Initialiser les observateurs Web Vitals
      await this.initializeWebVitals();

      // Initialiser le monitoring de navigation
      this.initializeNavigationTiming();

      // Initialiser le monitoring des ressources
      this.initializeResourceTiming();

      // Initialiser le monitoring de la mémoire
      this.initializeMemoryMonitoring();

      // Initialiser le monitoring des erreurs de performance
      this.initializePerformanceErrorMonitoring();

      this.isInitialized = true;
      console.log('✅ Performance monitoring initialisé');

    } catch (error) {
      console.error('❌ Erreur initialisation performance monitoring:', error);
    }
  }

  /**
   * Initialise les Web Vitals
   */
  private async initializeWebVitals(): Promise<void> {
    // Import dynamique de web-vitals
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = await import('web-vitals');

    // Cumulative Layout Shift
    onCLS((metric: Metric) => {
      this.recordWebVital('CLS', metric.value);
    });

    // First Contentful Paint
    onFCP((metric: Metric) => {
      this.recordWebVital('FCP', metric.value);
    });

    // Largest Contentful Paint
    onLCP((metric: Metric) => {
      this.recordWebVital('LCP', metric.value);
    });

    // Time to First Byte
    onTTFB((metric: Metric) => {
      this.recordWebVital('TTFB', metric.value);
    });

    // Interaction to Next Paint (nouveau)
    onINP((metric: Metric) => {
      this.recordWebVital('INP', metric.value);
    });
  }

  /**
   * Initialise le monitoring de navigation
   */
  private initializeNavigationTiming(): void {
    if (!window.performance.getEntriesByType) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'navigation') {
          this.recordNavigationTiming(entry as PerformanceNavigationTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  /**
   * Initialise le monitoring des ressources
   */
  private initializeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'resource') {
          this.recordResourceTiming(entry as PerformanceResourceTiming);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  /**
   * Initialise le monitoring de la mémoire
   */
  private initializeMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      setInterval(() => {
        this.recordCustomMetric('memory_used', memoryInfo.usedJSHeapSize);
        this.recordCustomMetric('memory_total', memoryInfo.totalJSHeapSize);
        this.recordCustomMetric('memory_limit', memoryInfo.jsHeapSizeLimit);
      }, 30000); // Toutes les 30 secondes
    }
  }

  /**
   * Initialise le monitoring des erreurs de performance
   */
  private initializePerformanceErrorMonitoring(): void {
    // Observer pour les erreurs de performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        if (entry.entryType === 'measure' && entry.duration > 1000) {
          console.warn('Performance warning: mesure lente détectée', {
            name: entry.name,
            duration: entry.duration,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.push(observer);
  }

  /**
   * Enregistre une métrique Web Vital
   */
  private recordWebVital(name: string, value: number): void {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection?.effectiveType,
      deviceMemory: (navigator as any).deviceMemory,
      webVitals: { [name]: value },
      customMetrics: {},
      navigationTiming: this.getNavigationTiming(),
      resourceTiming: this.getResourceTiming(),
    };

    this.metrics.push(metric);

    // Évaluer la performance
    const rating = this.evaluatePerformance(name, value);
    
    // Envoyer vers les services de monitoring
    this.sendToMonitoring(name, value, rating);

    console.log(`📊 Web Vital ${name}: ${value}ms (${rating})`);
  }

  /**
   * Enregistre les métriques de navigation
   */
  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const navigationMetrics = {
      'dns_lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp_connection': entry.connectEnd - entry.connectStart,
      'request_response': entry.responseEnd - entry.requestStart,
      'dom_processing': entry.domComplete - entry.domInteractive,
      'page_load': entry.duration,
    };

    Object.entries(navigationMetrics).forEach(([name, value]) => {
      this.recordCustomMetric(name, value);
    });
  }

  /**
   * Enregistre les métriques de ressources
   */
  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    const resourceMetrics = {
      'resource_duration': entry.duration,
      'resource_size': entry.transferSize,
      'resource_type': entry.initiatorType,
    };

    // Filtrer les ressources importantes
    if (entry.duration > 1000 || entry.transferSize > 100000) {
      Object.entries(resourceMetrics).forEach(([name, value]) => {
        if (typeof value === 'number') {
          this.recordCustomMetric(`${name}_${entry.name.split('/').pop()}`, value);
        }
      });
    }
  }

  /**
{{ ... }}
   * Enregistre une métrique personnalisée
   */
  public recordCustomMetric(name: string, value: number): void {
    this.customMetrics.set(name, value);
    
    // Créer un événement personnalisé
    const event = new CustomEvent('performance-metric', {
      detail: { name, value, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Mesure une opération personnalisée
   */
  public measureOperation<T>(name: string, operation: () => T): T {
    const startTime = performance.now();
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    
    try {
      const result = operation();
      return result;
    } finally {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      const duration = performance.now() - startTime;
      this.recordCustomMetric(name, duration);
    }
  }

  /**
   * Mesure une opération asynchrone
   */
  public async measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;
    
    performance.mark(startMark);
    
    try {
      const result = await operation();
      return result;
    } finally {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      const duration = performance.now() - startTime;
      this.recordCustomMetric(name, duration);
    }
  }

  /**
   * Évalue la performance d'une métrique
   */
  private evaluatePerformance(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = this.thresholds[metric as keyof PerformanceThresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Obtient les métriques de navigation
   */
  private getNavigationTiming(): any {
    if (!window.performance.getEntriesByType) return null;
    
    const entries = window.performance.getEntriesByType('navigation');
    return entries[0] || null;
  }

  /**
   * Obtient les métriques de ressources
   */
  private getResourceTiming(): any[] {
    if (!window.performance.getEntriesByType) return [];
    
    return window.performance.getEntriesByType('resource').slice(-10); // 10 dernières ressources
  }

  /**
   * Envoie les métriques vers les services de monitoring
   */
  private sendToMonitoring(metric: string, value: number, rating: string): void {
    // Envoyer vers Google Analytics
    if (window.gtag) {
      window.gtag('event', 'web_vital', {
        metric_name: metric,
        metric_value: value,
        metric_rating: rating,
      });
    }

    // Envoyer vers Sentry
    if (window.Sentry) {
      window.Sentry.addBreadcrumb({
        category: 'performance',
        message: `Web Vital ${metric}: ${value}ms (${rating})`,
        level: rating === 'poor' ? 'error' : 'info',
        data: {
          metric,
          value,
          rating,
        },
      });
    }

    // Envoyer vers un endpoint personnalisé
    if (process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric,
          value,
          rating,
          timestamp: Date.now(),
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  /**
   * Obtient les métriques actuelles
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Obtient les métriques personnalisées
   */
  public getCustomMetrics(): Record<string, number> {
    return Object.fromEntries(this.customMetrics);
  }

  /**
   * Obtient le score de performance global
   */
  public getPerformanceScore(): number {
    if (this.metrics.length === 0) return 100;

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const webVitals = latestMetrics.webVitals;
    
    let score = 100;
    let count = 0;

    Object.entries(webVitals).forEach(([metric, value]) => {
      const rating = this.evaluatePerformance(metric, value);
      count++;
      
      switch (rating) {
        case 'good':
          score += 0;
          break;
        case 'needs-improvement':
          score -= 20;
          break;
        case 'poor':
          score -= 40;
          break;
      }
    });

    return Math.max(0, Math.min(100, score / count));
  }

  /**
   * Obtient les recommandations de performance
   */
  public getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const latestMetrics = this.metrics[this.metrics.length - 1];
    
    if (!latestMetrics) return recommendations;

    const webVitals = latestMetrics.webVitals;

    if (webVitals.LCP && webVitals.LCP > 4000) {
      recommendations.push('Optimisez les images et le chargement des ressources pour améliorer le LCP');
    }

    if (webVitals.FID && webVitals.FID > 300) {
      recommendations.push('Réduisez le JavaScript bloquant pour améliorer le FID');
    }

    if (webVitals.CLS && webVitals.CLS > 0.25) {
      recommendations.push('Fixez les dimensions des éléments pour éviter le CLS');
    }

    if (webVitals.TTFB && webVitals.TTFB > 1800) {
      recommendations.push('Optimisez le serveur et utilisez un CDN pour améliorer le TTFB');
    }

    return recommendations;
  }

  /**
   * Nettoie les observateurs
   */
  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  /**
   * Met à jour les seuils de performance
   */
  public updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

// Hook React pour utiliser le monitoring de performance
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = React.useState(performanceMonitor.getMetrics());
  const [customMetrics, setCustomMetrics] = React.useState(performanceMonitor.getCustomMetrics());
  const [score, setScore] = React.useState(performanceMonitor.getPerformanceScore());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setCustomMetrics(performanceMonitor.getCustomMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    }, 10000); // Mise à jour toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const measureOperation = React.useCallback(<T>(name: string, operation: () => T): T => {
    return performanceMonitor.measureOperation(name, operation);
  }, []);

  const measureAsyncOperation = React.useCallback(<T>(name: string, operation: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncOperation(name, operation);
  }, []);

  const recordCustomMetric = React.useCallback((name: string, value: number) => {
    performanceMonitor.recordCustomMetric(name, value);
  }, []);

  return {
    metrics,
    customMetrics,
    score,
    measureOperation,
    measureAsyncOperation,
    recordCustomMetric,
    getRecommendations: performanceMonitor.getPerformanceRecommendations.bind(performanceMonitor),
    updateThresholds: performanceMonitor.updateThresholds.bind(performanceMonitor)
  };
};

// Types globaux pour TypeScript
declare global {
  interface Window {
    Sentry?: any;
  }
}

// Import React pour les hooks
import React from 'react';
