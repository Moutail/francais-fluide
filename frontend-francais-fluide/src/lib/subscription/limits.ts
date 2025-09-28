// src/lib/subscription/limits.ts
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from './plans';

export interface UsageStats {
  aiCorrections: number;
  exercisesCompleted: number;
  lastResetDate: string;
  planId: string;
}

export interface LimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate?: Date;
  message?: string;
}

export class SubscriptionLimiter {
  private usage: UsageStats;

  constructor(usage: UsageStats) {
    this.usage = usage;
  }

  checkAICorrections(): LimitCheck {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    if (!plan) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        message: 'Plan non trouvé'
      };
    }

    const limit = plan.limits.aiCorrections;
    const used = this.usage.aiCorrections;

    // Illimité
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1
      };
    }

    const remaining = Math.max(0, limit - used);
    const allowed = remaining > 0;

    return {
      allowed,
      remaining,
      limit,
      message: allowed 
        ? `${remaining} corrections restantes`
        : `Limite atteinte (${limit}/jour). Passez à un plan supérieur !`
    };
  }

  checkExercises(): LimitCheck {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    if (!plan) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        message: 'Plan non trouvé'
      };
    }

    const limit = plan.limits.exercisesPerDay;
    const used = this.usage.exercisesCompleted;

    // Illimité
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1
      };
    }

    const remaining = Math.max(0, limit - used);
    const allowed = remaining > 0;

    return {
      allowed,
      remaining,
      limit,
      message: allowed 
        ? `${remaining} exercices restants`
        : `Limite atteinte (${limit}/jour). Passez à un plan supérieur !`
    };
  }

  checkFeature(feature: keyof SubscriptionPlan['limits']): boolean {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    return plan?.limits[feature] === true;
  }

  getUpgradePrompt(feature: string): string {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    const nextPlan = SUBSCRIPTION_PLANS.find(p => 
      p.price > (plan?.price || 0) && p.price > 0
    );

    if (!nextPlan) {
      return 'Fonctionnalité non disponible dans votre plan actuel.';
    }

    return `Cette fonctionnalité est disponible avec le plan ${nextPlan.name} (${nextPlan.price}€/mois).`;
  }

  // Simulation d'utilisation (en réalité, ceci serait géré par le backend)
  useAICorrection(): boolean {
    const check = this.checkAICorrections();
    if (check.allowed) {
      this.usage.aiCorrections++;
      return true;
    }
    return false;
  }

  useExercise(): boolean {
    const check = this.checkExercises();
    if (check.allowed) {
      this.usage.exercisesCompleted++;
      return true;
    }
    return false;
  }
}

// Hook React pour utiliser les limites
export function useSubscriptionLimits(userPlan: string = 'free') {
  const usage: UsageStats = {
    aiCorrections: 2, // Simulé
    exercisesCompleted: 1, // Simulé
    lastResetDate: new Date().toISOString(),
    planId: userPlan
  };

  const limiter = new SubscriptionLimiter(usage);

  return {
    limiter,
    usage,
    canUseAI: limiter.checkAICorrections().allowed,
    canUseExercises: limiter.checkExercises().allowed,
    hasAdvancedAnalytics: limiter.checkFeature('advancedAnalytics'),
    hasVoiceAssistant: limiter.checkFeature('voiceAssistant'),
    hasOfflineMode: limiter.checkFeature('offlineMode'),
    hasCustomExercises: limiter.checkFeature('customExercises'),
    getUpgradePrompt: (feature: string) => limiter.getUpgradePrompt(feature)
  };
}

// Utilitaire non-hook pour les contextes non-React (classes, libs)
export function getSubscriptionLimits(userPlan: string = 'free') {
  const usage: UsageStats = {
    aiCorrections: 2,
    exercisesCompleted: 1,
    lastResetDate: new Date().toISOString(),
    planId: userPlan,
  };

  const limiter = new SubscriptionLimiter(usage);
  return {
    limiter,
    usage,
    canUseAI: limiter.checkAICorrections().allowed,
    canUseExercises: limiter.checkExercises().allowed,
    hasAdvancedAnalytics: limiter.checkFeature('advancedAnalytics'),
    hasVoiceAssistant: limiter.checkFeature('voiceAssistant'),
    hasOfflineMode: limiter.checkFeature('offlineMode'),
    hasCustomExercises: limiter.checkFeature('customExercises'),
    getUpgradePrompt: (feature: string) => limiter.getUpgradePrompt(feature),
  };
}
