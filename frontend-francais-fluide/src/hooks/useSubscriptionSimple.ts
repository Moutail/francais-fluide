// src/hooks/useSubscriptionSimple.ts
import { useAuth } from './useApi';
import { getFrontendPlanById, getPlanFeatures, getPlanLimits } from '@/lib/subscription/subscriptionService';
import { SubscriptionPlan } from '@/lib/subscription/plans';

export function useSubscriptionSimple() {
  const { user } = useAuth();

  const getStatus = () => {
    const defaultPlan: SubscriptionPlan = {
      id: 'free',
      name: 'Démo Gratuite',
      price: 0,
      currency: 'CAD',
      interval: 'month',
      description: 'Parfait pour découvrir FrançaisFluide',
      color: 'from-gray-500 to-gray-600',
      features: [
        'Correction de base (5 par jour)',
        'Exercices simples (3 par jour)',
        'Statistiques de base',
        'Support communautaire'
      ],
      limits: {
        aiCorrections: 5,
        exercisesPerDay: 3,
        dictationsPerDay: 0,
        advancedAnalytics: false,
        prioritySupport: false,
        exportData: false,
        customExercises: false,
        voiceAssistant: false,
        offlineMode: false,
        intelligentTutor: false,
        personalizedLearning: false
      }
    };

    if (!user || !user.subscription) {
      return {
        planId: defaultPlan.id,
        planName: defaultPlan.name,
        status: 'inactive',
        features: defaultPlan.features,
        limits: defaultPlan.limits,
        isActive: false,
      };
    }

    // Vérifier si l'abonnement a expiré
    const now = new Date();
    const endDate = new Date(user.subscription.endDate);
    const isExpired = endDate < now;

    const backendPlanId = user.subscription.plan;
    const frontendPlan = getFrontendPlanById(backendPlanId);

    if (!frontendPlan) {
      console.warn(`Plan ID '${backendPlanId}' not found in frontend plans. Using default.`);
      return {
        planId: defaultPlan.id,
        planName: defaultPlan.name,
        status: isExpired ? 'expired' : user.subscription.status,
        features: defaultPlan.features,
        limits: defaultPlan.limits,
        isActive: !isExpired && user.subscription.status === 'active',
      };
    }

    return {
      planId: frontendPlan.id,
      planName: frontendPlan.name,
      status: isExpired ? 'expired' : user.subscription.status,
      features: frontendPlan.features,
      limits: frontendPlan.limits,
      isActive: !isExpired && user.subscription.status === 'active',
    };
  };

  const canUseFeature = (featureKey: keyof SubscriptionPlan['limits']): boolean => {
    const { limits, isActive } = getStatus();
    if (!isActive) return false;

    const limit = limits[featureKey];
    // Boolean limits represent enable/disable directly
    if (typeof limit === 'boolean') return limit;
    // Numeric limits: -1 means unlimited, > 0 means available
    return limit === -1 || limit > 0;
  };

  const isActive = (): boolean => {
    return getStatus().isActive;
  };

  return {
    getStatus,
    canUseFeature,
    isActive,
  };
}
