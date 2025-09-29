// src/lib/performance/monitoring.ts

/**
 * Système de monitoring des performances pour FrançaisFluide
 * Mesure et analyse les métriques de performance en temps réel
 */

export interface PerformanceMetrics {
  // Métriques de rendu
  renderTime: number;
  reRenderCount: number;
  componentMountTime: number;
  
  // Métriques de réseau
  networkRequests: number;
  networkLatency: number;
  dataTransferSize: number;
  
  // Métriques d'application
  grammarCheckTime: number;
  textProcessingTime: number;
  memoryUsage: number;
  
  // Métriques utilisateur
  userInteractionDelay: number;
  typingLatency: number;
  suggestionResponseTime: number;
}

export interface ComponentPerformanceData {
  componentName: string;
  mountTime: number;
  renderTime: number;
  reRenderCount: number;
  propsChanges: number;
  lastRenderTime: number;
}

export interface NetworkPerformanceData {
  requestCount: number;
  averageLatency: number;
  totalDataTransfer: number;
  failedRequests: number;
  cacheHitRate: number;
}

export interface UserExperienceMetrics {
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  typingResponsiveness: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private componentData: Map<string, ComponentPerformanceData>;
  private networkData: NetworkPerformanceData;
  private userExperience: UserExperienceMetrics;
  private observers: PerformanceObserver[];
  private isMonitoring: boolean;
  private reportInterval: number;

  constructor() {
    this.metrics = {
      renderTime: 0,
      reRenderCount: 0,
      componentMountTime: 0,
      networkRequests: 0,
      networkLatency: 0,
      dataTransferSize: 0,
      grammarCheckTime: 0,
      textProcessingTime: 0,
      memoryUsage: 0,
      userInteractionDelay: 0,
      typingLatency: 0,
      suggestionResponseTime: 0
    };

    this.componentData = new Map();
    this.networkData = {
      requestCount: 0,
      averageLatency: 0,
      totalDataTransfer: 0,
      failedRequests: 0,
      cacheHitRate: 0
    };

    this.userExperience = {
      timeToInteractive: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      typingResponsiveness: 0
    };

    this.observers = [];
    this.isMonitoring = false;
    this.reportInterval = 30000; // 30 secondes
  }

