import type { ExerciseResult, UserProfile, Difficulty } from '@/types';
import { exerciseGenerator } from './generator';

// Types pour la gamification des exercices
export interface ExerciseStats {
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  bestStreak: number;
  accuracyRate: number;
  level: number;
  xp: number;
  nextLevelXp: number;
}

export interface ExerciseAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'exercise';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  xp: number;
  criteria: {
    type: 'score' | 'streak' | 'time' | 'accuracy' | 'completion';
    value: number;
    operator: 'gte' | 'lte' | 'eq';
  };
}

// Système de points et niveaux
export class ExerciseGamification {
  private baseXpPerExercise = 100;
  private xpMultiplier = {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0
  };

  // Calculer les points XP pour un exercice
  calculateXp(result: ExerciseResult, difficulty: string): number {
    const baseXp = this.baseXpPerExercise;
    const difficultyMultiplier = this.xpMultiplier[difficulty as keyof typeof this.xpMultiplier] || 1.0;
    const scoreMultiplier = result.score / result.maxScore;
    const timeBonus = result.timeSpent < 300 ? 1.2 : 1.0; // Bonus si terminé en moins de 5 minutes
    const accuracyBonus = result.accuracy > 0.8 ? 1.1 : 1.0;

    return Math.round(baseXp * difficultyMultiplier * scoreMultiplier * timeBonus * accuracyBonus);
  }

  // Calculer le niveau basé sur l'XP total
  calculateLevel(totalXp: number): { level: number; xp: number; nextLevelXp: number } {
    const level = Math.floor(Math.sqrt(totalXp / 1000)) + 1;
    const currentLevelXp = Math.pow(level - 1, 2) * 1000;
    const nextLevelXp = Math.pow(level, 2) * 1000;
    
    return {
      level,
      xp: totalXp - currentLevelXp,
      nextLevelXp: nextLevelXp - currentLevelXp
    };
  }

  // Mettre à jour les statistiques d'exercices
  updateExerciseStats(
    currentStats: ExerciseStats,
    result: ExerciseResult,
    difficulty: string
  ): ExerciseStats {
    const xpGained = this.calculateXp(result, difficulty);
    const newTotalXp = currentStats.xp + xpGained;
    const levelInfo = this.calculateLevel(newTotalXp);
    
    const newStreak = result.accuracy >= 0.7 ? currentStats.currentStreak + 1 : 0;
    
    return {
      totalExercises: currentStats.totalExercises + 1,
      completedExercises: currentStats.completedExercises + 1,
      averageScore: (currentStats.averageScore * currentStats.completedExercises + result.score) / 
                   (currentStats.completedExercises + 1),
      totalTimeSpent: currentStats.totalTimeSpent + result.timeSpent,
      currentStreak: newStreak,
      bestStreak: Math.max(currentStats.bestStreak, newStreak),
      accuracyRate: (currentStats.accuracyRate * currentStats.completedExercises + result.accuracy) / 
                   (currentStats.completedExercises + 1),
      level: levelInfo.level,
      xp: levelInfo.xp,
      nextLevelXp: levelInfo.nextLevelXp
    };
  }

