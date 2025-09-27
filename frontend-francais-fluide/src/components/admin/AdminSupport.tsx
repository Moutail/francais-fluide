'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Ticket = {
  id: string;
  subject: string;
  description: string;
  status: 'open'|'in_progress'|'resolved'|'closed';
  priority: 'low'|'medium'|'high';
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: { id: string; name: string; email: string; role?: string; subscription?: { plan: string; status: string } };
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
      const res = await fetch('/api/admin/support?' + query, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setTickets(json?.data?.tickets ?? []);
    } catch (e) {
      console.error('Erreur chargement tickets:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token, query]);

  async function updateTicket(id: string, patch: Partial<Ticket>) {
    try {
      const res = await fetch('/api/admin/support/' + id, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patch)
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
        headers: { Authorization: `Bearer ${token}` }
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
      const res = await fetch('/api/admin/support/' + id, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setSelected(json?.data);
      setAnswer(json?.data?.response || '');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2 items-end">
          <input className="border rounded px-2 py-1" placeholder="Recherche..." value={search} onChange={e=>setSearch(e.target.value)} />
          <select className="border rounded px-2 py-1" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Tous statuts</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
            <option value="closed">closed</option>
          </select>
          <select className="border rounded px-2 py-1" value={priority} onChange={e=>setPriority(e.target.value)}>
            <option value="">Toutes priorités</option>
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <input className="border rounded px-2 py-1" placeholder="Catégorie" value={category} onChange={e=>setCategory(e.target.value)} />
        </div>

        <div className="overflow-auto border rounded bg-white">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Sujet</th>
                <th className="px-3 py-2">Utilisateur</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Priorité</th>
                <th className="px-3 py-2">Créé</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-3 py-4">Chargement...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-4">Aucun ticket</td></tr>
              ) : tickets.map(t => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2">{t.subject}</td>
                  <td className="px-3 py-2">{t.user?.name} <span className="text-xs text-gray-500">({t.user?.email})</span></td>
                  <td className="px-3 py-2">
                    <select value={t.status} onChange={e=>updateTicket(t.id, { status: e.target.value as any })} className="border rounded px-2 py-1">
                      <option value="open">open</option>
                      <option value="in_progress">in_progress</option>
                      <option value="resolved">resolved</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select value={t.priority} onChange={e=>updateTicket(t.id, { priority: e.target.value as any })} className="border rounded px-2 py-1">
                      <option value="low">low</option>
                      <option value="medium">medium</option>
                      <option value="high">high</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">
                    <button className="text-blue-600 hover:underline mr-2" onClick={()=>openDetails(t.id)}>Détails</button>
                    <button className="text-red-600 hover:underline" onClick={()=>removeTicket(t.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-2">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 border rounded">Précédent</button>
          <button onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded">Suivant</button>
        </div>
      </div>

      <div className="w-full md:w-1/3">
        {selected ? (
          <div className="p-4 border rounded bg-white space-y-3 sticky top-4">
            <div className="font-semibold">{selected.subject}</div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">{selected.description}</div>
            <div className="text-xs text-gray-500">De: {selected.user?.name} ({selected.user?.email})</div>
            <hr />
            <div>
              <label className="block text-sm text-gray-600 mb-1">Réponse</label>
              <textarea value={answer} onChange={e=>setAnswer(e.target.value)} className="w-full border rounded px-2 py-1 h-28" />
              <div className="mt-2 flex gap-2">
                <button onClick={()=>updateTicket(selected.id, { response: answer })} className="bg-blue-600 text-white px-3 py-1 rounded">Enregistrer</button>
                <button onClick={()=>setSelected(null)} className="px-3 py-1 border rounded">Fermer</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded bg-white text-gray-500">Sélectionnez un ticket pour voir les détails</div>
        )}
      </div>
    </div>
  );
}
