'use client';

import React, { useEffect, useMemo, useState } from 'react';

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
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setItems(json?.data?.subscriptions ?? []);
    } catch (e) {
      console.error('Erreur chargement abonnements:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token, query]);

  async function submit() {
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(patch)
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
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await load();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="text-sm text-gray-600">Recherche</label>
          <input value={search} onChange={e => setSearch(e.target.value)} className="border rounded px-2 py-1 ml-2" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Plan</label>
          <select value={plan} onChange={e => setPlan(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="">Tous</option>
            <option value="demo">demo</option>
            <option value="etudiant">etudiant</option>
            <option value="premium">premium</option>
            <option value="etablissement">etablissement</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600">Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="">Tous</option>
            <option value="active">active</option>
            <option value="pending">pending</option>
            <option value="cancelled">cancelled</option>
            <option value="expired">expired</option>
          </select>
        </div>
        <button onClick={() => setCreating(true)} className="ml-auto bg-blue-600 text-white px-3 py-2 rounded">Créer abonnement</button>
      </div>

      {creating && (
        <div className="p-4 border rounded bg-white space-y-3">
          <div className="flex gap-3">
            <input placeholder="User ID" value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} className="border rounded px-2 py-1 flex-1" />
            <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as any })} className="border rounded px-2 py-1">
              <option value="demo">demo</option>
              <option value="etudiant">etudiant</option>
              <option value="premium">premium</option>
              <option value="etablissement">etablissement</option>
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="border rounded px-2 py-1">
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="cancelled">cancelled</option>
              <option value="expired">expired</option>
            </select>
            <input type="number" min={1} max={24} value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="border rounded px-2 py-1 w-28" />
            <button onClick={submit} className="bg-green-600 text-white px-3 py-2 rounded">Enregistrer</button>
            <button onClick={() => setCreating(false)} className="bg-gray-200 px-3 py-2 rounded">Annuler</button>
          </div>
        </div>
      )}

      <div className="overflow-auto border rounded">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Statut</th>
              <th className="px-3 py-2">Début</th>
              <th className="px-3 py-2">Fin</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={7}>Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-3 py-4" colSpan={7}>Aucun abonnement trouvé</td></tr>
            ) : items.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.user?.name || s.userId}</td>
                <td className="px-3 py-2">{s.user?.email}</td>
                <td className="px-3 py-2">
                  <select value={s.plan} onChange={e => update(s.id, { plan: e.target.value })} className="border rounded px-2 py-1">
                    <option value="demo">demo</option>
                    <option value="etudiant">etudiant</option>
                    <option value="premium">premium</option>
                    <option value="etablissement">etablissement</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select value={s.status} onChange={e => update(s.id, { status: e.target.value })} className="border rounded px-2 py-1">
                    <option value="active">active</option>
                    <option value="pending">pending</option>
                    <option value="cancelled">cancelled</option>
                    <option value="expired">expired</option>
                  </select>
                </td>
                <td className="px-3 py-2">{s.startDate ? new Date(s.startDate).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2">{s.endDate ? new Date(s.endDate).toLocaleDateString() : '-'}</td>
                <td className="px-3 py-2">
                  <button onClick={() => remove(s.id)} className="text-red-600 hover:underline">Supprimer</button>
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
  );
}
