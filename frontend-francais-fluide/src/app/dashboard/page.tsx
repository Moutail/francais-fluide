'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useApi';
import { useProgress } from '@/hooks/useApi';
import Navigation from '@/components/layout/Navigation';

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { progress, loading: progressLoading } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger les utilisateurs non connectés vers la page d'accueil
  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [mounted, authLoading, isAuthenticated]);

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Dashboard Content */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenue, {user?.name || 'Utilisateur'} ! 👋
              </h1>
              <p className="text-gray-600">
                Prêt à continuer votre apprentissage du français ? Votre progression vous attend.
              </p>
            </div>

          {/* Actions Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={() => window.location.href = '/editor'}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✍️</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Commencer à écrire</h3>
                  <p className="text-blue-100 text-sm">Utilisez l'éditeur intelligent</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/exercices'}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Faire des exercices</h3>
                  <p className="text-green-100 text-sm">Améliorez vos compétences</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => window.location.href = '/progression'}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold">Voir ma progression</h3>
                  <p className="text-purple-100 text-sm">Suivez vos performances</p>
                </div>
              </div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mots écrits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.wordsWritten || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Précision</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.accuracy || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Exercices</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.exercisesCompleted || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Série</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {progress?.currentStreak || 0} jours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/editor'}
                  className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">✏️ Éditeur de texte</div>
                  <div className="text-sm text-gray-600">Corrigez vos textes avec l'IA</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/exercices'}
                  className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">📚 Exercices</div>
                  <div className="text-sm text-gray-600">Pratiquez la grammaire</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/progression'}
                  className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="font-medium text-gray-900">📊 Progression</div>
                  <div className="text-sm text-gray-600">Suivez vos progrès</div>
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dernières activités
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Aucune activité récente
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}