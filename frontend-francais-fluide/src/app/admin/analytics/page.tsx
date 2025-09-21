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
  MessageSquare,
  Clock,
  DollarSign,
  ArrowLeft,
  Download,
  Calendar,
  Filter,
  RefreshCw
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
          revenue: 26750.50,
          subscriptions: 25,
          grammarChecks: 3421,
          exercisesCompleted: 892,
          averageSessionTime: 18.5,
          conversionRate: 12.3,
          churnRate: 2.1,
          mrr: 26750.50,
          arr: 321006.00
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
          arr: 347403.00
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
          arr: 374409.00
        }
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
    arr: 0
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <a href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </a>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analytics & Statistiques</h1>
                  <p className="text-sm text-gray-600">Données détaillées de l'application</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                Exporter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1">
                {userGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${userGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {userGrowth >= 0 ? '+' : ''}{userGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentData.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs total</div>
            <div className="text-xs text-gray-500 mt-1">
              +{currentData.newUsers} nouveaux aujourd'hui
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${currentData.revenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Revenus totaux</div>
            <div className="text-xs text-gray-500 mt-1">
              MRR: ${currentData.mrr.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1">
                {subscriptionGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${subscriptionGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {subscriptionGrowth >= 0 ? '+' : ''}{subscriptionGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentData.subscriptions}
            </div>
            <div className="text-sm text-gray-600">Nouveaux abonnements</div>
            <div className="text-xs text-gray-500 mt-1">
              Taux de conversion: {currentData.conversionRate}%
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex items-center gap-1">
                {activityGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${activityGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {activityGrowth >= 0 ? '+' : ''}{activityGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {currentData.grammarChecks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Corrections aujourd'hui</div>
            <div className="text-xs text-gray-500 mt-1">
              {currentData.exercisesCompleted} exercices complétés
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Évolution des utilisateurs */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des utilisateurs</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.map((data, index) => (
                <div key={data.period} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(data.totalUsers / 1500) * 200}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                      {data.totalUsers}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(data.period).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évolution des revenus */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des revenus</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analytics.map((data, index) => (
                <div key={data.period} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gray-100 rounded-t-lg relative">
                    <div
                      className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(data.revenue / 35000) * 200}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                      ${(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(data.period).toLocaleDateString('fr-FR', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métriques détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Utilisateurs actifs</span>
                <span className="font-semibold text-gray-900">{currentData.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Temps de session moyen</span>
                <span className="font-semibold text-gray-900">{currentData.averageSessionTime} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Exercices complétés</span>
                <span className="font-semibold text-gray-900">{currentData.exercisesCompleted}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de conversion</span>
                <span className="font-semibold text-gray-900">{currentData.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Taux de désabonnement</span>
                <span className="font-semibold text-gray-900">{currentData.churnRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nouveaux abonnements</span>
                <span className="font-semibold text-gray-900">{currentData.subscriptions}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenus récurrents mensuels</span>
                <span className="font-semibold text-gray-900">${currentData.mrr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenus récurrents annuels</span>
                <span className="font-semibold text-gray-900">${currentData.arr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenus totaux</span>
                <span className="font-semibold text-gray-900">${currentData.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des performances */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Performances détaillées</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abonnements
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Corrections
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.map((data) => (
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
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.subscriptions}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.grammarChecks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {data.conversionRate}%
                    </td>
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
