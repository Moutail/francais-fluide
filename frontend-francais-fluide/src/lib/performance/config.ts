// src/lib/performance/config.ts

/**
 * Configuration des optimisations de performance pour FrançaisFluide
 */

export interface PerformanceConfig {
  // Configuration du monitoring
  monitoring: {
    enabled: boolean;
    reportInterval: number; // en millisecondes
    maxMetricsHistory: number;
    enableRealTimeMetrics: boolean;
    enableWebVitals: boolean;
  };

  // Configuration de l'optimiseur
  optimizer: {
    enabled: boolean;
    optimizationInterval: number; // en millisecondes
    autoApplyOptimizations: boolean;
    enableIntelligentPreloading: boolean;
  };

  // Configuration du lazy loader
  lazyLoader: {
    enabled: boolean;
    preloadDistance: number; // en pixels
    cacheSize: number;
    enableIntelligentPreloading: boolean;
    cleanupInterval: number; // en millisecondes
  };

  // Configuration de la virtualisation
  virtualization: {
    enabled: boolean;
    defaultItemHeight: number;
    overscanCount: number;
    enableAnimations: boolean;
  };

  // Configuration du cache
  cache: {
    enabled: boolean;
    grammarCacheSize: number;
    grammarCacheTTL: number; // en millisecondes
    networkCacheSize: number;
    componentCacheSize: number;
  };

  // Configuration des métriques
  metrics: {
    enablePerformanceObserver: boolean;
    enableResourceTiming: boolean;
    enableNavigationTiming: boolean;
    enableUserTiming: boolean;
  };

  // Configuration des seuils
  thresholds: {
    renderTime: number; // en millisecondes
    grammarCheckTime: number; // en millisecondes
    networkLatency: number; // en millisecondes
    memoryUsage: number; // en MB
    reRenderCount: number;
  };
}

// Configuration par défaut
export const defaultPerformanceConfig: PerformanceConfig = {
  monitoring: {
    enabled: process.env.NODE_ENV === 'production' || process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
    reportInterval: 30000, // 30 secondes
    maxMetricsHistory: 1000,
    enableRealTimeMetrics: true,
    enableWebVitals: true,
  },

  optimizer: {
    enabled: process.env.ENABLE_AUTO_OPTIMIZATION === 'true',
    optimizationInterval: 60000, // 1 minute
    autoApplyOptimizations: true,
    enableIntelligentPreloading: true,
  },

  lazyLoader: {
    enabled: process.env.ENABLE_LAZY_LOADING !== 'false',
    preloadDistance: 200, // 200px
    cacheSize: 100,
    enableIntelligentPreloading: true,
    cleanupInterval: 300000, // 5 minutes
  },

  virtualization: {
    enabled: process.env.ENABLE_VIRTUALIZATION !== 'false',
    defaultItemHeight: 50,
    overscanCount: 5,
    enableAnimations: true,
  },

  cache: {
    enabled: true,
    grammarCacheSize: 500,
    grammarCacheTTL: 3600000, // 1 heure
    networkCacheSize: 200,
    componentCacheSize: 100,
  },

  metrics: {
    enablePerformanceObserver: true,
    enableResourceTiming: true,
    enableNavigationTiming: true,
    enableUserTiming: true,
  },

  thresholds: {
    renderTime: 16, // 16ms (60fps)
    grammarCheckTime: 300, // 300ms
    networkLatency: 500, // 500ms
    memoryUsage: 100, // 100MB
    reRenderCount: 10,
  },
};

// Configuration pour l'environnement de développement
export const developmentConfig: PerformanceConfig = {
  ...defaultPerformanceConfig,
  monitoring: {
    ...defaultPerformanceConfig.monitoring,
    enabled: true,
    reportInterval: 10000, // 10 secondes en dev
  },
  optimizer: {
    ...defaultPerformanceConfig.optimizer,
    enabled: true,
    optimizationInterval: 30000, // 30 secondes en dev
  },
  thresholds: {
    ...defaultPerformanceConfig.thresholds,
    renderTime: 20, // Plus tolérant en dev
    grammarCheckTime: 500, // Plus tolérant en dev
  },
};

// Configuration pour l'environnement de production
export const productionConfig: PerformanceConfig = {
  ...defaultPerformanceConfig,
  monitoring: {
    ...defaultPerformanceConfig.monitoring,
    enabled: true,
    reportInterval: 60000, // 1 minute en prod
  },
  optimizer: {
    ...defaultPerformanceConfig.optimizer,
    enabled: true,
    optimizationInterval: 120000, // 2 minutes en prod
  },
  cache: {
    ...defaultPerformanceConfig.cache,
    grammarCacheSize: 1000, // Plus de cache en prod
    networkCacheSize: 500,
  },
  thresholds: {
    ...defaultPerformanceConfig.thresholds,
    renderTime: 16, // Strict en prod
    grammarCheckTime: 200, // Strict en prod
  },
};

