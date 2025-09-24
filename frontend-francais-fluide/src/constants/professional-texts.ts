// src/constants/professional-texts.ts
// Textes professionnels pour remplacer les éléments ludiques

export const professionalTexts = {
  // Messages de bienvenue
  welcome: {
    title: "Tableau de bord",
    subtitle: "Voici un aperçu de votre progression",
    greeting: "Bonjour",
  },

  // Actions et boutons
  actions: {
    startWriting: "Commencer à écrire",
    doExercises: "Faire des exercices", 
    viewProgress: "Voir ma progression",
    startFreeTrial: "Démarrer l'essai gratuit",
    viewDemo: "Voir la démonstration",
    viewSubscriptions: "Voir les abonnements",
    startFree: "Commencer gratuitement",
    quickActions: "Actions rapides",
    recentActivities: "Activités récentes",
  },

  // Fonctionnalités
  features: {
    smartEditor: "Éditeur de texte",
    exercises: "Exercices",
    progress: "Progression",
    analytics: "Analytics",
    dictations: "Dictées audio",
    aiAssistant: "Assistant IA avancé",
    realTimeCorrections: "Corrections en temps réel",
    personalizedExercises: "Exercices personnalisés",
    detailedAnalytics: "Analytics détaillées",
    offlineMode: "Mode hors ligne",
    prioritySupport: "Support prioritaire",
  },

  // Descriptions
  descriptions: {
    smartEditor: "Corrigez vos textes avec l'IA",
    exercises: "Améliorez vos compétences",
    progress: "Suivez vos performances",
    analytics: "Analysez vos performances",
    dictations: "Améliorez votre écoute",
    grammarPractice: "Pratiquez la grammaire",
    followProgress: "Suivez vos progrès",
  },

  // Métriques
  metrics: {
    wordsWritten: "Mots écrits",
    accuracy: "Précision",
    exercises: "Exercices",
    currentStreak: "Série actuelle",
    days: "jours",
    thisMonth: "ce mois",
    thisWeek: "cette semaine",
    record: "Record",
  },

  // États
  states: {
    active: "Actif",
    inactive: "Inactif",
    loading: "Chargement...",
    noRecentActivity: "Aucune activité récente",
    availableFeatures: "Fonctionnalités disponibles",
    other: "autres",
  },

  // Plans d'abonnement
  plans: {
    demo: "Démo Gratuite",
    student: "Étudiant",
    premium: "Premium", 
    institution: "Établissement",
    free: "Gratuit",
    monthly: "CAD/mois",
  },

  // Messages de succès
  achievements: {
    streakCompleted: "Série de 7 jours complétée",
    objectiveReached: "Objectif atteint",
    excellentWork: "Excellent travail",
    correctionSuggested: "Correction suggérée",
    improveWriting: "Améliorer votre écriture",
    veryGood: "Très bien",
  },

  // Titres de sections
  sections: {
    subscriptionPlans: "Plans d'Abonnement (CAD)",
    premiumFeatures: "Fonctionnalités Premium",
    readyToImprove: "Prêt à améliorer votre français ?",
    joinThousands: "Rejoignez des milliers d'utilisateurs qui écrivent déjà sans fautes",
  },

  // Placeholders
  placeholders: {
    startWriting: "Commencez à écrire...",
    askQuestion: "Posez votre question...",
    search: "Rechercher...",
  },
} as const;
