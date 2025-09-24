// src/components/pricing/ProfessionalPricing.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/professional/Card';
import { Button } from '@/components/ui/professional/Button';
import { Check, Star, Users, Building } from 'lucide-react';

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
      'Interface limitée'
    ],
    icon: FileText,
    cta: 'Commencer gratuitement'
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
      'Mode hors ligne'
    ],
    icon: Users,
    cta: 'Choisir ce plan'
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
      'Formation personnalisée'
    ],
    icon: Star,
    popular: true,
    cta: 'Choisir ce plan'
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
      'Formation sur site'
    ],
    icon: Building,
    cta: 'Nous contacter'
  }
];

export const ProfessionalPricing: React.FC = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choisissez votre plan d'abonnement
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Des solutions adaptées à tous vos besoins d'apprentissage du français
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Le plus populaire
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <plan.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-600 ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  variant={plan.popular ? 'primary' : 'secondary'}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ ou informations supplémentaires */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Tous les plans incluent une garantie de remboursement de 30 jours
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