// Configuration pour les tests
export const testConfig: PerformanceConfig = {
  ...defaultPerformanceConfig,
  monitoring: {
    ...defaultPerformanceConfig.monitoring,
    enabled: false,
  },
  optimizer: {
    ...defaultPerformanceConfig.optimizer,
    enabled: false,
  },
  lazyLoader: {
    ...defaultPerformanceConfig.lazyLoader,
    enabled: false,
  },
  virtualization: {
    ...defaultPerformanceConfig.virtualization,
    enabled: false,
  },
  cache: {
    ...defaultPerformanceConfig.cache,
    enabled: false,
  },
};

// Fonction pour obtenir la configuration appropriée
export function getPerformanceConfig(): PerformanceConfig {
  const env = process.env.NODE_ENV;
  
  switch (env) {
    case 'development':
      return developmentConfig;
    case 'production':
      return productionConfig;
    case 'test':
      return testConfig;
    default:
      return defaultPerformanceConfig;
  }
}

// Fonction pour valider la configuration
export function validatePerformanceConfig(config: PerformanceConfig): boolean {
  try {
    // Vérifier les valeurs numériques positives
    const numericFields = [
      'monitoring.reportInterval',
      'monitoring.maxMetricsHistory',
      'optimizer.optimizationInterval',
      'lazyLoader.preloadDistance',
      'lazyLoader.cacheSize',
      'lazyLoader.cleanupInterval',
      'virtualization.defaultItemHeight',
      'virtualization.overscanCount',
      'cache.grammarCacheSize',
      'cache.grammarCacheTTL',
      'cache.networkCacheSize',
      'cache.componentCacheSize',
      'thresholds.renderTime',
      'thresholds.grammarCheckTime',
      'thresholds.networkLatency',
      'thresholds.memoryUsage',
      'thresholds.reRenderCount',
    ];

    for (const field of numericFields) {
      const value = getNestedValue(config, field);
      if (typeof value !== 'number' || value < 0) {
        console.error(`Configuration invalide: ${field} doit être un nombre positif`);
        return false;
      }
    }

    // Vérifier les valeurs booléennes
    const booleanFields = [
      'monitoring.enabled',
      'monitoring.enableRealTimeMetrics',
      'monitoring.enableWebVitals',
      'optimizer.enabled',
      'optimizer.autoApplyOptimizations',
      'optimizer.enableIntelligentPreloading',
      'lazyLoader.enabled',
      'lazyLoader.enableIntelligentPreloading',
      'virtualization.enabled',
      'virtualization.enableAnimations',
      'cache.enabled',
      'metrics.enablePerformanceObserver',
      'metrics.enableResourceTiming',
      'metrics.enableNavigationTiming',
      'metrics.enableUserTiming',
    ];

    for (const field of booleanFields) {
      const value = getNestedValue(config, field);
      if (typeof value !== 'boolean') {
        console.error(`Configuration invalide: ${field} doit être un booléen`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la validation de la configuration:', error);
    return false;
  }
}

// Fonction utilitaire pour obtenir une valeur imbriquée
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Configuration personnalisable via les variables d'environnement
export function createCustomConfig(): PerformanceConfig {
  const config = getPerformanceConfig();
  
  // Permettre la personnalisation via les variables d'environnement
  if (process.env.PERFORMANCE_MONITORING_INTERVAL) {
    config.monitoring.reportInterval = parseInt(process.env.PERFORMANCE_MONITORING_INTERVAL);
  }
  
  if (process.env.PERFORMANCE_OPTIMIZATION_INTERVAL) {
    config.optimizer.optimizationInterval = parseInt(process.env.PERFORMANCE_OPTIMIZATION_INTERVAL);
  }
  
  if (process.env.PERFORMANCE_CACHE_SIZE) {
    config.cache.grammarCacheSize = parseInt(process.env.PERFORMANCE_CACHE_SIZE);
  }
  
  if (process.env.PERFORMANCE_LAZY_LOADING_DISTANCE) {
    config.lazyLoader.preloadDistance = parseInt(process.env.PERFORMANCE_LAZY_LOADING_DISTANCE);
  }
  
  return config;
}

// Export de la configuration finale
export const performanceConfig = createCustomConfig();
