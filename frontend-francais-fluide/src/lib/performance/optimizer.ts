// src/lib/performance/optimizer.ts

/**
 * Système d'optimisation automatique pour FrançaisFluide
 * Applique des optimisations intelligentes basées sur les métriques de performance
 */

import { performanceMonitor, PerformanceReport } from './monitoring';

export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  condition: (report: PerformanceReport) => boolean;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  impact: 'major' | 'moderate' | 'minor';
}

export interface OptimizationResult {
  ruleId: string;
  applied: boolean;
  impact: string;
  beforeScore: number;
  afterScore: number;
  improvement: number;
  timestamp: string;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  rules: OptimizationRule[];
  enabled: boolean;
}

class PerformanceOptimizer {
  private strategies: Map<string, OptimizationStrategy>;
  private appliedOptimizations: OptimizationResult[];
  private isOptimizing: boolean;
  private optimizationInterval: number;

  constructor() {
    this.strategies = new Map();
    this.appliedOptimizations = [];
    this.isOptimizing = false;
    this.optimizationInterval = 60000; // 1 minute

    this.initializeDefaultStrategies();
  }

  /**
   * Initialise les stratégies d'optimisation par défaut
   */
  private initializeDefaultStrategies(): void {
    // Stratégie de rendu React
    this.addStrategy({
      id: 'react-rendering',
      name: 'Optimisation du rendu React',
      description: 'Optimise les composants React pour réduire les re-renders',
      enabled: true,
      rules: [
        {
          id: 'memo-components',
          name: 'Mémorisation des composants',
          description: 'Applique React.memo aux composants qui se re-rendent trop souvent',
          priority: 'high',
          impact: 'major',
          condition: report => report.componentData.some(comp => comp.reRenderCount > 10),
          action: () => this.enableComponentMemoization(),
        },
        {
          id: 'debounce-inputs',
          name: 'Debounce des inputs',
          description: 'Applique un debounce aux champs de saisie pour réduire les traitements',
          priority: 'medium',
          impact: 'moderate',
          condition: report => report.metrics.userInteractionDelay > 100,
          action: () => this.enableInputDebouncing(),
        },
      ],
    });

    // Stratégie de cache
    this.addStrategy({
      id: 'caching',
      name: 'Optimisation du cache',
      description: 'Améliore les stratégies de mise en cache',
      enabled: true,
      rules: [
        {
          id: 'grammar-cache',
          name: 'Cache grammatical intelligent',
          description: 'Optimise le cache des vérifications grammaticales',
          priority: 'high',
          impact: 'major',
          condition: report => report.metrics.grammarCheckTime > 300,
          action: () => this.optimizeGrammarCache(),
        },
        {
          id: 'network-cache',
          name: 'Cache réseau',
          description: 'Améliore le cache des requêtes réseau',
          priority: 'medium',
          impact: 'moderate',
          condition: report => report.networkData.averageLatency > 500,
          action: () => this.optimizeNetworkCache(),
        },
      ],
    });

    // Stratégie de virtualisation
    this.addStrategy({
      id: 'virtualization',
      name: 'Virtualisation des listes',
      description: 'Applique la virtualisation aux longues listes',
      enabled: true,
      rules: [
        {
          id: 'virtualize-lists',
          name: 'Virtualisation des suggestions',
          description: 'Virtualise les listes de suggestions longues',
          priority: 'medium',
          impact: 'moderate',
          condition: report => report.metrics.renderTime > 20,
          action: () => this.enableListVirtualization(),
        },
      ],
    });

    // Stratégie de bundle
    this.addStrategy({
      id: 'bundle-optimization',
      name: 'Optimisation du bundle',
      description: 'Optimise le chargement des ressources',
      enabled: true,
      rules: [
        {
          id: 'lazy-loading',
          name: 'Chargement différé',
          description: 'Active le chargement différé des composants non critiques',
          priority: 'high',
          impact: 'major',
          condition: report => report.userExperience.timeToInteractive > 3000,
          action: () => this.enableLazyLoading(),
        },
        {
          id: 'code-splitting',
          name: 'Division du code',
          description: 'Divise le code en chunks plus petits',
          priority: 'medium',
          impact: 'moderate',
          condition: report => report.userExperience.largestContentfulPaint > 2500,
          action: () => this.enableCodeSplitting(),
        },
      ],
    });
  }

