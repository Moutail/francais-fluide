// src/lib/subscription/limits.ts
import React from 'react';
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
        message: 'Plan non trouvé',
      };
    }

    const limit = plan.limits.aiCorrections;
    const used = this.usage.aiCorrections;

    // Illimité
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
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
        : `Limite atteinte (${limit}/jour). Passez à un plan supérieur !`,
    };
  }

  checkExercises(): LimitCheck {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    if (!plan) {
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        message: 'Plan non trouvé',
      };
    }

    const limit = plan.limits.exercisesPerDay;
    const used = this.usage.exercisesCompleted;

    // Illimité
    if (limit === -1) {
      return {
        allowed: true,
        remaining: -1,
        limit: -1,
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
        : `Limite atteinte (${limit}/jour). Passez à un plan supérieur !`,
    };
  }

  checkFeature(feature: keyof SubscriptionPlan['limits']): boolean {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    return plan?.limits[feature] === true;
  }

  getUpgradePrompt(feature: string): string {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === this.usage.planId);
    const nextPlan = SUBSCRIPTION_PLANS.find(p => p.price > (plan?.price || 0) && p.price > 0);

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

/**
 * Récupère l'usage réel depuis le backend
 */
export async function getRealUsage(userId: string): Promise<UsageStats> {
  try {
    const response = await fetch(`/api/usage/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur récupération usage');
    }

    const data = await response.json();
    return data.usage;
  } catch (error) {
    console.error('Erreur getRealUsage:', error);
    // Fallback sur valeurs par défaut
    return {
      aiCorrections: 0,
      exercisesCompleted: 0,
      lastResetDate: new Date().toISOString(),
      planId: 'demo',
    };
  }
}

/**
 * Incrémente l'usage côté backend
 */
export async function incrementUsage(
  userId: string,
  feature: 'aiCorrections' | 'exercisesCompleted'
): Promise<boolean> {
  try {
    const response = await fetch('/api/usage/increment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, feature }),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur incrementUsage:', error);
    return false;
  }
}

// Hook React pour utiliser les limites avec données réelles
export function useSubscriptionLimits(userPlan: string = 'free', userId?: string) {
  const [usage, setUsage] = React.useState<UsageStats>({
    aiCorrections: 0,
    exercisesCompleted: 0,
    lastResetDate: new Date().toISOString(),
    planId: userPlan,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      getRealUsage(userId).then(realUsage => {
        setUsage(realUsage);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [userId]);

  const limiter = new SubscriptionLimiter(usage);

  const useFeature = async (feature: 'aiCorrections' | 'exercisesCompleted') => {
    if (userId) {
      const success = await incrementUsage(userId, feature);
      if (success) {
        // Rafraîchir l'usage
        const newUsage = await getRealUsage(userId);
        setUsage(newUsage);
      }
      return success;
    }
    return false;
  };

  return {
    limiter,
    usage,
    loading,
    canUseAI: limiter.checkAICorrections().allowed,
    canUseExercises: limiter.checkExercises().allowed,
    hasAdvancedAnalytics: limiter.checkFeature('advancedAnalytics'),
    hasVoiceAssistant: limiter.checkFeature('voiceAssistant'),
    hasOfflineMode: limiter.checkFeature('offlineMode'),
    hasCustomExercises: limiter.checkFeature('customExercises'),
    getUpgradePrompt: (feature: string) => limiter.getUpgradePrompt(feature),
    useFeature, // Nouvelle fonction pour incrémenter l'usage
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
