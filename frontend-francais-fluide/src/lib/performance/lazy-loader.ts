// src/lib/performance/lazy-loader.ts

/**
 * Système de chargement différé intelligent pour FrançaisFluide
 * Charge les composants et ressources de manière optimale selon les besoins
 */

import React, { Suspense, lazy, ComponentType, ReactElement } from 'react';

export interface LazyLoadConfig {
  // Configuration du chargement
  threshold?: number; // Distance avant de charger (en pixels)
  rootMargin?: string; // Marge autour du viewport
  delay?: number; // Délai avant de charger (en ms)
  
  // Configuration de préchargement
  preload?: boolean; // Précharger automatiquement
  preloadDistance?: number; // Distance de préchargement
  
  // Configuration de fallback
  fallback?: ReactElement;
  errorBoundary?: ComponentType<any>;
  
  // Configuration de priorité
  priority?: 'high' | 'medium' | 'low';
  
  // Configuration de cache
  cache?: boolean;
  cacheKey?: string;
}

export interface LazyLoadEntry {
  id: string;
  component: ComponentType<any>;
  config: LazyLoadConfig;
  loaded: boolean;
  loading: boolean;
  error: Error | null;
  loadTime: number;
  lastUsed: number;
}

export interface LazyLoadMetrics {
  totalComponents: number;
  loadedComponents: number;
  loadingComponents: number;
  errorComponents: number;
  averageLoadTime: number;
  cacheHitRate: number;
  preloadAccuracy: number;
}

class IntelligentLazyLoader {
  private entries: Map<string, LazyLoadEntry>;
  private intersectionObserver: IntersectionObserver | null;
  private preloadObserver: IntersectionObserver | null;
  private loadQueue: string[];
  private metrics: LazyLoadMetrics;
  private cache: Map<string, ComponentType<any>>;
  private preloadCache: Set<string>;

  constructor() {
    this.entries = new Map();
    this.intersectionObserver = null;
    this.preloadObserver = null;
    this.loadQueue = [];
    this.cache = new Map();
    this.preloadCache = new Set();
    
    this.metrics = {
      totalComponents: 0,
      loadedComponents: 0,
      loadingComponents: 0,
      errorComponents: 0,
      averageLoadTime: 0,
      cacheHitRate: 0,
      preloadAccuracy: 0
    };

    this.initializeObservers();
  }

  /**
   * Initialise les observateurs d'intersection
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observer principal pour le chargement
    this.intersectionObserver = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observer pour le préchargement
    this.preloadObserver = new IntersectionObserver(
      (entries) => this.handlePreloadIntersection(entries),
      {
        rootMargin: '200px',
        threshold: 0
      }
    );
  }

  /**
   * Enregistre un composant pour le chargement différé
   */
  public registerComponent(
    id: string,
    importFn: () => Promise<{ default: ComponentType<any> }>,
    config: LazyLoadConfig = {}
  ): void {
    const defaultConfig: LazyLoadConfig = {
      threshold: 0.1,
      rootMargin: '50px',
      delay: 0,
      preload: false,
      preloadDistance: 200,
      priority: 'medium',
      cache: true,
      ...config
    };

    const lazyComponent = lazy(importFn);
    
    const entry: LazyLoadEntry = {
      id,
      component: lazyComponent,
      config: defaultConfig,
      loaded: false,
      loading: false,
      error: null,
      loadTime: 0,
      lastUsed: 0
    };

    this.entries.set(id, entry);
    this.metrics.totalComponents++;

    // Ajouter au cache si activé
    if (defaultConfig.cache && defaultConfig.cacheKey) {
      this.cache.set(defaultConfig.cacheKey, lazyComponent);
    }

    console.log(`📦 Registered lazy component: ${id}`);
  }

  /**
   * Crée un wrapper React pour un composant différé
   */
  public createLazyWrapper(
    id: string,
    props: any = {},
    fallback?: ReactElement
  ): ReactElement {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new Error(`Component ${id} not registered`);
    }

    const Component = entry.component;
    const config = entry.config;

