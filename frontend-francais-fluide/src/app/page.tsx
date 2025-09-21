// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useApi';
import { SimpleAIAssistant } from '@/components/ai/SimpleAIAssistant';
import Navigation from '@/components/layout/Navigation';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Rediriger les utilisateurs connectés vers le dashboard
  useEffect(() => {
    if (mounted && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [mounted, isAuthenticated]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, ne pas afficher cette page
  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              🇨🇦 <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FrançaisFluide
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              L'application intelligente qui transforme l'apprentissage du français 
              en une expérience intuitive et engageante.
            </p>
          </div>
          
          {/* Plans Grid - Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Plans d'Abonnement */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                💰 Plans d'Abonnement (CAD)
              </h2>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                  <span className="font-medium text-sm sm:text-base">🆓 Démo Gratuite</span>
                  <span className="text-green-600 font-bold text-sm sm:text-base">Gratuit</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-blue-50 rounded-lg gap-2">
                  <span className="font-medium text-sm sm:text-base">🎓 Étudiant</span>
                  <span className="text-blue-600 font-bold text-sm sm:text-base">14.99$ CAD/mois</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-purple-50 rounded-lg gap-2">
                  <span className="font-medium text-sm sm:text-base">⭐ Premium</span>
                  <span className="text-purple-600 font-bold text-sm sm:text-base">29.99$ CAD/mois</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-green-50 rounded-lg gap-2">
                  <span className="font-medium text-sm sm:text-base">🏢 Établissement</span>
                  <span className="text-green-600 font-bold text-sm sm:text-base">149.99$ CAD/mois</span>
                </div>
              </div>
            </div>
            
            {/* Fonctionnalités */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                ✨ Fonctionnalités Premium
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Assistant IA avancé</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Corrections en temps réel</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Exercices personnalisés</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Analytics détaillées</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Mode hors ligne</span>
                </div>
                à
                <div className="flex items-center gap-3">
                  <span className="text-green-500 text-sm sm:text-base">✅</span>
                  <span className="text-sm sm:text-base">Support prioritaire</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              🚀 Prêt à transformer votre français ?
            </h3>
            <p className="text-blue-100 mb-6 text-center text-sm sm:text-base">
              Rejoignez des milliers d'étudiants qui écrivent déjà sans fautes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/subscription'}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Voir les abonnements
              </button>
              <button 
                onClick={() => window.location.href = '/auth/login'}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:bg-blue-800 transition-all"
              >
                Commencer gratuitement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Assistant IA Widget */}
      <SimpleAIAssistant userPlan="free" />
    </div>
  );
}