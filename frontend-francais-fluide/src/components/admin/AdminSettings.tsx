'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminSettings() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    setMessage(null);
    const res = await changePassword(currentPassword, newPassword);
    setSaving(false);
    if (res.success) setMessage('Mot de passe modifié avec succès');
    else setMessage(res.error || 'Erreur lors du changement de mot de passe');
  }

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-xl font-semibold">Paramètres du compte</h2>
      <form onSubmit={onSubmit} className="space-y-3 p-4 border rounded bg-white">
        <div>
          <label className="text-sm text-gray-600">Mot de passe actuel</label>
          <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="text-sm text-gray-600">Nouveau mot de passe</label>
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <div>
          <label className="text-sm text-gray-600">Confirmer</label>
          <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} className="w-full border rounded px-2 py-1" required />
        </div>
        <button disabled={saving} className="bg-blue-600 text-white px-3 py-2 rounded">{saving ? 'Enregistrement...' : 'Changer le mot de passe'}</button>
      </form>
      {message && <div className="text-sm">{message}</div>}
    </div>
  );
}