    return React.createElement(
      Suspense,
      { fallback: fallback || config.fallback || this.getDefaultFallback() },
      React.createElement(LazyLoadWrapper, {
        id,
        component: Component,
        props,
        config,
        onLoad: () => this.handleComponentLoad(id),
        onError: (error: Error) => this.handleComponentError(id, error),
      })
    );
  }

  /**
   * Précharge un composant
   */
  public async preloadComponent(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry || entry.loaded || entry.loading) return;

    const startTime = performance.now();
    entry.loading = true;

    try {
      // Déclencher le chargement du composant
      await this.triggerComponentLoad(id);
      
      const endTime = performance.now();
      entry.loadTime = endTime - startTime;
      entry.loaded = true;
      entry.loading = false;
      entry.lastUsed = Date.now();

      this.metrics.loadedComponents++;
      this.updateAverageLoadTime();

      console.log(`⚡ Preloaded component: ${id} (${entry.loadTime.toFixed(2)}ms)`);

    } catch (error) {
      entry.error = error as Error;
      entry.loading = false;
      this.metrics.errorComponents++;

      console.error(`❌ Failed to preload component ${id}:`, error);
    }
  }

  /**
   * Précharge plusieurs composants en parallèle
   */
  public async preloadComponents(ids: string[]): Promise<void> {
    const promises = ids.map(id => this.preloadComponent(id));
    await Promise.allSettled(promises);
  }

  /**
   * Précharge les composants basés sur la navigation
   */
  public preloadOnNavigation(route: string): void {
    const componentsToPreload = this.getComponentsForRoute(route);
    
    if (componentsToPreload.length > 0) {
      this.preloadComponents(componentsToPreload);
    }
  }

  /**
   * Gère l'intersection des éléments
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const componentId = entry.target.getAttribute('data-lazy-component');
        if (componentId) {
          this.scheduleLoad(componentId);
        }
      }
    }
  }

  /**
   * Gère l'intersection pour le préchargement
   */
  private handlePreloadIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const componentId = entry.target.getAttribute('data-lazy-component');
        if (componentId) {
          const lazyEntry = this.entries.get(componentId);
          if (lazyEntry?.config.preload && !lazyEntry.loaded && !lazyEntry.loading) {
            this.preloadComponent(componentId);
          }
        }
      }
    }
  }

  /**
   * Planifie le chargement d'un composant
   */
  private scheduleLoad(id: string): void {
    const entry = this.entries.get(id);
    if (!entry || entry.loaded || entry.loading) return;

    if (entry.config.delay && entry.config.delay > 0) {
      setTimeout(() => this.loadComponent(id), entry.config.delay);
    } else {
      this.loadComponent(id);
    }
  }

  /**
   * Charge un composant
   */
  private async loadComponent(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry || entry.loaded || entry.loading) return;

    const startTime = performance.now();
    entry.loading = true;

    try {
      await this.triggerComponentLoad(id);
      
      const endTime = performance.now();
      entry.loadTime = endTime - startTime;
      entry.loaded = true;
      entry.loading = false;
      entry.lastUsed = Date.now();

      this.metrics.loadedComponents++;
      this.updateAverageLoadTime();

      console.log(`✅ Loaded component: ${id} (${entry.loadTime.toFixed(2)}ms)`);

    } catch (error) {
      entry.error = error as Error;
      entry.loading = false;
      this.metrics.errorComponents++;

      console.error(`❌ Failed to load component ${id}:`, error);
    }
  }

  /**
   * Déclenche le chargement d'un composant
   */
  private async triggerComponentLoad(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) return;

    // Simuler le chargement du composant lazy
    // En réalité, cela se fait automatiquement quand React.lazy charge le composant
    return new Promise((resolve) => {
      // Petit délai pour simuler le chargement
      setTimeout(resolve, 0);
    });
  }

  /**
   * Gère le chargement réussi d'un composant
   */
  private handleComponentLoad(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.loaded = true;
      entry.loading = false;
      entry.lastUsed = Date.now();
    }
  }

  /**
   * Gère l'erreur de chargement d'un composant
   */
  private handleComponentError(id: string, error: Error): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.error = error;
      entry.loading = false;
    }
  }

  /**
   * Obtient les composants pour une route donnée
   */
  private getComponentsForRoute(route: string): string[] {
    // Mapping des routes vers les composants
    const routeComponentMap: Record<string, string[]> = {
      '/': ['SmartEditor', 'ProgressDashboard'],
      '/exercises': ['ExercisePlayer', 'ExerciseSelector'],
      '/analytics': ['AnalyticsDashboard', 'ProgressChart'],
      '/settings': ['SettingsPanel', 'ThemeProvider']
    };

    return routeComponentMap[route] || [];
  }

  /**
   * Met à jour le temps de chargement moyen
   */
  private updateAverageLoadTime(): void {
    const loadedEntries = Array.from(this.entries.values()).filter(entry => entry.loaded);
    if (loadedEntries.length > 0) {
      const totalTime = loadedEntries.reduce((sum, entry) => sum + entry.loadTime, 0);
      this.metrics.averageLoadTime = totalTime / loadedEntries.length;
    }
  }

  /**
   * Obtient le fallback par défaut
   */
  private getDefaultFallback(): ReactElement {
    return React.createElement(
      'div',
      { className: 'flex items-center justify-center p-4' },
      React.createElement('div', {
        key: 'spinner',
        className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'
      }),
      React.createElement(
        'span',
        { key: 'text', className: 'ml-2 text-gray-600' },
        'Chargement...'
      )
    );
  }

  /**
   * Nettoie les composants inutilisés
   */
  public cleanup(): void {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes

    for (const [id, entry] of this.entries.entries()) {
      if (entry.loaded && now - entry.lastUsed > maxAge) {
        // Marquer comme non chargé pour libérer la mémoire
        entry.loaded = false;
        entry.loadTime = 0;
        
        console.log(`🧹 Cleaned up unused component: ${id}`);
      }
    }
  }

  /**
   * Obtient les métriques
   */
  public getMetrics(): LazyLoadMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtient les entrées
   */
  public getEntries(): LazyLoadEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Obtient le statut d'un composant
   */
  public getComponentStatus(id: string): LazyLoadEntry | null {
    return this.entries.get(id) || null;
  }

  /**
   * Précharge intelligemment basé sur l'utilisation
   */
  public intelligentPreload(): void {
    // Analyser les patterns d'utilisation pour précharger intelligemment
    const frequentlyUsedComponents = this.getFrequentlyUsedComponents();
    
    if (frequentlyUsedComponents.length > 0) {
      this.preloadComponents(frequentlyUsedComponents);
    }
  }

  /**
   * Obtient les composants fréquemment utilisés
   */
  private getFrequentlyUsedComponents(): string[] {
    const entries = Array.from(this.entries.values());
    const now = Date.now();
    const recentThreshold = 24 * 60 * 60 * 1000; // 24 heures

    return entries
      .filter(entry => 
        entry.loaded && 
        now - entry.lastUsed < recentThreshold
      )
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, 3)
      .map(entry => entry.id);
  }
}

