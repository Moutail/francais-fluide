// src/lib/subscription/subscriptionService.ts
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from './plans';
import { SubscriptionExpirationManager } from './expiration-manager';

// Mapping entre les IDs de la base de données et les plans frontend
const PLAN_MAPPING: Record<string, string> = {
  demo: 'free',
  etudiant: 'student',
  premium: 'premium',
  etablissement: 'enterprise',
};

export interface UserSubscription {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
}

export class SubscriptionService {
  static getPlanFromDb(planId: string): SubscriptionPlan | null {
    const frontendPlanId = PLAN_MAPPING[planId];
    if (!frontendPlanId) return null;

    return SUBSCRIPTION_PLANS.find(plan => plan.id === frontendPlanId) || null;
  }

  static getUserLimits(subscription: UserSubscription | null): SubscriptionPlan['limits'] {
    if (!subscription || subscription.status !== 'active') {
      // Plan gratuit par défaut
      return SUBSCRIPTION_PLANS[0].limits;
    }

    const plan = this.getPlanFromDb(subscription.plan);
    return plan?.limits || SUBSCRIPTION_PLANS[0].limits;
  }

  static canUseFeature(
    subscription: UserSubscription | null,
    feature: keyof SubscriptionPlan['limits']
  ): boolean {
    const limits = this.getUserLimits(subscription);
    return limits[feature] === true || limits[feature] === -1;
  }

  static getRemainingUsage(
    subscription: UserSubscription | null,
    feature: 'aiCorrections' | 'exercisesPerDay'
  ): number {
    const limits = this.getUserLimits(subscription);
    const limit = limits[feature];

    if (limit === -1) return Infinity; // Illimité

    // TODO: Implémenter le comptage de l'usage réel
    // Pour l'instant, on retourne la limite
    return limit;
  }

  static getPlanFeatures(subscription: UserSubscription | null): string[] {
    if (!subscription || subscription.status !== 'active') {
      return SUBSCRIPTION_PLANS[0].features;
    }

    const plan = this.getPlanFromDb(subscription.plan);
    return plan?.features || SUBSCRIPTION_PLANS[0].features;
  }

  static isSubscriptionActive(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;

    if (subscription.status !== 'active') return false;

    // Utiliser le gestionnaire d'expiration pour vérifier
    const expirationStatus = SubscriptionExpirationManager.checkExpiration(subscription);
    
    // Permettre l'accès pendant la période de grâce
    if (expirationStatus.isExpired) {
      return SubscriptionExpirationManager.isInGracePeriod(subscription);
    }

    return !expirationStatus.isExpired;
  }

  static getSubscriptionStatus(subscription: UserSubscription | null): {
    isActive: boolean;
    planName: string;
    features: string[];
    limits: SubscriptionPlan['limits'];
  } {
    const isActive = this.isSubscriptionActive(subscription);
    const plan = subscription ? this.getPlanFromDb(subscription.plan) : SUBSCRIPTION_PLANS[0];

    return {
      isActive,
      planName: plan?.name || 'Démo Gratuite',
      features: this.getPlanFeatures(subscription),
      limits: this.getUserLimits(subscription),
    };
  }
}

// Fonctions utilitaires exportées pour compatibilité
export const getFrontendPlanById = (backendPlanId: string): SubscriptionPlan | undefined => {
  const frontendPlanId = PLAN_MAPPING[backendPlanId];
  if (!frontendPlanId) return undefined;

  return SUBSCRIPTION_PLANS.find(plan => plan.id === frontendPlanId);
};

export const getPlanFeatures = (backendPlanId: string): string[] => {
  const plan = getFrontendPlanById(backendPlanId);
  return plan ? plan.features : SUBSCRIPTION_PLANS[0].features;
};

export const getPlanLimits = (backendPlanId: string): SubscriptionPlan['limits'] | undefined => {
  const plan = getFrontendPlanById(backendPlanId);
  return plan ? plan.limits : SUBSCRIPTION_PLANS[0].limits;
};
