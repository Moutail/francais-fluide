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
  etablissement: 3,
};

export default function SubscriptionGuard({
  children,
  requiredPlan,
  fallback,
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
    <div className="flex items-center justify-center rounded-lg border bg-gray-50 p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-yellow-100">
          <Lock className="size-8 text-yellow-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Fonctionnalité Premium</h3>
        <p className="mb-4 text-gray-600">
          Cette fonctionnalité nécessite un abonnement {requiredPlan}. Votre plan actuel :{' '}
          {userPlan}
        </p>
        <button
          onClick={() => (window.location.href = '/pricing')}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <Crown className="size-4" />
          Voir les plans
        </button>
      </div>
    </div>
  );
}