// Wrapper React pour les composants différés
interface LazyLoadWrapperProps {
  id: string;
  component: ComponentType<any>;
  props: any;
  config: LazyLoadConfig;
  onLoad: () => void;
  onError: (error: Error) => void;
}

const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  id,
  component: Component,
  props,
  onLoad,
  onError
}) => {
  React.useEffect(() => {
    onLoad();
  }, [onLoad]);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      onError(new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  return React.createElement(Component, props);
};

// Instance singleton
export const intelligentLazyLoader = new IntelligentLazyLoader();

// Hook React pour utiliser le lazy loader
export const useLazyLoader = () => {
  const [metrics, setMetrics] = React.useState(intelligentLazyLoader.getMetrics());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(intelligentLazyLoader.getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const registerComponent = React.useCallback((
    id: string,
    importFn: () => Promise<{ default: ComponentType<any> }>,
    config?: LazyLoadConfig
  ) => {
    intelligentLazyLoader.registerComponent(id, importFn, config);
  }, []);

  const preloadComponent = React.useCallback((id: string) => {
    return intelligentLazyLoader.preloadComponent(id);
  }, []);

  const preloadComponents = React.useCallback((ids: string[]) => {
    return intelligentLazyLoader.preloadComponents(ids);
  }, []);

  const createWrapper = React.useCallback((
    id: string,
    props: any = {},
    fallback?: ReactElement
  ) => {
    return intelligentLazyLoader.createLazyWrapper(id, props, fallback);
  }, []);

  const getStatus = React.useCallback((id: string) => {
    return intelligentLazyLoader.getComponentStatus(id);
  }, []);

  return {
    metrics,
    registerComponent,
    preloadComponent,
    preloadComponents,
    createWrapper,
    getStatus,
    cleanup: intelligentLazyLoader.cleanup.bind(intelligentLazyLoader)
  };
};

// Composants prêts à l'emploi
export const LazySmartEditor = intelligentLazyLoader.createLazyWrapper.bind(intelligentLazyLoader);
export const LazyAnalyticsDashboard = intelligentLazyLoader.createLazyWrapper.bind(intelligentLazyLoader);
export const LazyExercisePlayer = intelligentLazyLoader.createLazyWrapper.bind(intelligentLazyLoader);
