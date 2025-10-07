// src/hooks/useSubscriptionExpiration.ts
import { useEffect, useState } from 'react';
import { SubscriptionExpirationManager, ExpirationStatus } from '@/lib/subscription/expiration-manager';
import { UserSubscription } from '@/lib/subscription/subscriptionService';

export function useSubscriptionExpiration(subscription: UserSubscription | null) {
  const [expirationStatus, setExpirationStatus] = useState<ExpirationStatus | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (subscription) {
      const status = SubscriptionExpirationManager.checkExpiration(subscription);
      setExpirationStatus(status);
      setShowAlert(status.shouldNotify || status.isExpired);

      // Gérer l'expiration automatiquement
      if (status.isExpired && !SubscriptionExpirationManager.isInGracePeriod(subscription)) {
        handleExpiration(subscription.userId);
      }
    }
  }, [subscription]);

  const handleExpiration = async (userId: string) => {
    try {
      await SubscriptionExpirationManager.handleExpiredSubscription(userId);
    } catch (error) {
      console.error('Erreur gestion expiration:', error);
    }
  };

  const dismissAlert = () => {
    setShowAlert(false);
  };

  const getAlertProps = () => {
    if (!expirationStatus) return null;
    return SubscriptionExpirationManager.getAlertMessage(expirationStatus);
  };

  return {
    expirationStatus,
    showAlert,
    dismissAlert,
    getAlertProps,
    isExpired: expirationStatus?.isExpired || false,
    isInGracePeriod: subscription ? SubscriptionExpirationManager.isInGracePeriod(subscription) : false,
    daysRemaining: expirationStatus?.daysRemaining || 0,
  };
}
