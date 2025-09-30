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
  RefreshCw,
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
        fetch('/api/admin/subscriptions/stats', { headers: { Authorization: `Bearer ${token}` } }),
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

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-8 w-1/2 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }: any) => (
    <div className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-lg p-3 bg-${color}-50`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-sm ${
              changeType === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {changeType === 'up' ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {change}%
          </div>
        )}
      </div>
      <div>
        <div className="mb-1 text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  );

  const PlanChart = ({ data }: any) => {
    const plans = data?.distribution?.byPlan || [];
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'];

    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Répartition des abonnements</h3>
          <PieChart className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {plans.map((plan: any, index: number) => (
            <div key={plan.plan} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}></div>
                <span className="font-medium capitalize">{plan.plan}</span>
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
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          value={
            stats?.overview?.activeSubscriptions || subsStats?.overview?.activeSubscriptions || '-'
          }
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlanChart data={subsStats} />

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <div className="flex-1">
                <div className="font-medium">Nouveaux utilisateurs</div>
                <div className="text-sm text-gray-600">
                  +{stats?.trends?.newUsersLast30Days || 0} ce mois
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <div className="font-medium">Nouveaux abonnements</div>
                <div className="text-sm text-gray-600">
                  +{stats?.trends?.newSubscriptionsLast30Days || 0} ce mois
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilisateurs récents */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Utilisateurs récents</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Nom</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-900">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(stats?.recentUsers || []).slice(0, 5).map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        user.subscription?.plan === 'premium'
                          ? 'bg-purple-100 text-purple-800'
                          : user.subscription?.plan === 'etudiant'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.subscription?.plan || 'demo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
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