  // Vérifier les achievements
  checkAchievements(stats: ExerciseStats, result: ExerciseResult): ExerciseAchievement[] {
    const achievements: ExerciseAchievement[] = [];

    // Achievement: Premier exercice
    if (stats.completedExercises === 1) {
      achievements.push({
        id: 'first-exercise',
        name: 'Premier Pas',
        description: 'Vous avez complété votre premier exercice !',
        icon: '🎯',
        category: 'exercise',
        rarity: 'common',
        xp: 50,
        criteria: {
          type: 'completion',
          value: 1,
          operator: 'eq'
        }
      });
    }

    // Achievement: Score parfait
    if (result.score === result.maxScore) {
      achievements.push({
        id: 'perfect-score',
        name: 'Score Parfait',
        description: 'Excellent ! Vous avez obtenu un score parfait !',
        icon: '⭐',
        category: 'exercise',
        rarity: 'rare',
        xp: 100,
        criteria: {
          type: 'score',
          value: result.maxScore,
          operator: 'eq'
        }
      });
    }

    // Achievement: Série de 5
    if (stats.currentStreak === 5) {
      achievements.push({
        id: 'streak-5',
        name: 'En Série',
        description: '5 exercices réussis consécutivement !',
        icon: '🔥',
        category: 'exercise',
        rarity: 'uncommon',
        xp: 150,
        criteria: {
          type: 'streak',
          value: 5,
          operator: 'eq'
        }
      });
    }

    // Achievement: Série de 10
    if (stats.currentStreak === 10) {
      achievements.push({
        id: 'streak-10',
        name: 'Inarrêtable',
        description: '10 exercices réussis consécutivement !',
        icon: '🚀',
        category: 'exercise',
        rarity: 'epic',
        xp: 300,
        criteria: {
          type: 'streak',
          value: 10,
          operator: 'eq'
        }
      });
    }

    // Achievement: 100 exercices
    if (stats.completedExercises === 100) {
      achievements.push({
        id: 'centurion',
        name: 'Centurion',
        description: '100 exercices complétés !',
        icon: '💯',
        category: 'exercise',
        rarity: 'legendary',
        xp: 500,
        criteria: {
          type: 'completion',
          value: 100,
          operator: 'eq'
        }
      });
    }

    // Achievement: Rapidité
    if (result.timeSpent < 60) { // Moins d'une minute
      achievements.push({
        id: 'speed-demon',
        name: 'Démon de Vitesse',
        description: 'Exercice terminé en moins d\'une minute !',
        icon: '⚡',
        category: 'exercise',
        rarity: 'rare',
        xp: 200,
        criteria: {
          type: 'time',
          value: 60,
          operator: 'lte'
        }
      });
    }

    // Achievement: Précision
    if (result.accuracy >= 0.95) {
      achievements.push({
        id: 'precision-master',
        name: 'Maître de la Précision',
        description: '95% de précision ou plus !',
        icon: '🎯',
        category: 'exercise',
        rarity: 'epic',
        xp: 250,
        criteria: {
          type: 'accuracy',
          value: 0.95,
          operator: 'gte'
        }
      });
    }

    return achievements;
  }

  // Générer des exercices adaptatifs basés sur les faiblesses
  generateAdaptiveExercises(
    userProfile: UserProfile,
    recentResults: ExerciseResult[],
    count: number = 5
  ) {
    // Analyser les erreurs récentes
    const recentErrors = recentResults.flatMap(result => 
      result.answers.filter(answer => !answer.isCorrect)
    );

    // Mettre à jour les faiblesses
    exerciseGenerator.updateUserWeaknesses(userProfile, recentErrors as any);

    // Générer des exercices adaptatifs
    return exerciseGenerator.generateExerciseSeries(userProfile, count);
  }

  // Calculer la difficulté recommandée
  calculateRecommendedDifficulty(stats: ExerciseStats): Difficulty {
    if (stats.averageScore >= 90 && stats.accuracyRate >= 0.9) {
      return 'advanced';
    } else if (stats.averageScore >= 70 && stats.accuracyRate >= 0.7) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  // Obtenir les recommandations d'amélioration
  getImprovementRecommendations(stats: ExerciseStats): string[] {
    const recommendations: string[] = [];

    if (stats.accuracyRate < 0.7) {
      recommendations.push('Concentrez-vous sur la précision avant la vitesse');
    }

    if (stats.averageScore < 70) {
      recommendations.push('Révisez les règles de grammaire de base');
    }

    if (stats.currentStreak < 3) {
      recommendations.push('Essayez de maintenir une série de réussites');
    }

    if (stats.totalTimeSpent < 1800) { // Moins de 30 minutes
      recommendations.push('Pratiquez plus régulièrement pour améliorer vos compétences');
    }

    return recommendations;
  }
}

// Instance globale
export const exerciseGamification = new ExerciseGamification();
