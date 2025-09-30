// src/lib/exercises/adaptive-engine.ts
import { SUBSCRIPTION_PLANS } from '@/lib/subscription/plans';

export interface Exercise {
  id: string;
  type: 'dictation' | 'grammar' | 'vocabulary' | 'conjugation' | 'comprehension' | 'writing';
  title: string;
  content: any;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  targetSkills: string[];
  prerequisites?: string[];
  tags: string[];
}

export interface UserProgress {
  userId: string;
  completedExercises: string[];
  scores: { [exerciseId: string]: number };
  timeSpent: { [exerciseId: string]: number };
  errorPatterns: { [skill: string]: number };
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  learningVelocity: number; // exercices par jour
  preferredTypes: string[];
  weakAreas: string[];
  strongAreas: string[];
}

export interface AdaptiveRecommendation {
  exercise: Exercise;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  expectedDifficulty: number; // 0-1
  estimatedTime: number;
  learningValue: number; // 0-1
}

export class AdaptiveExerciseEngine {
  private exercises: Exercise[] = [];
  private userProgress: Map<string, UserProgress> = new Map();

  constructor(exercises: Exercise[] = []) {
    this.exercises = exercises;
  }

  /**
   * Recommande des exercices adaptés à l'utilisateur
   */
  getRecommendations(
    userId: string,
    subscriptionPlan: string,
    count: number = 5
  ): AdaptiveRecommendation[] {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) {
      return this.getDefaultRecommendations(count);
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionPlan);
    const maxExercises = plan?.limits.exercisesPerDay || 3;
    const actualCount = Math.min(count, maxExercises);

    // Filtrer les exercices selon le plan d'abonnement
    const availableExercises = this.filterBySubscription(this.exercises, subscriptionPlan);

    // Calculer les scores de recommandation
    const recommendations = availableExercises
      .filter(ex => !userProgress.completedExercises.includes(ex.id))
      .map(exercise => this.calculateRecommendationScore(exercise, userProgress))
      .sort((a, b) => b.learningValue - a.learningValue)
      .slice(0, actualCount);

