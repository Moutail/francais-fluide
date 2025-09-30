'use client';

import React from 'react';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import DissertationAssistant from '@/components/dissertation/DissertationAssistant';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Crown, Sparkles, CheckCircle, BookOpen, Target, TrendingUp } from 'lucide-react';

export default function DissertationPage() {
  const { user, loading, isAuthenticated } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-gray-600">Chargement...</p>
          </Card>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <Card className="max-w-md p-8 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-blue-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Connexion requise</h1>
            <p className="mb-6 text-gray-600">
              Vous devez être connecté pour accéder à l'assistant de dissertation.
            </p>
            <Button onClick={() => (window.location.href = '/auth/login')}>Se connecter</Button>
          </Card>
        </div>
      </div>
    );
  }

  // Subscription check
  const hasSubscription = user?.subscription?.status === 'active';
  const isPremium =
    hasSubscription && ['premium', 'etablissement'].includes(user?.subscription?.plan || '');

  // Non-premium: show premium prompt
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="mx-auto max-w-4xl p-6 pt-24">
          <Card className="p-12 text-center">
            <div className="mb-8">
              <div className="mb-6 flex items-center justify-center gap-3">
                <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-4">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 p-2">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="mb-4 text-4xl font-bold text-gray-900">
                Assistant de Dissertation IA
              </h1>
              <p className="mb-8 text-xl text-gray-600">
                Maîtrisez l'art de la dissertation française avec votre assistant intelligent
                personnel
              </p>
            </div>

            {/* Features */}
            <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Plans Intelligents</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Génération automatique de plans détaillés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Arguments et exemples suggérés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Transitions optimisées
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Correction Avancée</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Analyse de structure et argumentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Feedback personnalisé et constructif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Conseils d'amélioration ciblés
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Types Variés</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dissertation argumentative
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Dissertation comparative
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Analyse poétique et rédaction créative
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6 text-left">
                <div className="mb-4 flex items-center gap-3">
                  <Sparkles className="h-8 w-8 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">IA Avancée</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Powered by GPT-4 et Claude
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Apprentissage adaptatif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Progression personnalisée
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-6">
              <div className="rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-6">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Fonctionnalité Premium</h2>
                <p className="mb-4 text-gray-700">
                  L'assistant de dissertation est disponible avec les abonnements Premium et
                  Établissement.
                </p>

                {hasSubscription ? (
                  <div className="text-center">
                    <p className="mb-4 text-lg text-gray-800">
                      Votre plan actuel : <strong>{user?.subscription?.plan}</strong>
                    </p>
                    <Button
                      onClick={() => (window.location.href = '/subscription')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      Passer à Premium
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="mb-4 text-gray-700">Aucun abonnement actif</p>
                    <Button
                      onClick={() => (window.location.href = '/subscription')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Crown className="mr-2 h-5 w-5" />
                      Découvrir Premium
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={() => (window.location.href = '/dashboard')} variant="secondary">
                  Retour au tableau de bord
                </Button>
                <Button onClick={() => (window.location.href = '/demo')} variant="secondary">
                  Essayer la démo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Premium view
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="pt-20">
        <DissertationAssistant />
      </div>
    </div>
  );
}
