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
  BookOpen,
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

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 sm:mb-6">
            <Crown className="h-4 w-4 text-purple-600 sm:h-5 sm:w-5" />
            <span className="text-xs font-medium text-purple-900 sm:text-sm">
              Choisissez votre plan d'apprentissage
            </span>
          </div>

          <h1 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Maîtrisez le français avec l'IA
            </span>
          </h1>
          <p className="mx-auto mb-6 max-w-3xl text-lg text-gray-600 sm:mb-8 sm:text-xl">
            Accédez aux dictées audio interactives, aux corrections IA avancées et à un tuteur
            personnel. Transformez votre apprentissage du français avec des outils d'IA de nouvelle
            génération.
          </p>

          {/* Toggle de facturation */}
          <div className="mb-6 flex items-center justify-center gap-3 sm:mb-8 sm:gap-4">
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                billingInterval === 'month' ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              Mensuel
            </span>
            <button
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  billingInterval === 'year' ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                billingInterval === 'year' ? 'text-gray-900' : 'text-gray-500'
              )}
            >
              Annuel
              <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                -20%
              </span>
            </span>
          </div>
        </div>

        {/* Grille des plans */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl p-4 shadow-xl transition-all duration-300 sm:p-6',
                plan.popular
                  ? 'border-2 border-purple-500 bg-white'
                  : 'border-2 border-gray-200 bg-white hover:border-gray-300',
                selectedPlan === plan.id && 'ring-2 ring-purple-500 ring-offset-2'
              )}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-sm font-medium text-white">
                    <Star className="h-4 w-4" />
                    Populaire
                  </div>
                </div>
              )}

              {/* Header du plan */}
              <div className="mb-4 text-center sm:mb-6">
                <div
                  className={cn(
                    'mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r sm:mb-4 sm:h-12 sm:w-12',
                    plan.color
                  )}
                >
                  <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 sm:text-xl">{plan.name}</h3>
                <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">{plan.description}</p>
                <div className="mb-3 sm:mb-4">
                  <span className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {plan.price === 0
                      ? 'Gratuit'
                      : billingInterval === 'year'
                        ? formatPrice(calculateAnnualPrice(plan.price) / 12)
                        : formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-xs text-gray-600 sm:text-sm">
                      /{billingInterval === 'month' ? 'mois' : 'an'}
                    </span>
                  )}
                  {billingInterval === 'year' && plan.price > 0 && (
                    <div className="text-xs font-medium text-green-600">
                      Économisez 20% avec l'abonnement annuel !
                    </div>
                  )}
                </div>
              </div>

              {/* Fonctionnalités */}
              <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-2 sm:gap-3">
                    <div className="mt-0.5 flex-shrink-0">
                      <Check className="h-3 w-3 text-green-500 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-xs text-gray-700 sm:text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Bouton d'action */}
              <button
                onClick={() => handleSubscribe(plan.id)}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all sm:px-4 sm:py-3 sm:text-base',
                  plan.id === 'free'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700'
                      : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                )}
              >
                {plan.id === 'free' ? (
                  'Commencer gratuitement'
                ) : (
                  <>
                    S'abonner
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Section spéciale pour les dictées audio */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 sm:mb-12 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Fonctionnalité vedette</span>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Dictées Audio Interactives
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Améliorez votre compréhension orale et votre orthographe avec nos dictées audio
              alimentées par l'IA. Disponibles uniquement avec les plans payants.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Gratuit</h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Dictées audio non disponibles
              </p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-blue-200 bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Étudiant</h3>
              <p className="mb-4 text-center text-sm text-gray-600">10 dictées audio par jour</p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  10/jour
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Premium+</h3>
              <p className="mb-4 text-center text-sm text-gray-600">Dictées audio illimitées</p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                  Illimité
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section spéciale pour l'assistant de dissertation */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 sm:mb-12 sm:p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2">
              <Crown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Fonctionnalité Premium Exclusive
              </span>
            </div>
            <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl">
              Assistant de Dissertation IA
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Maîtrisez l'art de la dissertation française avec un assistant IA intelligent.
              Génération de plans, analyse complète et feedback personnalisé.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Gratuit</h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Assistant de dissertation non disponible
              </p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Étudiant</h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Assistant de dissertation non disponible
              </p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                  Accès refusé
                </span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-purple-200 bg-white p-6 shadow-lg">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-center font-semibold text-gray-900">Plan Premium+</h3>
              <p className="mb-4 text-center text-sm text-gray-600">
                Assistant de dissertation IA complet
              </p>
              <div className="text-center">
                <span className="inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                  ✅ Disponible
                </span>
              </div>
            </div>
          </div>

          {/* Fonctionnalités de l'assistant */}
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="mb-1 font-medium text-gray-900">Plans Intelligents</h4>
              <p className="text-xs text-gray-600">Génération automatique de plans détaillés</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="mb-1 font-medium text-gray-900">Correction Avancée</h4>
              <p className="text-xs text-gray-600">Analyse de structure et argumentation</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="mb-1 font-medium text-gray-900">Types Variés</h4>
              <p className="text-xs text-gray-600">Argumentative, comparative, poétique</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </div>
              <h4 className="mb-1 font-medium text-gray-900">IA Avancée</h4>
              <p className="text-xs text-gray-600">Powered by GPT-4 et Claude</p>
            </div>
          </div>
        </div>

        {/* Section de comparaison détaillée */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-xl sm:mb-12 sm:p-8">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            Comparaison détaillée des fonctionnalités
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">
                    Fonctionnalités
                  </th>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <th key={plan.id} className="px-6 py-4 text-center font-semibold text-gray-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    feature: 'Corrections IA par jour',
                    free: '5',
                    student: 'Illimité',
                    premium: 'Illimité',
                    enterprise: 'Illimité',
                  },
                  {
                    feature: 'Exercices quotidiens',
                    free: '3',
                    student: '20/jour',
                    premium: 'Illimité',
                    enterprise: 'Illimité',
                  },
                  {
                    feature: 'Dictées audio',
                    free: '❌ Non disponible',
                    student: '10/jour',
                    premium: 'Illimité',
                    enterprise: 'Illimité',
                  },
                  {
                    feature: 'Assistant de dissertation IA',
                    free: '❌ Non disponible',
                    student: '❌ Non disponible',
                    premium: '✅ Disponible',
                    enterprise: '✅ Disponible',
                  },
                  {
                    feature: 'Tuteur IA',
                    free: false,
                    student: 'Basique',
                    premium: 'Premium',
                    enterprise: 'Premium',
                  },
                  {
                    feature: 'Assistant IA',
                    free: false,
                    student: 'Basique',
                    premium: 'Avancé',
                    enterprise: 'Avancé',
                  },
                  {
                    feature: 'Analytics détaillées',
                    free: false,
                    student: true,
                    premium: 'Premium',
                    enterprise: 'Premium',
                  },
                  {
                    feature: 'Exercices personnalisés',
                    free: false,
                    student: '20/jour',
                    premium: 'Illimité',
                    enterprise: 'Illimité',
                  },
                  {
                    feature: 'Export des données',
                    free: false,
                    student: true,
                    premium: true,
                    enterprise: 'Avancé',
                  },
                  {
                    feature: 'Gestion multi-utilisateurs',
                    free: false,
                    student: false,
                    premium: false,
                    enterprise: true,
                  },
                ].map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.free === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      ) : row.free === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : row.free.includes('❌') ? (
                        <span className="font-medium text-red-600">{row.free}</span>
                      ) : (
                        <span className="text-gray-900">{row.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.student === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      ) : row.student === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <span className="font-medium text-gray-900">{row.student}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.premium === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      ) : row.premium === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <span className="font-medium text-gray-900">{row.premium}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.enterprise === false ? (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      ) : row.enterprise === true ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <span className="font-medium text-gray-900">{row.enterprise}</span>
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
          <h2 className="mb-8 text-2xl font-bold text-gray-900">Questions fréquentes</h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              {
                question:
                  'Pourquoi les dictées audio ne sont-elles pas disponibles avec le plan gratuit ?',
                answer:
                  'Les dictées audio sont notre fonctionnalité premium qui nécessite des ressources IA avancées. Elles sont disponibles à partir du plan Étudiant (14.99 CAD/mois) avec 10 dictées par jour.',
              },
              {
                question: "L'assistant de dissertation est-il disponible avec tous les plans ?",
                answer:
                  "L'assistant de dissertation IA est exclusivement réservé aux plans Premium et Établissement. Cette fonctionnalité avancée nécessite des modèles IA sophistiqués pour générer des plans détaillés et analyser vos dissertations.",
              },
              {
                question: 'Puis-je changer de plan à tout moment ?',
                answer:
                  'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.',
              },
              {
                question: 'Comment fonctionnent les quotas de dictées ?',
                answer:
                  'Les quotas se réinitialisent chaque jour à minuit. Le plan Étudiant inclut 10 dictées par jour, tandis que les plans Premium et Établissement offrent un accès illimité.',
              },
              {
                question: 'Les données sont-elles sécurisées ?',
                answer:
                  "Absolument. Nous utilisons un chiffrement de niveau bancaire et respectons le RGPD pour protéger vos données personnelles et vos progrès d'apprentissage.",
              },
              {
                question: 'Puis-je annuler à tout moment ?',
                answer:
                  "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucun frais d'annulation.",
              },
              {
                question: 'Y a-t-il un essai gratuit ?',
                answer:
                  "Le plan gratuit vous permet de découvrir les corrections IA de base (5/jour) et les exercices simples (3/jour). Pour les dictées audio et l'IA avancée, un abonnement est requis.",
              },
            ].map((faq, index) => (
              <div key={index} className="rounded-xl bg-white p-4 text-left shadow-lg sm:p-6">
                <h3 className="mb-2 text-sm font-semibold text-gray-900 sm:text-base">
                  {faq.question}
                </h3>
                <p className="text-xs text-gray-600 sm:text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
