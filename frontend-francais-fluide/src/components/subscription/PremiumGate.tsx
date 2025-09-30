'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Crown, Sparkles, CheckCircle, ArrowRight, Zap, Star } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: string;
  description: string;
  requiredPlans?: string[];
  fallbackContent?: React.ReactNode;
}

export default function PremiumGate({
  children,
  feature,
  description,
  requiredPlans = ['premium', 'etablissement'],
  fallbackContent,
}: PremiumGateProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Vérification de l'abonnement...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="mx-auto mb-4 size-16 text-blue-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Connexion requise</h2>
        <p className="mb-6 text-gray-600">Connectez-vous pour accéder à {feature}.</p>
        <Button onClick={() => (window.location.href = '/auth/login')}>Se connecter</Button>
      </Card>
    );
  }

  const hasSubscription = user?.subscription?.status === 'active';
  const currentPlan = user?.subscription?.plan;
  const hasRequiredPlan = hasSubscription && currentPlan && requiredPlans.includes(currentPlan);

  if (hasRequiredPlan) {
    return <>{children}</>;
  }

  // Afficher le contenu de fallback ou la promotion premium
  if (fallbackContent) {
    return <>{fallbackContent}</>;
  }

  const planFeatures = {
    premium: [
      'Assistant de dissertation IA',
      'Corrections illimitées',
      'Exercices personnalisés',
      'Analytics avancées',
      'Support prioritaire',
    ],
    etablissement: [
      'Toutes les fonctionnalités Premium',
      'Gestion multi-utilisateurs',
      'Outils pédagogiques avancés',
      'Analytics institutionnelles',
      'Support 24/7',
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-4xl p-6 pt-20">
        <Card className="p-12 text-center">
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-blue-600 p-4">
                <Sparkles className="size-12 text-white" />
              </div>
              <div className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 p-2">
                <Crown className="size-8 text-white" />
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">{feature}</h1>
            <p className="mb-8 text-xl text-gray-600">{description}</p>
          </div>

          {/* État actuel de l'abonnement */}
          <div className="mb-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <div className="mb-3 flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">État de votre abonnement</span>
            </div>

            {hasSubscription ? (
              <div>
                <p className="mb-2 text-yellow-700">
                  Plan actuel : <strong className="capitalize">{currentPlan}</strong>
                </p>
                <p className="text-sm text-yellow-600">
                  Cette fonctionnalité nécessite un abonnement {requiredPlans.join(' ou ')}.
                </p>
              </div>
            ) : (
              <p className="text-yellow-700">
                Aucun abonnement actif. Cette fonctionnalité nécessite un abonnement Premium.
              </p>
            )}
          </div>

          {/* Avantages Premium */}
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="text-left">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Crown className="size-6 text-purple-600" />
                Premium
              </h3>
              <ul className="space-y-3">
                {planFeatures.premium.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <div className="mb-1 text-2xl font-bold text-purple-600">29,99 CAD</div>
                <div className="text-sm text-gray-600">par mois</div>
              </div>
            </div>

            <div className="text-left">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                <Zap className="size-6 text-blue-600" />
                Établissement
              </h3>
              <ul className="space-y-3">
                {planFeatures.etablissement.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <div className="mb-1 text-2xl font-bold text-blue-600">149,99 CAD</div>
                <div className="text-sm text-gray-600">par mois</div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-4">
            <Button
              onClick={() => (window.location.href = '/subscription')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Crown className="mr-2 size-5" />
              Passer à Premium
              <ArrowRight className="ml-2 size-5" />
            </Button>

            <div className="flex justify-center gap-4">
              <Button onClick={() => (window.location.href = '/dashboard')} variant="secondary">
                Retour au tableau de bord
              </Button>
              <Button onClick={() => (window.location.href = '/demo')} variant="secondary">
                Essayer la démo
              </Button>
            </div>
          </div>

          {/* Garantie */}
          <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="size-5" />
              <span className="font-medium">Garantie 30 jours satisfait ou remboursé</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