  /**
   * Ajoute une stratégie d'optimisation
   */
  public addStrategy(strategy: OptimizationStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  /**
   * Active une stratégie
   */
  public enableStrategy(strategyId: string): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = true;
    }
  }

  /**
   * Désactive une stratégie
   */
  public disableStrategy(strategyId: string): void {
    const strategy = this.strategies.get(strategyId);
    if (strategy) {
      strategy.enabled = false;
    }
  }

  /**
   * Démarre l'optimisation automatique
   */
  public startOptimization(): void {
    if (this.isOptimizing) return;

    this.isOptimizing = true;
    this.runOptimizationCycle();

    console.log('🚀 Performance optimization started');
  }

  /**
   * Arrête l'optimisation automatique
   */
  public stopOptimization(): void {
    this.isOptimizing = false;
    console.log('⏹️ Performance optimization stopped');
  }

  /**
   * Exécute un cycle d'optimisation
   */
  private runOptimizationCycle(): void {
    if (!this.isOptimizing) return;

    const report = performanceMonitor.generatePerformanceReport();
    const applicableRules = this.findApplicableRules(report);

    for (const rule of applicableRules) {
      try {
        const beforeScore = report.score;
        rule.action();

        // Mesurer l'impact après un délai
        setTimeout(() => {
          const newReport = performanceMonitor.generatePerformanceReport();
          const afterScore = newReport.score;
          const improvement = afterScore - beforeScore;

          this.recordOptimizationResult({
            ruleId: rule.id,
            applied: true,
            impact: `${improvement > 0 ? '+' : ''}${improvement} points`,
            beforeScore,
            afterScore,
            improvement,
            timestamp: new Date().toISOString(),
          });

          console.log(
            `✅ Applied optimization: ${rule.name} (${improvement > 0 ? '+' : ''}${improvement} points)`
          );
        }, 2000);
      } catch (error) {
        console.error(`❌ Failed to apply optimization ${rule.name}:`, error);

        this.recordOptimizationResult({
          ruleId: rule.id,
          applied: false,
          impact: 'Failed',
          beforeScore: report.score,
          afterScore: report.score,
          improvement: 0,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Programmer le prochain cycle
    setTimeout(() => this.runOptimizationCycle(), this.optimizationInterval);
  }

  /**
   * Trouve les règles applicables basées sur le rapport de performance
   */
  private findApplicableRules(report: PerformanceReport): OptimizationRule[] {
    const applicableRules: OptimizationRule[] = [];

    for (const strategy of this.strategies.values()) {
      if (!strategy.enabled) continue;

      for (const rule of strategy.rules) {
        if (rule.condition(report)) {
          applicableRules.push(rule);
        }
      }
    }

    // Trier par priorité
    return applicableRules.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Enregistre le résultat d'une optimisation
   */
  private recordOptimizationResult(result: OptimizationResult): void {
    this.appliedOptimizations.push(result);

    // Garder seulement les 100 derniers résultats
    if (this.appliedOptimizations.length > 100) {
      this.appliedOptimizations = this.appliedOptimizations.slice(-100);
    }
  }

  /**
   * Actions d'optimisation spécifiques
   */

  private enableComponentMemoization(): void {
    // Activer la mémorisation des composants
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:component-memoization', 'enabled');

      // Déclencher un re-render pour appliquer les optimisations
      window.dispatchEvent(new CustomEvent('francais-fluide:optimize-components'));
    }
  }

  private enableInputDebouncing(): void {
    // Augmenter le délai de debounce pour les inputs
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:debounce-delay', '750');

      window.dispatchEvent(new CustomEvent('francais-fluide:update-debounce'));
    }
  }

  private optimizeGrammarCache(): void {
    // Optimiser le cache grammatical
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:grammar-cache-size', '500');
      window.localStorage.setItem('francais-fluide:grammar-cache-ttl', '3600000'); // 1 heure

      window.dispatchEvent(new CustomEvent('francais-fluide:optimize-grammar-cache'));
    }
  }

  private optimizeNetworkCache(): void {
    // Optimiser le cache réseau
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:network-cache', 'enabled');

      window.dispatchEvent(new CustomEvent('francais-fluide:optimize-network-cache'));
    }
  }

  private enableListVirtualization(): void {
    // Activer la virtualisation des listes
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:list-virtualization', 'enabled');

      window.dispatchEvent(new CustomEvent('francais-fluide:enable-virtualization'));
    }
  }

  private enableLazyLoading(): void {
    // Activer le chargement différé
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:lazy-loading', 'enabled');

      window.dispatchEvent(new CustomEvent('francais-fluide:enable-lazy-loading'));
    }
  }

  private enableCodeSplitting(): void {
    // Activer la division du code
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('francais-fluide:code-splitting', 'enabled');

      window.dispatchEvent(new CustomEvent('francais-fluide:enable-code-splitting'));
    }
  }

  /**
   * Obtient les stratégies disponibles
   */
  public getStrategies(): OptimizationStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Obtient les résultats d'optimisation
   */
  public getOptimizationResults(): OptimizationResult[] {
    return [...this.appliedOptimizations];
  }

  /**
   * Obtient le score d'optimisation global
   */
  public getOptimizationScore(): number {
    if (this.appliedOptimizations.length === 0) return 0;

    const totalImprovement = this.appliedOptimizations.reduce(
      (sum, result) => sum + result.improvement,
      0
    );

    return Math.max(0, 100 + totalImprovement);
  }

  /**
   * Applique une optimisation manuelle
   */
  public applyOptimization(ruleId: string): OptimizationResult | null {
    const report = performanceMonitor.generatePerformanceReport();

    // Trouver la règle
    let targetRule: OptimizationRule | null = null;
    for (const strategy of this.strategies.values()) {
      const rule = strategy.rules.find(r => r.id === ruleId);
      if (rule) {
        targetRule = rule;
        break;
      }
    }

    if (!targetRule) {
      console.error(`Rule ${ruleId} not found`);
      return null;
    }

    try {
      const beforeScore = report.score;
      targetRule.action();

      const afterScore = report.score;
      const improvement = afterScore - beforeScore;

      const result: OptimizationResult = {
        ruleId,
        applied: true,
        impact: `${improvement > 0 ? '+' : ''}${improvement} points`,
        beforeScore,
        afterScore,
        improvement,
        timestamp: new Date().toISOString(),
      };

      this.recordOptimizationResult(result);
      return result;
    } catch (error) {
      console.error(`Failed to apply optimization ${ruleId}:`, error);

      return {
        ruleId,
        applied: false,
        impact: 'Failed',
        beforeScore: report.score,
        afterScore: report.score,
        improvement: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Génère un rapport d'optimisation
   */
  public generateOptimizationReport(): OptimizationReport {
    const strategies = this.getStrategies();
    const results = this.getOptimizationResults();
    const score = this.getOptimizationScore();

    return {
      timestamp: new Date().toISOString(),
      strategies,
      results,
      score,
      isOptimizing: this.isOptimizing,
      recommendations: this.generateOptimizationRecommendations(),
    };
  }

  /**
   * Génère des recommandations d'optimisation
   */
  private generateOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const report = performanceMonitor.generatePerformanceReport();

    if (report.score < 70) {
      recommendations.push(
        "Score de performance faible. Activez toutes les stratégies d'optimisation."
      );
    }

    if (report.metrics.renderTime > 16) {
      recommendations.push('Temps de rendu élevé. Activez la mémorisation des composants.');
    }

    if (report.metrics.grammarCheckTime > 500) {
      recommendations.push('Vérification grammaticale lente. Optimisez le cache grammatical.');
    }

    if (report.userExperience.timeToInteractive > 3000) {
      recommendations.push("Temps d'interactivité élevé. Activez le chargement différé.");
    }

    return recommendations;
  }
}

export interface OptimizationReport {
  timestamp: string;
  strategies: OptimizationStrategy[];
  results: OptimizationResult[];
  score: number;
  isOptimizing: boolean;
  recommendations: string[];
}

// Instance singleton
export const performanceOptimizer = new PerformanceOptimizer();

// Hook React pour utiliser l'optimiseur
export const usePerformanceOptimizer = () => {
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [score, setScore] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setScore(performanceOptimizer.getOptimizationScore());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const startOptimization = React.useCallback(() => {
    performanceOptimizer.startOptimization();
    setIsOptimizing(true);
  }, []);

  const stopOptimization = React.useCallback(() => {
    performanceOptimizer.stopOptimization();
    setIsOptimizing(false);
  }, []);

  const applyOptimization = React.useCallback((ruleId: string) => {
    return performanceOptimizer.applyOptimization(ruleId);
  }, []);

  const generateReport = React.useCallback(() => {
    return performanceOptimizer.generateOptimizationReport();
  }, []);

  return {
    isOptimizing,
    score,
    strategies: performanceOptimizer.getStrategies(),
    results: performanceOptimizer.getOptimizationResults(),
    startOptimization,
    stopOptimization,
    applyOptimization,
    generateReport,
  };
};

// Import React pour les hooks
import React from 'react';
