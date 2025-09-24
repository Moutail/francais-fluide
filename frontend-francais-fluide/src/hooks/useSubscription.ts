// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { SubscriptionService, UserSubscription } from '@/lib/subscription/subscriptionService';
import { apiClient } from '@/lib/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiClient.getCurrentSubscription();
        if (response.success && response.data) {
          setSubscription(response.data);
        } else {
          setSubscription(null);
        }
      } catch (err) {
        console.error('Erreur chargement abonnement:', err);
        setError('Erreur de chargement de l\'abonnement');
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, []);

  const canUseFeature = (feature: keyof ReturnType<typeof SubscriptionService.getUserLimits>) => {
    return SubscriptionService.canUseFeature(subscription, feature);
  };

  const getRemainingUsage = (feature: 'aiCorrections' | 'exercisesPerDay') => {
    return SubscriptionService.getRemainingUsage(subscription, feature);
  };

  const getStatus = () => {
    return SubscriptionService.getSubscriptionStatus(subscription);
  };

  const isActive = () => {
    return SubscriptionService.isSubscriptionActive(subscription);
  };

  return {
    subscription,
    loading,
    error,
    canUseFeature,
    getRemainingUsage,
    getStatus,
    isActive,
    refetch: () => {
      setLoading(true);
      // Recharger l'abonnement
      const loadSubscription = async () => {
        try {
          const response = await apiClient.getCurrentSubscription();
          if (response.success && response.data) {
            setSubscription(response.data);
          } else {
            setSubscription(null);
          }
        } catch (err) {
          setError('Erreur de chargement de l\'abonnement');
          setSubscription(null);
        } finally {
          setLoading(false);
        }
      };
      loadSubscription();
    }
  };
}
