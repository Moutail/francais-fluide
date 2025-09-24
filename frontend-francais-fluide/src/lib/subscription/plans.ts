// src/lib/subscription/plans.ts
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    aiCorrections: number;
    exercisesPerDay: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    exportData: boolean;
    customExercises: boolean;
    voiceAssistant: boolean;
    offlineMode: boolean;
  };
  popular?: boolean;
  description: string;
  color: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Démo Gratuite',
    price: 0,
    currency: 'CAD',
    interval: 'month',
    description: 'Parfait pour découvrir FrançaisFluide',
    color: 'from-gray-500 to-gray-600',
    features: [
      'Correction de base (5 par jour)',
      'Exercices simples (3 par jour)',
      'Statistiques de base',
      'Support communautaire'
    ],
    limits: {
      aiCorrections: 5,
      exercisesPerDay: 3,
      advancedAnalytics: false,
      prioritySupport: false,
      exportData: false,
      customExercises: false,
      voiceAssistant: false,
      offlineMode: false
    }
  },
  {
    id: 'student',
    name: 'Étudiant',
    price: 14.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Idéal pour les étudiants et l\'apprentissage personnel',
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Corrections IA illimitées',
      'Exercices personnalisés (20/jour)',
      'Dictées audio (10/jour)',
      'Tuteur IA intelligent',
      'Analytics avancées',
      'Assistant IA basique',
      'Export des données',
      'Support prioritaire'
    ],
    limits: {
      aiCorrections: -1, // illimité
      exercisesPerDay: 20,
      dictationsPerDay: 10,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
      customExercises: false,
      voiceAssistant: true,
      offlineMode: false,
      intelligentTutor: true,
      personalizedLearning: true
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Pour les professionnels et apprenants sérieux',
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Tout de l\'Étudiant',
      'Exercices illimités',
      'Dictées audio illimitées',
      'Assistant IA avancé',
      'Tuteur IA premium',
      'Mode hors ligne',
      'Exercices personnalisés',
      'Assistant vocal',
      'Analytics premium',
      'Support prioritaire 24/7'
    ],
    limits: {
      aiCorrections: -1,
      exercisesPerDay: -1,
      dictationsPerDay: -1,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
      customExercises: true,
      voiceAssistant: true,
      offlineMode: true,
      intelligentTutor: true,
      personalizedLearning: true
    }
  },
  {
    id: 'enterprise',
    name: 'Établissement',
    price: 149.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Pour les écoles, universités et entreprises',
    color: 'from-green-500 to-emerald-500',
    features: [
      'Tout de Premium',
      'Gestion multi-utilisateurs',
      'Tableau de bord administrateur',
      'Intégration LMS',
      'Rapports personnalisés',
      'Support dédié',
      'Formation personnalisée'
    ],
    limits: {
      aiCorrections: -1,
      exercisesPerDay: -1,
      advancedAnalytics: true,
      prioritySupport: true,
      exportData: true,
      customExercises: true,
      voiceAssistant: true,
      offlineMode: true
    }
  }
];

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id);
};

export const getUpgradeBenefits = (currentPlan: string, targetPlan: string): string[] => {
  const current = getPlanById(currentPlan);
  const target = getPlanById(targetPlan);
  
  if (!current || !target) return [];
  
  return target.features.filter(feature => 
    !current.features.includes(feature)
  );
};
