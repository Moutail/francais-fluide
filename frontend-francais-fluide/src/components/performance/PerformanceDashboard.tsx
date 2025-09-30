// src/components/performance/PerformanceDashboard.tsx

/**
 * Dashboard de performance pour FrançaisFluide
 * Affiche les métriques de performance en temps réel
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  Clock,
  Database,
  Network,
  Cpu,
  MemoryStick,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { performanceOptimizer } from '@/lib/performance/optimizer';
import { intelligentLazyLoader } from '@/lib/performance/lazy-loader';

interface PerformanceDashboardProps {
  className?: string;
  compact?: boolean;
  showControls?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className = '',
  compact = false,
  showControls = true,
}) => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());
  const [optimizationResults, setOptimizationResults] = useState(
    performanceOptimizer.getOptimizationResults()
  );
  const [lazyLoaderMetrics, setLazyLoaderMetrics] = useState(intelligentLazyLoader.getMetrics());
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setOptimizationResults(performanceOptimizer.getOptimizationResults());
      setLazyLoaderMetrics(intelligentLazyLoader.getMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceScore = () => {
    let score = 100;

    // Pénalités basées sur les métriques
    if (metrics.renderTime > 16) score -= 15;
    if (metrics.grammarCheckTime > 300) score -= 20;
    if (metrics.networkLatency > 500) score -= 15;
    if (metrics.userInteractionDelay > 100) score -= 10;

    return Math.max(0, score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />;
    if (score >= 70) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const performanceScore = getPerformanceScore();

  if (compact) {
    return (
      <div className={`performance-dashboard-compact ${className}`}>
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
          <div className={`flex items-center gap-1 ${getScoreColor(performanceScore)}`}>
            {getScoreIcon(performanceScore)}
            <span className="text-sm font-medium">{performanceScore}</span>
          </div>
          <div className="text-xs text-gray-500">{metrics.renderTime.toFixed(1)}ms</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-dashboard ${className}`}>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Activity className="h-6 w-6 text-blue-600" />
            Dashboard de Performance
          </h2>

          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isOptimizing) {
                    performanceOptimizer.stopOptimization();
                  } else {
                    performanceOptimizer.startOptimization();
                  }
                  setIsOptimizing(!isOptimizing);
                }}
                className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                  isOptimizing
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isOptimizing ? 'Arrêter' : 'Optimiser'}
              </button>
            </div>
          )}
        </div>

        {/* Score de performance global */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Score de Performance</span>
            <div className={`flex items-center gap-1 ${getScoreColor(performanceScore)}`}>
              {getScoreIcon(performanceScore)}
              <span className="text-lg font-bold">{performanceScore}</span>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <motion.div
              className={`h-2 rounded-full ${
                performanceScore >= 90
                  ? 'bg-green-500'
                  : performanceScore >= 70
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${performanceScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Métriques principales */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            title="Temps de Rendu"
            value={`${metrics.renderTime.toFixed(1)}ms`}
            status={metrics.renderTime <= 16 ? 'good' : 'warning'}
            description="Temps pour rendre un frame"
          />

          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            title="Analyse Grammaticale"
            value={`${metrics.grammarCheckTime.toFixed(0)}ms`}
            status={metrics.grammarCheckTime <= 300 ? 'good' : 'warning'}
            description="Temps de vérification"
          />

          <MetricCard
            icon={<Network className="h-5 w-5" />}
            title="Latence Réseau"
            value={`${metrics.networkLatency.toFixed(0)}ms`}
            status={metrics.networkLatency <= 500 ? 'good' : 'warning'}
            description="Temps de réponse API"
          />

          <MetricCard
            icon={<MemoryStick className="h-5 w-5" />}
            title="Utilisation Mémoire"
            value={`${metrics.memoryUsage.toFixed(1)}MB`}
            status={metrics.memoryUsage <= 100 ? 'good' : 'warning'}
            description="Mémoire utilisée"
          />
        </div>

        {/* Métriques de composants */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Composants Lazy</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-xl font-bold text-gray-900">
                {lazyLoaderMetrics.totalComponents}
              </div>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-sm text-green-600">Chargés</div>
              <div className="text-xl font-bold text-green-700">
                {lazyLoaderMetrics.loadedComponents}
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <div className="text-sm text-yellow-600">En cours</div>
              <div className="text-xl font-bold text-yellow-700">
                {lazyLoaderMetrics.loadingComponents}
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <div className="text-sm text-red-600">Erreurs</div>
              <div className="text-xl font-bold text-red-700">
                {lazyLoaderMetrics.errorComponents}
              </div>
            </div>
          </div>
        </div>

        {/* Optimisations appliquées */}
        {optimizationResults.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Optimisations Récentes</h3>
            <div className="space-y-2">
              {optimizationResults.slice(-3).map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    {result.improvement > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-900">{result.ruleId}</span>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      result.improvement > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.improvement > 0 ? '+' : ''}
                    {result.improvement.toFixed(1)} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        {showControls && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => performanceMonitor.generatePerformanceReport()}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              Générer Rapport
            </button>
            <button
              onClick={() => intelligentLazyLoader.cleanup()}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            >
              Nettoyer Cache
            </button>
            <button
              onClick={() => intelligentLazyLoader.intelligentPreload()}
              className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-200"
            >
              Précharger
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: 'good' | 'warning' | 'error';
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, status, description }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      className="rounded-lg bg-gray-50 p-4"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className={`${getStatusColor()}`}>{icon}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
      <div className="text-sm font-medium text-gray-700">{title}</div>
      <div className="text-xs text-gray-500">{description}</div>
    </motion.div>
  );
};

// Export du composant compact pour l'utilisation dans d'autres composants
export const PerformanceIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <PerformanceDashboard compact className={className} />;
};
