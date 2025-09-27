'use client';

import React, { useEffect, useState } from 'react';

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
    return <div className="p-8">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-white">
          <div className="text-sm text-gray-500">Utilisateurs</div>
          <div className="text-2xl font-bold">{stats?.totalUsers ?? stats?.overview?.totalUsers ?? '-'}</div>
        </div>
        <div className="p-4 border rounded-lg bg-white">
          <div className="text-sm text-gray-500">Abonnements actifs</div>
          <div className="text-2xl font-bold">{stats?.overview?.activeSubscriptions ?? subsStats?.overview?.activeSubscriptions ?? '-'}</div>
        </div>
        <div className="p-4 border rounded-lg bg-white">
          <div className="text-sm text-gray-500">Revenu mensuel (estim.)</div>
          <div className="text-2xl font-bold">
            {subsStats?.revenue?.monthly ?? subsStats?.revenue?.monthly ?? 0} $
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-white">
        <div className="text-sm text-gray-500 mb-2">Répartition des plans</div>
        <pre className="text-xs bg-gray-50 p-3 rounded">{JSON.stringify(subsStats?.byPlan ?? subsStats?.distribution?.byPlan, null, 2)}</pre>
      </div>
    </div>
  );
}
