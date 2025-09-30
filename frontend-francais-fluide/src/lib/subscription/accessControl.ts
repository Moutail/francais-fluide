// Système de contrôle d'accès basé sur les niveaux d'abonnement

export interface AccessLimits {
  aiCorrections: number;
  exercisesPerDay: number;
  dictationsPerDay: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  exportData: boolean;
  customExercises: boolean;
  voiceAssistant: boolean;
  offlineMode: boolean;
  intelligentTutor: boolean;
  personalizedLearning: boolean;
  apiAccess: boolean;
  multiUserManagement: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  color: string;
  features: string[];
  limits: AccessLimits;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'demo',
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
      'Support communautaire',
    ],
    limits: {
      aiCorrections: 5,
      exercisesPerDay: 3,
      dictationsPerDay: 0,
      advancedAnalytics: false,
      prioritySupport: false,
      exportData: false,
      customExercises: false,
      voiceAssistant: false,
      offlineMode: false,
      intelligentTutor: false,
      personalizedLearning: false,
      apiAccess: false,
      multiUserManagement: false,
    },
  },
  {
    id: 'etudiant',
    name: 'Étudiant',
    price: 14.99,
    currency: 'CAD',
    interval: 'month',
    description: "Idéal pour les étudiants et l'apprentissage personnel",
    color: 'from-blue-500 to-cyan-500',
    features: [
      'Corrections IA illimitées',
      'Exercices personnalisés (20/jour)',
      'Dictées audio (10/jour)',
      'Tuteur IA intelligent',
      'Analytics avancées',
      'Assistant IA basique',
      'Export des données',
      'Support prioritaire',
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
      personalizedLearning: true,
      apiAccess: false,
      multiUserManagement: false,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 29.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Pour les professionnels et apprenants avancés',
    color: 'from-purple-500 to-pink-500',
    features: [
      'Tout du plan Étudiant',
      'Exercices illimités',
      'Dictées illimitées',
      'Exercices personnalisés',
      'Mode hors ligne',
      'Assistant IA avancé',
      'API complète',
      'Support prioritaire 24/7',
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
      personalizedLearning: true,
      apiAccess: true,
      multiUserManagement: false,
    },
  },
  {
    id: 'etablissement',
    name: 'Établissement',
    price: 149.99,
    currency: 'CAD',
    interval: 'month',
    description: 'Pour les écoles, universités et entreprises',
    color: 'from-orange-500 to-red-500',
    features: [
      'Tout du plan Premium',
      'Gestion multi-utilisateurs',
      'Tableau de bord administrateur',
      'Rapports détaillés',
      'Intégration API complète',
      'Support dédié',
      'Formation personnalisée',
      'SLA garanti',
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
      personalizedLearning: true,
      apiAccess: true,
      multiUserManagement: true,
    },
  },
];

// Fonction pour vérifier l'accès à une fonctionnalité
export function hasAccess(userPlan: string, feature: keyof AccessLimits): boolean {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
  if (!plan) return false;

  const value = plan.limits[feature];
  if (typeof value === 'boolean') return value;
  // Valeurs numériques: -1 = illimité (accès autorisé), 0 = aucun accès, >0 = accès avec quota
  return value === -1 || value > 0;
}

// Fonction pour vérifier les quotas
export function checkQuota(
  userPlan: string,
  feature: keyof AccessLimits,
  currentUsage: number
): boolean {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
  if (!plan) return false;

  const limit = plan.limits[feature];
  if (limit === -1) return true; // illimité
  if (typeof limit === 'boolean') return limit;

  return currentUsage < limit;
}

// Fonction pour obtenir les limites d'un plan
export function getPlanLimits(userPlan: string): AccessLimits | null {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
  return plan ? plan.limits : null;
}

// Fonction pour obtenir le plan d'un utilisateur
export function getUserPlan(subscription: any): string {
  if (!subscription) return 'demo';
  return subscription.plan || 'demo';
}

// Fonction pour vérifier si un utilisateur peut accéder à une page
export function canAccessPage(userPlan: string, page: string): boolean {
  const accessRules: Record<string, string[]> = {
    admin: ['etablissement'],
    analytics: ['etudiant', 'premium', 'etablissement'],
    api: ['premium', 'etablissement'],
    'custom-exercises': ['premium', 'etablissement'],
    offline: ['premium', 'etablissement'],
    'multi-user': ['etablissement'],
  };

  const allowedPlans = accessRules[page] || [];
  return allowedPlans.includes(userPlan);
}

// Fonction pour obtenir le message d'upgrade
export function getUpgradeMessage(currentPlan: string, requiredFeature: string): string {
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === currentPlan);
  const nextPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'etudiant'); // Plan suivant par défaut

  return `Cette fonctionnalité nécessite un abonnement ${nextPlan?.name}. Votre plan actuel (${plan?.name}) ne permet pas d'accéder à cette fonctionnalité.`;
}
