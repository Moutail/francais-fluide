// src/components/pricing/ProfessionalPricing.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Check, Star, Users, Building, FileText } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  popular?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    id: 'demo',
    name: 'Démo Gratuite',
    price: 'Gratuit',
    period: '',
    description: 'Parfait pour découvrir la plateforme',
    features: [
      'Corrections de base',
      '5 documents par mois',
      'Support par email',
      'Interface limitée',
    ],
    icon: FileText,
    cta: 'Commencer gratuitement',
  },
  {
    id: 'student',
    name: 'Étudiant',
    price: '14.99$',
    period: 'CAD/mois',
    description: 'Idéal pour les étudiants et apprenants',
    features: [
      'Corrections avancées',
      'Documents illimités',
      'Assistant IA basique',
      'Analytics de base',
      'Support prioritaire',
      'Mode hors ligne',
    ],
    icon: Users,
    cta: 'Choisir ce plan',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '29.99$',
    period: 'CAD/mois',
    description: 'Pour les professionnels et écrivains',
    features: [
      'Toutes les fonctionnalités Étudiant',
      'Assistant IA avancé',
      'Analytics détaillées',
      'Intégrations API',
      'Support 24/7',
      'Formation personnalisée',
    ],
    icon: Star,
    popular: true,
    cta: 'Choisir ce plan',
  },
  {
    id: 'institution',
    name: 'Établissement',
    price: '149.99$',
    period: 'CAD/mois',
    description: 'Pour les écoles et organisations',
    features: [
      'Toutes les fonctionnalités Premium',
      'Gestion multi-utilisateurs',
      'Tableau de bord administrateur',
      'Intégration LMS',
      'Support dédié',
      'Formation sur site',
    ],
    icon: Building,
    cta: 'Nous contacter',
  },
];

export const ProfessionalPricing: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Choisissez votre plan d'abonnement
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Des solutions adaptées à tous vos besoins d'apprentissage du français
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map(plan => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'shadow-lg ring-2 ring-blue-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
                    Le plus populaire
                  </span>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-lg bg-blue-100">
                  <plan.icon className="size-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-gray-600">{plan.period}</span>}
                </div>
                <p className="mt-2 text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="size-4 shrink-0 text-green-600" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant={plan.popular ? 'primary' : 'secondary'}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ ou informations supplémentaires */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-gray-600">
            Tous les plans incluent une garantie de remboursement de 30 jours
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button variant="ghost" className="text-blue-600">
              Voir les questions fréquentes
            </Button>
            <Button variant="ghost" className="text-blue-600">
              Contacter le support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
