// src/components/subscription/ExpirationAlert.tsx
'use client';

import React from 'react';
import { AlertCircle, X, Crown } from 'lucide-react';
import { useSubscriptionExpiration } from '@/hooks/useSubscriptionExpiration';
import { UserSubscription } from '@/lib/subscription/subscriptionService';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpirationAlertProps {
  subscription: UserSubscription | null;
}

export default function ExpirationAlert({ subscription }: ExpirationAlertProps) {
  const { showAlert, dismissAlert, getAlertProps, daysRemaining, isInGracePeriod } =
    useSubscriptionExpiration(subscription);

  if (!showAlert) return null;

  const alertProps = getAlertProps();
  if (!alertProps || !alertProps.show) return null;

  const bgColor = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  }[alertProps.type];

  const textColor = {
    info: 'text-blue-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
  }[alertProps.type];

  const iconColor = {
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  }[alertProps.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-20 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 transform px-4`}
      >
        <div className={`rounded-lg border-2 ${bgColor} p-4 shadow-lg`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className={`mt-0.5 h-5 w-5 flex-shrink-0 ${iconColor}`} />
              <div className="flex-1">
                <h3 className={`mb-1 font-semibold ${textColor}`}>
                  {isInGracePeriod
                    ? 'Période de grâce active'
                    : daysRemaining <= 1
                      ? 'Abonnement expire bientôt !'
                      : 'Rappel d\'expiration'}
                </h3>
                <p className={`text-sm ${textColor}`}>{alertProps.message}</p>

                {isInGracePeriod && (
                  <p className={`mt-2 text-xs ${textColor}`}>
                    Vous avez encore accès aux fonctionnalités premium pendant 3 jours.
                    Renouvelez maintenant pour éviter toute interruption.
                  </p>
                )}

                <div className="mt-3 flex gap-2">
                  <a
                    href="/subscription/renew"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                  >
                    <Crown className="h-4 w-4" />
                    Renouveler maintenant
                  </a>
                  <a
                    href="/subscription"
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Voir les plans
                  </a>
                </div>
              </div>
            </div>

            <button
              onClick={dismissAlert}
              className={`ml-2 flex-shrink-0 rounded-lg p-1 transition-colors hover:bg-white/50 ${textColor}`}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
