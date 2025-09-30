// src/components/ai/AIDashboard.tsx

/**
 * Dashboard de gestion des services IA pour FrançaisFluide
 * Monitoring des quotas, coûts, et statistiques des providers
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Activity,
  DollarSign,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  BarChart3,
  Globe,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAPIManager } from '@/lib/ai/api-manager';
import { useAISecurity } from '@/lib/ai/security';
import { useAIContentGenerator } from '@/lib/ai/content-generator';

interface AIDashboardProps {
  className?: string;
  compact?: boolean;
}

// Type minimal utilisé par ce composant pour les providers
interface ProviderStat {
  id: string;
  name: string;
  type: 'paid' | 'free' | 'freemium';
  status: 'active' | 'inactive' | 'quota_exceeded' | 'error';
  successRate: number;
  averageResponseTime: number;
  lastUsed: number;
  quota?: {
    dailyUsed?: number;
    dailyLimit?: number;
    monthlyUsed?: number;
    monthlyLimit?: number;
    resetTime?: number;
    remaining?: number;
    isOverBudget?: boolean;
  } | null;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ className = '', compact = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'security' | 'costs'>(
    'overview'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks pour les services IA
  const { stats: apiStats, makeRequest, disableProvider, enableProvider } = useAPIManager();
  const { stats: securityStats, checkRateLimit, filterContent } = useAISecurity();
  const { getStats: contentStats } = useAIContentGenerator();

  // Actualiser les statistiques
  const refreshStats = async () => {
    setIsRefreshing(true);
    // Simuler un délai de rafraîchissement
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Calculer les métriques globales
  const globalMetrics = {
    totalRequests: apiStats.totalRequests,
    totalCost: apiStats.totalCost,
    activeProviders: (apiStats.providers as ProviderStat[]).filter(
      (p: ProviderStat) => p.status === 'active'
    ).length,
    totalProviders: apiStats.providers.length,
    securityEvents: securityStats.securityEvents.recent,
    successRate: apiStats.providers.length
      ? (apiStats.providers as ProviderStat[]).reduce(
          (acc: number, p: ProviderStat) => acc + (p.successRate ?? 0),
          0
        ) / apiStats.providers.length
      : 0,
  };

  if (compact) {
    return (
      <div className={`ai-dashboard-compact ${className}`}>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Bot className="h-5 w-5 text-blue-600" />
              Services IA
            </h3>
            <button
              onClick={refreshStats}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {globalMetrics.activeProviders}
              </div>
              <div className="text-xs text-gray-500">Providers actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${globalMetrics.totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Coût total</div>
            </div>
          </div>

          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Requêtes: {globalMetrics.totalRequests}</span>
              <span
                className={`flex items-center gap-1 ${
                  globalMetrics.successRate > 90
                    ? 'text-green-600'
                    : globalMetrics.successRate > 75
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                {globalMetrics.successRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-dashboard ${className}`}>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Dashboard IA</h2>
              <p className="text-sm text-gray-500">Monitoring des services IA et de la sécurité</p>
            </div>
          </div>

          <button
            onClick={refreshStats}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: "Vue d'ensemble", icon: BarChart3 },
            { id: 'providers', label: 'Providers', icon: Globe },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'costs', label: 'Coûts', icon: DollarSign },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Métriques globales */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <MetricCard
                    icon={<Globe className="h-5 w-5" />}
                    title="Providers Actifs"
                    value={globalMetrics.activeProviders}
                    subtitle={`sur ${globalMetrics.totalProviders}`}
                    color="blue"
                  />

                  <MetricCard
                    icon={<Activity className="h-5 w-5" />}
                    title="Requêtes Total"
                    value={globalMetrics.totalRequests.toLocaleString()}
                    subtitle="ce mois"
                    color="green"
                  />

                  <MetricCard
                    icon={<DollarSign className="h-5 w-5" />}
                    title="Coût Total"
                    value={`$${globalMetrics.totalCost.toFixed(2)}`}
                    subtitle="ce mois"
                    color="yellow"
                  />

                  <MetricCard
                    icon={<Shield className="h-5 w-5" />}
                    title="Événements Sécurité"
                    value={globalMetrics.securityEvents}
                    subtitle="dernières 24h"
                    color={globalMetrics.securityEvents > 10 ? 'red' : 'green'}
                  />
                </div>

                {/* Graphique de succès */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Taux de Succès par Provider
                  </h3>
                  <div className="space-y-3">
                    {apiStats.providers.map((provider: ProviderStat) => (
                      <div key={provider.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              provider.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="font-medium text-gray-900">{provider.name}</span>
                          <span className="text-sm text-gray-500">({provider.type})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                provider.successRate > 90
                                  ? 'bg-green-500'
                                  : provider.successRate > 75
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                              }`}
                              style={{ width: `${provider.successRate}%` }}
                            />
                          </div>
                          <span className="w-12 text-sm font-medium text-gray-600">
                            {provider.successRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'providers' && (
              <motion.div
                key="providers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {apiStats.providers.map((provider: ProviderStat) => (
                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    quota={provider.quota}
                    onToggle={enabled => {
                      if (enabled) {
                        enableProvider(provider.id);
                      } else {
                        disableProvider(provider.id);
                      }
                    }}
                  />
                ))}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Événements de Sécurité
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(securityStats.securityEvents.bySeverity).map(
                        ([severity, count]) => (
                          <div key={severity} className="flex items-center justify-between">
                            <span className="capitalize text-gray-700">{severity}</span>
                            <span
                              className={`rounded px-2 py-1 text-sm font-medium ${
                                severity === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : severity === 'high'
                                    ? 'bg-orange-100 text-orange-800'
                                    : severity === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">Rate Limiting</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Limiteurs actifs</span>
                        <span className="font-medium">
                          {securityStats.rateLimiting.activeLimiters}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Utilisateurs bloqués</span>
                        <span className="font-medium text-red-600">
                          {securityStats.rateLimiting.blockedUsers}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'costs' && (
              <motion.div
                key="costs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {apiStats.providers.map((provider: ProviderStat) => (
                    <div key={provider.id} className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{provider.name}</h4>
                        <span
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            provider.quota?.isOverBudget
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {provider.quota?.isOverBudget ? 'Dépassé' : 'OK'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quotidien:</span>
                          <span className="font-medium">
                            ${(provider.quota?.dailyUsed || 0).toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mensuel:</span>
                          <span className="font-medium">
                            ${(provider.quota?.monthlyUsed || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Restant:</span>
                          <span className="font-medium">
                            {provider.quota?.remaining || 0} requêtes
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Composant de carte de métrique
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
  };

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className={colorClasses[color]}>{icon}</div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}
        </div>
      </div>
      <div className="text-sm font-medium text-gray-700">{title}</div>
    </div>
  );
};

// Composant de carte de provider
interface ProviderCardProps {
  provider: ProviderStat;
  quota: ProviderStat['quota'];
  onToggle: (enabled: boolean) => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, quota, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`h-3 w-3 rounded-full ${
              provider.status === 'active' ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <h4 className="font-medium text-gray-900">{provider.name}</h4>
          <span className="text-sm text-gray-500">({provider.type})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggle(provider.status !== 'active')}
            className={`rounded p-1 ${
              provider.status === 'active'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {provider.status === 'active' ? (
              <Lock className="h-4 w-4" />
            ) : (
              <Unlock className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Succès</div>
          <div className="font-medium">{provider.successRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-gray-500">Temps moyen</div>
          <div className="font-medium">{provider.averageResponseTime.toFixed(0)}ms</div>
        </div>
        <div>
          <div className="text-gray-500">Quota restant</div>
          <div className="font-medium">{quota?.remaining || 0}</div>
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 border-t border-gray-200 pt-4"
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Coût quotidien:</span>
              <span className="font-medium">${quota?.dailyUsed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Coût mensuel:</span>
              <span className="font-medium">${quota?.monthlyUsed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dernière utilisation:</span>
              <span className="font-medium">
                {provider.lastUsed ? new Date(provider.lastUsed).toLocaleTimeString() : 'Jamais'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Export du composant compact
export const AIDashboardCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <AIDashboard compact className={className} />;
};