    return recommendations;
  }

  /**
   * Met à jour le progrès de l'utilisateur après un exercice
   */
  updateProgress(
    userId: string,
    exerciseId: string,
    score: number,
    timeSpent: number,
    errors: { [skill: string]: number }
  ): void {
    let progress = this.userProgress.get(userId);
    if (!progress) {
      progress = this.createDefaultProgress(userId);
    }

    // Mettre à jour les données
    if (!progress.completedExercises.includes(exerciseId)) {
      progress.completedExercises.push(exerciseId);
    }
    progress.scores[exerciseId] = score;
    progress.timeSpent[exerciseId] = timeSpent;

    // Mettre à jour les patterns d'erreurs
    Object.entries(errors).forEach(([skill, count]) => {
      progress.errorPatterns[skill] = (progress.errorPatterns[skill] || 0) + count;
    });

    // Recalculer les zones faibles et fortes
    this.updateWeakAndStrongAreas(progress);

    // Mettre à jour le niveau
    this.updateUserLevel(progress);

    this.userProgress.set(userId, progress);
  }

  /**
   * Génère un plan d'apprentissage personnalisé
   */
  generateLearningPlan(
    userId: string,
    subscriptionPlan: string,
    duration: number = 30 // jours
  ): {
    dailyGoals: { [day: number]: Exercise[] };
    weeklyMilestones: string[];
    estimatedProgress: number;
  } {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) {
      return this.getDefaultLearningPlan();
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionPlan);
    const dailyLimit = plan?.limits.exercisesPerDay || 3;

    const dailyGoals: { [day: number]: Exercise[] } = {};
    const weeklyMilestones: string[] = [];

    // Générer les exercices pour chaque jour
    for (let day = 1; day <= duration; day++) {
      const recommendations = this.getRecommendations(userId, subscriptionPlan, dailyLimit);
      dailyGoals[day] = recommendations.map(rec => rec.exercise);

      // Ajouter des jalons hebdomadaires
      if (day % 7 === 0) {
        const week = Math.ceil(day / 7);
        weeklyMilestones.push(
          `Semaine ${week}: Maîtriser ${this.getWeeklyGoal(week, userProgress)}`
        );
      }
    }

    const estimatedProgress = this.calculateEstimatedProgress(userProgress, duration);

    return {
      dailyGoals,
      weeklyMilestones,
      estimatedProgress,
    };
  }

  /**
   * Analyse les performances et suggère des améliorations
   */
  analyzePerformance(userId: string): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    nextFocus: string[];
  } {
    const userProgress = this.userProgress.get(userId);
    if (!userProgress) {
      return {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        nextFocus: [],
      };
    }

    const strengths = userProgress.strongAreas;
    const weaknesses = userProgress.weakAreas;

    const recommendations = this.generateRecommendations(userProgress);
    const nextFocus = this.getNextFocusAreas(userProgress);

    return {
      strengths,
      weaknesses,
      recommendations,
      nextFocus,
    };
  }

  private calculateRecommendationScore(
    exercise: Exercise,
    userProgress: UserProgress
  ): AdaptiveRecommendation {
    let score = 0;
    let reason = '';

    // Score basé sur les zones faibles
    const weakAreaMatch = exercise.targetSkills.filter(skill =>
      userProgress.weakAreas.includes(skill)
    ).length;
    score += weakAreaMatch * 0.4;

    // Score basé sur le niveau de difficulté
    const difficultyMatch = this.calculateDifficultyMatch(exercise, userProgress);
    score += difficultyMatch * 0.3;

    // Score basé sur les préférences
    const preferenceMatch = userProgress.preferredTypes.includes(exercise.type) ? 0.2 : 0;
    score += preferenceMatch;

    // Score basé sur la variété
    const varietyBonus = this.calculateVarietyBonus(exercise, userProgress);
    score += varietyBonus * 0.1;

    // Déterminer la priorité
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (score > 0.7) priority = 'high';
    else if (score > 0.4) priority = 'medium';

    // Générer la raison
    if (weakAreaMatch > 0) {
      reason = `Cible vos zones faibles: ${exercise.targetSkills
        .filter(s => userProgress.weakAreas.includes(s))
        .join(', ')}`;
    } else if (difficultyMatch > 0.5) {
      reason = `Niveau adapté à votre progression`;
    } else if (preferenceMatch > 0) {
      reason = `Type d'exercice que vous préférez`;
    } else {
      reason = `Exercice varié pour diversifier votre apprentissage`;
    }

    return {
      exercise,
      priority,
      reason,
      expectedDifficulty: difficultyMatch,
      estimatedTime: exercise.estimatedTime,
      learningValue: score,
    };
  }

  private calculateDifficultyMatch(exercise: Exercise, userProgress: UserProgress): number {
    const levelScores = { beginner: 0, intermediate: 1, advanced: 2 };
    const userLevel = levelScores[userProgress.currentLevel];
    const exerciseLevel = levelScores[exercise.difficulty];

    // Préférer les exercices légèrement plus difficiles que le niveau actuel
    const idealLevel = userLevel + 0.5;
    const diff = Math.abs(exerciseLevel - idealLevel);

    return Math.max(0, 1 - diff);
  }

  private calculateVarietyBonus(exercise: Exercise, userProgress: UserProgress): number {
    const recentTypes = userProgress.completedExercises
      .slice(-10) // 10 derniers exercices
      .map(id => this.exercises.find(ex => ex.id === id)?.type)
      .filter(Boolean);

    const typeCount = recentTypes.filter(type => type === exercise.type).length;
    return Math.max(0, 1 - typeCount / 3); // Bonus si pas trop répétitif
  }

  private updateWeakAndStrongAreas(progress: UserProgress): void {
    const skillScores = Object.entries(progress.errorPatterns)
      .map(([skill, errors]) => ({
        skill,
        errorRate: errors / (progress.completedExercises.length || 1),
      }))
      .sort((a, b) => a.errorRate - b.errorRate);

    const threshold = 0.3; // 30% d'erreurs
    progress.weakAreas = skillScores.filter(s => s.errorRate > threshold).map(s => s.skill);

    progress.strongAreas = skillScores.filter(s => s.errorRate < threshold).map(s => s.skill);
  }

  private updateUserLevel(progress: UserProgress): void {
    const avgScore =
      Object.values(progress.scores).reduce((a, b) => a + b, 0) /
        Object.values(progress.scores).length || 0;

    if (avgScore >= 80 && progress.completedExercises.length >= 20) {
      progress.currentLevel = 'advanced';
    } else if (avgScore >= 60 && progress.completedExercises.length >= 10) {
      progress.currentLevel = 'intermediate';
    } else {
      progress.currentLevel = 'beginner';
    }
  }

  private filterBySubscription(exercises: Exercise[], subscriptionPlan: string): Exercise[] {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscriptionPlan);
    if (!plan) return exercises;

    return exercises.filter(exercise => {
      // Logique de filtrage basée sur le plan
      switch (subscriptionPlan) {
        case 'free':
          return ['grammar', 'vocabulary'].includes(exercise.type);
        case 'student':
          return true; // Tous les exercices
        case 'premium':
          return true; // Tous les exercices + fonctionnalités premium
        case 'enterprise':
          return true; // Tous les exercices + fonctionnalités entreprise
        default:
          return true;
      }
    });
  }

  private createDefaultProgress(userId: string): UserProgress {
    return {
      userId,
      completedExercises: [],
      scores: {},
      timeSpent: {},
      errorPatterns: {},
      currentLevel: 'beginner',
      learningVelocity: 3,
      preferredTypes: [],
      weakAreas: [],
      strongAreas: [],
    };
  }

  private getDefaultRecommendations(count: number): AdaptiveRecommendation[] {
    return this.exercises.slice(0, count).map(exercise => ({
      exercise,
      priority: 'medium' as const,
      reason: 'Exercice recommandé pour débuter',
      expectedDifficulty: 0.5,
      estimatedTime: exercise.estimatedTime,
      learningValue: 0.5,
    }));
  }

  private getDefaultLearningPlan() {
    return {
      dailyGoals: {},
      weeklyMilestones: [],
      estimatedProgress: 0,
    };
  }

  private getWeeklyGoal(week: number, userProgress: UserProgress): string {
    const goals = [
      'les bases de la grammaire',
      'le vocabulaire essentiel',
      'la conjugaison des verbes',
      'la compréhension écrite',
    ];
    return goals[(week - 1) % goals.length];
  }

  private calculateEstimatedProgress(userProgress: UserProgress, duration: number): number {
    const currentProgress = (userProgress.completedExercises.length / 100) * 100;
    const dailyIncrease = userProgress.learningVelocity * 0.1;
    return Math.min(100, currentProgress + dailyIncrease * duration);
  }

  private generateRecommendations(userProgress: UserProgress): string[] {
    const recommendations = [];

    if (userProgress.weakAreas.length > 0) {
      recommendations.push(`Concentrez-vous sur: ${userProgress.weakAreas.join(', ')}`);
    }

    if (userProgress.learningVelocity < 2) {
      recommendations.push("Essayez de faire plus d'exercices par jour pour progresser plus vite");
    }

    if (userProgress.preferredTypes.length === 0) {
      recommendations.push("Explorez différents types d'exercices pour trouver vos préférences");
    }

    return recommendations;
  }

  private getNextFocusAreas(userProgress: UserProgress): string[] {
    // Retourner les compétences à développer en priorité
    return userProgress.weakAreas.slice(0, 3);
  }
}

// Hook React pour utiliser l'engine adaptatif
export function useAdaptiveExercises() {
  const engine = new AdaptiveExerciseEngine();

  const getRecommendations = (userId: string, subscriptionPlan: string, count: number) => {
    return engine.getRecommendations(userId, subscriptionPlan, count);
  };

  const updateProgress = (
    userId: string,
    exerciseId: string,
    score: number,
    timeSpent: number,
    errors: { [skill: string]: number }
  ) => {
    engine.updateProgress(userId, exerciseId, score, timeSpent, errors);
  };

  const generateLearningPlan = (userId: string, subscriptionPlan: string, duration: number) => {
    return engine.generateLearningPlan(userId, subscriptionPlan, duration);
  };

  const analyzePerformance = (userId: string) => {
    return engine.analyzePerformance(userId);
  };

  return {
    getRecommendations,
    updateProgress,
    generateLearningPlan,
    analyzePerformance,
  };
}
