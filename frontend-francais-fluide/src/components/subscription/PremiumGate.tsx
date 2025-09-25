'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { 
  Crown,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';

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
  fallbackContent 
}: PremiumGateProps) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Vérification de l'abonnement...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <Sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connexion requise
        </h2>
        <p className="text-gray-600 mb-6">
          Connectez-vous pour accéder à {feature}.
        </p>
        <Button onClick={() => window.location.href = '/auth/login'}>
          Se connecter
        </Button>
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
      'Support prioritaire'
    ],
    etablissement: [
      'Toutes les fonctionnalités Premium',
      'Gestion multi-utilisateurs',
      'Outils pédagogiques avancés',
      'Analytics institutionnelles',
      'Support 24/7'
    ]
  };

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
              {feature}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {description}
            </p>
          </div>

          {/* État actuel de l'abonnement */}
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">État de votre abonnement</span>
            </div>
            
            {hasSubscription ? (
              <div>
                <p className="text-yellow-700 mb-2">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                Premium
              </h3>
              <ul className="space-y-3">
                {planFeatures.premium.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <div className="text-2xl font-bold text-purple-600 mb-1">29,99 CAD</div>
                <div className="text-sm text-gray-600">par mois</div>
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                Établissement
              </h3>
              <ul className="space-y-3">
                {planFeatures.etablissement.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">149,99 CAD</div>
                <div className="text-sm text-gray-600">par mois</div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/subscription'}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3"
            >
              <Crown className="w-5 h-5 mr-2" />
              Passer à Premium
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
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

          {/* Garantie */}
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Garantie 30 jours satisfait ou remboursé</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
