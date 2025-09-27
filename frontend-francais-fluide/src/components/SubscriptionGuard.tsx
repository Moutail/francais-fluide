'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Lock } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'demo' | 'etudiant' | 'premium' | 'etablissement';
  fallback?: React.ReactNode;
}

const planHierarchy = {
  demo: 0,
  etudiant: 1,
  premium: 2,
  etablissement: 3
};

export default function SubscriptionGuard({ 
  children, 
  requiredPlan, 
  fallback 
}: SubscriptionGuardProps) {
  const { user } = useAuth();

  const userPlan = user?.subscription?.plan || 'demo';
  const userPlanLevel = planHierarchy[userPlan as keyof typeof planHierarchy];
  const requiredPlanLevel = planHierarchy[requiredPlan];

  const hasAccess = userPlanLevel >= requiredPlanLevel;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-yellow-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Fonctionnalité Premium
        </h3>
        <p className="text-gray-600 mb-4">
          Cette fonctionnalité nécessite un abonnement {requiredPlan}.
          Votre plan actuel : {userPlan}
        </p>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Crown className="w-4 h-4" />
          Voir les plans
        </button>
      </div>
    </div>
  );
}
