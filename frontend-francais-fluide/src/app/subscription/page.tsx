// src/app/subscription/page.tsx
'use client';

import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Crown, 
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Target,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/subscription/plans';
import { formatPrice, calculateAnnualPrice } from '@/lib/config/pricing';
import Navigation from '@/components/layout/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils/cn';

export default function SubscriptionPage() {
  const { isAuthenticated, loading } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('illimité') || feature.includes('Tout')) return Zap;
    if (feature.includes('Support') || feature.includes('prioritaire')) return Shield;
    if (feature.includes('Analytics') || feature.includes('rapports')) return TrendingUp;
    if (feature.includes('Export') || feature.includes('données')) return Users;
    return Check;
  };

  const getFeatureColor = (feature: string) => {
    if (feature.includes('illimité') || feature.includes('Tout')) return 'text-purple-600';
    if (feature.includes('Support') || feature.includes('prioritaire')) return 'text-blue-600';
    if (feature.includes('Analytics') || feature.includes('rapports')) return 'text-green-600';
    if (feature.includes('Export') || feature.includes('données')) return 'text-orange-600';
    return 'text-gray-600';
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = (planId: string) => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
      return;
    }

    if (planId === 'free') {
      // Redirection vers la page d'accueil pour le plan gratuit
      window.location.href = '/';
      return;
    }

    // Redirection vers la page de paiement
    const url = `/payment?plan=${planId}&interval=${billingInterval}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4 sm:mb-6">
            <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <span className="text-xs sm:text-sm font-medium text-purple-900">
              Choisissez votre plan d'apprentissage
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Maîtrisez le français avec l'IA
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8">
            Accédez aux dictées audio interactives, aux corrections IA avancées et à un tuteur personnel. 
            Transformez votre apprentissage du français avec des outils d'IA de nouvelle génération.
          </p>

          {/* Toggle de facturation */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === 'month' ? "text-gray-900" : "text-gray-500"
            )}>
              Mensuel
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  billingInterval === 'year' ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium transition-colors",
              billingInterval === 'year' ? "text-gray-900" : "text-gray-500"
            )}>
              Annuel
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300",
                plan.popular 
                  ? "bg-white border-2 border-purple-500" 
                  : "bg-white border-2 border-gray-200 hover:border-gray-300",
                selectedPlan === plan.id && "ring-2 ring-purple-500 ring-offset-2"
              )}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Populaire
                  </div>
                </div>
              )}

              {/* Header du plan */}
              <div className="text-center mb-4 sm:mb-6">
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r mx-auto mb-3 sm:mb-4 flex items-center justify-center",
                  plan.color
                )}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  {plan.description}
                </p>
                <div className="mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {plan.price === 0 
                      ? 'Gratuit' 
                      : billingInterval === 'year' 
                        ? formatPrice(calculateAnnualPrice(plan.price) / 12)
                        : formatPrice(plan.price)
                    }
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 text-xs sm:text-sm">
                      /{billingInterval === 'month' ? 'mois' : 'an'}
                    </span>
                  )}
                  {billingInterval === 'year' && plan.price > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Économisez 20% avec l'abonnement annuel !
                    </div>
                  )}
                </div>
              </div>

              {/* Fonctionnalités */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bouton d'action */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={cn(
                  "w-full py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base",
                  plan.id === 'free'
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"
                )}
              >
                {plan.id === 'free' ? (
                  'Commencer gratuitement'
                ) : (
                  <>
                    S'abonner
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Section spéciale pour les dictées audio */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Fonctionnalité vedette
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Dictées Audio Interactives
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Améliorez votre compréhension orale et votre orthographe avec nos dictées audio 
              alimentées par l'IA. Disponibles uniquement avec les plans payants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Gratuit</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Dictées audio non disponibles
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Étudiant</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                10 dictées audio par jour
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  10/jour
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Premium+</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Dictées audio illimitées
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  Illimité
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section spéciale pour l'assistant de dissertation */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Fonctionnalité Premium Exclusive
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Assistant de Dissertation IA
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Maîtrisez l'art de la dissertation française avec un assistant IA intelligent. 
              Génération de plans, analyse complète et feedback personnalisé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Gratuit</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Assistant de dissertation non disponible
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Étudiant</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Assistant de dissertation non disponible
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-center">Plan Premium+</h3>
              <p className="text-gray-600 text-sm text-center mb-4">
                Assistant de dissertation IA complet
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  ✅ Disponible
                </span>
              </div>
            </div>
          </div>

          {/* Fonctionnalités de l'assistant */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Plans Intelligents</h4>
              <p className="text-xs text-gray-600">Génération automatique de plans détaillés</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Correction Avancée</h4>
              <p className="text-xs text-gray-600">Analyse de structure et argumentation</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Types Variés</h4>
              <p className="text-xs text-gray-600">Argumentative, comparative, poétique</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">IA Avancée</h4>
              <p className="text-xs text-gray-600">Powered by GPT-4 et Claude</p>
            </div>
          </div>
        </div>

        {/* Section de comparaison détaillée */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Comparaison détaillée des fonctionnalités
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">
                    Fonctionnalités
                  </th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="text-center py-4 px-6 font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  { feature: 'Corrections IA par jour', free: '5', student: 'Illimité', premium: 'Illimité', enterprise: 'Illimité' },
                  { feature: 'Exercices quotidiens', free: '3', student: '20/jour', premium: 'Illimité', enterprise: 'Illimité' },
                  { feature: 'Dictées audio', free: '❌ Non disponible', student: '10/jour', premium: 'Illimité', enterprise: 'Illimité' },
                  { feature: 'Assistant de dissertation IA', free: '❌ Non disponible', student: '❌ Non disponible', premium: '✅ Disponible', enterprise: '✅ Disponible' },
                  { feature: 'Tuteur IA', free: false, student: 'Basique', premium: 'Premium', enterprise: 'Premium' },
                  { feature: 'Assistant IA', free: false, student: 'Basique', premium: 'Avancé', enterprise: 'Avancé' },
                  { feature: 'Analytics détaillées', free: false, student: true, premium: 'Premium', enterprise: 'Premium' },
                  { feature: 'Exercices personnalisés', free: false, student: '20/jour', premium: 'Illimité', enterprise: 'Illimité' },
                  { feature: 'Export des données', free: false, student: true, premium: true, enterprise: 'Avancé' },
                  { feature: 'Gestion multi-utilisateurs', free: false, student: false, premium: false, enterprise: true },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.free === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.free === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : row.free.includes('❌') ? (
                        <span className="text-red-600 font-medium">{row.free}</span>
                      ) : (
                        <span className="text-gray-900">{row.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.student === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.student === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-900 font-medium">{row.student}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.premium === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.premium === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-900 font-medium">{row.premium}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {row.enterprise === false ? (
                        <X className="w-5 h-5 text-red-500 mx-auto" />
                      ) : row.enterprise === true ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-gray-900 font-medium">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Questions fréquentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                question: 'Pourquoi les dictées audio ne sont-elles pas disponibles avec le plan gratuit ?',
                answer: 'Les dictées audio sont notre fonctionnalité premium qui nécessite des ressources IA avancées. Elles sont disponibles à partir du plan Étudiant (14.99 CAD/mois) avec 10 dictées par jour.'
              },
              {
                question: 'L\'assistant de dissertation est-il disponible avec tous les plans ?',
                answer: 'L\'assistant de dissertation IA est exclusivement réservé aux plans Premium et Établissement. Cette fonctionnalité avancée nécessite des modèles IA sophistiqués pour générer des plans détaillés et analyser vos dissertations.'
              },
              {
                question: 'Puis-je changer de plan à tout moment ?',
                answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.'
              },
              {
                question: 'Comment fonctionnent les quotas de dictées ?',
                answer: 'Les quotas se réinitialisent chaque jour à minuit. Le plan Étudiant inclut 10 dictées par jour, tandis que les plans Premium et Établissement offrent un accès illimité.'
              },
              {
                question: 'Les données sont-elles sécurisées ?',
                answer: 'Absolument. Nous utilisons un chiffrement de niveau bancaire et respectons le RGPD pour protéger vos données personnelles et vos progrès d\'apprentissage.'
              },
              {
                question: 'Puis-je annuler à tout moment ?',
                answer: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais d\'annulation.'
              },
              {
                question: 'Y a-t-il un essai gratuit ?',
                answer: 'Le plan gratuit vous permet de découvrir les corrections IA de base (5/jour) et les exercices simples (3/jour). Pour les dictées audio et l\'IA avancée, un abonnement est requis.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