  /**
   * Démarre le monitoring des performances
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.setupPerformanceObservers();
    this.setupNetworkMonitoring();
    this.setupUserExperienceMonitoring();
    this.startPeriodicReporting();

    console.log('🚀 Performance monitoring started');
  }

  /**
   * Arrête le monitoring des performances
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Configure les observateurs de performance
   */
  private setupPerformanceObservers(): void {
    // Observer pour les mesures de performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'measure') {
            this.handlePerformanceEntry(entry);
          } else if (entry.entryType === 'navigation') {
            this.handleNavigationEntry(entry as PerformanceNavigationTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['measure', 'navigation'] });
      this.observers.push(observer);
    }

    // Observer pour les ressources
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'resource') {
          this.handleResourceEntry(entry as PerformanceResourceTiming);
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * Configure le monitoring réseau
   */
  private setupNetworkMonitoring(): void {
    // Intercepter les requêtes fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.updateNetworkMetrics({
          latency: endTime - startTime,
          success: response.ok,
          size: this.estimateResponseSize(response)
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.updateNetworkMetrics({
          latency: endTime - startTime,
          success: false,
          size: 0
        });
        
        throw error;
      }
    };

    // Intercepter XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    // Lier les méthodes nécessaires pour utilisation dans les callbacks sans aliasser `this`
    const updateNetworkMetrics = this.updateNetworkMetrics.bind(this);

    // Assurer une signature compatible avec les surcharges de XHR.open
    XMLHttpRequest.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ): void {
      // Marquer l'heure de début sur l'instance XHR (propriété personnalisée)
      (this as any)._ffStartTime = performance.now();

      // Appeler la méthode d'origine avec les bons arguments selon le cas
      if (typeof async === 'undefined') {
        return originalXHROpen.call(this, method, url as any, true, null, null);
      }
      return originalXHROpen.call(this, method, url as any, async, username ?? null, password ?? null);
    };

    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, data?: Document | BodyInit | null): void {
      this.addEventListener('loadend', () => {
        const endTime = performance.now();
        const start = (this as any)._ffStartTime || 0;
        const latency = endTime - start;

        // Récupérer la taille si disponible
        const header = this.getResponseHeader('content-length');
        const size = header ? parseInt(header) : 0;

        // Utiliser la fonction liée pour mettre à jour les métriques réseau
        updateNetworkMetrics({
          latency,
          success: this.status >= 200 && this.status < 300,
          size,
        });
      });

      return originalXHRSend.call(this, data as any);
    };
  }

  /**
   * Configure le monitoring de l'expérience utilisateur
   */
  private setupUserExperienceMonitoring(): void {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          this.userExperience.firstContentfulPaint = fcpEntry.startTime;
        }
      });

      fcpObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(fcpObserver);
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          this.userExperience.largestContentfulPaint = lastEntry.startTime;
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);
    }

    // Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.userExperience.cumulativeLayoutShift = clsValue;
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // First Input Delay
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.userExperience.firstInputDelay = (entry as any).processingStart - entry.startTime;
        }
      });

      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    }
  }

  /**
   * Gère les entrées de performance
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.name) {
      case 'grammar-check':
        this.metrics.grammarCheckTime = entry.duration;
        break;
      case 'text-processing':
        this.metrics.textProcessingTime = entry.duration;
        break;
      case 'component-render':
        this.metrics.renderTime = entry.duration;
        break;
      case 'user-interaction':
        this.metrics.userInteractionDelay = entry.duration;
        break;
    }
  }

  /**
   * Gère les entrées de navigation
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    this.userExperience.timeToInteractive = entry.domInteractive - entry.startTime;
  }

  /**
   * Gère les entrées de ressources
   */
  private handleResourceEntry(entry: PerformanceResourceTiming): void {
    this.metrics.dataTransferSize += entry.transferSize;
    this.metrics.networkLatency = (this.metrics.networkLatency + entry.responseEnd - entry.requestStart) / 2;
  }

  /**
   * Met à jour les métriques réseau
   */
  private updateNetworkMetrics(data: { latency: number; success: boolean; size: number }): void {
    this.networkData.requestCount++;
    this.networkData.totalDataTransfer += data.size;
    
    if (!data.success) {
      this.networkData.failedRequests++;
    }

    // Mise à jour de la latence moyenne
    this.networkData.averageLatency = 
      (this.networkData.averageLatency * (this.networkData.requestCount - 1) + data.latency) / 
      this.networkData.requestCount;
  }

  /**
   * Estime la taille de la réponse
   */
  private estimateResponseSize(response: Response): number {
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      return parseInt(contentLength);
    }
    
    // Estimation basée sur le type de contenu
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return 1024; // Estimation pour JSON
    }
    
    return 512; // Estimation par défaut
  }

  /**
   * Mesure le temps de rendu d'un composant
   */
  public measureComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    componentName: string
  ): T {
    // Lier la méthode pour l'utiliser dans la fonction de rendu sans aliasser `this`
    const updateComponentMetrics = this.updateComponentMetrics.bind(this);
    const Wrapped = React.forwardRef((props, ref) => {
      const startTime = performance.now();
      const [renderCount, setRenderCount] = React.useState(0);

      React.useEffect(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;

        updateComponentMetrics(componentName, {
          renderTime,
          reRenderCount: renderCount,
          mountTime: renderTime
        });

        setRenderCount(prev => prev + 1);
      }, [renderCount, startTime]);

      return React.createElement(Component, { ...props, ref });
    }) as unknown as T;

    // Provide a display name for better React DevTools and to satisfy linter
    (Wrapped as any).displayName = `withPerformance(${(Component as any).displayName || componentName})`;

    return Wrapped;
  }

  /**
   * Met à jour les métriques d'un composant
   */
  private updateComponentMetrics(componentName: string, data: Partial<ComponentPerformanceData>): void {
    const existing = this.componentData.get(componentName) || {
      componentName,
      mountTime: 0,
      renderTime: 0,
      reRenderCount: 0,
      propsChanges: 0,
      lastRenderTime: 0
    };

    this.componentData.set(componentName, {
      ...existing,
      ...data,
      lastRenderTime: performance.now()
    });
  }

  /**
   * Mesure une opération personnalisée
   */
  public measureOperation<T>(name: string, operation: () => T): T {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();

    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    return result;
  }

  /**
   * Mesure une opération asynchrone
   */
  public async measureAsyncOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();

    performance.mark(`${name}-start`);
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    return result;
  }

  /**
   * Démarre le reporting périodique
   */
  private startPeriodicReporting(): void {
    setInterval(() => {
      this.generatePerformanceReport();
    }, this.reportInterval);
  }

  /**
   * Génère un rapport de performance
   */
  public generatePerformanceReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      componentData: Array.from(this.componentData.values()),
      networkData: this.networkData,
      userExperience: this.userExperience,
      recommendations: this.generateRecommendations(),
      score: this.calculatePerformanceScore()
    };

    // Envoyer le rapport si nécessaire
    this.sendPerformanceReport(report);

    return report;
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.renderTime > 16) {
      recommendations.push('Temps de rendu élevé détecté. Considérez l\'utilisation de React.memo ou useMemo.');
    }

    if (this.metrics.grammarCheckTime > 500) {
      recommendations.push('Vérification grammaticale lente. Optimisez les regex ou implémentez un cache.');
    }

    if (this.networkData.averageLatency > 1000) {
      recommendations.push('Latence réseau élevée. Implémentez la mise en cache ou la compression.');
    }

    if (this.userExperience.firstInputDelay > 100) {
      recommendations.push('Délai de première interaction élevé. Optimisez le JavaScript critique.');
    }

    if (this.userExperience.cumulativeLayoutShift > 0.1) {
      recommendations.push('Décalage de mise en page cumulatif élevé. Fixez les dimensions des éléments.');
    }

    return recommendations;
  }

  /**
   * Calcule un score de performance global
   */
  private calculatePerformanceScore(): number {
    let score = 100;

    // Pénalités basées sur les métriques
    if (this.metrics.renderTime > 16) score -= 10;
    if (this.metrics.grammarCheckTime > 500) score -= 15;
    if (this.networkData.averageLatency > 1000) score -= 20;
    if (this.userExperience.firstInputDelay > 100) score -= 15;
    if (this.userExperience.cumulativeLayoutShift > 0.1) score -= 10;

    return Math.max(0, score);
  }

  /**
   * Envoie le rapport de performance
   */
  private sendPerformanceReport(report: PerformanceReport): void {
    // Envoyer vers un service d'analytics ou de monitoring
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // }).catch(console.error);
    }

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Report:', report);
    }
  }

  /**
   * Obtient les métriques actuelles
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtient les données des composants
   */
  public getComponentData(): ComponentPerformanceData[] {
    return Array.from(this.componentData.values());
  }

  /**
   * Obtient les données réseau
   */
  public getNetworkData(): NetworkPerformanceData {
    return { ...this.networkData };
  }

  /**
   * Obtient les métriques d'expérience utilisateur
   */
  public getUserExperienceMetrics(): UserExperienceMetrics {
    return { ...this.userExperience };
  }
}

export interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  componentData: ComponentPerformanceData[];
  networkData: NetworkPerformanceData;
  userExperience: UserExperienceMetrics;
  recommendations: string[];
  score: number;
}

// Instance singleton
export const performanceMonitor = new PerformanceMonitor();

// Hook React pour utiliser le monitoring
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceMonitor.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    measureOperation: performanceMonitor.measureOperation.bind(performanceMonitor),
    measureAsyncOperation: performanceMonitor.measureAsyncOperation.bind(performanceMonitor),
    generateReport: performanceMonitor.generatePerformanceReport.bind(performanceMonitor)
  };
};

// Import React pour les hooks
import React from 'react';
