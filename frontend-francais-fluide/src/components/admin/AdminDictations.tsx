'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Play,
  Clock,
  BarChart3,
  Filter,
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Import dynamique pour éviter les erreurs SSR
const AudioUploader = dynamic(() => import('./AudioUploader'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <p className="text-gray-600">Chargement du composant d'upload...</p>
    </div>
  ),
});

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
  const [form, setForm] = useState<any>({
    title: '',
    description: '',
    difficulty: 'beginner',
    duration: 10,
    text: '',
    audioUrl: '',
    category: '',
    tags: [],
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>({}); // seconds by id

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
      const res = await fetch('/api/admin/dictations?' + query, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setItems(json?.data?.dictations ?? []);
    } catch (e) {
      console.error('Erreur chargement dictées:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token, query]);

  // Load audio metadata durations for rows that have audioUrl
  useEffect(() => {
    const controllers: Array<{
      id: string;
      audio: HTMLAudioElement;
      onLoad: () => void;
      onError: () => void;
    }> = [];
    items.forEach(d => {
      if (d?.audioUrl && typeof d.audioUrl === 'string' && !audioDurations[d.id]) {
        const audio = new Audio();
        audio.src = d.audioUrl;
        const onLoad = () => {
          if (!isFinite(audio.duration) || audio.duration <= 0) return;
          setAudioDurations(prev => ({ ...prev, [d.id]: Math.round(audio.duration) }));
        };
        const onError = () => {
          // ignore errors; keep est. fallback
        };
        audio.addEventListener('loadedmetadata', onLoad);
        audio.addEventListener('error', onError);
        controllers.push({ id: d.id, audio, onLoad, onError });
      }
    });
    return () => {
      controllers.forEach(({ audio, onLoad, onError }) => {
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
        audio.src = '';
      });
    };
  }, [items, audioDurations]);

  // Utilities
  const getWordCountFromText = (text: string) =>
    (text || '').trim().split(/\s+/).filter(Boolean).length;
  const getDurationSecondsFromText = (text: string) => {
    const words = getWordCountFromText(text);
    return Math.max(5, Math.ceil(words / 2));
  };
  const formatDurationLabel = (seconds: number) =>
    seconds < 60 ? `${seconds}s` : `${Math.round(seconds / 60)} min`;

  async function create() {
    try {
      const res = await fetch('/api/admin/dictations', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e?.error || 'Erreur création dictée');
      } else {
        setCreating(false);
        setForm({
          title: '',
          description: '',
          difficulty: 'beginner',
          duration: 60,
          text: '',
          audioUrl: '',
          category: '',
          tags: [],
        });
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
        body: JSON.stringify(patch),
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await load();
    } catch (e) {
      console.error(e);
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des dictées</h1>
          <p className="text-gray-600">Créez et gérez le contenu pédagogique de la plateforme</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle dictée
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
                placeholder="Rechercher par titre, description ou contenu..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes difficultés</option>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
          <input
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="Catégorie"
            className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {creating && (
        <div className="space-y-3 rounded border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              placeholder="Titre"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="rounded border px-2 py-1"
            />
            <input
              placeholder="Catégorie"
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="rounded border px-2 py-1"
            />
            <select
              value={form.difficulty}
              onChange={e => setForm({ ...form, difficulty: e.target.value })}
              className="rounded border px-2 py-1"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={60}
                value={form.duration}
                onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-24 rounded border px-2 py-1"
              />
              <span className="text-sm text-gray-600">min</span>
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="h-20 w-full rounded border px-2 py-1"
          />
          <textarea
            placeholder="Texte de la dictée"
            value={form.text}
            onChange={e => setForm({ ...form, text: e.target.value })}
            className="h-32 w-full rounded border px-2 py-1"
          />
          
          {/* Téléversement audio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fichier Audio
            </label>
            <AudioUploader
              onUploadSuccess={(audioUrl, duration) => {
                setForm({ 
                  ...form, 
                  audioUrl, 
                  duration: Math.ceil(duration / 60) // Convertir secondes en minutes
                });
              }}
              onUploadError={(error) => {
                alert(`Erreur: ${error}`);
              }}
            />
            {form.audioUrl && (
              <div className="mt-2 rounded-lg bg-green-50 p-3">
                <p className="text-sm text-green-800">
                  ✅ Audio téléversé : {form.audioUrl}
                </p>
              </div>
            )}
          </div>
          
          {/* OU saisir une URL manuellement */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ou saisir une URL audio manuellement
            </label>
            <input
              placeholder="https://exemple.com/audio.mp3"
              value={form.audioUrl}
              onChange={e => setForm({ ...form, audioUrl: e.target.value })}
              className="w-full rounded border px-2 py-1"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={create} className="rounded bg-green-600 px-3 py-2 text-white">
              Enregistrer
            </button>
            <button onClick={() => setCreating(false)} className="rounded border px-3 py-2">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto rounded border bg-white">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Titre</th>
              <th className="px-3 py-2">Difficulté</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Mots</th>
              <th className="px-3 py-2">Durée</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4">
                  Chargement...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4">
                  Aucune dictée
                </td>
              </tr>
            ) : (
              items.map(d => (
                <tr key={d.id} className="border-t">
                  {/* Titre */}
                  <td className="px-3 py-2">
                    {editing?.id === d.id ? (
                      <input
                        value={editing.title}
                        onChange={e => setEditing({ ...editing, title: e.target.value })}
                        className="rounded border px-2 py-1"
                      />
                    ) : (
                      d.title
                    )}
                  </td>
                  {/* Difficulté */}
                  <td className="px-3 py-2">
                    {editing?.id === d.id ? (
                      <select
                        value={editing.difficulty}
                        onChange={e => setEditing({ ...editing, difficulty: e.target.value })}
                        className="rounded border px-2 py-1"
                      >
                        <option value="beginner">beginner</option>
                        <option value="intermediate">intermediate</option>
                        <option value="advanced">advanced</option>
                      </select>
                    ) : (
                      d.difficulty
                    )}
                  </td>
                  {/* Catégorie */}
                  <td className="px-3 py-2">
                    {editing?.id === d.id ? (
                      <input
                        value={editing.category || ''}
                        onChange={e => setEditing({ ...editing, category: e.target.value })}
                        className="rounded border px-2 py-1"
                      />
                    ) : (
                      d.category || '-'
                    )}
                  </td>
                  {/* Mots */}
                  <td className="px-3 py-2">{getWordCountFromText(d.text || '')}</td>
                  {/* Durée */}
                  <td className="px-3 py-2">
                    {editing?.id === d.id ? (
                      <input
                        type="number"
                        value={editing.duration}
                        onChange={e => setEditing({ ...editing, duration: Number(e.target.value) })}
                        className="w-24 rounded border px-2 py-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const audioSec = audioDurations[d.id];
                          if (audioSec && Number.isFinite(audioSec)) {
                            return (
                              <>
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                  Durée audio
                                </span>
                                <span>{formatDurationLabel(audioSec)}</span>
                              </>
                            );
                          }
                          const estSec = getDurationSecondsFromText(d.text || '');
                          return (
                            <>
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                Durée estimée
                              </span>
                              <span>{formatDurationLabel(estSec)}</span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="space-x-2 px-3 py-2">
                    {editing?.id === d.id ? (
                      <>
                        <button
                          onClick={() => update(d.id, editing)}
                          className="rounded bg-green-600 px-3 py-1 text-white"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="rounded border px-3 py-1"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditing(d)}
                          className="text-blue-600 hover:underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => remove(d.id)}
                          className="text-red-600 hover:underline"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => p - 1)}
          className="rounded border px-3 py-1"
        >
          Précédent
        </button>
        <button onClick={() => setPage(p => p + 1)} className="rounded border px-3 py-1">
          Suivant
        </button>
      </div>
    </div>
  );
}
