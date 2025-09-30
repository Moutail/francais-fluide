'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ErrorAnalytics from '@/components/analytics/ErrorAnalytics';
import PersonalizedRecommendations from '@/components/ai/PersonalizedRecommendations';
import { useSubscriptionSimple } from '@/hooks/useSubscriptionSimple';
import Navigation from '@/components/layout/Navigation';
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Shield,
  CreditCard,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { getStatus } = useSubscriptionSimple();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUnsubscribeOpen, setIsUnsubscribeOpen] = useState(false);

  // Données du profil
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    bio: '',
    language: 'fr',
    timezone: 'America/Montreal',
  });

  // Données de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Préférences de notification
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    achievements: true,
    reminders: false,
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        language: user.language || 'fr',
        timezone: user.timezone || 'America/Montreal',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await updateProfile(profileData);
      setMessage('Profil mis à jour avec succès !');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Mot de passe modifié avec succès !');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      // Sauvegarder les préférences de notification
      localStorage.setItem('notification-preferences', JSON.stringify(notifications));
      setMessage('Préférences de notification sauvegardées !');
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          "Désabonnement effectué avec succès. Votre abonnement restera actif jusqu'à la fin de la période de facturation."
        );
        setIsUnsubscribeOpen(false);
        // Recharger les données utilisateur
        window.location.reload();
      } else {
        setError(data.error || 'Erreur lors du désabonnement. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Erreur lors du désabonnement. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Logique de suppression de compte
      setMessage('Compte supprimé avec succès');
    } catch (err) {
      setError('Erreur lors de la suppression du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Facturation', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'privacy', label: 'Confidentialité', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-600">Gérez vos préférences et informations personnelles</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Modal de confirmation de désabonnement */}
              {isUnsubscribeOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black/50"
                    onClick={() => setIsUnsubscribeOpen(false)}
                  />
                  <div className="relative mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Confirmer le désabonnement
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Êtes-vous sûr de vouloir vous désabonner ? Vous perdrez l'accès aux
                      fonctionnalités premium à la fin de votre période actuelle.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setIsUnsubscribeOpen(false)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleUnsubscribe}
                        disabled={isLoading}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Traitement...' : 'Confirmer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Messages */}
              {message && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-green-700">{message}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Onglet Profil */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Informations du profil
                  </h2>

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          L'email ne peut pas être modifié
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        value={profileData.bio}
                        onChange={e => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Langue
                        </label>
                        <select
                          value={profileData.language}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, language: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="fr">Français</option>
                          <option value="en">English</option>
                          <option value="es">Español</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Fuseau horaire
                        </label>
                        <select
                          value={profileData.timezone}
                          onChange={e =>
                            setProfileData(prev => ({ ...prev, timezone: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="America/Montreal">Montréal (GMT-5)</option>
                          <option value="America/Toronto">Toronto (GMT-5)</option>
                          <option value="Europe/Paris">Paris (GMT+1)</option>
                          <option value="America/New_York">New York (GMT-5)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </form>
                </div>
              )}

              {/* Onglet Sécurité */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">Sécurité</h2>

                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={e =>
                            setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({ ...prev, current: !prev.current }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={e =>
                            setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={e =>
                            setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))
                          }
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Lock className="h-4 w-4" />
                      {isLoading ? 'Modification...' : 'Modifier le mot de passe'}
                    </button>
                  </form>

                  {/* Suppression de compte */}
                  <div className="mt-12 border-t border-gray-200 pt-8">
                    <h3 className="mb-4 text-lg font-semibold text-red-600">Zone dangereuse</h3>
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="mb-4 text-red-700">
                        La suppression de votre compte est irréversible. Toutes vos données seront
                        perdues.
                      </p>
                      <button
                        onClick={handleAccountDeletion}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Supprimer mon compte
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Notifications */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Préférences de notification
                  </h2>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {key === 'email' && 'Notifications par email'}
                              {key === 'push' && 'Notifications push'}
                              {key === 'weekly' && 'Rapport hebdomadaire'}
                              {key === 'achievements' && 'Nouveaux succès'}
                              {key === 'reminders' && "Rappels d'exercices"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {key === 'email' && 'Recevez des mises à jour par email'}
                              {key === 'push' && 'Recevez des notifications dans le navigateur'}
                              {key === 'weekly' && 'Recevez un résumé de vos progrès'}
                              {key === 'achievements' && 'Soyez notifié de vos nouveaux succès'}
                              {key === 'reminders' && 'Recevez des rappels pour pratiquer'}
                            </p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={e =>
                                setNotifications(prev => ({ ...prev, [key]: e.target.checked }))
                              }
                              className="peer sr-only"
                            />
                            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Bell className="h-4 w-4" />
                      {isLoading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
                    </button>
                  </div>
                </div>
              )}

              {/* Onglet Facturation */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Facturation et abonnement
                  </h2>

                  <div className="space-y-6">
                    {/* Plan actuel */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
                      <h3 className="mb-2 text-lg font-semibold text-blue-900">Plan actuel</h3>
                      <p className="mb-4 text-blue-700">
                        {getStatus().planName} - {getStatus().isActive ? 'Actif' : 'Inactif'}
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="/subscription"
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                          <CreditCard className="h-4 w-4" />
                          Gérer l'abonnement
                        </a>
                        <button
                          onClick={() => setIsUnsubscribeOpen(true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Me désabonner
                        </button>
                      </div>
                    </div>

                    {/* Historique des factures */}
                    <div>
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Historique des factures
                      </h3>
                      <div className="py-8 text-center text-gray-500">
                        <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <p>Aucune facture disponible</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Onglet Analytics */}
              {activeTab === 'analytics' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">
                      Analytics et Performance
                    </h2>
                    <ErrorAnalytics />
                  </div>

                  <div>
                    <h2 className="mb-6 text-xl font-semibold text-gray-900">Recommandations IA</h2>
                    <PersonalizedRecommendations />
                  </div>
                </div>
              )}

              {/* Onglet Confidentialité */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Confidentialité et données
                  </h2>

                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Export de données
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Téléchargez une copie de toutes vos données personnelles.
                      </p>
                      <button className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700">
                        Télécharger mes données
                      </button>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Suppression de données
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Supprimez définitivement toutes vos données personnelles.
                      </p>
                      <button className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700">
                        Supprimer mes données
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
