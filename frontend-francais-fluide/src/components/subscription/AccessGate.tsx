'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Star, GraduationCap, Building, ArrowRight } from 'lucide-react';
import { hasAccess, getUpgradeMessage, SUBSCRIPTION_PLANS } from '@/lib/subscription/accessControl';
import { cn } from '@/lib/utils/cn';

interface AccessGateProps {
  userPlan: string;
  requiredFeature: keyof import('@/lib/subscription/accessControl').AccessLimits;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

const PLAN_ICONS = {
  demo: Lock,
  etudiant: GraduationCap,
  premium: Star,
  etablissement: Building,
};

const PLAN_COLORS = {
  demo: 'text-gray-600',
  etudiant: 'text-blue-600',
  premium: 'text-purple-600',
  etablissement: 'text-orange-600',
};

export default function AccessGate({
  userPlan,
  requiredFeature,
  children,
  fallback,
  showUpgrade = true,
}: AccessGateProps) {
  const hasAccessToFeature = hasAccess(userPlan, requiredFeature);

  if (hasAccessToFeature) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
  const nextPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'etudiant'); // Plan suivant par défaut

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center"
    >
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-gray-200">
            <Lock className="size-8 text-gray-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Fonctionnalité Premium</h3>
          <p className="text-gray-600">
            Cette fonctionnalité nécessite un abonnement supérieur à votre plan actuel.
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {React.createElement(PLAN_ICONS[userPlan as keyof typeof PLAN_ICONS], {
                className: cn('size-6', PLAN_COLORS[userPlan as keyof typeof PLAN_COLORS]),
              })}
              <div className="text-left">
                <p className="font-semibold text-gray-900">{currentPlan?.name}</p>
                <p className="text-sm text-gray-500">Plan actuel</p>
              </div>
            </div>
            <ArrowRight className="size-5 text-gray-400" />
            <div className="flex items-center gap-3">
              {React.createElement(PLAN_ICONS[nextPlan?.id as keyof typeof PLAN_ICONS] || Crown, {
                className: cn(
                  'size-6',
                  PLAN_COLORS[nextPlan?.id as keyof typeof PLAN_COLORS] || 'text-purple-600'
                ),
              })}
              <div className="text-left">
                <p className="font-semibold text-gray-900">{nextPlan?.name}</p>
                <p className="text-sm text-gray-500">Recommandé</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="mb-1 text-2xl font-bold text-gray-900">
              {nextPlan?.price} {nextPlan?.currency}
            </p>
            <p className="text-sm text-gray-500">par mois</p>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700">
            Mettre à niveau maintenant
          </button>
          <button className="w-full rounded-xl px-6 py-2 font-medium text-gray-600 transition-colors hover:text-gray-800">
            Voir tous les plans
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Débloquez toutes les fonctionnalités avancées</p>
          <p>Support prioritaire inclus</p>
        </div>
      </div>
    </motion.div>
  );
}
