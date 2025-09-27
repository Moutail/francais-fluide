'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [subsStats, setSubsStats] = useState<any>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchStats = async () => {
    try {
      const [a, b] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/subscriptions/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const aJson = await a.json();
      const bJson = await b.json();
      setStats(aJson?.data || aJson);
      setSubsStats(bJson?.data || bJson);
    } catch (e) {
      console.error('Erreur chargement analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchStats(); }, [token]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = "blue" }: any) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {change}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );

  const PlanChart = ({ data }: any) => {
    const plans = data?.distribution?.byPlan || [];
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Répartition des abonnements</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {plans.map((plan: any, index: number) => (
            <div key={plan.plan} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                <span className="capitalize font-medium">{plan.plan}</span>
              </div>
              <div className="text-right">
                <div className="font-bold">{plan._count}</div>
                <div className="text-xs text-gray-500">utilisateurs</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Vue d'ensemble des performances de la plateforme</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total utilisateurs"
          value={stats?.overview?.totalUsers || stats?.totalUsers || '-'}
          icon={Users}
          change={12}
          changeType="up"
          color="blue"
        />
        <StatCard
          title="Abonnements actifs"
          value={stats?.overview?.activeSubscriptions || subsStats?.overview?.activeSubscriptions || '-'}
          icon={CreditCard}
          change={8}
          changeType="up"
          color="green"
        />
        <StatCard
          title="Revenu mensuel"
          value={`${subsStats?.revenue?.monthly || 0}$`}
          icon={DollarSign}
          change={15}
          changeType="up"
          color="yellow"
        />
        <StatCard
          title="Taux de conversion"
          value={`${subsStats?.overview?.conversionRate || 0}%`}
          icon={TrendingUp}
          change={3}
          changeType="down"
          color="purple"
        />
      </div>

      {/* Graphiques et données détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanChart data={subsStats} />

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Nouveaux utilisateurs</div>
                <div className="text-sm text-gray-600">+{stats?.trends?.newUsersLast30Days || 0} ce mois</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="font-medium">Nouveaux abonnements</div>
                <div className="text-sm text-gray-600">+{stats?.trends?.newSubscriptionsLast30Days || 0} ce mois</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Utilisateurs récents</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Nom</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(stats?.recentUsers || []).slice(0, 5).map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.subscription?.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
                      user.subscription?.plan === 'etudiant' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.subscription?.plan || 'demo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
