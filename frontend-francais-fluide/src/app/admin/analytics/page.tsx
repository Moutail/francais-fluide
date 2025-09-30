// src/app/admin/analytics/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  BookOpen,
  DollarSign,
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  revenue: number;
  subscriptions: number;
  grammarChecks: number;
  exercisesCompleted: number;
  averageSessionTime: number;
  conversionRate: number;
  churnRate: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AnalyticsData[] = [
        {
          period: '2024-01-01',
          totalUsers: 1200,
          newUsers: 45,
          activeUsers: 180,
          revenue: 26750.5,
          subscriptions: 25,
          grammarChecks: 3421,
          exercisesCompleted: 892,
          averageSessionTime: 18.5,
          conversionRate: 12.3,
          churnRate: 2.1,
          mrr: 26750.5,
          arr: 321006.0,
        },
        {
          period: '2024-01-02',
          totalUsers: 1245,
          newUsers: 38,
          activeUsers: 195,
          revenue: 28950.25,
          subscriptions: 28,
          grammarChecks: 3892,
          exercisesCompleted: 945,
          averageSessionTime: 19.2,
          conversionRate: 13.1,
          churnRate: 1.8,
          mrr: 28950.25,
          arr: 347403.0,
        },
        {
          period: '2024-01-03',
          totalUsers: 1283,
          newUsers: 42,
          activeUsers: 210,
          revenue: 31200.75,
          subscriptions: 32,
          grammarChecks: 4256,
          exercisesCompleted: 1023,
          averageSessionTime: 20.1,
          conversionRate: 14.2,
          churnRate: 1.5,
          mrr: 31200.75,
          arr: 374409.0,
        },
      ];

      setAnalytics(mockData);
      setIsLoading(false);
    };

    loadAnalytics();
  }, []);

  const currentData = analytics[analytics.length - 1] || {
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    revenue: 0,
    subscriptions: 0,
    grammarChecks: 0,
    exercisesCompleted: 0,
    averageSessionTime: 0,
    conversionRate: 0,
    churnRate: 0,
    mrr: 0,
    arr: 0,
  };

  const previousData = analytics[analytics.length - 2] || currentData;

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const userGrowth = calculateGrowth(currentData.totalUsers, previousData.totalUsers);
  const revenueGrowth = calculateGrowth(currentData.revenue, previousData.revenue);
  const subscriptionGrowth = calculateGrowth(currentData.subscriptions, previousData.subscriptions);
  const activityGrowth = calculateGrowth(currentData.grammarChecks, previousData.grammarChecks);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="size-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <BarChart3 className="size-6 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analytics & Statistiques</h1>
                  <p className="text-sm text-gray-600">Données détaillées de l'application</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
              <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
                <Download className="size-4" />
                Exporter
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <RefreshCw className="size-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Métriques principales */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-blue-100 p-2">
                <Users className="size-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1">
                {userGrowth >= 0 ? (
                  <TrendingUp className="size-4 text-green-500" />
                ) : (
                  <TrendingDown className="size-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {userGrowth >= 0 ? '+' : ''}
                  {userGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {currentData.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs total</div>
            <div className="mt-1 text-xs text-gray-500">
              +{currentData.newUsers} nouveaux aujourd'hui
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-green-100 p-2">
                <DollarSign className="size-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="size-4 text-green-500" />
                ) : (
                  <TrendingDown className="size-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {revenueGrowth >= 0 ? '+' : ''}
                  {revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              ${currentData.revenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenus totaux</div>
            <div className="mt-1 text-xs text-gray-500">
              MRR: ${currentData.mrr.toLocaleString()}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-purple-100 p-2">
                <CreditCard className="size-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1">
                {subscriptionGrowth >= 0 ? (
                  <TrendingUp className="size-4 text-green-500" />
                ) : (
                  <TrendingDown className="size-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${subscriptionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {subscriptionGrowth >= 0 ? '+' : ''}
                  {subscriptionGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">{currentData.subscriptions}</div>
            <div className="text-sm text-gray-600">Nouveaux abonnements</div>
            <div className="mt-1 text-xs text-gray-500">
              Taux de conversion: {currentData.conversionRate}%
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-lg bg-orange-100 p-2">
                <BookOpen className="size-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1">
                {activityGrowth >= 0 ? (
                  <TrendingUp className="size-4 text-green-500" />
                ) : (
                  <TrendingDown className="size-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${activityGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {activityGrowth >= 0 ? '+' : ''}
                  {activityGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mb-1 text-3xl font-bold text-gray-900">
              {currentData.grammarChecks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Corrections aujourd'hui</div>
            <div className="mt-1 text-xs text-gray-500">
              {currentData.exercisesCompleted} exercices complétés
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Évolution des utilisateurs */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Évolution des utilisateurs</h3>
            <div className="flex h-64 items-end justify-between gap-2">
              {analytics.map((data, index) => (
                <div key={data.period} className="flex flex-1 flex-col items-center">
                  <div className="relative w-full rounded-t-lg bg-gray-100">
                    <div
                      className="rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
                      style={{ height: `${(data.totalUsers / 1500) * 200}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600">
                      {data.totalUsers}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(data.period).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évolution des revenus */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Évolution des revenus</h3>
            <div className="flex h-64 items-end justify-between gap-2">
              {analytics.map((data, index) => (
                <div key={data.period} className="flex flex-1 flex-col items-center">
                  <div className="relative w-full rounded-t-lg bg-gray-100">
                    <div
                      className="rounded-t-lg bg-gradient-to-t from-green-500 to-green-400 transition-all duration-500"
                      style={{ height: `${(data.revenue / 35000) * 200}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600">
                      ${(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(data.period).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Utilisateurs actifs</span>
                <span className="font-semibold text-gray-900">{currentData.activeUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Temps de session moyen</span>
                <span className="font-semibold text-gray-900">
                  {currentData.averageSessionTime} min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Exercices complétés</span>
                <span className="font-semibold text-gray-900">
                  {currentData.exercisesCompleted}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Conversion</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taux de conversion</span>
                <span className="font-semibold text-gray-900">{currentData.conversionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taux de désabonnement</span>
                <span className="font-semibold text-gray-900">{currentData.churnRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Nouveaux abonnements</span>
                <span className="font-semibold text-gray-900">{currentData.subscriptions}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Revenus</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenus récurrents mensuels</span>
                <span className="font-semibold text-gray-900">
                  ${currentData.mrr.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenus récurrents annuels</span>
                <span className="font-semibold text-gray-900">
                  ${currentData.arr.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenus totaux</span>
                <span className="font-semibold text-gray-900">
                  ${currentData.revenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des performances */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Performances détaillées</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Utilisateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Abonnements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Corrections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.map(data => (
                  <tr key={data.period} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(data.period).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.totalUsers.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${data.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{data.subscriptions}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.grammarChecks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{data.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
