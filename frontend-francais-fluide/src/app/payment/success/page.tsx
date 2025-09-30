// src/app/payment/success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Crown, ArrowRight, Sparkles, Mail, Calendar, Shield } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription/plans';
import { formatPrice } from '@/lib/config/pricing';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan') || 'premium';
  const amount = searchParams.get('amount') || '0';

  const [countdown, setCountdown] = useState(5);
  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          window.location.href = '/progression';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Icône de succès */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Titre principal */}
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Paiement réussi ! 🎉</h1>

          <p className="mb-8 text-xl text-gray-600">
            Bienvenue dans la famille FrançaisFluide Premium !
          </p>

          {/* Détails du plan */}
          {selectedPlan && (
            <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h2>
                  <p className="text-gray-600">{selectedPlan.description}</p>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-gray-900">
                  {formatPrice(parseFloat(amount))} CAD
                </div>
                <p className="text-gray-600">Facturé avec succès</p>
              </div>
            </div>
          )}

          {/* Fonctionnalités débloquées */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-gray-900">🚀 Fonctionnalités débloquées</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {selectedPlan?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="mb-8 rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Prochaines étapes</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email de confirmation</h4>
                  <p className="text-sm text-gray-600">
                    Un email de confirmation a été envoyé à votre adresse email avec tous les
                    détails de votre abonnement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Accès immédiat</h4>
                  <p className="text-sm text-gray-600">
                    Vous pouvez maintenant accéder à toutes les fonctionnalités premium de
                    FrançaisFluide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Prochaine facturation</h4>
                  <p className="text-sm text-gray-600">
                    Votre prochaine facturation aura lieu dans 30 jours. Vous pouvez gérer votre
                    abonnement à tout moment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              onClick={() => (window.location.href = '/progression')}
              className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
            >
              Commencer maintenant
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => (window.location.href = '/subscription')}
              className="rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-lg font-semibold text-gray-900 transition-all hover:border-gray-300"
            >
              Gérer mon abonnement
            </button>
          </div>

          {/* Redirection automatique */}
          <div className="mt-8 rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              Redirection automatique vers votre tableau de bord dans {countdown} seconde
              {countdown > 1 ? 's' : ''}...
            </p>
          </div>

          {/* Sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>Paiement sécurisé et chiffré</span>
          </div>
        </div>
      </div>
    </div>
  );
}
