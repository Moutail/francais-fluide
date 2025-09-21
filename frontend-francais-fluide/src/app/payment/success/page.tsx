// src/app/payment/success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  Crown, 
  ArrowRight, 
  Sparkles,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Icône de succès */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Paiement réussi ! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Bienvenue dans la famille FrançaisFluide Premium !
          </p>

          {/* Détails du plan */}
          {selectedPlan && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedPlan.name}
                  </h2>
                  <p className="text-gray-600">
                    {selectedPlan.description}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {formatPrice(parseFloat(amount))} CAD
                </div>
                <p className="text-gray-600">
                  Facturé avec succès
                </p>
              </div>
            </div>
          )}

          {/* Fonctionnalités débloquées */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              🚀 Fonctionnalités débloquées
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedPlan?.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prochaines étapes */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Prochaines étapes
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email de confirmation</h4>
                  <p className="text-sm text-gray-600">
                    Un email de confirmation a été envoyé à votre adresse email avec tous les détails de votre abonnement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Accès immédiat</h4>
                  <p className="text-sm text-gray-600">
                    Vous pouvez maintenant accéder à toutes les fonctionnalités premium de FrançaisFluide.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Prochaine facturation</h4>
                  <p className="text-sm text-gray-600">
                    Votre prochaine facturation aura lieu dans 30 jours. Vous pouvez gérer votre abonnement à tout moment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/progression'}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-3"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => window.location.href = '/subscription'}
              className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
            >
              Gérer mon abonnement
            </button>
          </div>

          {/* Redirection automatique */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Redirection automatique vers votre tableau de bord dans {countdown} seconde{countdown > 1 ? 's' : ''}...
            </p>
          </div>

          {/* Sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Paiement sécurisé et chiffré</span>
          </div>
        </div>
      </div>
    </div>
  );
}
