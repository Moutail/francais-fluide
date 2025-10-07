// src/lib/subscription/expiration-manager.ts
import { UserSubscription } from './subscriptionService';

export interface ExpirationStatus {
  isExpired: boolean;
  daysRemaining: number;
  shouldNotify: boolean;
  notificationLevel: 'none' | 'info' | 'warning' | 'critical';
  message: string;
}

export class SubscriptionExpirationManager {
  /**
   * Vérifie le statut d'expiration d'un abonnement
   */
  static checkExpiration(subscription: UserSubscription | null): ExpirationStatus {
    if (!subscription) {
      return {
        isExpired: true,
        daysRemaining: 0,
        shouldNotify: false,
        notificationLevel: 'none',
        message: 'Aucun abonnement actif',
      };
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const msRemaining = endDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    let notificationLevel: ExpirationStatus['notificationLevel'] = 'none';
    let message = '';

    if (daysRemaining <= 0) {
      notificationLevel = 'critical';
      message = 'Votre abonnement a expiré. Renouvelez maintenant pour continuer.';
    } else if (daysRemaining <= 1) {
      notificationLevel = 'critical';
      message = `Votre abonnement expire dans ${daysRemaining} jour !`;
    } else if (daysRemaining <= 3) {
      notificationLevel = 'warning';
      message = `Votre abonnement expire dans ${daysRemaining} jours.`;
    } else if (daysRemaining <= 7) {
      notificationLevel = 'info';
      message = `Votre abonnement expire dans ${daysRemaining} jours.`;
    }

    return {
      isExpired: daysRemaining <= 0,
      daysRemaining: Math.max(0, daysRemaining),
      shouldNotify: daysRemaining <= 7 && daysRemaining > 0,
      notificationLevel,
      message,
    };
  }

  /**
   * Désactive automatiquement un abonnement expiré
   */
  static async handleExpiredSubscription(userId: string): Promise<void> {
    try {
      console.log(`🔴 Traitement expiration pour utilisateur: ${userId}`);

      // 1. Mettre à jour le statut à 'expired'
      await fetch('/api/subscription/expire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId }),
      });

      // 2. Révoquer l'accès aux fonctionnalités premium
      await this.revokePremiumAccess(userId);

      // 3. Envoyer une notification
      await this.sendExpirationNotification(userId);

      // 4. Proposer le renouvellement
      await this.offerRenewal(userId);

      console.log(`✅ Expiration traitée pour utilisateur: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur gestion expiration:', error);
      throw error;
    }
  }

  /**
   * Envoie des rappels avant expiration
   */
  static async sendExpirationReminders(): Promise<void> {
    try {
      const response = await fetch('/api/subscription/check-expirations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur récupération abonnements expirants');
      }

      const { expiringSoon } = await response.json();

      for (const sub of expiringSoon) {
        const status = this.checkExpiration(sub);

        if (status.shouldNotify) {
          await this.sendReminderEmail(sub.userId, status.daysRemaining);
        }
      }

      console.log(`✅ ${expiringSoon.length} rappels d'expiration envoyés`);
    } catch (error) {
      console.error('❌ Erreur envoi rappels:', error);
    }
  }

  /**
   * Vérifie si l'abonnement est dans la période de grâce
   */
  static isInGracePeriod(subscription: UserSubscription | null): boolean {
    if (!subscription) return false;

    const status = this.checkExpiration(subscription);
    const daysExpired = Math.abs(status.daysRemaining);

    // 3 jours de grâce après expiration
    return status.isExpired && daysExpired <= 3;
  }

  /**
   * Calcule la date de fin de période de grâce
   */
  static getGracePeriodEndDate(subscription: UserSubscription): Date {
    const endDate = new Date(subscription.endDate);
    endDate.setDate(endDate.getDate() + 3); // 3 jours de grâce
    return endDate;
  }

  /**
   * Révoquer l'accès aux fonctionnalités premium
   */
  private static async revokePremiumAccess(userId: string): Promise<void> {
    try {
      await fetch(`/api/users/${userId}/revoke-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log(`✅ Accès premium révoqué pour: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur révocation accès:', error);
    }
  }

  /**
   * Envoyer une notification d'expiration
   */
  private static async sendExpirationNotification(userId: string): Promise<void> {
    try {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId,
          type: 'subscription_expired',
          title: 'Abonnement expiré',
          message: 'Votre abonnement a expiré. Renouvelez maintenant pour continuer à profiter de toutes les fonctionnalités.',
          priority: 'high',
        }),
      });
      console.log(`✅ Notification expiration envoyée à: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
    }
  }

  /**
   * Proposer le renouvellement
   */
  private static async offerRenewal(userId: string): Promise<void> {
    try {
      await fetch('/api/subscription/renewal-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId }),
      });
      console.log(`✅ Offre de renouvellement envoyée à: ${userId}`);
    } catch (error) {
      console.error('❌ Erreur offre renouvellement:', error);
    }
  }

  /**
   * Envoyer un email de rappel
   */
  private static async sendReminderEmail(userId: string, daysRemaining: number): Promise<void> {
    try {
      await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          userId,
          template: 'expiration_reminder',
          data: {
            daysRemaining,
            renewalUrl: `${window.location.origin}/subscription/renew`,
          },
        }),
      });
      console.log(`✅ Email de rappel envoyé à: ${userId} (${daysRemaining} jours restants)`);
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
    }
  }

  /**
   * Obtenir un message d'alerte formaté
   */
  static getAlertMessage(status: ExpirationStatus): {
    show: boolean;
    type: 'info' | 'warning' | 'error';
    message: string;
  } {
    if (!status.shouldNotify && !status.isExpired) {
      return { show: false, type: 'info', message: '' };
    }

    let type: 'info' | 'warning' | 'error' = 'info';
    if (status.notificationLevel === 'critical') type = 'error';
    else if (status.notificationLevel === 'warning') type = 'warning';

    return {
      show: true,
      type,
      message: status.message,
    };
  }
}
