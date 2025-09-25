'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DissertationAssistant from '@/components/dissertation/DissertationAssistant';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { 
  Crown,
  Sparkles,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Target,
  TrendingUp
} from 'lucide-react';

export default function DissertationPage() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à l'assistant de dissertation.
          </p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            Se connecter
          </Button>
        </Card>
      </div>
    );
  }

  // Vérifier l'abonnement (côté client pour l'UX, la vérification réelle est côté serveur)
  const hasSubscription = user?.subscription?.status === 'active';
  const isPremium = hasSubscription && ['premium', 'etablissement'].includes(user?.subscription?.plan);

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto p-6 pt-20">
          <Card className="p-12 text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full">
                  <Crown className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Assistant de Dissertation IA
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Maîtrisez l'art de la dissertation française avec votre assistant intelligent personnel
              </p>
            </div>

            {/* Fonctionnalités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="text-left p-6 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Plans Intelligents</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Génération automatique de plans détaillés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Arguments et exemples suggérés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Transitions optimisées
                  </li>
                </ul>
              </div>

              <div className="text-left p-6 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Correction Avancée</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Analyse de structure et argumentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Feedback personnalisé et constructif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Conseils d'amélioration ciblés
                  </li>
                </ul>
              </div>

              <div className="text-left p-6 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Types Variés</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Dissertation argumentative
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Dissertation comparative
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Analyse poétique et rédaction créative
                  </li>
                </ul>
              </div>

              <div className="text-left p-6 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">IA Avancée</h3>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Powered by GPT-4 et Claude
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Apprentissage adaptatif
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Progression personnalisée
                  </li>
                </ul>
              </div>
            </div>

            {/* Call to action */}
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Fonctionnalité Premium
                </h2>
                <p className="text-gray-700 mb-4">
                  L'assistant de dissertation est disponible avec les abonnements Premium et Établissement.
                </p>
                
                {hasSubscription ? (
                  <div className="text-center">
                    <p className="text-lg text-gray-800 mb-4">
                      Votre plan actuel : <strong>{user?.subscription?.plan}</strong>
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/subscription'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Passer à Premium
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">
                      Aucun abonnement actif
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/subscription'}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Découvrir Premium
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                >
                  Retour au tableau de bord
                </Button>
                <Button
                  onClick={() => window.location.href = '/demo'}
                  variant="outline"
                >
                  Essayer la démo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DissertationAssistant />
    </div>
  );
}
