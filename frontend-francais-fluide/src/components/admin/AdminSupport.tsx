'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { MessageCircle, Search, Eye, Trash2, X, Send, CheckCircle } from 'lucide-react';

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    subscription?: { plan: string; status: string };
  };
  response?: string;
};

export default function AdminSupport() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [answer, setAnswer] = useState('');

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', String(limit));
    if (search) q.set('search', search);
    if (status) q.set('status', status);
    if (priority) q.set('priority', priority);
    if (category) q.set('category', category);
    return q.toString();
  }, [page, limit, search, status, priority, category]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/support?' + query, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setTickets(json?.data?.tickets ?? []);
    } catch (e) {
      console.error('Erreur chargement tickets:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token, query]);

  async function updateTicket(id: string, patch: Partial<Ticket>) {
    try {
      const res = await fetch('/api/admin/support/' + id, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        await load();
        if (selected?.id === id) {
          const updated = await res.json();
          setSelected(updated.data);
        }
      } else {
        const e = await res.json();
        alert(e?.error || 'Erreur mise à jour');
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function removeTicket(id: string) {
    if (!confirm('Supprimer ce ticket ?')) return;
    try {
      const res = await fetch('/api/admin/support/' + id, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await load();
        if (selected?.id === id) setSelected(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function openDetails(id: string) {
    try {
      const res = await fetch('/api/admin/support/' + id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setSelected(json?.data);
      setAnswer(json?.data?.response || '');
    } catch (e) {
      console.error(e);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support client</h1>
        <p className="text-gray-600">Gérez les demandes et tickets de support des utilisateurs</p>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Filtres */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-64 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher dans les tickets..."
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous statuts</option>
                <option value="open">Ouvert</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Résolu</option>
                <option value="closed">Fermé</option>
              </select>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Catégorie"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tableau des tickets */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="animate-pulse">Chargement des tickets...</div>
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        Aucun ticket de support trouvé
                      </td>
                    </tr>
                  ) : (
                    tickets.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{t.subject}</div>
                          <div className="max-w-xs truncate text-sm text-gray-500">
                            {t.description}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <span className="text-xs font-medium text-blue-700">
                                {t.user?.name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {t.user?.name}
                              </div>
                              <div className="text-sm text-gray-500">{t.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={t.status}
                            onChange={e => updateTicket(t.id, { status: e.target.value as any })}
                            className={`rounded-lg border px-3 py-1 text-sm ${getStatusColor(t.status)} border-transparent`}
                          >
                            <option value="open">Ouvert</option>
                            <option value="in_progress">En cours</option>
                            <option value="resolved">Résolu</option>
                            <option value="closed">Fermé</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={t.priority}
                            onChange={e => updateTicket(t.id, { priority: e.target.value as any })}
                            className={`rounded-lg border px-3 py-1 text-sm ${getPriorityColor(t.priority)} border-transparent`}
                          >
                            <option value="low">Faible</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Élevée</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => openDetails(t.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={() => removeTicket(t.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Page {page}</div>
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

        {/* Panneau de détails */}
        <div className="w-full lg:w-96">
          {selected ? (
            <div className="sticky top-6 rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Détails du ticket</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">{selected.subject}</h4>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                    {selected.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-700">
                      {selected.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{selected.user?.name}</div>
                    <div className="text-sm text-gray-500">{selected.user?.email}</div>
                    <div className="text-xs text-gray-400">
                      Plan: {selected.user?.subscription?.plan || 'demo'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Votre réponse
                  </label>
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Tapez votre réponse ici..."
                    className="h-32 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateTicket(selected.id, { response: answer })}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Envoyer
                  </button>
                  <button
                    onClick={() => updateTicket(selected.id, { status: 'resolved' })}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-white p-6 text-center text-gray-500 shadow-sm">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>Sélectionnez un ticket pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
