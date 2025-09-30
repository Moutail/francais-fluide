// src/lib/performance/index.ts

// Import React et dépendances locales utilisées dans ce module
import React from 'react';
import { performanceMonitor } from './monitoring';
import { performanceOptimizer } from './optimizer';
import { intelligentLazyLoader } from './lazy-loader';
import { performanceConfig } from './config';

/**
 * Point d'entrée pour tous les outils de performance de FrançaisFluide
 */

// Monitoring
export { performanceMonitor, usePerformanceMonitor } from './monitoring';
export type {
  PerformanceMetrics,
  ComponentPerformanceData,
  NetworkPerformanceData,
  UserExperienceMetrics,
  PerformanceReport,
} from './monitoring';

// Optimisation
export { performanceOptimizer, usePerformanceOptimizer } from './optimizer';
export type {
  OptimizationRule,
  OptimizationResult,
  OptimizationStrategy,
  OptimizationReport,
} from './optimizer';

// Chargement différé
export { intelligentLazyLoader, useLazyLoader } from './lazy-loader';
export type { LazyLoadConfig, LazyLoadEntry, LazyLoadMetrics } from './lazy-loader';

// Configuration
export {
  performanceConfig,
  getPerformanceConfig,
  validatePerformanceConfig,
  createCustomConfig,
} from './config';
export type { PerformanceConfig } from './config';

// Fonction d'initialisation complète
export function initializePerformanceOptimizations(): void {
  console.log(' Initialisation des optimisations de performance...');

  // Démarrer le monitoring si activé
  if (performanceConfig.monitoring.enabled) {
    performanceMonitor.startMonitoring();
    console.log(' Monitoring des performances activé');
  }

  // Démarrer l'optimiseur si activé
  if (performanceConfig.optimizer.enabled) {
    performanceOptimizer.startOptimization();
    console.log('Optimiseur automatique activé');
  }

  // Précharger les composants critiques
  if (performanceConfig.optimizer.enableIntelligentPreloading) {
    intelligentLazyLoader.intelligentPreload();
    console.log('Préchargement intelligent activé');
  }

  console.log('Optimisations de performance initialisées');
}

// Fonction de nettoyage
export function cleanupPerformanceOptimizations(): void {
  console.log('Nettoyage des optimisations de performance...');

  performanceMonitor.stopMonitoring();
  performanceOptimizer.stopOptimization();

  console.log('Nettoyage terminé');
}

// Hook React pour l'initialisation automatique
export function usePerformanceInitialization(): void {
  React.useEffect(() => {
    initializePerformanceOptimizations();

    return () => {
      cleanupPerformanceOptimizations();
    };
  }, []);
}
