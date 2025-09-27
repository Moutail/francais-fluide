'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function AdminDictations() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<any>({ title: '', description: '', difficulty: 'beginner', duration: 60, text: '', audioUrl: '', category: '', tags: [] });
  const [editing, setEditing] = useState<any | null>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', String(limit));
    if (search) q.set('search', search);
    if (difficulty) q.set('difficulty', difficulty);
    if (category) q.set('category', category);
    return q.toString();
  }, [page, limit, search, difficulty, category]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dictations?' + query, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      setItems(json?.data?.dictations ?? []);
    } catch (e) {
      console.error('Erreur chargement dictées:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) load(); }, [token, query]);

  async function create() {
    try {
      const res = await fetch('/api/admin/dictations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e?.error || 'Erreur création dictée');
      } else {
        setCreating(false);
        setForm({ title: '', description: '', difficulty: 'beginner', duration: 60, text: '', audioUrl: '', category: '', tags: [] });
        await load();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function update(id: string, patch: any) {
    try {
      const res = await fetch('/api/admin/dictations/' + id, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e?.error || 'Erreur modification');
      } else {
        setEditing(null);
        await load();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function remove(id: string) {
    if (!confirm('Supprimer cette dictée ?')) return;
    try {
      const res = await fetch('/api/admin/dictations/' + id, {
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
        <input className="border rounded px-2 py-1" placeholder="Recherche..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="border rounded px-2 py-1" value={difficulty} onChange={e=>setDifficulty(e.target.value)}>
          <option value="">Toutes difficultés</option>
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="advanced">advanced</option>
        </select>
        <input className="border rounded px-2 py-1" placeholder="Catégorie" value={category} onChange={e=>setCategory(e.target.value)} />
        <button onClick={()=>setCreating(true)} className="ml-auto bg-blue-600 text-white px-3 py-2 rounded">Créer dictée</button>
      </div>

      {creating && (
        <div className="p-4 border rounded bg-white space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <input placeholder="Titre" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} className="border rounded px-2 py-1" />
            <input placeholder="Catégorie" value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })} className="border rounded px-2 py-1" />
            <select value={form.difficulty} onChange={e=>setForm({ ...form, difficulty: e.target.value })} className="border rounded px-2 py-1">
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <input type="number" min={10} max={600} value={form.duration} onChange={e=>setForm({ ...form, duration: Number(e.target.value) })} className="border rounded px-2 py-1" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} className="border rounded px-2 py-1 w-full h-20" />
          <textarea placeholder="Texte de la dictée" value={form.text} onChange={e=>setForm({ ...form, text: e.target.value })} className="border rounded px-2 py-1 w-full h-32" />
          <input placeholder="URL Audio (optionnel)" value={form.audioUrl} onChange={e=>setForm({ ...form, audioUrl: e.target.value })} className="border rounded px-2 py-1 w-full" />
          <div className="flex gap-2">
            <button onClick={create} className="bg-green-600 text-white px-3 py-2 rounded">Enregistrer</button>
            <button onClick={()=>setCreating(false)} className="px-3 py-2 border rounded">Annuler</button>
          </div>
        </div>
      )}

      <div className="overflow-auto border rounded bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Difficulté</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Durée</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-4">Chargement...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-4">Aucune dictée</td></tr>
            ) : items.map(d => (
              <tr key={d.id} className="border-t">
                <td className="px-3 py-2">{editing?.id === d.id ? (
                  <input value={editing.title} onChange={e=>setEditing({ ...editing, title: e.target.value })} className="border rounded px-2 py-1" />
                ) : d.title}</td>
                <td className="px-3 py-2">{editing?.id === d.id ? (
                  <select value={editing.difficulty} onChange={e=>setEditing({ ...editing, difficulty: e.target.value })} className="border rounded px-2 py-1">
                    <option value="beginner">beginner</option>
                    <option value="intermediate">intermediate</option>
                    <option value="advanced">advanced</option>
                  </select>
                ) : d.difficulty}</td>
                <td className="px-3 py-2">{editing?.id === d.id ? (
                  <input value={editing.category || ''} onChange={e=>setEditing({ ...editing, category: e.target.value })} className="border rounded px-2 py-1" />
                ) : (d.category || '-')}</td>
                <td className="px-3 py-2">{editing?.id === d.id ? (
                  <input type="number" value={editing.duration} onChange={e=>setEditing({ ...editing, duration: Number(e.target.value) })} className="border rounded px-2 py-1 w-24" />
                ) : d.duration}</td>
                <td className="px-3 py-2 space-x-2">
                  {editing?.id === d.id ? (
                    <>
                      <button onClick={()=>update(d.id, editing)} className="bg-green-600 text-white px-3 py-1 rounded">Enregistrer</button>
                      <button onClick={()=>setEditing(null)} className="px-3 py-1 border rounded">Annuler</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>setEditing(d)} className="text-blue-600 hover:underline">Modifier</button>
                      <button onClick={()=>remove(d.id)} className="text-red-600 hover:underline">Supprimer</button>
                    </>
                  )}
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
