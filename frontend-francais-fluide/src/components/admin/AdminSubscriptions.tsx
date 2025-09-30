'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Crown,
  GraduationCap,
  Building,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSubscriptions() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ userId: '', plan: 'demo', status: 'active', duration: 12 });

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', String(limit));
    if (search) q.set('search', search);
    if (plan) q.set('plan', plan);
    if (status) q.set('status', status);
    return q.toString();
  }, [page, limit, search, plan, status]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions?' + query, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setItems(json?.data?.subscriptions ?? []);
    } catch (e) {
      console.error('Erreur chargement abonnements:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token, query]);

  async function submit() {
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e?.error || 'Erreur création abonnement');
      } else {
        setCreating(false);
        setForm({ userId: '', plan: 'demo', status: 'active', duration: 12 });
        await load();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function update(id: string, patch: any) {
    try {
      const res = await fetch('/api/admin/subscriptions/' + id, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e?.error || 'Erreur modification');
      } else {
        await load();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cet abonnement ?')) return;
    try {
      const res = await fetch('/api/admin/subscriptions/' + id, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await load();
    } catch (e) {
      console.error(e);
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'premium':
        return Crown;
      case 'etudiant':
        return GraduationCap;
      case 'etablissement':
        return Building;
      default:
        return Zap;
    }
  };

  const getStatusIcon = (statusName: string) => {
    switch (statusName) {
      case 'active':
        return CheckCircle;
      case 'expired':
        return XCircle;
      case 'pending':
        return Clock;
      case 'cancelled':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des abonnements</h1>
          <p className="text-gray-600">Gérez les plans et facturation des utilisateurs</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvel abonnement
        </button>
      </div>

      {/* Filtres */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-64 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={plan}
              onChange={e => setPlan(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les plans</option>
              <option value="demo">Demo</option>
              <option value="etudiant">Étudiant</option>
              <option value="premium">Premium</option>
              <option value="etablissement">Établissement</option>
            </select>
          </div>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulé</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
      </div>

      {/* Formulaire de création */}
      {creating && (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Créer un nouvel abonnement</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">ID Utilisateur</label>
              <input
                placeholder="ID de l'utilisateur"
                value={form.userId}
                onChange={e => setForm({ ...form, userId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Plan</label>
              <select
                value={form.plan}
                onChange={e => setForm({ ...form, plan: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="demo">Demo</option>
                <option value="etudiant">Étudiant</option>
                <option value="premium">Premium</option>
                <option value="etablissement">Établissement</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Statut</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Actif</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Durée (mois)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.duration}
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={submit}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Enregistrer
            </button>
            <button
              onClick={() => setCreating(false)}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Tableau des abonnements */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="animate-pulse">Chargement des abonnements...</div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    Aucun abonnement trouvé
                  </td>
                </tr>
              ) : (
                items.map(s => {
                  const PlanIcon = getPlanIcon(s.plan);
                  const StatusIcon = getStatusIcon(s.status);

                  return (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {s.user?.name || 'Utilisateur inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">{s.user?.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <PlanIcon className="h-4 w-4 text-gray-400" />
                          <select
                            value={s.plan}
                            onChange={e => update(s.id, { plan: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="demo">Demo</option>
                            <option value="etudiant">Étudiant</option>
                            <option value="premium">Premium</option>
                            <option value="etablissement">Établissement</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`h-4 w-4 ${
                              s.status === 'active'
                                ? 'text-green-500'
                                : s.status === 'expired'
                                  ? 'text-red-500'
                                  : s.status === 'pending'
                                    ? 'text-yellow-500'
                                    : 'text-gray-500'
                            }`}
                          />
                          <select
                            value={s.status}
                            onChange={e => update(s.id, { status: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="active">Actif</option>
                            <option value="pending">En attente</option>
                            <option value="cancelled">Annulé</option>
                            <option value="expired">Expiré</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          Du {s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}
                        </div>
                        <div className="text-gray-500">
                          Au {s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => remove(s.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Page {page} sur ?</div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );
}
